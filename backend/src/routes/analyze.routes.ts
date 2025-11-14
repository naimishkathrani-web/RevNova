// backend/src/routes/analyze.routes.ts
import { Router, Request, Response } from 'express';
import { RedisService } from '../services/redis.service';

const router = Router();
const redis = new RedisService();
if (process.env.NODE_ENV !== 'test') {
  redis.connect();
}


interface AnalysisJob {
  status: string;
  projectId: string;
  objects: string[];
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  result?: any;
  error?: string;
}

/**
 * ----------------------------------------------------
 * POST /projects/:id/analyze
 * ----------------------------------------------------
 */
router.post('/projects/:id/analyze', async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const objects = req.body.objects || ['Product2', 'Pricebook2', 'PricebookEntry'];
    const jobId = `job_${Date.now()}`;

    await redis.set(`job:${jobId}`, {
      status: 'queued',
      projectId,
      objects,
      createdAt: new Date().toISOString()
    });

    // Skip async timers during tests
    if (process.env.NODE_ENV !== 'test') {
      // ⭐ IMPORTANT: .unref() prevents Jest from waiting for the timer
      setTimeout(async () => {
        await redis.set(`job:${jobId}`, {
          status: 'in-progress',
          projectId,
          objects,
          startedAt: new Date().toISOString()
        });

        try {
          const analysisResult = {
            analyzedObjects: objects.length,
            message: 'Schema analysis finished successfully',
            timestamp: new Date().toISOString()
          };

          await redis.set(`job:${jobId}`, {
            status: 'completed',
            projectId,
            objects,
            completedAt: new Date().toISOString(),
            result: analysisResult
          });

          console.log(`✅ Job ${jobId} completed`);
        } catch (err: any) {
          console.error(`❌ Job ${jobId} failed`, err.message);

          await redis.set(`job:${jobId}`, {
            status: 'failed',
            projectId,
            objects,
            failedAt: new Date().toISOString(),
            error: err.message
          });
        }

      }, 2000).unref(); // <-- FIX FOR JEST
    }

    return res.json({
      job_id: jobId,
      status: 'queued',
      message: 'Analysis started',
      objects
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * ----------------------------------------------------
 * GET /projects/:id/analyze/summary
 * ----------------------------------------------------
 */
router.get('/projects/:id/analyze/summary', async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.id);

    const summary = {
      project_id: projectId,
      total_objects: 5,
      custom_objects: 2,
      total_fields: 78,
      custom_fields: 25,
      readiness_score: 0.84,
      warnings: [
        'Product2.Special__c is not mapped',
        'Pricebook2.Discount__c is unused',
        'Custom object Inventory__c missing required fields'
      ],
      last_analyzed_at: new Date().toISOString()
    };

    return res.json(summary);
  } catch (error: any) {
    console.error('❌ Error fetching summary:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * ----------------------------------------------------
 * GET /projects/:id/catalog/search
 * ----------------------------------------------------
 */
router.get('/projects/:id/catalog/search', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const q = req.query.q as string;

    if (!q) {
      return res.status(400).json({ error: 'Missing query parameter q' });
    }

    const db = req.app.locals.db;

    const query = `
      SELECT * FROM schema_catalog
      WHERE project_id = $1
      AND (field_name ILIKE $2 OR field_label ILIKE $2)
      ORDER BY field_name
      LIMIT 20
    `;

    const result = await db.query(query, [id, `%${q}%`]);

    return res.json({ results: result.rows });

  } catch (error: any) {
    console.error('❌ Error performing metadata search:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * ----------------------------------------------------
 * GET /projects/:id/relationships
 * ----------------------------------------------------
 */
router.get('/projects/:id/relationships', async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;

    const query = `
      SELECT 
        source_object,
        source_field,
        target_object,
        relationship_type,
        cascade_delete
      FROM object_relationships
      WHERE project_id = $1
      ORDER BY source_object, source_field
    `;

    const result = await db.query(query, [req.params.id]);

    return res.json({
      project_id: req.params.id,
      relationships: result.rows
    });

  } catch (error: any) {
    console.error('❌ Error fetching relationships:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * ----------------------------------------------------
 * GET /projects/:id/analyze/:jobId
 * ----------------------------------------------------
 */
router.get('/projects/:id/analyze/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const job = await redis.get<AnalysisJob>(`job:${jobId}`);

    if (!job) {
      return res.status(404).json({ error: `Job ${jobId} not found` });
    }

    return res.json(job);

  } catch (error: any) {
    console.error('❌ Error fetching job status:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * ----------------------------------------------------
 * GET /projects/:id/analyze/jobs
 * ----------------------------------------------------
 */
router.get('/projects/:id/analyze/jobs', async (req: Request, res: Response) => {
  try {
    const keys = await redis.getKeys('job:');
    const projectId = req.params.id;

    const jobs: any[] = [];

    for (const key of keys) {
      const job = await redis.get<AnalysisJob>(key);

      if (job && job.projectId === projectId) {
        jobs.push({
          job_id: key.replace('job:', ''),
          ...job
        });
      }
    }

    return res.json({
      project_id: projectId,
      total_jobs: jobs.length,
      jobs
    });

  } catch (error: any) {
    console.error('❌ Error fetching jobs:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
