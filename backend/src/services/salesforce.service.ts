import { Connection } from 'jsforce';
import axios from 'axios';

export interface SalesforceConnection {
  instanceUrl: string;
  accessToken: string;
  refreshToken?: string;
  apiVersion?: string;
}

export class SalesforceService {
  private conn: Connection | null = null;
  private config: SalesforceConnection;

  constructor(config: SalesforceConnection) {
    this.config = config;
  }

  /**
   * Establish Salesforce connection using access token + instance URL.
   */
  async connect(config?: SalesforceConnection): Promise<Connection> {
    const connConfig = config || this.config;
    this.conn = new Connection({
      instanceUrl: connConfig.instanceUrl,
      accessToken: connConfig.accessToken,
      version: connConfig.apiVersion || '58.0'
    });
    return this.conn;
  }

  /**
   * Get current connection instance
   */
  getConnection(): Connection {
    if (!this.conn) {
      throw new Error('Connection not established. Call connect() first.');
    }
    return this.conn;
  }

  /**
   * Test if connection is valid
   */
  async testConnection(): Promise<boolean> {
    try {
      const conn = await this.connect();
      const identity = await conn.identity();
      return !!identity;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get user identity information
   */
  async getIdentity(): Promise<any> {
    const conn = await this.connect();
    return await conn.identity();
  }

  /**
   * Refresh OAuth access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    if (!this.config.refreshToken) {
      throw new Error('Refresh token not provided');
    }

    const clientId = process.env.SALESFORCE_CLIENT_ID;
    const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Salesforce OAuth credentials not configured');
    }

    try {
      const response = await axios.post(
        `${this.config.instanceUrl}/services/oauth2/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: this.config.refreshToken
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const newAccessToken = response.data.access_token;
      this.config.accessToken = newAccessToken;

      // Reconnect with new token
      await this.connect();

      return newAccessToken;
    } catch (error: any) {
      console.error('Token refresh failed:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Describe all global Salesforce objects
   */
  async describeGlobal(): Promise<any> {
    const conn = await this.connect();
    return await conn.describeGlobal();
  }

  /**
   * Describe a single Salesforce object (works with Connection instance)
   */
  async describeSObject(objectName: string): Promise<any> {
    const conn = this.getConnection();
    try {
      return await conn.sobject(objectName).describe();
    } catch (err: any) {
      console.error(`❌ Error describing ${objectName}:`, err.message);
      throw new Error(`Failed to describe object: ${objectName}`);
    }
  }

  /**
   * Describe a Salesforce object (legacy method for compatibility).
   */
  async describeObject(conn: Connection, objectName: string) {
    try {
      return await conn.sobject(objectName).describe();
    } catch (err: any) {
      console.error(`❌ Error describing ${objectName}:`, err.message);
      throw new Error(`Failed to describe object: ${objectName}`);
    }
  }

  /**
   * Step 4: Enhanced schema discovery metadata:
   * Picklists, lookups, formulas, required, unique, custom, length, help text...
   */
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

      recordCount: 0 // optional — updated later
    };
  }

  /**
   * Count total records for an object in Salesforce.
   */
  async getRecordCount(conn: Connection, objectName: string): Promise<number> {
    try {
      const res = await conn.query(`SELECT COUNT() FROM ${objectName}`);
      return res.totalSize;
    } catch (err: any) {
      console.error(`❌ Failed to count records in ${objectName}:`, err.message);
      return 0;
    }
  }

  /**
   * Analyze multiple Salesforce objects with enhanced metadata.
   */
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
