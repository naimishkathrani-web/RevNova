import request from 'supertest';
import { app, server } from '../../index'; 
import { RedisService } from '../../services/redis.service';

const redis = new RedisService();

describe('POST /projects/:id/analyze', () => {
  it('should queue a schema analysis job', async () => {
    const response = await request(app)
      .post('/api/v1/projects/1/analyze')
      .send({ objects: ['Account'] });

    expect(response.status).toBe(200);
    expect(response.body.job_id).toBeDefined();
    expect(response.body.status).toBe("queued");
    expect(response.body.message).toBe("Analysis started");
  });
});

/**
 * 🧹 Clean up Express + Redis after tests
 */
afterAll(async () => {
  // Close Express server (only if running)
  if (server && server.close) {
    await new Promise((resolve) => server.close(resolve));
  }

  // Close Redis safely
  try {
    await redis.disconnect();
  } catch {
    // ignore
  }
});
