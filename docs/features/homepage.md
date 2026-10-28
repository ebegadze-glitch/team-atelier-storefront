# ATELIER — HomePage

## Overview

The ATELIER HomePage is the public showroom of the furniture storefront.

It includes a hero section, brand navigation, six furniture categories and account/cart navigation.

## Public access

- `/home` is accessible without authentication.
- The root route `/` redirects visitors to `/home`.
- Signed-out visitors can access the Login page.
- Profile, Cart and Checkout remain protected.

## Brand cards

The HomePage contains eight brand image cards.

- Four brand cards per row on desktop (4 + 4).
- Brand links use `/catalog?brand=<brand>&page=1`.
- Brand images are cropped proportionally.
- Embedded white arrows were removed from the updated image assets.
- Image proportions should be preserved without stretching.

The exact image-fitting and spacing rules should be checked against the current HomePage CSS because older design instructions differ.

## Furniture categories

Six furniture types are displayed using black SVG pictograms:

1. Sofa
2. Armchair
3. Table
4. Chair
5. Wardrobe
6. Bed

The category cards use a three-column desktop layout (3 + 3).

Both HomePage category links and Footer category links use the shared `categoryCatalogUrl()` function.

Their current destination format is:

`/catalog?type=<furniture-type>&page=1`

See `category-navigation.md` for filtering details.

## Navigation and accessibility

- HomePage uses React Router links.
- Brand and category cards are clickable.
- Category cards include descriptive Georgian `aria-label` values.
- Navigation uses Lucide icons.
- Category pictograms use the approved SVG illustrations.

## Responsive design

The layout adapts to different screen widths.

Review the HomePage at:

- 360 px
- 768 px
- 1440 px

Check image proportions, card layout, navigation and horizontal overflow.

## Related files

- `src/pages/HomePage.tsx`
- `src/pages/HomePage.css`
- `src/shared/data/furnitureCategories.ts`
- `src/shared/styles/atelierTheme.css`
- `public/images/home/`

## Verification

Run:

- `npm run lint`
- `npm run build`

Test `/` and `/home` while signed in and signed out.

Also verify that brand and category links open the expected catalog results.
