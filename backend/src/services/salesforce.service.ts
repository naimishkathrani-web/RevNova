import { Connection } from 'jsforce';

export interface SalesforceConnection {
  instanceUrl: string;
  accessToken: string;
  apiVersion?: string;
}

export class SalesforceService {
  async connect(config: SalesforceConnection): Promise<Connection> {
    const conn = new Connection({
      instanceUrl: config.instanceUrl,
      accessToken: config.accessToken,
      version: config.apiVersion || '58.0'
    });
    return conn;
  }

  async describeObject(conn: Connection, objectName: string) {
    return await conn.sobject(objectName).describe();
  }
}
