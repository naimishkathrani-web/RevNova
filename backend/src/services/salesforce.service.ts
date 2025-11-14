// backend/src/services/salesforce.service.ts
import { Connection } from "jsforce";

export interface SalesforceConnection {
  instanceUrl: string;
  accessToken: string;
  apiVersion?: string;
}

export class SalesforceService {
  async connect(config: SalesforceConnection): Promise<Connection> {
    return new Connection({
      instanceUrl: config.instanceUrl,
      accessToken: config.accessToken,
      version: config.apiVersion || "58.0"
    });
  }

  async describeObject(conn: Connection, objectName: string) {
    try {
      return await conn.sobject(objectName).describe();
    } catch (err: any) {
      console.error(`❌ Error describing ${objectName}:`, err.message);
      throw new Error(`Failed to describe object: ${objectName}`);
    }
  }

  async getDetailedMetadata(conn: Connection, objectName: string) {
    const metadata = await this.describeObject(conn, objectName);

    return {
      name: metadata.name,
      label: metadata.label,
      custom: metadata.custom,

      fields: metadata.fields.map((field: any) => ({
        name: field.name,
        label: field.label,
        type: field.type,
        length: field.length || null,
        required: !field.nillable,
        unique: field.unique || false,
        custom: field.custom || false,
        picklistValues: field.picklistValues || [],
        referenceTo: field.referenceTo || [],
        calculated: field.calculated || false,
        inlineHelpText: field.inlineHelpText || null
      })),

      recordCount: 0
    };
  }

  async getRecordCount(conn: Connection, objectName: string): Promise<number> {
    try {
      const res = await conn.query(`SELECT COUNT() FROM ${objectName}`);
      return res.totalSize;
    } catch (err: any) {
      console.error(`❌ Failed to count records in ${objectName}:`, err.message);
      return 0;
    }
  }

  async analyzeObjects(conn: Connection, objects: string[]) {
    const results: any[] = [];

    for (const objectName of objects) {
      try {
        const metadata = await this.getDetailedMetadata(conn, objectName);
        const recordCount = await this.getRecordCount(conn, objectName);

        results.push({
          ...metadata,
          recordCount
        });
      } catch (error: any) {
        console.error(`❌ Failed to analyze ${objectName}:`, error.message);

        results.push({
          objectName,
          error: error.message
        });
      }
    }

    return {
      analyzedObjects: results.length,
      objects: results
    };
  }
}
