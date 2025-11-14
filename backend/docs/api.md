## Schema Analysis Endpoints

### POST /api/v1/projects/:id/analyze
Analyze Salesforce objects and extract metadata.

**Request:**
```json
{ "objects": ["Account", "Contact"] }
```

**Response:**
```json
{ "jobId": "abc123", "status": "queued" }
```