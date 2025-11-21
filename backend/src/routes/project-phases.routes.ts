import express from 'express';
import type { Request, Response } from 'express';
import { getProjectPhases, getNextPhase, PHASE_NAMES, MigrationPhase } from '../types/index.js';

const router = express.Router();

// -----------------------------------------------
// GET /api/v1/projects/:id/phases - Get project phases
// -----------------------------------------------
router.get('/projects/:id/phases', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    // Get project
    const result = await db.query(`
      SELECT project_type, current_phase, completed_phases
      FROM projects
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    const project = result.rows[0];
    const availablePhases = getProjectPhases(project.project_type);
    const completedPhases = project.completed_phases || [];

    return res.json({
      status: 'success',
      data: {
        current_phase: project.current_phase,
        completed_phases: completedPhases,
        available_phases: availablePhases.map((phase: MigrationPhase) => ({
          phase,
          name: PHASE_NAMES[phase],
          status: completedPhases.includes(phase) ? 'completed' : 
                  phase === project.current_phase ? 'in_progress' : 'pending'
        }))
      }
    });

  } catch (err: any) {
    console.error('Error fetching project phases:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// POST /api/v1/projects/:id/phases/complete - Mark current phase as complete and move to next
// -----------------------------------------------
router.post('/projects/:id/phases/complete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    // Get project
    const result = await db.query(`
      SELECT project_type, current_phase, completed_phases
      FROM projects
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    const project = result.rows[0];
    const currentPhase = project.current_phase as MigrationPhase;
    const completedPhases = project.completed_phases || [];
    
    // Add current phase to completed if not already there
    if (!completedPhases.includes(currentPhase)) {
      completedPhases.push(currentPhase);
    }

    // Get next phase
    const nextPhase = getNextPhase(project.project_type, currentPhase);
    
    if (!nextPhase) {
      // No next phase - project complete
      await db.query(`
        UPDATE projects
        SET completed_phases = $1, status = 'completed', updated_at = NOW()
        WHERE id = $2
      `, [completedPhases, id]);

      return res.json({
        status: 'success',
        message: 'Project completed!',
        data: {
          current_phase: null,
          completed_phases: completedPhases,
          project_complete: true
        }
      });
    }

    // Move to next phase
    await db.query(`
      UPDATE projects
      SET current_phase = $1, completed_phases = $2, updated_at = NOW()
      WHERE id = $3
    `, [nextPhase, completedPhases, id]);

    return res.json({
      status: 'success',
      message: `Phase '${PHASE_NAMES[currentPhase]}' completed. Moving to '${PHASE_NAMES[nextPhase]}'`,
      data: {
        previous_phase: currentPhase,
        current_phase: nextPhase,
        completed_phases: completedPhases
      }
    });

  } catch (err: any) {
    console.error('Error completing phase:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// POST /api/v1/projects/:id/phases/skip-inflight - Skip in-flight data import
// -----------------------------------------------
router.post('/projects/:id/phases/skip-inflight', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    // Get project
    const result = await db.query(`
      SELECT project_type, current_phase, completed_phases
      FROM projects
      WHERE id = $1 AND project_type = 'migrate_master_with_inflight'
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found or not eligible for skipping in-flight data'
      });
    }

    const project = result.rows[0];
    const completedPhases = project.completed_phases || [];

    // Mark skip flag and jump to report phase
    await db.query(`
      UPDATE projects
      SET 
        skip_inflight_import = true,
        current_phase = 'report',
        completed_phases = $1,
        updated_at = NOW()
      WHERE id = $2
    `, [
      [...completedPhases, 'import_transactions'], // Mark as skipped but completed
      id
    ]);

    return res.json({
      status: 'success',
      message: 'In-flight data import skipped. Moving to final report.',
      data: {
        skip_inflight_import: true,
        current_phase: 'report'
      }
    });

  } catch (err: any) {
    console.error('Error skipping in-flight import:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// POST /api/v1/projects/:id/phases/rollback - Rollback to mapping phase
// -----------------------------------------------
router.post('/projects/:id/phases/rollback', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const db = req.app.locals.db;
    
    // Get project
    const result = await db.query(`
      SELECT current_phase, completed_phases
      FROM projects
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    const project = result.rows[0];
    const completedPhases: MigrationPhase[] = project.completed_phases || [];
    
    // Remove phases after mapping
    const phasesToRemove: MigrationPhase[] = ['transform', 'validate', 'execute', 'test'];
    const updatedCompletedPhases = completedPhases.filter(
      (phase: MigrationPhase) => !phasesToRemove.includes(phase)
    );

    // Rollback to mapping phase
    await db.query(`
      UPDATE projects
      SET 
        current_phase = 'mapping',
        completed_phases = $1,
        status = 'mapping',
        updated_at = NOW()
      WHERE id = $2
    `, [updatedCompletedPhases, id]);

    // Log rollback reason
    await db.query(`
      INSERT INTO project_logs (project_id, log_type, message, metadata)
      VALUES ($1, 'rollback', $2, $3)
    `, [
      id,
      'Rollback to mapping phase',
      JSON.stringify({ reason, from_phase: project.current_phase })
    ]);

    return res.json({
      status: 'success',
      message: 'Project rolled back to mapping phase',
      data: {
        current_phase: 'mapping',
        completed_phases: updatedCompletedPhases,
        rollback_reason: reason
      }
    });

  } catch (err: any) {
    console.error('Error rolling back project:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

export default router;
