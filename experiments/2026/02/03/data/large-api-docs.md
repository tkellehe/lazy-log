# E-Commerce Platform API Documentation

Welcome to the E-Commerce Platform API. This comprehensive guide covers all aspects of integrating with our platform.

## Overview

The E-Commerce Platform API provides programmatic access to manage products, orders, customers, inventory, payments, shipping, analytics, and more. Built on REST principles with JSON payloads.

**Base URL**: `https://api.ecommerce-platform.com/v2`

**Latest Version**: 2.3.0 (Released: January 2026)

## Authentication

All API requests require authentication using one of the supported methods.

### API Keys

API keys are the primary authentication method for server-to-server integrations.

**Obtaining Keys**: Generate API keys from your dashboard under Settings > API Keys. Each key can have specific scopes and rate limits.

**Usage**: Include your API key in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

**Security Best Practices**:
- Never expose keys in client-side code
- Rotate keys every 90 days
- Use environment-specific keys (dev, staging, production)
- Revoke compromised keys immediately
- Limit key scopes to minimum required permissions

### OAuth 2.0

OAuth 2.0 is recommended for user-level access and third-party integrations.

**Supported Flows**:
- Authorization Code (recommended for web apps)
- Client Credentials (for server-to-server)
- Refresh Token (for long-lived sessions)

**Authorization Endpoint**: `https://auth.ecommerce-platform.com/oauth/authorize`

**Token Endpoint**: `https://auth.ecommerce-platform.com/oauth/token`

**Required Parameters**:
- `client_id`: Your application's client ID
- `client_secret`: Your application's client secret (server-side only)
- `redirect_uri`: Must match registered URI
- `scope`: Space-separated list of permissions
- `state`: CSRF protection token (recommended)

**Token Expiration**: Access tokens expire after 1 hour. Use refresh tokens to obtain new access tokens.

### Webhook Signatures

Webhooks are signed using HMAC-SHA256 to verify authenticity.

**Verification**:
1. Extract `X-Webhook-Signature` header
2. Compute HMAC-SHA256 of request body using your webhook secret
3. Compare computed signature with header value
4. Reject if mismatch

## Rate Limiting

Rate limits protect API stability and ensure fair usage.

### Limits by Plan

- **Free**: 100 requests/hour, 1,000 requests/day
- **Starter**: 1,000 requests/hour, 10,000 requests/day
- **Professional**: 5,000 requests/hour, 100,000 requests/day
- **Enterprise**: Custom limits (contact sales)

### Headers

Rate limit information is included in response headers:

- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

### Burst Handling

Short bursts above your limit are allowed (up to 2x) but will be throttled. Sustained overages will result in `429 Too Many Requests` responses.

## Products API

Manage your product catalog including variants, inventory, pricing, and images.

### List Products

**GET** `/products`

Retrieve a paginated list of products.

**Query Parameters**:
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 50, max: 200)
- `status` (string): Filter by status (active, draft, archived)
- `category` (string): Filter by category slug
- `search` (string): Search products by name or SKU
- `sort` (string): Sort field (created_at, updated_at, name, price)
- `order` (string): Sort order (asc, desc)

**Response**: Array of product objects with pagination metadata.

### Get Product

**GET** `/products/{id}`

Retrieve a specific product by ID or SKU.

**Path Parameters**:
- `id` (string): Product ID or SKU

**Response**: Full product object including variants, images, and metadata.

### Create Product

**POST** `/products`

Create a new product.

**Request Body**:
```json
{
  "name": "Premium Wireless Headphones",
  "description": "High-quality audio experience",
  "price": 199.99,
  "sku": "HEADPHONE-001",
  "status": "active",
  "categories": ["electronics", "audio"],
  "variants": [...],
  "images": [...]
}
```

**Required Fields**: name, price, sku

**Response**: Created product object with generated ID.

### Update Product

**PUT** `/products/{id}`

Update an existing product.

**Path Parameters**:
- `id` (string): Product ID

**Request Body**: Partial product object with fields to update.

**Response**: Updated product object.

### Delete Product

**DELETE** `/products/{id}`

Soft delete a product (sets status to archived).

**Path Parameters**:
- `id` (string): Product ID

**Response**: 204 No Content on success.

### Product Variants

Products can have multiple variants (size, color, material, etc).

**Variant Object**:
- `id`: Unique variant identifier
- `sku`: Variant-specific SKU
- `price`: Override product price (optional)
- `inventory`: Stock quantity
- `attributes`: Key-value pairs (size: "Large", color: "Blue")
- `image`: Variant-specific image URL

## Orders API

Process and manage customer orders from creation through fulfillment.

### List Orders

**GET** `/orders`

Retrieve orders with extensive filtering options.

**Query Parameters**:
- `page`, `limit`: Pagination
- `status`: Order status (pending, processing, shipped, delivered, cancelled)
- `customer_id`: Filter by customer
- `date_from`, `date_to`: Date range filter
- `payment_status`: Payment state (pending, paid, failed, refunded)
- `fulfillment_status`: Shipping state (unfulfilled, partial, fulfilled)

### Create Order

**POST** `/orders`

Create a new order programmatically.

**Request Body**:
```json
{
  "customer_id": "cust_123",
  "items": [
    {
      "product_id": "prod_456",
      "variant_id": "var_789",
      "quantity": 2,
      "price": 199.99
    }
  ],
  "shipping_address": {...},
  "billing_address": {...},
  "payment_method": "card",
  "shipping_method": "standard"
}
```

### Update Order Status

**PATCH** `/orders/{id}/status`

Update order workflow status.

**Request Body**:
```json
{
  "status": "processing",
  "note": "Payment confirmed, preparing shipment"
}
```

### Cancel Order

**POST** `/orders/{id}/cancel`

Cancel an order and initiate refund if applicable.

**Request Body**:
```json
{
  "reason": "customer_request",
  "refund": true,
  "note": "Customer changed mind"
}
```

## Customers API

Manage customer accounts, profiles, and data.

### List Customers

**GET** `/customers`

**Query Parameters**:
- Standard pagination parameters
- `email`: Search by email address
- `name`: Search by name
- `created_from`, `created_to`: Registration date range
- `tags`: Filter by customer tags

### Get Customer

**GET** `/customers/{id}`

Retrieve customer profile including order history summary.

### Create Customer

**POST** `/customers`

**Request Body**:
```json
{
  "email": "customer@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "phone": "+1-555-0123",
  "addresses": [...],
  "tags": ["vip", "newsletter"]
}
```

### Update Customer

**PUT** `/customers/{id}`

Update customer profile information.

### Customer Addresses

Manage multiple shipping and billing addresses per customer.

**Add Address**: **POST** `/customers/{id}/addresses`

**Update Address**: **PUT** `/customers/{id}/addresses/{address_id}`

**Delete Address**: **DELETE** `/customers/{id}/addresses/{address_id}`

**Set Default**: **POST** `/customers/{id}/addresses/{address_id}/set-default`

## Inventory Management

Track and manage stock levels across warehouses and locations.

### Get Inventory

**GET** `/inventory/{product_id}`

Retrieve current inventory levels.

**Response**:
```json
{
  "product_id": "prod_123",
  "total_available": 450,
  "total_reserved": 23,
  "locations": [
    {
      "warehouse_id": "wh_001",
      "available": 300,
      "reserved": 15
    }
  ]
}
```

### Update Inventory

**POST** `/inventory/{product_id}/adjust`

Adjust inventory levels with reason tracking.

**Request Body**:
```json
{
  "quantity": -10,
  "reason": "sold",
  "location": "wh_001",
  "note": "Online order #12345"
}
```

### Inventory Alerts

Configure low stock alerts and automatic reordering.

**Set Alert**: **POST** `/inventory/{product_id}/alerts`

**Alert Threshold**: Notify when stock falls below specified level.

## Payment Processing

Process payments securely with multiple payment methods.

### Supported Methods

- Credit/Debit Cards (Visa, Mastercard, Amex, Discover)
- Digital Wallets (Apple Pay, Google Pay, PayPal)
- Bank Transfers (ACH, Wire)
- Buy Now Pay Later (Affirm, Klarna)
- Cryptocurrency (Bitcoin, Ethereum) - Enterprise only

### Create Payment Intent

**POST** `/payments/intents`

Initialize a payment for processing.

**Request Body**:
```json
{
  "amount": 19999,
  "currency": "usd",
  "payment_method": "card",
  "order_id": "ord_123",
  "customer_id": "cust_456",
  "metadata": {}
}
```

### Capture Payment

**POST** `/payments/{intent_id}/capture`

Capture a previously authorized payment.

### Refund Payment

**POST** `/payments/{payment_id}/refund`

**Request Body**:
```json
{
  "amount": 19999,
  "reason": "customer_request",
  "refund_application_fee": false
}
```

**Partial Refunds**: Specify amount less than original charge.

**Refund Timeline**: 5-10 business days depending on payment method.

### Payment Disputes

Handle chargebacks and disputes.

**List Disputes**: **GET** `/payments/disputes`

**Respond to Dispute**: **POST** `/payments/disputes/{id}/respond`

**Evidence Requirements**: Transaction details, shipping proof, communication logs.

## Shipping & Fulfillment

Manage shipping carriers, rates, labels, and tracking.

### Calculate Shipping Rates

**POST** `/shipping/rates`

Get real-time shipping quotes from multiple carriers.

**Request Body**:
```json
{
  "origin": {
    "zip": "10001",
    "country": "US"
  },
  "destination": {
    "zip": "90210",
    "country": "US"
  },
  "packages": [
    {
      "weight": 2.5,
      "length": 12,
      "width": 8,
      "height": 6,
      "weight_unit": "lb",
      "dimension_unit": "in"
    }
  ]
}
```

**Response**: Array of shipping options with carrier, service, cost, and estimated delivery.

### Create Shipment

**POST** `/shipments`

Create a shipment and generate shipping label.

**Request Body**:
```json
{
  "order_id": "ord_123",
  "carrier": "fedex",
  "service": "ground",
  "packages": [...],
  "ship_from": {...},
  "ship_to": {...},
  "insurance_value": 500,
  "signature_required": true
}
```

**Response**: Shipment object with tracking number and label URL.

### Track Shipment

**GET** `/shipments/{id}/track`

Get real-time tracking information.

**Response**: Array of tracking events with timestamps, locations, and status.

### Supported Carriers

- USPS (Priority, Express, First Class, Parcel Select)
- FedEx (Ground, 2Day, Overnight, International)
- UPS (Ground, 3Day, 2Day, Next Day)
- DHL (Express, eCommerce)
- Custom/Regional carriers via API integration

## Analytics & Reporting

Access sales data, trends, and business intelligence.

### Sales Reports

**GET** `/analytics/sales`

**Query Parameters**:
- `period`: day, week, month, quarter, year, custom
- `start_date`, `end_date`: Date range for custom period
- `group_by`: product, category, customer, region
- `metrics`: revenue, orders, units, avg_order_value

**Response**: Aggregated sales metrics with time series data.

### Product Performance

**GET** `/analytics/products`

Analyze product sales, inventory turnover, and profitability.

**Metrics**:
- Units sold
- Revenue generated
- Profit margin
- View-to-purchase conversion rate
- Inventory turnover ratio
- Return rate

### Customer Analytics

**GET** `/analytics/customers`

Customer lifetime value, cohort analysis, retention metrics.

**Segments**:
- New vs. returning customers
- High-value customers (top 20% by revenue)
- At-risk customers (no purchase in 90+ days)
- Geographic distribution
- Acquisition channels

### Custom Reports

**POST** `/analytics/custom`

Build custom reports with flexible dimensions and measures.

**Request Body**:
```json
{
  "dimensions": ["product_category", "customer_segment"],
  "measures": ["revenue", "order_count", "avg_order_value"],
  "filters": {
    "date_range": "last_30_days",
    "region": "north_america"
  },
  "sort": {
    "field": "revenue",
    "order": "desc"
  }
}
```

## Webhooks

Receive real-time notifications for events in your account.

### Available Events

- `order.created`, `order.updated`, `order.cancelled`
- `order.fulfilled`, `order.refunded`
- `product.created`, `product.updated`, `product.deleted`
- `inventory.low`, `inventory.out_of_stock`
- `customer.created`, `customer.updated`
- `payment.succeeded`, `payment.failed`, `payment.refunded`
- `shipment.created`, `shipment.in_transit`, `shipment.delivered`

### Create Webhook

**POST** `/webhooks`

**Request Body**:
```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["order.created", "order.fulfilled"],
  "secret": "your_webhook_secret",
  "active": true
}
```

### Webhook Payload

```json
{
  "id": "evt_123",
  "type": "order.created",
  "created_at": "2026-01-15T10:30:00Z",
  "data": {
    "object": {...}
  }
}
```

### Retry Policy

Failed webhooks are retried with exponential backoff:
- Immediate
- 1 minute
- 5 minutes
- 30 minutes
- 2 hours
- 6 hours

After 6 failed attempts, webhook is marked as failed and no further retries.

## Error Handling

The API uses standard HTTP status codes and structured error responses.

### Status Codes

- `200 OK`: Successful GET, PUT, PATCH
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Authenticated but insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Resource conflict (duplicate, version mismatch)
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Temporary outage

### Error Response Format

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ],
    "request_id": "req_abc123"
  }
}
```

### Common Error Codes

- `authentication_error`: Invalid API key or token
- `authorization_error`: Insufficient permissions
- `validation_error`: Invalid request data
- `not_found`: Resource doesn't exist
- `rate_limit_exceeded`: Too many requests
- `conflict`: Resource conflict
- `server_error`: Internal error

### Best Practices

- Log `request_id` for support inquiries
- Implement exponential backoff for retries
- Handle all documented status codes
- Parse error details for user feedback
- Monitor error rates and patterns

## Pagination

List endpoints return paginated results with cursor-based or offset-based pagination.

### Offset-Based Pagination

**Parameters**:
- `page`: Page number (1-indexed)
- `limit`: Items per page (max: 200)

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total_pages": 10,
    "total_items": 487,
    "has_next": true,
    "has_previous": false
  }
}
```

### Cursor-Based Pagination

More efficient for large datasets.

**Parameters**:
- `cursor`: Opaque cursor string
- `limit`: Items per page

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTIzfQ==",
    "has_more": true
  }
}
```

## API Versioning

The API is versioned using URL paths. Current version: `v2`.

**Base URL**: `https://api.ecommerce-platform.com/v2`

### Version Support

- `v2` (current): Full support, active development
- `v1` (deprecated): Security updates only, EOL March 2027

### Breaking Changes

Breaking changes require a new version. Non-breaking changes (new fields, endpoints) are added to existing versions.

**Notification**: 6 months notice for deprecations via email and changelog.

## SDKs & Libraries

Official SDKs available in multiple languages:

- **JavaScript/TypeScript**: `npm install @ecommerce-platform/sdk`
- **Python**: `pip install ecommerce-platform`
- **Ruby**: `gem install ecommerce_platform`
- **PHP**: `composer require ecommerce-platform/sdk`
- **Java**: Maven/Gradle coordinates available
- **Go**: `go get github.com/ecommerce-platform/go-sdk`
- **C#/.NET**: NuGet package available

All SDKs provide type-safe interfaces, automatic retries, and webhook verification helpers.

## Testing & Sandbox

Use test mode for development without affecting production data.

**Test API Key**: Prefix `test_` indicates sandbox mode
**Test Base URL**: `https://sandbox-api.ecommerce-platform.com/v2`

### Test Data

Sandbox includes sample products, orders, and customers for testing.

### Test Payment Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`
- 3D Secure: `4000 0027 6000 3184`

Any future expiry date and any 3-digit CVC.

## Security

### HTTPS Required

All API requests must use HTTPS. HTTP requests are rejected.

### API Key Security

- Store keys in environment variables
- Never commit keys to version control
- Use key rotation policies
- Implement key management best practices
- Monitor key usage for anomalies

### Data Encryption

- All data encrypted in transit (TLS 1.3)
- All data encrypted at rest (AES-256)
- PCI DSS Level 1 compliant
- SOC 2 Type II certified
- GDPR compliant

### IP Whitelisting

Enterprise plans can restrict API access to specific IP addresses.

**Configure**: Dashboard > Security > IP Whitelist

## Support & Resources

### Documentation

- API Reference: https://docs.ecommerce-platform.com
- Guides & Tutorials: https://docs.ecommerce-platform.com/guides
- Changelog: https://docs.ecommerce-platform.com/changelog

### Support Channels

- Email: api-support@ecommerce-platform.com
- Developer Forum: https://forum.ecommerce-platform.com
- Status Page: https://status.ecommerce-platform.com
- GitHub Issues: https://github.com/ecommerce-platform/issues

### Support Hours

- Standard: Business hours (Mon-Fri 9am-5pm ET)
- Professional: Extended hours (Mon-Fri 7am-9pm ET)
- Enterprise: 24/7 priority support

### Rate Limits

Support tickets have different SLAs based on plan:
- Free: 72 hours
- Starter: 48 hours
- Professional: 24 hours
- Enterprise: 4 hours (critical issues: 1 hour)
