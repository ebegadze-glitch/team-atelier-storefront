# ATELIER — Public and Protected Routes

## Overview

ATELIER allows visitors to browse furniture without signing in.

Account-related features require authentication.

## Public routes

| Route              | Description               |
| ------------------ | ------------------------- |
| `/`                | Redirects to `/home`      |
| `/home`            | Public furniture showroom |
| `/catalog`         | Furniture catalog         |
| `/product/:slug`   | Product details           |
| `/login`           | User login                |
| `/register`        | User registration         |
| `/forgot-password` | Password recovery         |

## Protected routes

| Route                        | Description              |
| ---------------------------- | ------------------------ |
| `/profile`                   | User profile             |
| `/addresses`                 | Saved delivery addresses |
| `/cart`                      | Shopping cart            |
| `/checkout`                  | Checkout process         |
| `/checkout/confirm/:orderId` | Payment verification     |
| `/orders/:orderId`           | Order details            |

Protected routes require a signed-in user.

## HomePage navigation

When signed out:

- Visitors can browse furniture.
- The Login link is available.
- Account, Cart and Checkout remain protected.

When signed in:

- Account navigation is available.
- Users can access protected shopping features.

## Routing implementation

React Router manages navigation.

The main routing configuration is located in:

`src/App.tsx`

Protected routes are grouped under the `ProtectedRoute` component.

The component is located at:

`src/features/auth/model/ProtectedRoute.tsx`

Authentication and protected route behavior should be checked against the current implementation.

## Verification

1. Open `/` while signed out.
2. Confirm redirection to `/home`.
3. Open `/catalog` and a product details page.
4. Verify Login and Register pages.
5. Attempt to access protected routes while signed out.
6. Sign in and test Profile, Cart and Checkout.
7. Test payment verification at `/checkout/confirm/:orderId`.
8. Test order details at `/orders/:orderId`.
9. Refresh protected pages to verify authentication persistence.
10. Check browser console errors.

## Security

Route protection is a frontend access-control mechanism.

The backend must independently validate authorization for protected API operations.

Payment verification is simulated. No real money is charged.

Do not enter or submit real bank-card information.
