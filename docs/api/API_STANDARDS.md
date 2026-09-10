# SPLINCI COMMERCE OS — CANONICAL API DESIGN STANDARDS

## 1. Request Envelope & Authentication
- Machine-to-Machine API requests require `Authorization: Bearer spl_live_...` or `X-API-Key: spl_live_...`.
- All requests are stamped with a mandatory correlation ID (`X-Request-ID`).

## 2. Standard V1 Response Format
```json
{
  "success": true,
  "version": "v1",
  "correlationId": "req_12345",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  },
  "timestamp": "2026-08-21T10:58:00.000Z"
}
```

## 3. Standard V1 Error Format
```json
{
  "success": false,
  "version": "v1",
  "correlationId": "req_12345",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or revoked API key credential",
    "details": null
  },
  "timestamp": "2026-08-21T10:58:00.000Z"
}
```
