import express from 'express';
import type { Request, Response } from 'express';
import { ProjectType, getProjectPhases, PHASE_NAMES } from '../types/index.js';

const router = express.Router();

// -----------------------------------------------
// GET /api/v1/projects - List all projects
// -----------------------------------------------
router.get('/projects', async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query(`
      SELECT 
        p.*,
        COUNT(DISTINCT c.id) as connection_count,
        COUNT(DISTINCT mj.id) as migration_job_count
      FROM projects p
      LEFT JOIN connections c ON c.project_id = p.id
      LEFT JOIN migration_jobs mj ON mj.project_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    return res.json({
      status: 'success',
      data: result.rows,
      count: result.rows.length
    });

  } catch (err: any) {
    console.error('Error fetching projects:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// GET /api/v1/projects/:id - Get single project
// -----------------------------------------------
router.get('/projects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    const result = await db.query(`
      SELECT 
        p.*,
        json_agg(DISTINCT jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'type', c.type,
          'status', c.status
        )) FILTER (WHERE c.id IS NOT NULL) as connections,
        json_agg(DISTINCT jsonb_build_object(
          'id', mj.id,
          'status', mj.status,
          'workstream', mj.workstream
        )) FILTER (WHERE mj.id IS NOT NULL) as migration_jobs
      FROM projects p
      LEFT JOIN connections c ON c.project_id = p.id
      LEFT JOIN migration_jobs mj ON mj.project_id = p.id
      WHERE p.id = $1
      GROUP BY p.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    return res.json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (err: any) {
    console.error('Error fetching project:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// POST /api/v1/projects - Create new project
// -----------------------------------------------
router.post('/projects', async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      project_type = 'migrate_master_with_inflight',
      include_inflight_data = true,
      skip_inflight_import = false
    } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required field: name'
      });
    }

    // Validate project type
    const validProjectTypes: ProjectType[] = [
      'migrate_master_data',
      'migrate_master_with_inflight',
      'migrate_inflight_data',
      'design_product_ai'
    ];
    
    if (!validProjectTypes.includes(project_type)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid project_type. Must be one of: ${validProjectTypes.join(', ')}`
      });
    }

    const db = req.app.locals.db;
    
    // Get available phases for this project type
    const availablePhases = getProjectPhases(project_type);
    
    const result = await db.query(`
      INSERT INTO projects (
        name, 
        description, 
        project_type,
        include_inflight_data,
        skip_inflight_import,
        current_phase,
        completed_phases,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
      RETURNING *
    `, [
      name, 
      description, 
      project_type,
      include_inflight_data,
      skip_inflight_import,
      availablePhases[0], // Start with first phase
      []  // Empty completed phases
    ]);

    return res.status(201).json({
      status: 'success',
      message: 'Project created successfully',
      data: {
        ...result.rows[0],
        available_phases: availablePhases.map(phase => ({
          phase,
          name: PHASE_NAMES[phase]
        }))
      }
    });

  } catch (err: any) {
    console.error('Error creating project:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// PUT /api/v1/projects/:id - Update project
// -----------------------------------------------
router.put('/projects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, source_system, target_system, client_name, status, settings } = req.body;
    const db = req.app.locals.db;

    // Check if project exists
    const checkResult = await db.query('SELECT id FROM projects WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (source_system !== undefined) {
      updates.push(`source_system = $${paramCount++}`);
      values.push(source_system);
    }
    if (target_system !== undefined) {
      updates.push(`target_system = $${paramCount++}`);
      values.push(target_system);
    }
    if (client_name !== undefined) {
      updates.push(`client_name = $${paramCount++}`);
      values.push(client_name);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (settings !== undefined) {
      updates.push(`settings = $${paramCount++}`);
      values.push(JSON.stringify(settings));
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await db.query(`
      UPDATE projects 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    return res.json({
      status: 'success',
      message: 'Project updated successfully',
      data: result.rows[0]
    });

  } catch (err: any) {
    console.error('Error updating project:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// DELETE /api/v1/projects/:id - Delete project
// -----------------------------------------------
router.delete('/projects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    // Check if project exists
    const checkResult = await db.query('SELECT id FROM projects WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    // Delete project (CASCADE will handle related records)
    await db.query('DELETE FROM projects WHERE id = $1', [id]);

    return res.json({
      status: 'success',
      message: 'Project deleted successfully'
    });

  } catch (err: any) {
    console.error('Error deleting project:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// PATCH /api/v1/projects/:id/status - Update project status
// -----------------------------------------------
router.patch('/projects/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = req.app.locals.db;

    const validStatuses = ['draft', 'analyzing', 'mapping', 'transforming', 'validating', 'executing', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const result = await db.query(`
      UPDATE projects 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    return res.json({
      status: 'success',
      message: 'Project status updated successfully',
      data: result.rows[0]
    });

  } catch (err: any) {
    console.error('Error updating project status:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

console.log(">>> Projects Router registered routes:", router.stack);

export default router;
