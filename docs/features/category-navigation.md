# ATELIER — Category Navigation and Footer

## Overview

ATELIER uses six furniture categories on the HomePage and in the shared Footer.

Both components use `furnitureCategories` and `categoryCatalogUrl()` from `src/shared/data/furnitureCategories.ts`.

## Furniture categories

| Category | URL                             |
| -------- | ------------------------------- |
| Sofa     | `/catalog?type=sofa&page=1`     |
| Armchair | `/catalog?type=armchair&page=1` |
| Table    | `/catalog?type=table&page=1`    |
| Chair    | `/catalog?type=chair&page=1`    |
| Wardrobe | `/catalog?type=wardrobe&page=1` |
| Bed      | `/catalog?type=bed&page=1`      |

## Category filtering

The API uses the general `furniture` category.

For furniture-type filtering, ATELIER:

1. Fetches product pages from the API.
2. Matches product titles and slugs against furniture-type names.
3. Removes duplicate products.
4. Paginates the filtered results locally.

English, Georgian and Russian names are supported.

Chairs and armchairs are classified separately.

### Limitation

Filtering depends on recognizable furniture-type words in product titles or slugs.

A dedicated backend type or subcategory field would improve reliability.

## Shared Footer

`SiteFooter` is imported and rendered in `App.tsx`.

It contains:

- ATELIER branding and six category links.
- Social media icons, including the Facebook page link.
- Office information and copyright.

## Related files

- `src/shared/data/furnitureCategories.ts`
- `src/pages/HomePage.tsx`
- `src/pages/catalog/CatalogPage.tsx`
- `src/shared/ui/SiteFooter.tsx`
- `src/shared/ui/SiteFooter.css`

## Verification

Run `npm run lint` and `npm run build`.

Test all six category links from both the HomePage and Footer.
