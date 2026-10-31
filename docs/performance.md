# FE-010 — ATELIER: Performance, Accessibility and Bundle Report

**Date:** 31 October 2026  
**Project:** ATELIER — React / TypeScript / Vite  
**Measurement environment:** Vite production build served through `npm run preview` at `http://127.0.0.1:4173`  
**Tool:** Chrome Lighthouse 13.4.1 — Mobile, simulated Slow 4G  
**Deployment URL:** Not supplied/verified; this report is based on local production preview, not a public deployment.  
**API:** `https://shop-api-kbe6.onrender.com/api`. Because the hosting service may need to wake up, verify API readiness before comparable runs. No measured API wake-up time is available.

## 1. Goal and audit method

FE-010 measures and improves existing functionality. The required thresholds are **Performance ≥ 85**, **Accessibility ≥ 90** on three specified pages, and **total generated JavaScript gzip < 300 KB**. For each page, three Mobile Lighthouse audits were recorded; the median is the middle value after sorting the three scores. The same product slug was used for all official product measurements.

The FE-008 Dark Mode functionality exists in this branch's history, but it is **not** a FE-010 performance optimization. Its addition was combined with an optimization commit; therefore the original commit does not isolate the effects of FE-010. Future fixes should be isolated in narrowly scoped commits.

## 2. Before — available measurements

| Page | Before Performance | Before Accessibility | Before LCP | Before CLS | Before TBT | Evidence / limitations |
|---|---:|---:|---|---:|---:|---|
| Home `/home` | 73 | Not recorded | Not recorded | 0.304 | Not recorded | Initial production-preview audit |
| Catalog `/catalog` | 72 (median of 94, 72, 72) | Not recorded | Not recorded | 0.617 (two earlier audits) | Not recorded | Earlier three-run series; individual detailed reports not all retained |
| Product `/product/bed-jysk-grand-39` | **Not available** | Not available | Not available | Not available | Not available | No authentic pre-optimization baseline was retained |

An absent baseline is explicitly identified rather than reconstructed from a final screenshot.

## 3. After — official scores recorded before the review fixes

| Page | Performance runs | Performance median | Accessibility runs | Accessibility median | Required threshold result |
|---|---|---:|---|---:|---|
| Home `/home` | 95, 95, 94 | **95** | 96, 96, 96 | **96** | PASS |
| Catalog `/catalog` | 98, 97, 97 | **97** | 93, 93, 93 | **93** | PASS |
| Product `/product/bed-jysk-grand-39` | 87, 87, 87 | **87** | 92, 92, 92 | **92** | PASS |

These are the previously recorded results; **they are not fresh measurements following the 31 October review fix**.

### Detailed Core Web Vitals / diagnostics

| Page | LCP after | CLS after | TBT after | Note |
|---|---|---|---|---|
| Home | Not retained | 0 in one later detailed audit | Not retained | Single detailed CLS observation, not a three-run median |
| Catalog | Not retained | Not retained | Not retained | Earlier CLS was 0.617; do not call the final CLS zero |
| Product | **~3.9 s** in one detailed audit | Not retained | Not retained | Exceeds the desirable LCP ≤ 2.5 s |

The detailed LCP/CLS/TBT reports must be captured again after the current code changes; score screenshots alone do not establish these values.

## 4. Before / after comparison

| Page / metric | Before | Recorded after | Change |
|---|---:|---:|---:|
| Home Performance | 73 | 95 | +22 points |
| Catalog Performance | 72 | 97 | +25 points |
| Product Performance | No baseline | 87 | Cannot calculate honest change |
| Home CLS | 0.304 | 0 (one later run) | Improvement observed |
| Catalog CLS | 0.617 (earlier) | Not available | Cannot calculate |
| Product LCP | Not available | ~3.9 s (one run) | Still above 2.5 s target |

## 5. Implemented changes and effect

1. **Lazy routes:** `React.lazy` and `Suspense` split page code so all routes do not have to load at startup.
2. **Reserved loading height:** `Suspense` fallback has `minHeight: 100svh`, reducing initial footer movement.
3. **Responsive home hero:** WebP `hero-960.webp`, `hero-1280.webp`, and original `hero.webp` are selected using `srcSet` / `sizes`; the image has `fetchPriority="high"`.
4. **Catalog placeholders:** Reserved description/filter space reduces unexpected movement as API data arrives.
5. **API preconnect (review follow-up):** `index.html` now declares `rel="preconnect"` to `https://shop-api-kbe6.onrender.com`; connection benefit has not been measured and depends on the deployed API origin. 
6. **Product LCP image (review follow-up):** The main `ProductDetailsPage` image now specifies `fetchPriority="high"` and `loading="eager"`. This is a code fix; its effect on LCP **has not yet been measured**. Related images remain lazy-loaded.

External API product images are not claimed to have been resized, compressed, or delivered through a CDN. Recommendations and limitations are documented in [ADR 0007](adr/0007-fe010-api-images.md).

## 6. Complete JavaScript bundle

| Measurement | Value |
|---|---:|
| Production build JavaScript files | 22 |
| Sum of gzip sizes across all generated JS files | **173.80 KB** |
| Budget | **< 300 KB** |
| Headroom | **126.20 KB** |
| Recorded result | **PASS** |

The number counts **all** emitted JavaScript chunks, not only the entry chunk. This is the recorded 31 October build result, **before** the isolated product-image attribute update. Rebuild and recalculate after all changes. A comparable full pre-optimization bundle measurement is unavailable; no reduction percentage is claimed.

## 7. Accessibility findings

Recorded Mobile Lighthouse Accessibility medians are 96 (Home), 93 (Catalog), and 92 (Product). Earlier audits reported prohibited ARIA attributes and low text contrast on some catalog/product elements. Those warnings still require element-by-element identification and verification; the scores passing does **not** mean the accessibility problems are fixed. Correct invalid ARIA usage without breaking native semantics, check text contrast against WCAG AA, and rerun Lighthouse.

## 8. Evidence and reproducibility

The original audit screenshots are in [`docs/performance/`](performance/). The reviewer found that the official Home Run 2 screenshot was not separately supplied; the file named “Additional” does **not** establish an identical second run. Keep the historical 95, 95, 94 results clearly identified as recorded results, and replace the incomplete evidence with three newly captured runs of every page.

To repeat:

```bash
npm ci
npm run lint
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

1. Confirm the API is responsive and load each exact URL.
2. Use the same browser profile, viewport/emulation, network settings, language, theme, authentication state, and clean storage policy for every run.
3. Run three Mobile Lighthouse audits per page and save each detailed HTML/JSON report **and** a clearly named screenshot.
4. Capture Performance, Accessibility, LCP, CLS, and TBT for every run. Compute medians for the three new runs; keep earlier baselines separated.
5. Verify real deployment URL, if the assignment requires deployment; local preview is not the public deployment.
6. Confirm source diff contains only the intended FE-010 changes, and have the team review before merging.

The code and ADR updates in the review branch do not establish new Lighthouse results. The original audit screenshots and metrics need independent verification in the intended runtime.

## 9. Architectural records and outstanding work

- [ADR 0006 — Lazy routes / hero / loading layout](adr/0006-fe010-performance-decisions.md) — implemented earlier.
- [ADR 0007 — API-supplied images and 700 × 700 limitation](adr/0007-fe010-api-images.md) — recommended server formats/image CDN; not deployed.
- [ADR 0008 — Cache and logout policy](adr/0008-fe010-cache-strategy.md) — policy with proposed lifetimes; response headers and full logout invalidation not verified.

**Still to verify:** product LCP after the image-priority fix; all final LCP/CLS/TBT values; invalid ARIA and contrast diagnostics; exact API wake-up behavior; deployment URL; full new bundle size; missing Home Run 2 evidence. Neither a code edit nor an ADR should be presented as a measured performance improvement without a fresh audit.
