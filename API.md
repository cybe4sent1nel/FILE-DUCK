# FileDuck API Documentation

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-api.vercel.app/api`

## Authentication

Currently no authentication required. Rate limiting enforced per IP.

## Endpoints

### 1. Upload Metadata

Request presigned multipart upload URLs.

**Endpoint**: `POST /upload-meta`

**Request Body**:

```json
{
  "filename": "document.pdf",
  "size": 10485760,
  "sha256": "abc123...",
  "mimeType": "application/pdf",
  "ttlHours": 24,
  "maxUses": 1,
  "encrypted": false
}
```

**Response** (200 OK):

```json
{
  "shareCode": "aBc123XyZ9",
  "uploadUrls": [
    "https://s3.amazonaws.com/fileduck-quarantine/...?X-Amz-Signature=...",
    "https://s3.amazonaws.com/fileduck-quarantine/...?X-Amz-Signature=..."
  ],
  "uploadId": "upload123",
  "expiresAt": 1704067200000
}
```

**Error Responses**:

- `400 Bad Request`: Invalid parameters
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

### 2. Complete Upload

Complete multipart upload and trigger scan.

**Endpoint**: `POST /complete-upload`

**Request Body**:

```json
{
  "uploadId": "upload123",
  "key": "quarantine/1234-file.pdf",
  "parts": [
    { "ETag": "abc123", "PartNumber": 1 },
    { "ETag": "def456", "PartNumber": 2 }
  ]
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Upload completed, malware scan queued"
}
```

---

### 3. Redeem Share Code

Get download URL for a file.

**Endpoint**: `POST /redeem`

**Request Body**:

```json
{
  "shareCode": "aBc123XyZ9",
  "captchaToken": "optional-recaptcha-token"
}
```

**Response** (200 OK):

```json
{
  "downloadUrl": "https://d123.cloudfront.net/public/file.pdf?Expires=...",
  "filename": "document.pdf",
  "size": 10485760,
  "sha256": "abc123...",
  "mimeType": "application/pdf",
  "usesLeft": 0,
  "expiresAt": 1704067200000
}
```

**Error Responses**:

- `400 Bad Request`: Invalid share code format
- `403 Forbidden`: CAPTCHA required
- `404 Not Found`: Share code not found or expired
- `410 Gone`: No downloads remaining
- `202 Accepted`: File being scanned (code: `SCAN_PENDING`)
- `403 Forbidden`: Malware detected (code: `MALWARE_DETECTED`)
- `429 Too Many Requests`: Rate limit exceeded

---

### 4. Health Check

Check API and service status.

**Endpoint**: `GET /health`

**Response** (200 OK):

```json
{
  "status": "healthy",
  "timestamp": 1704067200000,
  "services": {
    "redis": "connected",
    "s3": "not_checked",
    "cdn": "not_checked"
  }
}
```

---

## Rate Limiting

- **Window**: 60 seconds
- **Max Requests**: 10 per IP
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

Example:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1704067260
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_CODE` | Share code invalid or expired |
| `EXPIRED` | Share code has expired |
| `NO_USES_LEFT` | Download limit reached |
| `RATE_LIMITED` | Too many requests |
| `CAPTCHA_REQUIRED` | CAPTCHA verification needed |
| `SCAN_PENDING` | File being scanned |
| `MALWARE_DETECTED` | File flagged as malicious |
| `INVALID_REQUEST` | Invalid parameters |
| `SERVER_ERROR` | Internal server error |

---

## Upload Flow

```
1. Client computes SHA-256 of file
2. Client calls POST /upload-meta
3. API generates share code
4. API stores metadata in Redis
5. API returns presigned S3 URLs
6. Client uploads file directly to S3
7. Client calls POST /complete-upload
8. API triggers malware scan
9. Scanner service scans file
10. Scanner moves to public bucket if clean
```

---

## Download Flow

```
1. User enters share code
2. Client calls POST /redeem
3. API validates code in Redis
4. API checks scan status
5. If clean: decrement uses, return signed URL
6. Client downloads from CDN
7. Client verifies SHA-256
```

---

## TypeScript Types

```typescript
interface UploadMetaRequest {
  filename: string;
  size: number;
  sha256: string;
  mimeType: string;
  ttlHours?: number;
  maxUses?: number;
  encrypted?: boolean;
}

interface UploadMetaResponse {
  shareCode: string;
  uploadUrls: string[];
  uploadId: string;
  expiresAt: number;
}

interface RedeemRequest {
  shareCode: string;
  captchaToken?: string;
}

interface RedeemResponse {
  downloadUrl: string;
  filename: string;
  size: number;
  sha256: string;
  mimeType: string;
  usesLeft: number;
  expiresAt: number;
}
```

---

## Client Libraries

### JavaScript/TypeScript

```bash
npm install @fileduck/client
```

```typescript
import { FileDuckClient } from '@fileduck/client';

const client = new FileDuckClient('https://api.fileduck.example');

// Upload file
const file = document.getElementById('file').files[0];
const result = await client.upload(file, {
  ttlHours: 24,
  maxUses: 5,
});

console.log('Share code:', result.shareCode);

// Download file
const download = await client.download('aBc123XyZ9');
window.location.href = download.downloadUrl;
```

---

## Examples

### cURL Upload

```bash
# 1. Get presigned URLs
curl -X POST https://api.fileduck.example/upload-meta \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test.txt",
    "size": 1024,
    "sha256": "abc123...",
    "mimeType": "text/plain"
  }'

# 2. Upload to S3 (use returned uploadUrls)
curl -X PUT "https://s3.amazonaws.com/..." \
  --upload-file test.txt

# 3. Complete upload
curl -X POST https://api.fileduck.example/complete-upload \
  -H "Content-Type: application/json" \
  -d '{
    "uploadId": "upload123",
    "key": "quarantine/...",
    "parts": [{"ETag": "...", "PartNumber": 1}]
  }'
```

### cURL Download

```bash
curl -X POST https://api.fileduck.example/redeem \
  -H "Content-Type: application/json" \
  -d '{"shareCode": "aBc123XyZ9"}'
```

---

## Webhooks (Future)

Coming soon: webhook notifications for scan completion.

---

For more details, see the [source code](https://github.com/your-org/fileduck).
