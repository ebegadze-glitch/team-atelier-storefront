# ADR 0004 — Cart concurrency and error handling

## Status

Accepted

## Context

FE-005 persists the shopping cart on the API. Multiple quick clicks can send conflicting quantity updates, and API messages are not consistently translated into Georgian. Stale cart items may disappear on the server between requests.

## Decision

- Keep the server as the source of truth for cart items, quantities, stock and totals.
- Disable quantity steppers, removal and add-to-cart buttons while loading or mutating.
- Keep `busyRef` as a synchronous protection against clicks before React renders the disabled state. Repeated clicks are silently ignored, not presented as errors.
- Serialize mutations rather than using optimistic quantity updates.
- Retain `generationRef` and the user-specific `CartSession` key to ignore obsolete responses and prevent cross-user state leaks.
- Translate known cart API error `code` values centrally in `features/cart/lib/cartErrors.ts`, including stock limits and missing items; do not display arbitrary raw server `message` strings.
- Preserve the `available` stock count from the API error response when present.
- On `CART_ITEM_NOT_FOUND`, refresh the cart after the mutation lock is released, so the interface reflects the current server state.

## Consequences

- Rapid double clicks do not produce misleading error notifications or conflicting requests.
- The UI is temporarily disabled during network operations and may feel less immediate than optimistic updates.
- All cart entry points use consistent Georgian errors.
- The cart can recover from stale line IDs without a page reload.
- The current architecture remains focused and avoids a premature rewrite to a new caching library.
