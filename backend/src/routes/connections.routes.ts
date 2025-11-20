import express from 'express';
import type { Request, Response } from 'express';
import { SalesforceService } from '../services/salesforce.service.js';

const router = express.Router();

// -----------------------------------------------
// POST /api/v1/connections/test - Test Salesforce connection
// -----------------------------------------------
router.post('/connections/test', async (req: Request, res: Response) => {
  try {
    const { instanceUrl, accessToken, refreshToken } = req.body;

    if (!instanceUrl || !accessToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: instanceUrl, accessToken'
      });
    }

    const sfService = new SalesforceService({
      instanceUrl,
      accessToken,
      refreshToken
    });

    const isValid = await sfService.testConnection();

    if (isValid) {
      const identity = await sfService.getIdentity();
      return res.json({
        status: 'success',
        message: 'Connection successful',
        data: {
          valid: true,
          organizationId: identity.organization_id,
          username: identity.username,
          displayName: identity.display_name
        }
      });
    } else {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials or connection failed'
      });
    }

  } catch (err: any) {
    console.error('Error testing connection:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// GET /api/v1/projects/:projectId/connections - List connections
// -----------------------------------------------
router.get('/projects/:projectId/connections', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const db = req.app.locals.db;

    const result = await db.query(`
      SELECT id, project_id, name, type, instance_url, status, created_at, updated_at
      FROM connections
      WHERE project_id = $1
      ORDER BY created_at DESC
    `, [projectId]);

    return res.json({
      status: 'success',
      data: result.rows,
      count: result.rows.length
    });

  } catch (err: any) {
    console.error('Error fetching connections:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// POST /api/v1/projects/:projectId/connections - Create connection
// -----------------------------------------------
router.post('/projects/:projectId/connections', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, type, instanceUrl, accessToken, refreshToken } = req.body;

    if (!name || !type || !instanceUrl || !accessToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: name, type, instanceUrl, accessToken'
      });
    }

    const db = req.app.locals.db;

    // Test connection first
    const sfService = new SalesforceService({
      instanceUrl,
      accessToken,
      refreshToken
    });

    const isValid = await sfService.testConnection();
    if (!isValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Connection test failed. Please check credentials.'
      });
    }

    const identity = await sfService.getIdentity();

    // Store connection
    const result = await db.query(`
      INSERT INTO connections (
        project_id, name, type, instance_url, access_token, refresh_token, 
        organization_id, username, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
      RETURNING id, project_id, name, type, instance_url, status, created_at
    `, [
      projectId, 
      name, 
      type, 
      instanceUrl, 
      accessToken, 
      refreshToken,
      identity.organization_id,
      identity.username
    ]);

    return res.status(201).json({
      status: 'success',
      message: 'Connection created successfully',
      data: result.rows[0]
    });

  } catch (err: any) {
    console.error('Error creating connection:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// GET /api/v1/connections/:id - Get single connection
// -----------------------------------------------
router.get('/connections/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    const result = await db.query(`
      SELECT id, project_id, name, type, instance_url, organization_id, username, status, created_at, updated_at
      FROM connections
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Connection not found'
      });
    }

    return res.json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (err: any) {
    console.error('Error fetching connection:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// PUT /api/v1/connections/:id - Update connection
// -----------------------------------------------
router.put('/connections/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, instanceUrl, accessToken, refreshToken } = req.body;
    const db = req.app.locals.db;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (instanceUrl !== undefined) {
      updates.push(`instance_url = $${paramCount++}`);
      values.push(instanceUrl);
    }
    if (accessToken !== undefined) {
      updates.push(`access_token = $${paramCount++}`);
      values.push(accessToken);
    }
    if (refreshToken !== undefined) {
      updates.push(`refresh_token = $${paramCount++}`);
      values.push(refreshToken);
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
      UPDATE connections
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, project_id, name, type, instance_url, status, created_at, updated_at
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Connection not found'
      });
    }

    return res.json({
      status: 'success',
      message: 'Connection updated successfully',
      data: result.rows[0]
    });

  } catch (err: any) {
    console.error('Error updating connection:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// DELETE /api/v1/connections/:id - Delete connection
// -----------------------------------------------
router.delete('/connections/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    const result = await db.query('DELETE FROM connections WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Connection not found'
      });
    }

    return res.json({
      status: 'success',
      message: 'Connection deleted successfully'
    });

  } catch (err: any) {
    console.error('Error deleting connection:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// -----------------------------------------------
// POST /api/v1/connections/:id/refresh - Refresh OAuth token
// -----------------------------------------------
router.post('/connections/:id/refresh', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    // Get connection
    const connResult = await db.query(`
      SELECT instance_url, access_token, refresh_token
      FROM connections
      WHERE id = $1
    `, [id]);

    if (connResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Connection not found'
      });
    }

    const conn = connResult.rows[0];
    const sfService = new SalesforceService({
      instanceUrl: conn.instance_url,
      accessToken: conn.access_token,
      refreshToken: conn.refresh_token
    });

    const newToken = await sfService.refreshAccessToken();

    // Update token in database
    await db.query(`
      UPDATE connections
      SET access_token = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [newToken, id]);

    return res.json({
      status: 'success',
      message: 'Access token refreshed successfully'
    });

  } catch (err: any) {
    console.error('Error refreshing token:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

export default router;
