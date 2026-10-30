# FE-010 — Performance and Accessibility Report

**Project:** ATELIER storefront (React, TypeScript, Vite)
**Audit date:** 2026-10-30 (Asia/Tbilisi)
**Environment:** Production build (`npm run build` + `npm run preview`), `http://127.0.0.1:4173`
**Audit tool:** Chrome Lighthouse 13.4.1, Mobile emulation / simulated Slow 4G, initial page load
**Acceptance thresholds used in this project:** Performance >= 85, Accessibility >= 90.

## Final production results (median of three runs on the same URL)

| Page | Run 1 performance | Run 2 | Run 3 | Performance median | Accessibility runs | Accessibility median | Result |
|---|---:|---:|---:|---:|---|---:|---|
| `/home` | 95 | 95 | 94 | **95** | 96, 96, 96 | **96** | Pass |
| `/catalog` | 98 | 97 | 97 | **97** | 93, 93, 93 | **93** | Pass |
| `/product/bed-jysk-grand-39` | 87 | 87 | 87 | **87** | 92, 92, 92 | **92** | Pass |

**Method:** For each page, the median is the middle of the three sorted scores. Results are observations, not guarantees for every user/device/network. The product URL was kept the same for the three official product runs. Measurements for `/catalog?page=3` and other product slugs were additional checks and were not mixed into the medians above.

## Before / after evidence

| Page / issue | Before | After | Interpretation |
|---|---|---|---|
| Home performance | 73 (initial production audit) | 95 (final median) | +22 points |
| Home CLS | 0.304 (initial) | 0 in verified later detailed audit | Reduced layout movement on observed run |
| Catalog performance | 72 (pre-fix median: 94, 72, 72) | 97 (final median: 98, 97, 97) | +25 points |
| Catalog CLS | 0.617 (two pre-fix audits) | Recheck detailed CLS in final reports | Post-fix score improved; CLS number not supplied in final screenshots |
| Hero image audit opportunity | ~143 KiB potential savings before responsive image change | ~12 KiB in later home audit | Lighthouse estimate, not a measured transfer-size reduction |

> Do not state that the final Catalog CLS equals zero without a detailed post-fix report showing the value. The final score screenshots alone do not show CLS.

## Implemented optimizations

1. **Route code splitting.** The application loads lazy routes via `React.lazy` and `Suspense`, avoiding eagerly bundling every page into the entry chunk.
2. **Stable route-loading fallback.** `src/App.tsx` gives the Suspense loading fallback a minimum viewport height (`100svh`) to prevent the footer from jumping during the transition from initial loading to page content.
3. **Responsive home hero.** `src/pages/HomePage.tsx` uses `srcSet` and `sizes` for `hero-960.webp`, `hero-1280.webp`, and the original `hero.webp`; the hero retains `fetchPriority="high"`.
4. **Stable catalog loading state.** `src/pages/catalog/CatalogPage.tsx` and `.css` preserve description space and render filter placeholders before API category filters arrive. These reserve space rather than hiding content.

## Remaining audit findings (non-blocking for recorded score thresholds)

- **Product LCP:** ~3.9 s in a detailed `/product/bed-jysk-grand-39` audit. Main product image is served by the external API; Lighthouse suggests `fetchpriority="high"` for the main image and reports up to ~484 KiB potential image-delivery savings across product / related images. This is an opportunity, not a verified shipped change.
- **Accessibility:** Lighthouse still reports prohibited ARIA attributes and low contrast on some product/catalog text; scores meet the threshold, but manual accessibility review is recommended.
- **Authentication pages (extra audits, not part of the three official URLs):** `/login` was observed at 81/96 on a later run, `/forgot-password` at 80/96, with the forgot-password footer contributing CLS 0.303. These are tracked follow-up items; they are **not** claimed as passed Performance >=85.
- **Bundle verification:** `npm run build` succeeded (TypeScript + Vite). The displayed entry JS chunk was about 72.95 KiB gzip in a captured build log. This is the entry chunk only, **not** the entire JavaScript bundle; do not assert a total bundle budget is met without measuring all emitted JS chunks according to the assignment rubric.

## Reproducing the audit

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Visit each exact URL listed above and run Lighthouse **Mobile** with Performance and Accessibility checked. Use comparable browser, theme, storage and network conditions. Save the HTML/JSON report or a screenshot for each audited run.

## Evidence checklist

- [ ] Save 3 Home Lighthouse reports/screenshots (95, 95, 94 / Accessibility 96).
- [ ] Save 3 Catalog reports/screenshots (98, 97, 97 / Accessibility 93).
- [ ] Save 3 `bed-jysk-grand-39` reports/screenshots (87, 87, 87 / Accessibility 92).
- [ ] Confirm the final detailed Catalog CLS if the assignment explicitly demands a CLS limit.
- [ ] Run `git status`, review the diff, and confirm no unrelated changes were included.
- [ ] Confirm any assignment-specific bundle-size threshold and naming/ADR requirements from the teacher's original instructions before claiming complete submission.
- [ ] Push your own branch and create/update PR against `develop` **only after review**; do not merge into `develop` yourself.

## Scope note

The scores above are based on user-provided Lighthouse runs, not independently run by the author of this report. No source files or CSS are changed by this documentation package.

## JavaScript bundle size — final measurement

- Date: 2026-10-31
- Source: production build (`dist/assets`)
- JavaScript files: 22
- Total JavaScript gzip size: **173.80 KB**
- Required maximum: **less than 300 KB**
- Result: **PASS**
- Measurement: sum of gzip-compressed JavaScript files using Python.
- Note: this is the total emitted JavaScript, not only the entry chunk.
