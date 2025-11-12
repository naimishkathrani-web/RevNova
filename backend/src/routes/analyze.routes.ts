import { Router, Request, Response } from 'express';
import { SalesforceService } from '../services/salesforce.service.js';

const router = Router();
const sfService = new SalesforceService();

router.post('/projects/:id/analyze', async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const objects = req.body.objects || ['Product2', 'Pricebook2', 'PricebookEntry'];

    // TODO: Get connection from DB using projectId
    // For now, return job ID
    const jobId = `job_${Date.now()}`;

    res.json({
      job_id: jobId,
      status: 'queued',
      objects: objects
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
