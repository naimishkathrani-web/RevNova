import { SalesforceService } from '../../services/salesforce.service';

// Mock jsforce
jest.mock('jsforce', () => {
  const mConn = {
    // mock sobject.describe()
    sobject: jest.fn(() => ({
      describe: jest.fn().mockResolvedValue({
        name: "Account",
        label: "Account",
        fields: [{ name: "Id" }, { name: "Name" }],
      })
    }))
  };

  return {
    Connection: jest.fn(() => mConn)
  };
});

describe('SalesforceService', () => {
  it('should create a jsforce connection', async () => {
    const service = new SalesforceService();

    const conn = await service.connect({
      instanceUrl: 'https://test.salesforce.com',
      accessToken: 'fake-token'
    });

    expect(conn).toBeDefined();
  });

  it('should describe an object successfully', async () => {
    const service = new SalesforceService();

    const conn = await service.connect({
      instanceUrl: 'https://test.salesforce.com',
      accessToken: 'fake-token'
    });

    const metadata = await service.describeObject(conn, 'Account');

    expect(metadata.fields).toBeDefined();
    expect(metadata.fields.length).toBeGreaterThan(0);
  });
});
