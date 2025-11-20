import request from 'supertest';
import app from '../src/index.js';
import db from '../src/database/db.js';

describe('Projects API', () => {
  let testProjectId: number;

  // Clean up before tests
  beforeAll(async () => {
    // Delete any test projects
    await db.query("DELETE FROM projects WHERE name LIKE 'Test Project%'");
  });

  // Clean up after tests
  afterAll(async () => {
    if (testProjectId) {
      await db.query('DELETE FROM projects WHERE id = $1', [testProjectId]);
    }
    await db.end();
  });

  describe('POST /api/v1/projects', () => {
    it('should create a new project with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .send({
          name: 'Test Project 1',
          description: 'Test project for unit tests',
          sourceSystem: 'Salesforce CPQ',
          targetSystem: 'Salesforce RCA'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Project 1');
      expect(response.body.data.status).toBe('draft');

      testProjectId = response.body.data.id;
    });

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .send({
          description: 'Missing required fields'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Missing required fields');
    });

    it('should create project with default status draft', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .send({
          name: 'Test Project 2',
          sourceSystem: 'CPQ',
          targetSystem: 'RCA'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.status).toBe('draft');

      // Clean up
      await db.query('DELETE FROM projects WHERE id = $1', [response.body.data.id]);
    });
  });

  describe('GET /api/v1/projects', () => {
    it('should list all projects', async () => {
      const response = await request(app).get('/api/v1/projects');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('count');
    });

    it('should include connection_count and migration_job_count', async () => {
      const response = await request(app).get('/api/v1/projects');

      if (response.body.data.length > 0) {
        const project = response.body.data[0];
        expect(project).toHaveProperty('connection_count');
        expect(project).toHaveProperty('migration_job_count');
      }
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('should get a single project by id', async () => {
      const response = await request(app).get(`/api/v1/projects/${testProjectId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(testProjectId);
      expect(response.body.data.name).toBe('Test Project 1');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app).get('/api/v1/projects/99999');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });

    it('should include connections and jobs arrays', async () => {
      const response = await request(app).get(`/api/v1/projects/${testProjectId}`);

      expect(response.body.data).toHaveProperty('connections');
      expect(response.body.data).toHaveProperty('migration_jobs');
      expect(Array.isArray(response.body.data.connections)).toBe(true);
      expect(Array.isArray(response.body.data.migration_jobs)).toBe(true);
    });
  });

  describe('PUT /api/v1/projects/:id', () => {
    it('should update project fields', async () => {
      const response = await request(app)
        .put(`/api/v1/projects/${testProjectId}`)
        .send({
          name: 'Test Project 1 Updated',
          description: 'Updated description'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('Test Project 1 Updated');
      expect(response.body.data.description).toBe('Updated description');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .put('/api/v1/projects/99999')
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
    });

    it('should handle partial updates', async () => {
      const response = await request(app)
        .put(`/api/v1/projects/${testProjectId}`)
        .send({
          description: 'Only updating description'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.description).toBe('Only updating description');
      expect(response.body.data.name).toBe('Test Project 1 Updated'); // Should remain unchanged
    });
  });

  describe('PATCH /api/v1/projects/:id/status', () => {
    it('should update project status', async () => {
      const response = await request(app)
        .patch(`/api/v1/projects/${testProjectId}/status`)
        .send({ status: 'analyzing' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('analyzing');
    });

    it('should reject invalid status', async () => {
      const response = await request(app)
        .patch(`/api/v1/projects/${testProjectId}/status`)
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid status');
    });

    it('should allow valid status transitions', async () => {
      const validStatuses = ['draft', 'analyzing', 'mapping', 'transforming', 'validating', 'executing', 'completed'];
      
      for (const status of validStatuses) {
        const response = await request(app)
          .patch(`/api/v1/projects/${testProjectId}/status`)
          .send({ status });

        expect(response.status).toBe(200);
        expect(response.body.data.status).toBe(status);
      }
    });
  });

  describe('DELETE /api/v1/projects/:id', () => {
    it('should delete a project', async () => {
      // Create a temporary project to delete
      const createResponse = await request(app)
        .post('/api/v1/projects')
        .send({
          name: 'Test Project To Delete',
          sourceSystem: 'CPQ',
          targetSystem: 'RCA'
        });

      const projectId = createResponse.body.data.id;

      const deleteResponse = await request(app).delete(`/api/v1/projects/${projectId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.status).toBe('success');

      // Verify it's deleted
      const getResponse = await request(app).get(`/api/v1/projects/${projectId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app).delete('/api/v1/projects/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Try to create project with invalid data type
      const response = await request(app)
        .post('/api/v1/projects')
        .send({
          name: 123, // Invalid type
          sourceSystem: 'CPQ',
          targetSystem: 'RCA'
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.status).toBe('error');
    });
  });
});
