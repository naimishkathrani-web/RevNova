import { Pool } from 'pg';

export class CatalogService {
  constructor(private db: Pool) {}

  async indexObject(projectId: number, metadata: any) {
    if (!metadata.fields || metadata.fields.length === 0) return;

    const values = [];
    for (const field of metadata.fields) {
      values.push([
        projectId,
        metadata.name,
        field.name,
        field.label,
        field.type,
        field.custom,
        field.required,
        field.picklistValues || []
      ]);
    }

    const placeholders = values
      .map(
        (_, i) =>
          `($${i * 8 + 1}, $${i * 8 + 2}, $${i * 8 + 3}, $${i * 8 + 4}, $${i * 8 + 5}, $${i * 8 + 6}, $${i * 8 + 7}, $${i * 8 + 8})`
      )
      .join(',');

    const flat = values.flat();

    const query = `
      INSERT INTO schema_catalog
      (project_id, object_name, field_name, field_label, data_type, is_custom, is_required, picklist_values)
      VALUES ${placeholders}
    `;

    await this.db.query(query, flat);
  }
}
