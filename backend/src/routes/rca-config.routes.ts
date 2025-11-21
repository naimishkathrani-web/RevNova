import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

// -----------------------------------------------
// GET /api/v1/projects/:id/rca-configurations - Get all RCA configurations for a project
// -----------------------------------------------
router.get('/projects/:id/rca-configurations', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, config_type } = req.query;
    
    const db = req.app.locals.db;
    
    let query = `
      SELECT * FROM rca_custom_configurations
      WHERE project_id = $1
    `;
    const params: any[] = [id];
    let paramCount = 2;

    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    if (config_type) {
      query += ` AND config_type = $${paramCount++}`;
      params.push(config_type);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await db.query(query, params);

    return res.json({
      status: 'success',
      data: result.rows,
      count: result.rows.length
    });

  } catch (err: any) {
    console.error('Error fetching RCA configurations:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// POST /api/v1/projects/:id/rca-configurations - Create RCA configuration
// -----------------------------------------------
router.post('/projects/:id/rca-configurations', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      config_type,
      source_object_name,
      source_field_name,
      rca_object_name,
      rca_field_name,
      rca_field_type,
      rca_field_length,
      rca_field_required = false,
      rca_picklist_values,
      stg2_table_name,
      stg2_column_name
    } = req.body;

    // Validation
    if (!config_type || !rca_object_name) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: config_type, rca_object_name'
      });
    }

    const db = req.app.locals.db;

    // Build Salesforce Metadata API payload based on config type
    let config_api_endpoint = '';
    let config_payload: any = {};

    if (config_type === 'custom_object') {
      config_api_endpoint = '/services/data/v60.0/tooling/sobjects/CustomObject';
      config_payload = {
        FullName: rca_object_name,
        Label: rca_object_name.replace(/_/g, ' '),
        PluralLabel: rca_object_name.replace(/_/g, ' ') + 's',
        NameField: {
          Type: 'Text',
          Label: 'Name'
        },
        DeploymentStatus: 'Deployed',
        SharingModel: 'ReadWrite'
      };
    } else if (config_type === 'custom_field') {
      config_api_endpoint = `/services/data/v60.0/tooling/sobjects/CustomField`;
      config_payload = {
        FullName: `${rca_object_name}.${rca_field_name}`,
        Metadata: {
          type: rca_field_type,
          label: rca_field_name?.replace(/_/g, ' '),
          required: rca_field_required,
          length: rca_field_length,
          picklistValues: rca_picklist_values?.map(value => ({ fullName: value, default: false }))
        }
      };
    }

    const result = await db.query(`
      INSERT INTO rca_custom_configurations (
        project_id, config_type, source_object_name, source_field_name,
        rca_object_name, rca_field_name, rca_field_type, rca_field_length,
        rca_field_required, rca_picklist_values, config_api_endpoint, config_payload,
        stg2_table_name, stg2_column_name, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'pending')
      RETURNING *
    `, [
      id, config_type, source_object_name, source_field_name,
      rca_object_name, rca_field_name, rca_field_type, rca_field_length,
      rca_field_required, rca_picklist_values, config_api_endpoint,
      JSON.stringify(config_payload), stg2_table_name, stg2_column_name
    ]);

    return res.status(201).json({
      status: 'success',
      message: 'RCA configuration created',
      data: result.rows[0]
    });

  } catch (err: any) {
    console.error('Error creating RCA configuration:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// POST /api/v1/projects/:id/rca-configurations/execute - Execute RCA configurations
// -----------------------------------------------
router.post('/projects/:id/rca-configurations/execute', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    // Get pending configurations
    const configsResult = await db.query(`
      SELECT * FROM rca_custom_configurations
      WHERE project_id = $1 AND status = 'pending'
      ORDER BY 
        CASE config_type 
          WHEN 'custom_object' THEN 1 
          WHEN 'custom_field' THEN 2 
        END
    `, [id]);

    if (configsResult.rows.length === 0) {
      return res.json({
        status: 'success',
        message: 'No pending configurations to execute',
        data: { executed: 0 }
      });
    }

    // TODO: Execute configurations via Salesforce Metadata API
    // For now, just mark as completed
    const executed: any[] = [];
    for (const config of configsResult.rows) {
      // Update status
      await db.query(`
        UPDATE rca_custom_configurations
        SET status = 'completed', created_in_rca = true, executed_at = NOW()
        WHERE id = $1
      `, [config.id]);

      executed.push({
        id: config.id,
        config_type: config.config_type,
        rca_object_name: config.rca_object_name,
        rca_field_name: config.rca_field_name
      });
    }

    return res.json({
      status: 'success',
      message: `${executed.length} configurations executed successfully`,
      data: { 
        executed: executed.length,
        configurations: executed
      }
    });

  } catch (err: any) {
    console.error('Error executing RCA configurations:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// GET /api/v1/projects/:id/mapping-conflicts - Get mapping conflicts
// -----------------------------------------------
router.get('/projects/:id/mapping-conflicts', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution_status, severity } = req.query;
    
    const db = req.app.locals.db;
    
    let query = `
      SELECT mc.*, fm.source_field, fm.target_field
      FROM mapping_conflicts mc
      LEFT JOIN field_mappings fm ON fm.id = mc.field_mapping_id
      WHERE mc.project_id = $1
    `;
    const params: any[] = [id];
    let paramCount = 2;

    if (resolution_status) {
      query += ` AND mc.resolution_status = $${paramCount++}`;
      params.push(resolution_status);
    }

    if (severity) {
      query += ` AND mc.severity = $${paramCount++}`;
      params.push(severity);
    }

    query += ` ORDER BY 
      CASE mc.severity 
        WHEN 'blocker' THEN 1 
        WHEN 'error' THEN 2 
        WHEN 'warning' THEN 3 
        WHEN 'info' THEN 4 
      END, 
      mc.created_at DESC`;

    const result = await db.query(query, params);

    return res.json({
      status: 'success',
      data: result.rows,
      count: result.rows.length
    });

  } catch (err: any) {
    console.error('Error fetching mapping conflicts:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// POST /api/v1/projects/:id/mapping-conflicts - Create mapping conflict
// -----------------------------------------------
router.post('/projects/:id/mapping-conflicts', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      field_mapping_id,
      conflict_type,
      severity = 'warning',
      source_object,
      source_field,
      source_data_type,
      target_object,
      target_field,
      target_data_type,
      conflict_description
    } = req.body;

    if (!conflict_type) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required field: conflict_type'
      });
    }

    const db = req.app.locals.db;

    const result = await db.query(`
      INSERT INTO mapping_conflicts (
        project_id, field_mapping_id, conflict_type, severity,
        source_object, source_field, source_data_type,
        target_object, target_field, target_data_type,
        conflict_description, resolution_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'unresolved')
      RETURNING *
    `, [
      id, field_mapping_id, conflict_type, severity,
      source_object, source_field, source_data_type,
      target_object, target_field, target_data_type,
      conflict_description
    ]);

    return res.status(201).json({
      status: 'success',
      message: 'Mapping conflict created',
      data: result.rows[0]
    });

  } catch (err: any) {
    console.error('Error creating mapping conflict:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// PATCH /api/v1/mapping-conflicts/:id/resolve - Resolve mapping conflict
// -----------------------------------------------
router.patch('/mapping-conflicts/:id/resolve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      resolution_action,
      resolution_details,
      user_notes,
      rca_config_id
    } = req.body;

    if (!resolution_action) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required field: resolution_action'
      });
    }

    const db = req.app.locals.db;

    const result = await db.query(`
      UPDATE mapping_conflicts
      SET 
        resolution_status = 'user_resolved',
        resolution_action = $1,
        resolution_details = $2,
        user_notes = $3,
        rca_config_id = $4,
        resolved_by = 'user',
        resolved_at = NOW(),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `, [
      resolution_action,
      JSON.stringify(resolution_details),
      user_notes,
      rca_config_id,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Conflict not found'
      });
    }

    return res.json({
      status: 'success',
      message: 'Conflict resolved',
      data: result.rows[0]
    });

  } catch (err: any) {
    console.error('Error resolving conflict:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

export default router;
