import { Router } from 'express';
import db from '../database/db';

const router = Router();

/* ============================================================
   STEP 2: BULK SAVE MAPPINGS
   ============================================================ */
router.post('/projects/:id/mappings', async (req, res) => {
  const { id: projectId } = req.params;
  const { mappings } = req.body;

  if (!Array.isArray(mappings)) {
    return res.status(400).json({ error: 'mappings must be an array' });
  }

  try {
    // Remove existing mappings for project
    await db.query('DELETE FROM field_mappings WHERE project_id = $1', [
      projectId,
    ]);

    // Insert new mappings
    for (const mapping of mappings) {
      await db.query(
        `INSERT INTO field_mappings 
          (project_id, source_object, source_field, target_object, target_field, mapping_type, transform_logic)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          projectId,
          mapping.sourceObject,
          mapping.sourceField,
          mapping.targetObject,
          mapping.targetField,
          mapping.mappingType,
          JSON.stringify(mapping.transformLogic || null),
        ]
      );
    }

    res.json({
      success: true,
      count: mappings.length,
    });
  } catch (error: any) {
    console.error('Error saving mappings:', error);
    res.status(500).json({ error: error.message });
  }
});

/* ============================================================
   STEP 3: GET ALL MAPPINGS FOR A PROJECT
   ============================================================ */
router.get('/projects/:id/mappings', async (req, res) => {
  const { id: projectId } = req.params;

  try {
    const result = await db.query(
      `SELECT * FROM field_mappings
       WHERE project_id = $1 
       ORDER BY source_object, source_field`,
      [projectId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      mappings: result.rows,
    });
  } catch (error: any) {
    console.error('Error retrieving mappings:', error);
    res.status(500).json({ error: error.message });
  }
});

/* ============================================================
   STEP 4: UPDATE A SINGLE MAPPING
   ============================================================ */
router.put('/projects/:projectId/mappings/:mappingId', async (req, res) => {
  const { mappingId } = req.params;
  const { targetField, mappingType, transformLogic } = req.body;

  if (!targetField || !mappingType) {
    return res.status(400).json({
      error: 'targetField and mappingType are required',
    });
  }

  try {
    const result = await db.query(
      `UPDATE field_mappings
         SET target_field = $1,
             mapping_type = $2,
             transform_logic = $3,
             created_at = NOW()
         WHERE id = $4
         RETURNING *`,
      [
        targetField,
        mappingType,
        transformLogic ? JSON.stringify(transformLogic) : null,
        mappingId,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    res.json({
      success: true,
      mapping: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error updating mapping:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
