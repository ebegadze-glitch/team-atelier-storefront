# ATELIER — Shopping Cart Icon

## Overview

ATELIER uses a consistent shopping bag icon across the storefront.

The icon is provided by the `lucide-react` library.

## Icon component

The shopping bag icon uses:

`ShoppingBag`

This replaces colorful shopping bag emoji with a monochrome SVG icon.

## Catalog page

File: `src/pages/catalog/CatalogPage.tsx`

- Uses the Lucide ShoppingBag icon.
- Icon size: 19 px.
- Stroke width: 1.8.
- Icon and text spacing is controlled by CatalogPage.css.

## Empty Cart page

File: `src/pages/cart/CartPage.tsx`

- Uses the Lucide ShoppingBag icon.
- Icon size: 48 px.
- Stroke width: 1.8.
- Replaces the previous emoji.

## HomePage

The HomePage also uses a monochrome shopping bag icon for cart navigation.

## Related files

- `src/pages/HomePage.tsx`
- `src/pages/catalog/CatalogPage.tsx`
- `src/pages/catalog/CatalogPage.css`
- `src/pages/cart/CartPage.tsx`

## Verification

Run:

- `npm run lint`
- `npm run build`

Check that the shopping bag icon displays correctly on the HomePage, Catalog and empty Cart page.

## Scope

These icon changes do not intentionally modify the shopping cart API, quantity management or Checkout functionality.
