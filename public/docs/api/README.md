# Call-Content API Documentation

Welcome to the Call-Content API! Use this API to programmatically upload transcripts, generate content, and manage your account.

## Base URL

```
https://call-content.com/api/v1
```

## Authentication

All API requests require authentication using an API key. Include your key in the `Authorization` header:

```bash
curl https://call-content.com/api/v1/transcripts \
  -H "Authorization: Bearer cc_your_api_key_here"
```

### Getting an API Key

1. Log in to your Call-Content dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create New Key**
4. Save the key immediately - it won't be shown again

## Rate Limiting

API requests are rate limited based on your plan:

| Plan | Requests/minute |
|------|-----------------|
| Starter | 60 |
| Professional | 120 |
| Enterprise | 600 |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1706745600
```

## Scopes

API keys can be scoped to limit access:

| Scope | Description |
|-------|-------------|
| `transcripts:read` | Read transcripts |
| `transcripts:write` | Upload and delete transcripts |
| `content:read` | Read generated content |
| `content:write` | Generate new content |
| `usage:read` | Read usage statistics |

---

## Endpoints

### Transcripts

#### List Transcripts

```http
GET /api/v1/transcripts
```

**Query Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page (max 100) |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Customer Interview - Acme Corp",
      "duration": 2400,
      "word_count": 4500,
      "created_at": "2026-01-31T10:00:00Z",
      "updated_at": "2026-01-31T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

#### Get Transcript

```http
GET /api/v1/transcripts/:id
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "title": "Customer Interview - Acme Corp",
    "content": "Full transcript text...",
    "duration": 2400,
    "word_count": 4500,
    "speakers": ["Interviewer", "Customer"],
    "metadata": {},
    "created_at": "2026-01-31T10:00:00Z",
    "updated_at": "2026-01-31T10:00:00Z"
  }
}
```

---

#### Upload Transcript

```http
POST /api/v1/transcripts
```

**Request Body:**

```json
{
  "title": "Customer Interview - Acme Corp",
  "content": "Full transcript text...",
  "duration": 2400,
  "speakers": ["Interviewer", "Customer"],
  "metadata": {
    "customer_name": "Acme Corp",
    "industry": "SaaS"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Transcript title |
| content | string | Yes | Full transcript text |
| duration | integer | No | Duration in seconds |
| speakers | string[] | No | List of speakers |
| metadata | object | No | Custom metadata |

**Response (201 Created):**

```json
{
  "data": {
    "id": "uuid",
    "title": "Customer Interview - Acme Corp",
    "duration": 2400,
    "word_count": 4500,
    "created_at": "2026-01-31T10:00:00Z"
  }
}
```

---

#### Delete Transcript

```http
DELETE /api/v1/transcripts/:id
```

**Response:** `204 No Content`

---

### Content Generation

#### Generate Content

```http
POST /api/v1/content/generate
```

**Request Body:**

```json
{
  "transcript_id": "uuid",
  "template": "case_study"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| transcript_id | string | Yes | UUID of the source transcript |
| template | string | Yes | Content template type |

**Available Templates:**

- `case_study` - Full case study document
- `blog_post` - Blog article
- `social_media` - Multi-platform social posts
- `linkedin_post` - LinkedIn post
- `twitter_thread` - Twitter/X thread
- `testimonial` - Customer testimonial
- `email` - Email marketing content
- `executive_summary` - Executive summary
- `key_quotes` - Extract key quotes
- `action_items` - Extract action items

**Response (201 Created):**

```json
{
  "data": {
    "id": "uuid",
    "transcript_id": "uuid",
    "template": "case_study",
    "title": "Case Study: Acme Corp",
    "content": "Generated content...",
    "word_count": 1200,
    "created_at": "2026-01-31T10:15:00Z"
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**HTTP Status Codes:**

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing or invalid API key |
| 403 | Forbidden - Insufficient permissions (scope) |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Code Examples

### Node.js

```javascript
const response = await fetch('https://call-content.com/api/v1/transcripts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer cc_your_api_key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Customer Call',
    content: 'Transcript text...',
  }),
});

const { data } = await response.json();
console.log('Created:', data.id);
```

### Python

```python
import requests

response = requests.post(
    'https://call-content.com/api/v1/transcripts',
    headers={'Authorization': 'Bearer cc_your_api_key'},
    json={
        'title': 'Customer Call',
        'content': 'Transcript text...',
    }
)

data = response.json()['data']
print(f"Created: {data['id']}")
```

### cURL

```bash
curl -X POST https://call-content.com/api/v1/transcripts \
  -H "Authorization: Bearer cc_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"title": "Customer Call", "content": "Transcript text..."}'
```

---

## Webhooks (Coming Soon)

Subscribe to events:

- `transcript.created`
- `transcript.deleted`
- `content.generated`
- `usage.limit_reached`

---

## Support

- Email: api-support@call-content.com
- Documentation: https://call-content.com/docs/api
- Status: https://status.call-content.com
