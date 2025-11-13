// backend/src/routes/analyze.routes.ts
import { Router, Request, Response } from 'express';
import { RedisService } from '../services/redis.service.js';

const router = Router();
const redis = new RedisService();

redis.connect();

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
 * @route POST /projects/:id/analyze
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
      createdAt: new Date().toISOString(),
    });

    setTimeout(async () => {
      await redis.set(`job:${jobId}`, {
        status: 'in-progress',
        projectId,
        objects,
        startedAt: new Date().toISOString(),
      });

      try {
        const analysisResult = {
          analyzedObjects: objects.length,
          message: 'Schema analysis finished successfully',
          timestamp: new Date().toISOString(),
        };

        await redis.set(`job:${jobId}`, {
          status: 'completed',
          projectId,
          objects,
          completedAt: new Date().toISOString(),
          result: analysisResult,
        });

        console.log(`✅ Job ${jobId} completed`);
      } catch (err: any) {
        console.error(`❌ Job ${jobId} failed:`, err.message);

        await redis.set(`job:${jobId}`, {
          status: 'failed',
          projectId,
          objects,
          failedAt: new Date().toISOString(),
          error: err.message,
        });
      }
    }, 2000);

    res.json({
      job_id: jobId,
      status: 'queued',
      message: 'Analysis started',
      objects,
    });
  } catch (error: any) {
    console.error('❌ Error starting analysis:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ⭐ IMPORTANT ⭐
 * Summary route MUST BE ABOVE the /:jobId route
 * Otherwise Express treats 'summary' as a jobId.
 */

/**
 * @route GET /projects/:id/analyze/summary
 */
router.get('/projects/:id/analyze/summary', async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id, 10);

    const summary = {
      project_id: projectId,
      total_objects: 5,
      custom_objects: 2,
      total_fields: 78,
      custom_fields: 25,
      readiness_score: 0.84,
      warnings: [
        "Product2.Special__c is not mapped",
        "Pricebook2.Discount__c is unused",
        "Custom object Inventory__c missing required fields"
      ],
      last_analyzed_at: new Date().toISOString()
    };

    return res.json(summary);
  } catch (error: any) {
    console.error('❌ Error fetching summary:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /projects/:id/analyze/:jobId
 */
router.get('/projects/:id/analyze/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const job = await redis.get<AnalysisJob>(`job:${jobId}`);

    if (!job) {
      return res.status(404).json({
        error: `Job ${jobId} not found`,
      });
    }

    return res.json(job);
  } catch (error: any) {
    console.error('❌ Error fetching job status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /projects/:id/analyze/jobs
 */
router.get('/projects/:id/analyze/jobs', async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;

    const keys = await redis.getKeys('job:');
    const jobs: any[] = [];

    for (const key of keys) {
      const job = await redis.get<AnalysisJob>(key);
      if (job && job.projectId === projectId) {
        jobs.push({
          job_id: key.replace('job:', ''),
          ...job,
        });
      }
    }

    return res.json({
      project_id: projectId,
      total_jobs: jobs.length,
      jobs,
    });
  } catch (error: any) {
    console.error('❌ Error fetching jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
