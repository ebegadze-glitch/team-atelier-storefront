# ATELIER — Design System

## Overview

ATELIER uses shared visual styles to maintain a consistent furniture storefront interface.

The design combines reusable CSS styles, Lucide React icons and custom SVG furniture pictograms.

## Technology

- React and TypeScript
- CSS stylesheets
- Shared design tokens
- lucide-react icon library

## Shared theme

The shared theme stylesheet is located at:

`src/shared/styles/atelierTheme.css`

It is imported by `HomePage.tsx`.

The theme supports consistent visual styling across the storefront.

Specific color values, spacing tokens and typography rules should be verified against the current CSS source.

## Icons

Navigation and interface icons use Lucide React.

The shopping bag icon uses the Lucide `ShoppingBag` component.

The Catalog and empty Cart views use this icon instead of colorful emoji.

## Furniture pictograms

The HomePage uses six approved black SVG pictograms:

- Sofa
- Armchair
- Table
- Chair
- Wardrobe
- Bed

These illustrations are separate from the Lucide icon library.

## Visual consistency

The interface should maintain:

- Consistent typography and colors
- Uniform navigation icons
- Accessible links and controls
- Responsive card layouts
- Images without stretching
- Consistent spacing and alignment

## Responsive design

Review the interface at:

- 360 px
- 768 px
- 1440 px

Check navigation, cards, icons and horizontal overflow.

## Related files

- `src/shared/styles/atelierTheme.css`
- `src/pages/HomePage.tsx`
- `src/pages/HomePage.css`
- `src/pages/catalog/CatalogPage.tsx`
- `src/pages/catalog/CatalogPage.css`
- `src/pages/cart/CartPage.tsx`

## Verification

Run:

`npm run lint`

`npm run build`

Verify that icons, images and styles display correctly across the storefront.
