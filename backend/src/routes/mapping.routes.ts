import { Router } from 'express';
import db from '../database/db';

import { suggestMappings } from '../services/ai-mapping.service';
import { getSourceFields, getTargetFields } from '../services/schema.service';
import { validateMapping } from "../services/mapping-validator.service";

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
    // Remove existing mappings
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

/* ============================================================
   STEP 5: AI FIELD MAPPING SUGGESTIONS
   ============================================================ */
router.post('/projects/:id/mappings/suggest', async (req, res) => {
  const { id: projectId } = req.params;

  try {
    // Load CPQ & Revenue Cloud schema
    const sourceFields = await getSourceFields(projectId);
    const targetFields = await getTargetFields(projectId);

    // AI-generated suggestions
    const suggestions = await suggestMappings(sourceFields, targetFields);

    res.json({
      success: true,
      projectId,
      suggestions,
    });
  } catch (error: any) {
    console.error('AI Suggestion Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI suggestion failed',
    });
  }
});

/* ============================================================
   STEP 6: VALIDATE MAPPINGS
   ============================================================ */
router.post('/projects/:id/mappings/validate', async (req, res) => {
  const { id: projectId } = req.params;

  try {
    // Load all mappings
    const mappingResult = await db.query(
      'SELECT * FROM field_mappings WHERE project_id = $1',
      [projectId]
    );

    const savedMappings = mappingResult.rows;

    // Load schema
    const sourceFields = await getSourceFields(projectId);
    const targetFields = await getTargetFields(projectId);

    const errors: string[] = [];
    const warnings: string[] = [];

    /* Required Field Check */
    for (const target of targetFields.filter(f => f.required)) {
      const exists = savedMappings.find(m => m.target_field === target.name);

      if (!exists) {
        errors.push(`Required field "${target.name}" is NOT mapped.`);
      }
    }

    /* Type Compatibility Check */
    for (const mapping of savedMappings) {
      const sourceMeta = sourceFields.find(f => f.name === mapping.source_field);
      const targetMeta = targetFields.find(f => f.name === mapping.target_field);

      if (!sourceMeta || !targetMeta) {
        warnings.push(`Missing metadata for mapping ${mapping.source_field} → ${mapping.target_field}`);
        continue;
      }

      const validationResult = validateMapping(sourceMeta, targetMeta);
      warnings.push(...validationResult);
    }

    res.json({
      success: true,
      valid: errors.length === 0,
      errors,
      warnings
    });

  } catch (error: any) {
    console.error("Validation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
