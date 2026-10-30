# ATELIER — Product Details (FE-007)

## Overview

The Product Details page displays furniture information, product images, specifications, stock availability and shopping cart controls.

## Quantity selector

- Minimum quantity: 1.
- Maximum quantity: the smaller of available stock and 99.
- The minus button is disabled at the minimum.
- The plus button is disabled at the maximum.
- The selected quantity is passed to AddToCartButton and the server-backed cart.

## Stock availability

- Out-of-stock products cannot be added to the cart.
- Quantity controls are disabled when stock is zero.
- A low-stock warning appears when stock is between 1 and 5.

## Product information

- Breadcrumbs display Home / Furniture / Product title.
- The API category name is used when available.
- Product specifications and related items are displayed.
- Warranty information is hidden when the warranty is zero months.

## Product gallery

- The main product image uses a 1:1 aspect ratio.
- Gallery images have descriptive accessible labels.
- Image labels reflect the actual number of available images.

## Related files

- `src/pages/product/ProductDetailsPage.tsx`
- `src/pages/product/ProductDetailsPage.css`
- `src/features/catalog/api/catalogApi.ts`

## Verification

Run:

- `npm run lint`
- `npm run build`

Manual tests:

1. Open a product details page.
2. Test the plus and minus quantity buttons.
3. Verify quantity limits at stock and 99.
4. Add multiple units to the cart.
5. Confirm the cart displays the selected quantity.
6. Check out-of-stock and low-stock products.
7. Verify gallery, specifications and related products.
8. Test layouts at 360 px and 1440 px.

## Scope

FE-007 Product Details improvements do not intentionally change authentication, Checkout, HomePage or Footer.
