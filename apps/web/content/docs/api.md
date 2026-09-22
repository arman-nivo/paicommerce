---
title: REST API
description: Read and write products, collections, customers and orders with the PaiCommerce REST API at /api/v1 — authentication with scoped API keys, pagination, errors, rate limits and curl examples.
---

The PaiCommerce REST API lets you connect a store to ERPs, warehouses, accounting tools, marketplaces and your own automations. It is a JSON-over-HTTPS API served by the storefront app under `/api/v1`.

> [!NOTE]
> API access is available on the **Growth** plan and above (`limits.apiAccess`). Keys are created per store, so every request is automatically scoped to the store that owns the key — you never pass a store id.

## Base URL

| Environment | Base URL |
| --- | --- |
| Production | `https://stores.paicommerce.com/api/v1` (any store domain also works, e.g. `https://yourstore.paicommerce.com/api/v1`) |
| Local development | `http://localhost:3003/api/v1` |

`/api/v1/*` is a global path on the storefront host: the store is resolved from the API key, not from the hostname.

## Authentication

Create a key in the dashboard under **Settings → Developers → API keys**. Choose a name and the scopes the key needs. The full secret is shown **once**; PaiCommerce stores only a hash (`api_keys.key_hash`) plus a short visible prefix so you can recognise the key later.

Send the key as a bearer token:

```bash
$ curl https://stores.paicommerce.com/api/v1/products \
    -H "Authorization: Bearer pai_sk_4f9c2a_7Qm1…"
```

Keys can be revoked at any time (`revoked_at`); revoked keys return `401` immediately. `last_used_at` is updated on use so you can spot stale keys.

### Scopes

| Scope | Grants |
| --- | --- |
| `products:read` | List and read products, variants and collections |
| `products:write` | Create, update and archive products; adjust inventory |
| `orders:read` | List and read orders, line items and timelines |
| `orders:write` | Create orders, update status, add notes, book couriers |
| `customers:read` | List and read customers |
| `customers:write` | Create and update customers |

A request without the required scope returns `403 insufficient_scope`.

## Conventions

- **JSON** request and response bodies (`Content-Type: application/json`).
- **Money is always an integer in minor units** (poisha for BDT): `245000` = ৳2,450. Every money object is accompanied by a `currency` field.
- **Timestamps** are ISO 8601 in UTC.
- **IDs** are UUIDs. Products and collections can also be fetched by `slug`.
- Successful list responses have the shape `{ "data": [...], "pagination": {...} }`; single resources return `{ "data": {...} }`.

### Pagination

List endpoints accept `page` (1-based) and `limit` (default `20`, max `100`):

```json
{
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 20, "total": 134, "pageCount": 7 }
}
```

### Errors

Errors use conventional HTTP status codes and a consistent body:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request body",
    "details": { "lines.0.quantity": "Must be at least 1" }
  }
}
```

| Status | Code | Meaning |
| --- | --- | --- |
| 400 | `validation_error` | Body or query failed validation (zod) |
| 401 | `unauthorized` | Missing, malformed or revoked key |
| 403 | `insufficient_scope` / `plan_required` | Key lacks a scope, or the store's plan has no API access |
| 404 | `not_found` | Resource doesn't exist in this store |
| 409 | `conflict` | E.g. insufficient stock when creating an order |
| 429 | `rate_limited` | Too many requests — see below |
| 500 | `internal_error` | Something went wrong on our side |

### Rate limits

Each key may make **120 requests per minute** (burst 40). Responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset`. On `429`, wait until the reset time; use exponential backoff for retries.

## Products

### List products

```http
GET /api/v1/products?page=1&limit=20&status=active&collection=new-arrivals&q=saree
```

| Query | Description |
| --- | --- |
| `status` | `draft`, `active` or `archived` |
| `collection` | Collection slug |
| `q` | Full-text search on title, SKU and tags |
| `updated_since` | ISO timestamp — only products changed after it (for syncing) |

```bash
$ curl "http://localhost:3003/api/v1/products?limit=2" \
    -H "Authorization: Bearer $PAI_API_KEY"
```

```json
{
  "data": [
    {
      "id": "7b1e…",
      "slug": "jamdani-cotton-saree",
      "title": "Jamdani Cotton Saree",
      "status": "active",
      "price": 345000,
      "compareAtPrice": 420000,
      "currency": "BDT",
      "inventory": 18,
      "images": [{ "url": "https://…/saree.jpg", "alt": "Red jamdani saree" }],
      "options": [{ "name": "Color", "values": ["Red", "Blue"] }],
      "variants": [
        { "id": "c2d4…", "title": "Red", "sku": "JS-RED", "price": 345000, "inventory": 10, "options": { "Color": "Red" } }
      ],
      "tags": ["eid", "handloom"],
      "createdAt": "2026-08-02T10:12:00.000Z",
      "updatedAt": "2026-09-18T04:40:11.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 2, "total": 134, "pageCount": 67 }
}
```

### Retrieve a product

```http
GET /api/v1/products/{id-or-slug}
```

### Create a product

```bash
$ curl -X POST http://localhost:3003/api/v1/products \
    -H "Authorization: Bearer $PAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Handloom Gamcha",
      "price": 45000,
      "inventory": 50,
      "status": "active",
      "tags": ["handloom"]
    }'
```

### Update a product

```http
PATCH /api/v1/products/{id}
```

Send only the fields you want to change. To adjust stock for a variant: `PATCH /api/v1/products/{id}/variants/{variantId}` with `{ "inventory": 12 }`.

## Collections

```http
GET /api/v1/collections
GET /api/v1/collections/{id-or-slug}
GET /api/v1/collections/{id-or-slug}/products
```

## Orders

### List orders

```http
GET /api/v1/orders?status=open&payment_status=paid&created_since=2026-09-01T00:00:00Z
```

```json
{
  "data": [
    {
      "id": "e91a…",
      "orderNumber": 1048,
      "status": "open",
      "paymentStatus": "paid",
      "fulfillmentStatus": "unfulfilled",
      "paymentMethod": "bkash",
      "currency": "BDT",
      "subtotal": 239000,
      "shipping": 6000,
      "discount": 0,
      "total": 245000,
      "customer": { "name": "Rafiq Ahmed", "phone": "01712345678", "email": null },
      "shippingAddress": { "address": "House 12, Road 5", "area": "Dhanmondi", "city": "Dhaka" },
      "lines": [{ "productId": "7b1e…", "variantId": "c2d4…", "title": "Jamdani Cotton Saree — Red", "quantity": 1, "price": 239000 }],
      "courier": { "provider": "steadfast", "consignmentId": "SF-839214", "status": "in_transit" },
      "createdAt": "2026-09-21T13:04:55.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pageCount": 1 }
}
```

### Create an order

Orders created through the API go through the same pricing and stock logic as storefront checkout (`priceCart` + `createOrder` in `@pai/core/orders`): prices are taken from the catalog, stock is reserved atomically, discounts and delivery zones are applied, and analytics and `order.created` webhooks fire.

```bash
$ curl -X POST http://localhost:3003/api/v1/orders \
    -H "Authorization: Bearer $PAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "customer": { "name": "Nusrat Jahan", "phone": "01812345678" },
      "shippingAddress": { "address": "Flat 4B, Road 11", "area": "Banani", "city": "Dhaka" },
      "deliveryZoneId": "inside-dhaka",
      "paymentMethod": "cod",
      "lines": [{ "variantId": "c2d4…", "quantity": 2 }],
      "note": "Call before delivery"
    }'
```

### Update an order

```http
PATCH /api/v1/orders/{id}
```

Accepts `status` (`open`, `completed`, `cancelled`, `archived`), `paymentStatus`, `fulfillmentStatus`, `note` and `tags`. Every change is recorded on the order timeline.

## Customers

```http
GET  /api/v1/customers?q=01712
GET  /api/v1/customers/{id}
POST /api/v1/customers
```

Phone numbers are normalised to the Bangladeshi local format (`+880 1712-345678` → `01712345678`).

## Client example (Node.js)

```ts title="sync-orders.ts"
const BASE = process.env.PAI_API_URL ?? "http://localhost:3003/api/v1";

async function pai<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.PAI_API_KEY}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (res.status === 429) {
    const reset = Number(res.headers.get("X-RateLimit-Reset") ?? 1);
    await new Promise((r) => setTimeout(r, reset * 1000));
    return pai(path, init);
  }
  if (!res.ok) throw new Error(`PaiCommerce API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

const { data: orders } = await pai<{ data: { orderNumber: number; total: number }[] }>("/orders?payment_status=paid");
for (const o of orders) console.log(`#${o.orderNumber} ৳${o.total / 100}`);
```

## Versioning

The API is versioned in the path. Additive changes (new fields, new endpoints) ship without a version bump, so ignore unknown fields. Breaking changes get a new version and at least **90 days** of overlap, announced in the [changelog](/changelog).

Next: react to changes in real time with [Webhooks](/docs/webhooks).
