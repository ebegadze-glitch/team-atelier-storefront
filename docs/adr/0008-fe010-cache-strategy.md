# ADR 0008 — HTTP and user-data cache strategy

**Date:** 2026-10-31  
**Status:** Proposed policy; not a claim that all headers or purge actions are implemented.

## Context
ATELIER is a Vite/React frontend that consumes public catalog data and authenticated account, cart and order endpoints. `apiClient` uses `fetch` with bearer-token headers. The access token is held in `localStorage` under `accessToken`. A cache strategy must prevent stale product details and cross-account data exposure.

## Decision / proposed lifetimes
| Resource | Suggested cache policy | Invalidation |
|---|---|---|
| Fingerprinted `dist/assets/*` JS/CSS | `Cache-Control: public, max-age=31536000, immutable` | New build produces new hashed filenames |
| `index.html` / SPA entry | `Cache-Control: no-cache` (revalidate) | Revalidate when opening/reloading |
| Public static images with stable names | Short-lived public cache, e.g. `max-age=86400`; use versioned names for long caching | Change filename/version or revalidate |
| Public catalog / category / product API | Start with short TTL, e.g. 60 seconds, only if endpoint semantics permit | Revalidate on updates; honor origin headers |
| Auth/session/profile/addresses/cart/orders | `Cache-Control: no-store` on server responses; no shared CDN caching | Logout, token expiration, account switch |
| Client-side temporary data | Prefer component-level state without persistent copies of private API data | Clear on logout and authorization failure |

The durations above are **recommended settings**, not confirmed live response headers. Browser HTTP caching ultimately follows the actual server/CDN headers. Frontend components must not assume the API has implemented them.

## Logout contract
1. Remove the access token (`tokenStorage.remove()`); current code removes the token on certain 401 invalid-session responses.
2. Reset in-memory account-specific state, including profile, cart, addresses and order data, when the app's auth/logout flow runs.
3. If a query cache is introduced, clear private query keys on logout and account change. Do not persist private queries in localStorage.
4. If service workers or Cache Storage are introduced later, exclude authenticated API responses and explicitly evict any private entries.
5. Test logout → login as a different user → browser Back/Forward to ensure no previously fetched personal data is exposed.

## Risks and alternatives
Overly long public-data TTLs can show outdated prices or inventory; a no-cache policy everywhere increases traffic and latency. Client-side clearing is not a substitute for correct server authorization and `no-store` headers. An access token in localStorage is vulnerable to XSS; an HttpOnly/Secure cookie approach needs backend support and is outside this FE-010 scope.

## Verification needed
Inspect actual response headers in browser Network tools for static assets and each API class. Test logout, 401 handling, navigation, reload, and user switching. Record observed TTLs separately from these proposed settings.
