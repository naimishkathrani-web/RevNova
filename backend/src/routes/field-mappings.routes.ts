import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

// -----------------------------------------------
// GET /api/v1/projects/:projectId/field-mappings
// -----------------------------------------------
router.get('/projects/:projectId/field-mappings', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { objectName, status } = req.query;
    const db = req.app.locals.db;

    let query = `
      SELECT fm.*, ai.confidence_score, ai.reasoning
      FROM field_mappings fm
      LEFT JOIN ai_suggestions ai ON ai.mapping_id = fm.id
      WHERE fm.project_id = $1
    `;
    const params: any[] = [projectId];
    let paramCount = 2;

    if (objectName) {
      query += ` AND fm.source_object = $${paramCount++}`;
      params.push(objectName);
    }

    if (status) {
      query += ` AND fm.status = $${paramCount++}`;
      params.push(status);
    }

    query += ' ORDER BY fm.source_object, fm.source_field';

    const result = await db.query(query, params);

    return res.json({
      status: 'success',
      data: result.rows,
      count: result.rows.length
    });

  } catch (err: any) {
    console.error('Error fetching field mappings:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// POST /api/v1/projects/:projectId/field-mappings
// -----------------------------------------------
router.post('/projects/:projectId/field-mappings', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const {
      sourceObject,
      sourceField,
      targetObject,
      targetField,
      mappingType,
      transformRule,
      isRequired,
      defaultValue
    } = req.body;

    if (!sourceObject || !sourceField || !targetObject || !targetField) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: sourceObject, sourceField, targetObject, targetField'
      });
    }

    const db = req.app.locals.db;

    const result = await db.query(`
      INSERT INTO field_mappings (
        project_id, source_object, source_field, target_object, target_field,
        mapping_type, transform_rule, is_required, default_value, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING *
    `, [
      projectId,
      sourceObject,
      sourceField,
      targetObject,
      targetField,
      mappingType || 'direct',
      transformRule ? JSON.stringify(transformRule) : null,
      isRequired || false,
      defaultValue
    ]);

    return res.status(201).json({
      status: 'success',
      message: 'Field mapping created successfully',
      data: result.rows[0]
    });

  } catch (err: any) {
    console.error('Error creating field mapping:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// POST /api/v1/projects/:projectId/field-mappings/bulk
// -----------------------------------------------
router.post('/projects/:projectId/field-mappings/bulk', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { mappings } = req.body;

    if (!Array.isArray(mappings) || mappings.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'mappings must be a non-empty array'
      });
    }

    const db = req.app.locals.db;
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const insertedMappings = [];
      for (const mapping of mappings) {
        const result = await client.query(`
          INSERT INTO field_mappings (
            project_id, source_object, source_field, target_object, target_field,
            mapping_type, transform_rule, is_required, default_value, status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
          RETURNING *
        `, [
          projectId,
          mapping.sourceObject,
          mapping.sourceField,
          mapping.targetObject,
          mapping.targetField,
          mapping.mappingType || 'direct',
          mapping.transformRule ? JSON.stringify(mapping.transformRule) : null,
          mapping.isRequired || false,
          mapping.defaultValue
        ]);
        insertedMappings.push(result.rows[0]);
      }

      await client.query('COMMIT');

      return res.status(201).json({
        status: 'success',
        message: `${insertedMappings.length} field mappings created successfully`,
        data: insertedMappings
      });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (err: any) {
    console.error('Error creating bulk mappings:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// PUT /api/v1/field-mappings/:id
// -----------------------------------------------
router.put('/field-mappings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      targetObject,
      targetField,
      mappingType,
      transformRule,
      isRequired,
      defaultValue,
      status
    } = req.body;

    const db = req.app.locals.db;
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (targetObject !== undefined) {
      updates.push(`target_object = $${paramCount++}`);
      values.push(targetObject);
    }
    if (targetField !== undefined) {
      updates.push(`target_field = $${paramCount++}`);
      values.push(targetField);
    }
    if (mappingType !== undefined) {
      updates.push(`mapping_type = $${paramCount++}`);
      values.push(mappingType);
    }
    if (transformRule !== undefined) {
      updates.push(`transform_rule = $${paramCount++}`);
      values.push(JSON.stringify(transformRule));
    }
    if (isRequired !== undefined) {
      updates.push(`is_required = $${paramCount++}`);
      values.push(isRequired);
    }
    if (defaultValue !== undefined) {
      updates.push(`default_value = $${paramCount++}`);
      values.push(defaultValue);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await db.query(`
      UPDATE field_mappings
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Field mapping not found'
      });
    }

    return res.json({
      status: 'success',
      message: 'Field mapping updated successfully',
      data: result.rows[0]
    });

  } catch (err: any) {
    console.error('Error updating field mapping:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// DELETE /api/v1/field-mappings/:id
// -----------------------------------------------
router.delete('/field-mappings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    const result = await db.query('DELETE FROM field_mappings WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Field mapping not found'
      });
    }

    return res.json({
      status: 'success',
      message: 'Field mapping deleted successfully'
    });

  } catch (err: any) {
    console.error('Error deleting field mapping:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// POST /api/v1/projects/:projectId/field-mappings/auto-map
// -----------------------------------------------
router.post('/projects/:projectId/field-mappings/auto-map', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { sourceObject, targetObject, confidenceThreshold = 0.7 } = req.body;

    if (!sourceObject || !targetObject) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: sourceObject, targetObject'
      });
    }

    const db = req.app.locals.db;

    // Get schema analysis for both objects
    const schemaResult = await db.query(`
      SELECT source_metadata, target_metadata
      FROM schema_analysis
      WHERE project_id = $1 AND source_object = $2
    `, [projectId, sourceObject]);

    if (schemaResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Schema analysis not found for specified objects'
      });
    }

    const { source_metadata, target_metadata } = schemaResult.rows[0];
    const autoMappings = [];

    // Simple auto-mapping logic based on field name similarity
    for (const sourceField of source_metadata.fields || []) {
      for (const targetField of target_metadata.fields || []) {
        const nameSimilarity = calculateNameSimilarity(sourceField.name, targetField.name);
        const typesMatch = sourceField.type === targetField.type;

        let confidence = nameSimilarity;
        if (typesMatch) confidence += 0.2;
        if (sourceField.label === targetField.label) confidence += 0.1;

        if (confidence >= confidenceThreshold) {
          autoMappings.push({
            sourceObject,
            sourceField: sourceField.name,
            targetObject,
            targetField: targetField.name,
            mappingType: typesMatch ? 'direct' : 'transform',
            confidence: Math.min(confidence, 1.0)
          });
        }
      }
    }

    return res.json({
      status: 'success',
      message: `Found ${autoMappings.length} potential mappings`,
      data: autoMappings
    });

  } catch (err: any) {
    console.error('Error auto-mapping fields:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// Helper: Calculate name similarity (simple Levenshtein-like)
// -----------------------------------------------
function calculateNameSimilarity(name1: string, name2: string): number {
  const n1 = name1.toLowerCase();
  const n2 = name2.toLowerCase();

  if (n1 === n2) return 1.0;
  if (n1.includes(n2) || n2.includes(n1)) return 0.8;

  // Simple character overlap
  const chars1 = new Set(n1.split(''));
  const chars2 = new Set(n2.split(''));
  const intersection = new Set([...chars1].filter(x => chars2.has(x)));
  const union = new Set([...chars1, ...chars2]);

  return intersection.size / union.size;
}

export default router;
