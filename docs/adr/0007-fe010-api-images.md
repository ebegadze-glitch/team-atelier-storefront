# ADR 0007 — Product images supplied by the API

**Date:** 2026-10-31  
**Status:** Accepted as an architectural recommendation; server-side delivery is not implemented in FE-010.

## Context
The ATELIER product page displays image URLs supplied by the external API. The teacher's review identifies a 700 × 700 image-delivery limitation and a measured Product LCP of approximately 3.9 seconds. A frontend-only change cannot generate genuinely smaller source files or guarantee that an external server provides optimized image variants. Lighthouse flagged potential image-transfer savings, which are estimates rather than achieved reductions.

## Decision
1. Keep the original API URLs until a verified server-side alternative exists; do not rewrite third-party URLs to invented sizes.
2. Request that the API provide multiple real image widths and modern formats (for example 320 / 480 / 700 px WebP or AVIF), retaining the 700 × 700 source as an upper bound where applicable.
3. Alternatively, use a properly configured image CDN with approved source domains, resize transformations, format negotiation, documented caching, and fallback to the original source.
4. Once actual variants exist, use `srcSet` and `sizes` for the product gallery. The main visible image should have `fetchPriority="high"` and `loading="eager"`; lower thumbnails and related products can remain lazy-loaded.
5. Reserve the image region's dimensions (currently a square aspect-ratio container) to limit layout shifts.

## Trade-offs
Server/API changes require coordination and maintenance. A CDN introduces service configuration and possible fees. Enlarging the existing 700 px original will not add real image detail. Prioritizing the LCP image cannot itself reduce its download size or the API response time.

## Verification
Repeat three Lighthouse Mobile production-build measurements of the same product URL after implementation and report medians plus detailed LCP/CLS/TBT. Check the Network panel for actual transferred image dimensions, content type, response headers, and cache hits. Do not claim LCP ≤ 2.5 seconds until measured.

## Scope
The FE-010 frontend fix prioritizes the existing main product image; server resizing, CDN deployment, and measured performance improvements remain pending.
