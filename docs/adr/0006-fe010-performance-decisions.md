# ADR 0006 — Route loading and image optimization for FE-010

**Date:** 2026-10-30
**Status:** Implemented and measured on production preview (submission review pending)

## Context

ATELIER is a React/Vite storefront with asynchronous catalog data and image-heavy Home and Product pages. The initial Home production audit reported Performance 73 and CLS 0.304. Catalog later showed an unstable CLS of 0.617 and a Performance median of 72 across three earlier runs. A primary requirement is reliable Mobile Lighthouse performance without changing layout, theme, filters, or checkout behavior.

## Decision 1 — Lazy-load routes and reserve viewport space

Use `React.lazy`/`Suspense` for route components. Reserve a minimum height of `100svh` in the route loading fallback so the shared footer does not jump while a lazy page component initializes. This is a loading-layout decision, not a fixed-position footer workaround.

**Trade-off:** A full-viewport placeholder can temporarily leave empty space during very slow page loads; nevertheless, it prevents a major initial footer shift in the measured Home route.

## Decision 2 — Use responsive static hero assets

Keep the original `/images/home/hero.webp` for large screens, and provide 960px and 1280px WebP variants using `srcSet`/`sizes`. Keep `fetchPriority="high"` on the hero. This reduces unnecessary mobile transfer without changing the chosen photograph or general visual structure.

**Trade-off:** Multiple asset variants need to be maintained, and a good responsive breakpoint/sizes strategy must remain aligned with actual rendered width.

## Decision 3 — Reserve catalog layout while the API responds

Keep the catalog description space and display inert loading placeholders in the filter panel until category information is available. Do not alter API calls, filter selection, sorting, pagination, or business rules.

**Trade-off:** Placeholders can be visible briefly. They are visual scaffolding and should be excluded from accessibility announcements (`aria-hidden="true"`).

## Outcomes

- Home: Performance 73 initial → **95 final median**, Accessibility **96**.
- Catalog: Performance 72 pre-fix median → **97 final median**, Accessibility **93**.
- Product (`/product/bed-jysk-grand-39`): Performance **87 median**, Accessibility **92**.
- Observed Home CLS improved 0.304 → 0 in a later detailed audit.
- Product images from the external API remain a major image optimization opportunity and are not claimed as optimized in this change.

## Alternatives rejected

- `position: fixed` on the footer: hides movement instead of resolving layout reservation and risks overlaying content.
- Removing catalog filters until data arrives without reserving space: risks layout shift when populated.
- Replacing the visual design or rebuilding page components: too much functional/regression risk for a targeted FE-010 optimization.

## Verification and limits

Run `npm run build` and Lighthouse Mobile against Vite Production Preview (`127.0.0.1:4173`), not the Vite Development server. Compare medians of three runs on identical URLs. Additional accessibility warnings and optional authentication-page audits are recorded in `docs/performance.md`.
