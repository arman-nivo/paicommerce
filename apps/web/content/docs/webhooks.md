---
title: Webhooks
description: Receive order, product and customer events in real time. Topics, payloads, delivery and retries, and HMAC-SHA256 signature verification in Node.js, PHP and Python.
---

Webhooks push events to your server the moment something happens in a store — a new order, a status change, an updated product. Use them to sync ERPs and warehouses, notify staff on Slack, or trigger SMS flows without polling the [REST API](/docs/api).

## Creating a webhook

In the dashboard go to **Settings → Developers → Webhooks**, choose a **topic** and enter an HTTPS **URL**. PaiCommerce generates a unique **signing secret** for each webhook (`webhooks.secret`) — copy it into your receiver's configuration. You can pause a webhook (`active = false`) or delete it at any time.

> [!NOTE]
> Webhooks require the same plan as API access (Growth and above). Endpoints must be reachable over HTTPS in production; `http://localhost` URLs are allowed only for stores in development.

## Topics

| Topic | Fires when |
| --- | --- |
| `order.created` | An order is placed — storefront checkout, manual order in the dashboard, recovered incomplete order or API |
| `order.updated` | Order, payment or fulfillment status changes, a courier is booked, or notes/tags change |
| `product.updated` | A product or one of its variants is created, edited, archived or its inventory changes |
| `customer.created` | A new customer record is created (checkout or dashboard) |

## Request format

Each delivery is a `POST` with a JSON body and these headers:

| Header | Example | Description |
| --- | --- | --- |
| `Content-Type` | `application/json` | |
| `X-Pai-Topic` | `order.created` | The event topic |
| `X-Pai-Store` | `deshi-threads` | Store slug |
| `X-Pai-Delivery` | `9c3f2b1e-…` | Unique delivery id — use it for idempotency |
| `X-Pai-Timestamp` | `1758546295` | Unix seconds when the delivery was signed |
| `X-Pai-Signature` | `sha256=5d0f…` | HMAC-SHA256 of `{timestamp}.{raw body}` with your secret, hex-encoded |

```json title="order.created payload"
{
  "id": "9c3f2b1e-6a0e-4b0e-9d5f-2f3c1a7b8e44",
  "topic": "order.created",
  "store": { "id": "3a7d…", "slug": "deshi-threads" },
  "createdAt": "2026-09-21T13:04:55.000Z",
  "data": {
    "id": "e91a…",
    "orderNumber": 1048,
    "status": "open",
    "paymentStatus": "pending",
    "fulfillmentStatus": "unfulfilled",
    "paymentMethod": "cod",
    "currency": "BDT",
    "total": 245000,
    "customer": { "name": "Rafiq Ahmed", "phone": "01712345678" },
    "lines": [{ "title": "Jamdani Cotton Saree — Red", "quantity": 1, "price": 239000 }]
  }
}
```

`data` has the same shape as the corresponding REST API resource. Money is in minor units (poisha).

## Verifying signatures

Always verify `X-Pai-Signature` before trusting a payload:

1. Read the **raw** request body (before JSON parsing).
2. Compute `HMAC_SHA256(secret, timestamp + "." + rawBody)` as lowercase hex.
3. Compare it to the header value (after `sha256=`) with a **constant-time** comparison.
4. Reject deliveries whose timestamp is more than **5 minutes** old to prevent replays.

### Node.js

```ts title="app/api/pai-webhook/route.ts"
import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET = process.env.PAI_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const raw = await req.text();
  const ts = req.headers.get("x-pai-timestamp") ?? "";
  const sig = (req.headers.get("x-pai-signature") ?? "").replace(/^sha256=/, "");

  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return new Response("stale", { status: 400 });

  const expected = createHmac("sha256", SECRET).update(`${ts}.${raw}`).digest("hex");
  const ok = sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!ok) return new Response("invalid signature", { status: 401 });

  const event = JSON.parse(raw) as { id: string; topic: string; data: unknown };
  // Idempotency: skip if event.id was already processed.
  if (event.topic === "order.created") {
    // enqueue work — respond quickly!
  }
  return new Response("ok");
}
```

### PHP

```php
<?php
$raw = file_get_contents('php://input');
$ts  = $_SERVER['HTTP_X_PAI_TIMESTAMP'] ?? '';
$sig = preg_replace('/^sha256=/', '', $_SERVER['HTTP_X_PAI_SIGNATURE'] ?? '');

$expected = hash_hmac('sha256', $ts . '.' . $raw, getenv('PAI_WEBHOOK_SECRET'));
if (abs(time() - intval($ts)) > 300 || !hash_equals($expected, $sig)) {
    http_response_code(401);
    exit('invalid signature');
}
$event = json_decode($raw, true);
http_response_code(200);
```

### Python

```python
import hashlib, hmac, os, time
from flask import Flask, request, abort

app = Flask(__name__)
SECRET = os.environ["PAI_WEBHOOK_SECRET"].encode()

@app.post("/pai-webhook")
def pai_webhook():
    raw = request.get_data()
    ts = request.headers.get("X-Pai-Timestamp", "")
    sig = request.headers.get("X-Pai-Signature", "").removeprefix("sha256=")
    expected = hmac.new(SECRET, f"{ts}.".encode() + raw, hashlib.sha256).hexdigest()
    if abs(time.time() - int(ts or 0)) > 300 or not hmac.compare_digest(expected, sig):
        abort(401)
    event = request.get_json()
    return "ok"
```

## Delivery and retries

- Respond with any **2xx** within **10 seconds**. Do heavy work asynchronously (queue it) and acknowledge immediately.
- Non-2xx responses and timeouts are retried with exponential backoff: after 1 min, 5 min, 30 min, 2 h, 6 h and 24 h (7 attempts over ~33 hours).
- Deliveries can arrive **out of order** and, rarely, **more than once**. Use `X-Pai-Delivery` / `id` for idempotency and compare `updatedAt` before overwriting newer data.
- After repeated failures for 3 consecutive days the webhook is paused automatically and the store owner is emailed.

In production, deliveries run on a background queue (BullMQ/Redis) isolated in `@pai/core`, so a slow endpoint never slows down checkout.

## Testing locally

Expose your local receiver with a tunnel (e.g. `cloudflared tunnel --url http://localhost:4000`) and register the tunnel URL. You can also compute a signature by hand to test your verifier:

```bash
$ BODY='{"id":"test","topic":"order.created","data":{}}'
$ TS=$(date +%s)
$ SIG=$(printf '%s.%s' "$TS" "$BODY" | openssl dgst -sha256 -hmac "$PAI_WEBHOOK_SECRET" -hex | sed 's/^.* //')
$ curl -X POST http://localhost:4000/pai-webhook \
    -H "Content-Type: application/json" \
    -H "X-Pai-Topic: order.created" \
    -H "X-Pai-Timestamp: $TS" \
    -H "X-Pai-Signature: sha256=$SIG" \
    -d "$BODY"
```
