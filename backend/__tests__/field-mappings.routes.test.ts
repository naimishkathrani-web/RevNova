import request from 'supertest';
import app from '../src/index.js';
import db from '../src/database/db.js';

describe('Field Mappings API', () => {
  let testProjectId: number;
  let testMappingId: number;

  beforeAll(async () => {
    // Create a test project
    const result = await db.query(`
      INSERT INTO projects (name, source_system, target_system, status)
      VALUES ('Test Project for Mappings', 'CPQ', 'RCA', 'mapping')
      RETURNING id
    `);
    testProjectId = result.rows[0].id;
  });

  afterAll(async () => {
    // Clean up
    await db.query('DELETE FROM field_mappings WHERE project_id = $1', [testProjectId]);
    await db.query('DELETE FROM projects WHERE id = $1', [testProjectId]);
    await db.end();
  });

  describe('POST /api/v1/projects/:projectId/field-mappings', () => {
    it('should create a field mapping', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${testProjectId}/field-mappings`)
        .send({
          sourceObject: 'Product2',
          sourceField: 'Name',
          targetObject: 'CatalogItem',
          targetField: 'ItemName',
          mappingType: 'direct',
          isRequired: true
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.source_object).toBe('Product2');
      expect(response.body.data.target_field).toBe('ItemName');
      expect(response.body.data.status).toBe('pending');

      testMappingId = response.body.data.id;
    });

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${testProjectId}/field-mappings`)
        .send({
          sourceObject: 'Product2'
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Missing required fields');
    });

    it('should default to direct mapping type', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${testProjectId}/field-mappings`)
        .send({
          sourceObject: 'Quote',
          sourceField: 'Status',
          targetObject: 'Deal',
          targetField: 'DealStatus'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.mapping_type).toBe('direct');

      // Clean up
      await db.query('DELETE FROM field_mappings WHERE id = $1', [response.body.data.id]);
    });

    it('should handle transform rules as JSON', async () => {
      const transformRule = {
        type: 'lookup',
        mapping: { 'Draft': 'NEW', 'Approved': 'APPROVED' }
      };

      const response = await request(app)
        .post(`/api/v1/projects/${testProjectId}/field-mappings`)
        .send({
          sourceObject: 'Quote',
          sourceField: 'Status',
          targetObject: 'Deal',
          targetField: 'Status',
          mappingType: 'transform',
          transformRule
        });

      expect(response.status).toBe(201);
      expect(response.body.data.transform_rule).toBeTruthy();

      // Clean up
      await db.query('DELETE FROM field_mappings WHERE id = $1', [response.body.data.id]);
    });
  });

  describe('GET /api/v1/projects/:projectId/field-mappings', () => {
    it('should list all field mappings for a project', async () => {
      const response = await request(app).get(`/api/v1/projects/${testProjectId}/field-mappings`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('count');
    });

    it('should filter by object name', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${testProjectId}/field-mappings`)
        .query({ objectName: 'Product2' });

      expect(response.status).toBe(200);
      response.body.data.forEach((mapping: any) => {
        expect(mapping.source_object).toBe('Product2');
      });
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${testProjectId}/field-mappings`)
        .query({ status: 'pending' });

      expect(response.status).toBe(200);
      response.body.data.forEach((mapping: any) => {
        expect(mapping.status).toBe('pending');
      });
    });

    it('should include AI confidence scores if available', async () => {
      const response = await request(app).get(`/api/v1/projects/${testProjectId}/field-mappings`);

      // Check structure (confidence_score may be null if no AI suggestion)
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('confidence_score');
      }
    });
  });

  describe('PUT /api/v1/field-mappings/:id', () => {
    it('should update field mapping', async () => {
      const response = await request(app)
        .put(`/api/v1/field-mappings/${testMappingId}`)
        .send({
          targetField: 'UpdatedFieldName',
          mappingType: 'transform',
          status: 'validated'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.target_field).toBe('UpdatedFieldName');
      expect(response.body.data.mapping_type).toBe('transform');
      expect(response.body.data.status).toBe('validated');
    });

    it('should handle partial updates', async () => {
      const response = await request(app)
        .put(`/api/v1/field-mappings/${testMappingId}`)
        .send({
          status: 'approved'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('approved');
    });

    it('should return 404 for non-existent mapping', async () => {
      const response = await request(app)
        .put('/api/v1/field-mappings/99999')
        .send({ status: 'approved' });

      expect(response.status).toBe(404);
    });

    it('should fail with no fields to update', async () => {
      const response = await request(app)
        .put(`/api/v1/field-mappings/${testMappingId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('No fields to update');
    });
  });

  describe('POST /api/v1/projects/:projectId/field-mappings/bulk', () => {
    it('should create multiple mappings in a transaction', async () => {
      const mappings = [
        {
          sourceObject: 'Product2',
          sourceField: 'ProductCode',
          targetObject: 'CatalogItem',
          targetField: 'ItemCode'
        },
        {
          sourceObject: 'Product2',
          sourceField: 'Description',
          targetObject: 'CatalogItem',
          targetField: 'ItemDescription'
        },
        {
          sourceObject: 'Product2',
          sourceField: 'IsActive',
          targetObject: 'CatalogItem',
          targetField: 'Active'
        }
      ];

      const response = await request(app)
        .post(`/api/v1/projects/${testProjectId}/field-mappings/bulk`)
        .send({ mappings });

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('3 field mappings created');
      expect(response.body.data).toHaveLength(3);

      // Clean up
      const ids = response.body.data.map((m: any) => m.id);
      await db.query('DELETE FROM field_mappings WHERE id = ANY($1::int[])', [ids]);
    });

    it('should fail with empty mappings array', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${testProjectId}/field-mappings/bulk`)
        .send({ mappings: [] });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('non-empty array');
    });

    it('should rollback on error', async () => {
      const mappings = [
        {
          sourceObject: 'Product2',
          sourceField: 'ValidField',
          targetObject: 'CatalogItem',
          targetField: 'ValidTarget'
        },
        {
          sourceObject: 'Product2',
          // Missing required sourceField - should cause error
          targetObject: 'CatalogItem',
          targetField: 'InvalidTarget'
        }
      ];

      const response = await request(app)
        .post(`/api/v1/projects/${testProjectId}/field-mappings/bulk`)
        .send({ mappings });

      expect(response.status).toBeGreaterThanOrEqual(400);

      // Verify no mappings were created (transaction rolled back)
      const checkResult = await db.query(
        'SELECT COUNT(*) FROM field_mappings WHERE source_field = $1',
        ['ValidField']
      );
      expect(parseInt(checkResult.rows[0].count)).toBe(0);
    });
  });

  describe('POST /api/v1/projects/:projectId/field-mappings/auto-map', () => {
    beforeAll(async () => {
      // Create schema analysis data for auto-mapping
      await db.query(`
        INSERT INTO schema_analysis (
          project_id, source_object, source_metadata, target_metadata, analysis_status
        )
        VALUES (
          $1,
          'Product2',
          '{"fields": [
            {"name": "Name", "type": "string", "label": "Product Name"},
            {"name": "ProductCode", "type": "string", "label": "Product Code"},
            {"name": "IsActive", "type": "boolean", "label": "Active"}
          ]}',
          '{"fields": [
            {"name": "ItemName", "type": "string", "label": "Item Name"},
            {"name": "ItemCode", "type": "string", "label": "Item Code"},
            {"name": "Active", "type": "boolean", "label": "Active"}
          ]}',
          'completed'
        )
      `, [testProjectId]);
    });

    it('should generate auto-mapping suggestions', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${testProjectId}/field-mappings/auto-map`)
        .send({
          sourceObject: 'Product2',
          targetObject: 'CatalogItem',
          confidenceThreshold: 0.7
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.message).toContain('potential mappings');
    });

    it('should return mappings with confidence scores', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${testProjectId}/field-mappings/auto-map`)
        .send({
          sourceObject: 'Product2',
          targetObject: 'CatalogItem'
        });

      if (response.body.data.length > 0) {
        const mapping = response.body.data[0];
        expect(mapping).toHaveProperty('confidence');
        expect(mapping.confidence).toBeGreaterThanOrEqual(0);
        expect(mapping.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${testProjectId}/field-mappings/auto-map`)
        .send({
          sourceObject: 'Product2'
          // Missing targetObject
        });

      expect(response.status).toBe(400);
    });

    it('should handle custom confidence thresholds', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${testProjectId}/field-mappings/auto-map`)
        .send({
          sourceObject: 'Product2',
          targetObject: 'CatalogItem',
          confidenceThreshold: 0.9
        });

      expect(response.status).toBe(200);
      // All returned mappings should meet threshold
      response.body.data.forEach((mapping: any) => {
        expect(mapping.confidence).toBeGreaterThanOrEqual(0.9);
      });
    });
  });

  describe('DELETE /api/v1/field-mappings/:id', () => {
    it('should delete a field mapping', async () => {
      // Create a temporary mapping to delete
      const createResponse = await request(app)
        .post(`/api/v1/projects/${testProjectId}/field-mappings`)
        .send({
          sourceObject: 'TempObject',
          sourceField: 'TempField',
          targetObject: 'TempTarget',
          targetField: 'TempTargetField'
        });

      const mappingId = createResponse.body.data.id;

      const deleteResponse = await request(app).delete(`/api/v1/field-mappings/${mappingId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.status).toBe('success');

      // Verify deletion
      const result = await db.query('SELECT * FROM field_mappings WHERE id = $1', [mappingId]);
      expect(result.rows.length).toBe(0);
    });

    it('should return 404 for non-existent mapping', async () => {
      const response = await request(app).delete('/api/v1/field-mappings/99999');

      expect(response.status).toBe(404);
    });
  });
});
