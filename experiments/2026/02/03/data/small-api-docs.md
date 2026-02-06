# API Overview

Welcome to our API documentation. This guide covers authentication, endpoints, and rate limits.

## Authentication

All API requests must include authentication. We support two methods: API keys and OAuth 2.0.

### API Keys

API keys are the simplest authentication method. Include your key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY
```

Keys can be managed in your dashboard.

### OAuth 2.0

For user-level access, use OAuth 2.0 with the authorization code flow. Redirect users to /oauth/authorize with your client_id.

## Rate Limits

API requests are rate limited to 1000 requests per hour per API key. Rate limit headers are included in responses: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset.

## API Endpoints

Our API provides the following resource endpoints.

### Users

GET /users - List users
GET /users/:id - Get user details
POST /users - Create user

### Posts

GET /posts - List posts
GET /posts/:id - Get post details
POST /posts - Create post

## Error Handling

The API uses standard HTTP status codes:

200 - Success
400 - Bad Request
401 - Unauthorized
404 - Not Found
429 - Rate Limited
500 - Server Error

Error responses include a JSON body with code and message fields.
