// backend/src/services/relationship.service.ts

export class RelationshipService {
  /**
   * Detect lookup / master-detail relationships from object metadata
   */
  async detectRelationships(projectId: number, metadata: any) {
    const relationships: any[] = [];

    for (const field of metadata.fields) {
      // Only reference fields (lookups / MD)
      if (field.type === 'reference' && field.referenceTo && field.referenceTo.length > 0) {
        
        for (const target of field.referenceTo) {
          relationships.push({
            projectId,
            sourceObject: metadata.name,
            sourceField: field.name,
            targetObject: target,

            // Salesforce usually returns "lookup" (master-detail still appears as lookup in metadata)
            relationshipType: field.relationshipType || 'lookup',

            // jsforce returns deleteConstraint = "Cascade" for MD
            cascadeDelete:
              field.deleteConstraint === 'Cascade' ||
              field.cascadeDelete === true
                ? true
                : false
          });
        }
      }
    }

    return relationships;
  }
}
