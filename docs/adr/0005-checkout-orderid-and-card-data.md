# ADR 0005 — Checkout order identifier and sensitive card data

## Context

FE-006 uses a simulated two-step payment: `/checkout` creates an unpaid order,
`/checkout/confirm/:orderId` confirms a development email code, and
`/orders/:orderId` fetches the order from the server. The code screen and
receipt must survive browser refresh.

## Decision

- Store the **order ID in the URL path**, not only in React memory. A refresh
  reconstructs the screen from the URL, and the receipt is fetched from the API.
- Use a **protected route**; unauthenticated users return to the attempted URL
  after login through the existing login `location.state.from` mechanism.
- Keep card fields **only in React Hook Form component state** during checkout;
  POST directly to `/orders` over the existing API client. Never persist card
  data in `localStorage`, `sessionStorage`, the URL, app context or logs.
- Clear card form fields after order creation. On return to checkout,
  initialize card inputs empty. Preserve **shipping-only** draft in
  user-scoped `sessionStorage` so returning from the code page keeps edits;
  this draft never writes to the Address Book.
- On confirm success and already-paid response, read `/cart` again through
  the existing cart context so the header badge uses server truth (zero).
- Ignore `devCode` in UI; it remains visible only in the Network response for
  developer testing. The customer enters the code manually.
- Disable requests during in-flight operations with UI state and a synchronous
  ref to protect against rapid double clicks. Respect resend cooldown and 429.

## Consequences

Refresh and deep links work without persisting payment credentials. Client-side
state cannot forge a successful order because the details page fetches from
`GET /orders/:id`. Payment is a **simulation**; no real funds are captured.

## Test coverage required before PR approval

Check successful and declined test cards, invalid Luhn, inline 422 errors,
stock 409 errors, 30-second resend cooldown and 429, browser refresh on both
code/receipt screens, double-click prevention, empty-cart redirect, shared
cart badge update, and responsive widths 360/768/1440.
