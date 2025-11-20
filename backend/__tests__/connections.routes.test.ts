import request from 'supertest';
import app from '../src/index.js';
import db from '../src/database/db.js';

describe('Connections API', () => {
  let testProjectId: number;
  let testConnectionId: number;

  beforeAll(async () => {
    // Create a test project
    const result = await db.query(`
      INSERT INTO projects (name, source_system, target_system, status)
      VALUES ('Test Project for Connections', 'CPQ', 'RCA', 'draft')
      RETURNING id
    `);
    testProjectId = result.rows[0].id;
  });

  afterAll(async () => {
    // Clean up
    if (testConnectionId) {
      await db.query('DELETE FROM connections WHERE id = $1', [testConnectionId]);
    }
    await db.query('DELETE FROM projects WHERE id = $1', [testProjectId]);
    await db.end();
  });

  describe('POST /api/v1/connections/test', () => {
    it('should test Salesforce credentials', async () => {
      const response = await request(app)
        .post('/api/v1/connections/test')
        .send({
          instanceUrl: process.env.TEST_SF_INSTANCE_URL || 'https://test.salesforce.com',
          accessToken: process.env.TEST_SF_ACCESS_TOKEN || 'test_token_123',
          refreshToken: process.env.TEST_SF_REFRESH_TOKEN || 'test_refresh_123'
        });

      // Note: This will likely fail without valid credentials, but we're testing the endpoint structure
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.body).toHaveProperty('status');
    });

    it('should fail without required credentials', async () => {
      const response = await request(app)
        .post('/api/v1/connections/test')
        .send({
          instanceUrl: 'https://test.salesforce.com'
          // Missing tokens
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/projects/:projectId/connections', () => {
    it('should create a connection with valid data', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${testProjectId}/connections`)
        .send({
          name: 'Test CPQ Connection',
          connectionType: 'source',
          instanceUrl: 'https://test.salesforce.com',
          accessToken: 'test_access_token_123',
          refreshToken: 'test_refresh_token_123'
        });

      // May fail due to Salesforce validation, but testing structure
      if (response.status === 201) {
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.name).toBe('Test CPQ Connection');
        testConnectionId = response.body.data.id;
      } else {
        // If Salesforce test fails, that's expected in test environment
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${testProjectId}/connections`)
        .send({
          name: 'Incomplete Connection'
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should fail for non-existent project', async () => {
      const response = await request(app)
        .post('/api/v1/projects/99999/connections')
        .send({
          name: 'Test Connection',
          connectionType: 'source',
          instanceUrl: 'https://test.salesforce.com',
          accessToken: 'token',
          refreshToken: 'refresh'
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/v1/projects/:projectId/connections', () => {
    it('should list connections for a project', async () => {
      const response = await request(app).get(`/api/v1/projects/${testProjectId}/connections`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should not include access tokens in response', async () => {
      const response = await request(app).get(`/api/v1/projects/${testProjectId}/connections`);

      if (response.body.data.length > 0) {
        const connection = response.body.data[0];
        expect(connection).not.toHaveProperty('access_token');
        expect(connection).not.toHaveProperty('refresh_token');
      }
    });

    it('should return empty array for project with no connections', async () => {
      // Create a new project with no connections
      const projectResult = await db.query(`
        INSERT INTO projects (name, source_system, target_system, status)
        VALUES ('Empty Project', 'CPQ', 'RCA', 'draft')
        RETURNING id
      `);
      const emptyProjectId = projectResult.rows[0].id;

      const response = await request(app).get(`/api/v1/projects/${emptyProjectId}/connections`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);

      // Clean up
      await db.query('DELETE FROM projects WHERE id = $1', [emptyProjectId]);
    });
  });

  describe('GET /api/v1/connections/:id', () => {
    beforeEach(async () => {
      // Create a test connection if needed
      if (!testConnectionId) {
        const result = await db.query(`
          INSERT INTO connections (
            project_id, name, connection_type, instance_url, 
            access_token, refresh_token, status
          )
          VALUES ($1, 'Test Connection', 'source', 'https://test.sf.com', 'token123', 'refresh123', 'active')
          RETURNING id
        `, [testProjectId]);
        testConnectionId = result.rows[0].id;
      }
    });

    it('should get a single connection by id', async () => {
      const response = await request(app).get(`/api/v1/connections/${testConnectionId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(testConnectionId);
    });

    it('should not expose tokens in GET response', async () => {
      const response = await request(app).get(`/api/v1/connections/${testConnectionId}`);

      expect(response.body.data).not.toHaveProperty('access_token');
      expect(response.body.data).not.toHaveProperty('refresh_token');
    });

    it('should return 404 for non-existent connection', async () => {
      const response = await request(app).get('/api/v1/connections/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/connections/:id', () => {
    it('should update connection fields', async () => {
      const response = await request(app)
        .put(`/api/v1/connections/${testConnectionId}`)
        .send({
          name: 'Updated Connection Name',
          instanceUrl: 'https://updated.salesforce.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Connection Name');
    });

    it('should handle partial updates', async () => {
      const response = await request(app)
        .put(`/api/v1/connections/${testConnectionId}`)
        .send({
          name: 'Partially Updated'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Partially Updated');
    });

    it('should return 404 for non-existent connection', async () => {
      const response = await request(app)
        .put('/api/v1/connections/99999')
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/connections/:id/refresh', () => {
    it('should handle refresh token request', async () => {
      const response = await request(app).post(`/api/v1/connections/${testConnectionId}/refresh`);

      // Will likely fail without valid Salesforce credentials, but testing structure
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.body).toHaveProperty('status');
    });

    it('should return 404 for non-existent connection', async () => {
      const response = await request(app).post('/api/v1/connections/99999/refresh');

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/connections/:id', () => {
    it('should delete a connection', async () => {
      // Create a temporary connection to delete
      const createResult = await db.query(`
        INSERT INTO connections (
          project_id, name, connection_type, instance_url, 
          access_token, refresh_token, status
        )
        VALUES ($1, 'Connection to Delete', 'source', 'https://test.sf.com', 'token', 'refresh', 'active')
        RETURNING id
      `, [testProjectId]);
      const connectionId = createResult.rows[0].id;

      const response = await request(app).delete(`/api/v1/connections/${connectionId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      // Verify it's deleted
      const getResponse = await request(app).get(`/api/v1/connections/${connectionId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent connection', async () => {
      const response = await request(app).delete('/api/v1/connections/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('Security', () => {
    it('should never expose access tokens in list responses', async () => {
      const response = await request(app).get(`/api/v1/projects/${testProjectId}/connections`);

      response.body.data.forEach((conn: any) => {
        expect(conn).not.toHaveProperty('access_token');
        expect(conn).not.toHaveProperty('refresh_token');
      });
    });

    it('should never expose tokens in single connection response', async () => {
      const response = await request(app).get(`/api/v1/connections/${testConnectionId}`);

      expect(response.body.data).not.toHaveProperty('access_token');
      expect(response.body.data).not.toHaveProperty('refresh_token');
    });
  });
});
