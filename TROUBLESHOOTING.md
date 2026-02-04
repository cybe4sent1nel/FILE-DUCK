# 🔧 Troubleshooting Guide

## Common Issues

### 1. Upload Fails

**Symptom**: Upload progress bar stuck or error message

**Solutions**:

```bash
# Check API is running
curl http://localhost:3001/api/health

# Check S3 credentials
aws s3 ls s3://fileduck-quarantine

# Check network tab in browser DevTools
# Look for failed requests to /api/upload-meta
```

### 2. ClamAV Connection Failed

**Symptom**: Scanner service can't connect to ClamAV daemon

**Solutions**:

```bash
# Check ClamAV is running
docker ps | grep clamav

# Test connection manually
telnet localhost 3310

# Restart ClamAV
docker restart fileduck-clamav

# Check ClamAV logs
docker logs fileduck-clamav

# Update virus signatures
docker exec fileduck-clamav freshclam
```

### 3. Redis Connection Issues

**Symptom**: "Failed to connect to Redis" errors

**Solutions**:

```bash
# Local development - check Docker container
docker ps | grep redis

# Production - verify Upstash credentials
# Check UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN in .env

# Test connection
redis-cli -u $UPSTASH_REDIS_URL ping
```

### 4. Share Code Not Found

**Symptom**: "Share code not found or expired" when downloading

**Possible causes**:

- Code already used (one-time download)
- Code expired (TTL reached)
- Redis connection lost

**Debug**:

```bash
# Check if code exists in Redis
redis-cli GET <shareCode>

# Check TTL
redis-cli TTL <shareCode>
```

### 5. Malware Scan Stuck on "Pending"

**Symptom**: File shows "Scan pending" indefinitely

**Solutions**:

```bash
# Check scanner service is running
curl http://localhost:4000/health

# Check scanner logs
docker logs fileduck-scanner

# Manually trigger scan
curl -X POST http://localhost:4000/scan \
  -H "Content-Type: application/json" \
  -d '{
    "shareCode": "abc123",
    "s3Key": "quarantine/1234-file.txt",
    "sha256": "abcd..."
  }'

# Check if scan webhook/queue is configured
# See DEPLOYMENT.md section 3
```

### 6. CloudFront Signed URLs Not Working

**Symptom**: 403 Forbidden when accessing download URL

**Solutions**:

```bash
# Verify CloudFront key pair is correct
# Ensure CLOUDFRONT_KEYPAIR_ID matches uploaded public key

# Check private key is base64 encoded correctly
cat cloudfront-private-key.pem | base64 -w 0

# Verify key group is associated with distribution
aws cloudfront get-distribution --id E123456

# Test with a simple signed URL
# Use AWS SDK to generate test URL
```

### 7. Rate Limiting Blocks Legitimate Users

**Symptom**: Users getting "Too many requests" errors

**Solutions**:

```bash
# Check rate limit settings in .env
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10

# Increase limits for production
RATE_LIMIT_MAX_REQUESTS=50

# Implement IP whitelisting for trusted IPs
# Add to API code in lib/redis.ts
```

### 8. File Upload Incomplete

**Symptom**: Multipart upload fails or hangs

**Solutions**:

```bash
# Check file size limits
# Default is 5 GB in CONSTANTS

# Verify S3 multipart settings
# Check MULTIPART_CHUNK_SIZE (100 MB default)

# Test with smaller file
# Increase timeout if needed

# Check browser console for errors
# Look for CORS issues
```

### 9. CORS Errors

**Symptom**: Browser shows CORS policy errors

**Solutions**:

Add CORS headers to API responses:

```typescript
// apps/api/api/*.ts
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

For Vercel, add `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ]
}
```

### 10. VirusTotal API Limit Exceeded

**Symptom**: "Rate limit exceeded" from VirusTotal

**Solutions**:

```bash
# Free tier: 4 requests/minute
# Implement request queuing

# Or disable VirusTotal for non-critical files
# Only scan with ClamAV

# Upgrade to VirusTotal Premium API
# https://www.virustotal.com/gui/my-apikey
```

## Performance Issues

### Slow Uploads

**Optimizations**:

- Enable multipart uploads (already implemented)
- Use CloudFront for upload acceleration
- Increase `MULTIPART_CHUNK_SIZE` for large files
- Check network bandwidth

### Slow Downloads

**Optimizations**:

- Verify CDN is enabled (`USE_CDN=true`)
- Check CloudFront cache hit ratio
- Enable gzip/brotli compression
- Use edge locations closer to users

### High Memory Usage (Scanner)

**Solutions**:

```bash
# Limit concurrent scans
# Add queue system (SQS, Bull, etc.)

# Increase scanner instance size
# Or deploy multiple scanner instances

# Monitor with:
docker stats fileduck-scanner
```

## Debugging Tools

### Check All Service Health

```bash
#!/bin/bash
# health-check.sh

echo "Checking API..."
curl -s http://localhost:3001/api/health | jq

echo "Checking Scanner..."
curl -s http://localhost:4000/health | jq

echo "Checking ClamAV..."
echo "PING" | nc localhost 3310

echo "Checking Redis..."
redis-cli ping

echo "Checking MinIO..."
curl -s http://localhost:9000/minio/health/live
```

### View Logs

```bash
# Docker services
docker-compose logs -f

# Vercel deployments
vercel logs --follow

# Specific service
docker logs -f fileduck-scanner
```

### Monitor Redis

```bash
# Monitor commands
redis-cli monitor

# Check memory usage
redis-cli info memory

# List all keys
redis-cli keys '*'

# Check specific key
redis-cli GET <shareCode>
```

## Getting Help

1. Check [GitHub Issues](https://github.com/your-org/fileduck/issues)
2. Search [Discussions](https://github.com/your-org/fileduck/discussions)
3. Join [Discord](https://discord.gg/fileduck) (if available)
4. Email: support@fileduck.example

## Reporting Bugs

Include:

- OS and browser version
- Steps to reproduce
- Expected vs actual behavior
- Error messages and logs
- Screenshots (if applicable)

Use the bug report template when opening an issue.
