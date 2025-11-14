import { Router } from 'express';
import db from '../database/db';
 // adjust path if needed

const router = Router();

/** ------------------------------
 *  Step 2: Bulk Save Mappings
 * ------------------------------ */
router.post('/projects/:id/mappings', async (req, res) => {
  const { id: projectId } = req.params;
  const { mappings } = req.body;

  if (!Array.isArray(mappings)) {
    return res.status(400).json({ error: 'mappings must be an array' });
  }

  try {
    await db.query('DELETE FROM field_mappings WHERE project_id = $1', [projectId]);

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
          JSON.stringify(mapping.transformLogic || null)
        ]
      );
    }

    res.json({
      success: true,
      count: mappings.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/** ------------------------------
 *  Step 3: Get Mappings
 * ------------------------------ */
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
      mappings: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
