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

## Mapping Endpoints
POST /api/v1/projects/:id/mappings - Bulk save mappings
GET /api/v1/projects/:id/mappings - Retrieve all mappings
PUT /api/v1/projects/:id/mappings/:mappingId - Update single mapping
POST /api/v1/projects/:id/mappings/suggest - AI suggestions
POST /api/v1/projects/:id/mappings/validate - Validate mappings