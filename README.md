# ATELIER — Furniture Storefront

A responsive furniture e-commerce storefront built with **React 19, TypeScript and Vite** as part of the Skillwill Frontend Development project.

## Project Overview

ATELIER is a furniture storefront where visitors can explore brands, browse furniture categories, view product details and search the product catalog.

Registered users can manage their accounts, delivery addresses, shopping carts and orders.

The project integrates with the course REST API.

**API:** https://shop-api-kbe6.onrender.com/api

> Academic project: payment verification is simulated. No real money is charged.

## Features

### HomePage

- Public furniture showroom.
- Eight brand image cards.
- Six furniture categories with custom SVG pictograms.
- Responsive layouts.
- Navigation to the catalog by brand or furniture type.
- Shared Footer with category links and social media icons.

### Product Catalog

- Server-backed furniture listings.
- Product search.
- Brand and price filters.
- Sorting and pagination.
- URL-based navigation and filters.
- Furniture-type filtering using product titles and slugs.

The six furniture types are:

- Sofa
- Armchair
- Table
- Chair
- Wardrobe
- Bed

Furniture-type links use:

`/catalog?type=<type>&page=1`

Because the API currently uses a general furniture category, type filtering is implemented in the frontend.

### Product Details

- Product image gallery.
- Product descriptions and specifications.
- Stock availability.
- Quantity selector.
- Warranty information when available.
- Related products.
- Add-to-cart functionality.

### Authentication and Profile

- User registration.
- Login and logout.
- Password recovery.
- Protected account pages.
- Profile management.
- Saved delivery addresses.

### Shopping Cart

- Server-backed shopping cart.
- Add products to cart.
- Update product quantities.
- Remove products.
- Shared shopping bag icon.

### Checkout and Orders

- Checkout process.
- Order creation.
- Simulated payment verification.
- Order confirmation and details.

**Important:** The application does not process real payments. Do not enter real bank-card information.

## Technology Stack

| Technology      | Purpose                            |
| --------------- | ---------------------------------- |
| React 19        | User interface                     |
| TypeScript      | Type safety                        |
| Vite            | Development and build tooling      |
| React Router    | Navigation and routing             |
| React Hook Form | Form management                    |
| Zod             | Form validation                    |
| Lucide React    | Interface icons                    |
| CSS             | Component styles and design tokens |
| REST API        | Product and account data           |

## Project Structure

```text
src/
├── features/
│   ├── auth/
│   ├── catalog/
│   └── checkout/
├── pages/
│   ├── auth/
│   ├── cart/
│   ├── catalog/
│   ├── checkout/
│   ├── product/
│   ├── profile/
│   ├── HomePage.tsx
│   └── HomePage.css
├── shared/
│   ├── api/
│   ├── data/
│   ├── styles/
│   └── ui/
└── App.tsx

docs/
├── adr/
├── archive/
│   └── old-readmes/
└── features/

public/
└── images/
    └── home/
```

This is a simplified overview of the main project directories.

## Getting Started

### Requirements

- Node.js
- npm

### Installation

Clone the repository and open the project directory.

Install dependencies:

```bash
npm ci
```

Create the local environment file:

```bash
cp .env.example .env
```

Configure the API URL in `.env`:

```env
VITE_API_URL=https://shop-api-kbe6.onrender.com/api
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite.

**Security:** Never commit `.env` files, passwords, tokens or real payment-card information.

## Application Routes

### Public Routes

| Route              | Description          |
| ------------------ | -------------------- |
| `/`                | Redirect to HomePage |
| `/home`            | Furniture showroom   |
| `/catalog`         | Product catalog      |
| `/product/:slug`   | Product details      |
| `/login`           | Login                |
| `/register`        | Registration         |
| `/forgot-password` | Password recovery    |

### Protected Routes

| Route                        | Description              |
| ---------------------------- | ------------------------ |
| `/profile`                   | User profile             |
| `/addresses`                 | Saved delivery addresses |
| `/cart`                      | Shopping cart            |
| `/checkout`                  | Checkout                 |
| `/checkout/confirm/:orderId` | Payment verification     |
| `/orders/:orderId`           | Order details            |

Protected routes are managed through the `ProtectedRoute` component.

Backend authorization must also be enforced independently.

## Quality Checks

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Manual Testing

Verify:

1. Public pages work without authentication.
2. Registration, login and logout work correctly.
3. Protected routes require authentication.
4. Brand and furniture-type links open the expected catalog results.
5. Catalog search, filters, sorting and pagination work.
6. Product quantities respect available stock.
7. Shopping cart quantities update correctly.
8. Checkout and simulated payment verification work.
9. Order details are displayed correctly.
10. Responsive layouts work at 360, 768 and 1440 px.
11. Keyboard navigation and accessibility labels work.
12. The browser console contains no unexpected errors.

## Documentation

### Feature Documentation

- [HomePage](docs/features/homepage.md)
- [Category Navigation and Footer](docs/features/category-navigation.md)
- [Design System](docs/features/design-system.md)
- [Product Details — FE-007](docs/features/product-details.md)
- [Shopping Cart Icon](docs/features/cart-icon.md)
- [Public and Protected Routes](docs/features/public-routing.md)

### Architecture Decision Records

- [ADR 0001 — Frontend Stack](docs/adr/0001-frontend-stack.md)
- [ADR 0002 — Token Storage](docs/adr/0002-token-storage.md)
- [ADR 0003 — Profile Password Verification](docs/adr/0003-profile-password-verification.md)
- [ADR 0004 — Cart Concurrency Errors](docs/adr/0004-cart-concurrency-errors.md)
- [ADR 0005 — Checkout Order ID and Card Data](docs/adr/0005-checkout-orderid-and-card-data.md)

### Archived Documentation

Previous implementation notes are preserved in:

`docs/archive/old-readmes/`

The archived files are retained for reference and are not the authoritative description of the current implementation.

## Project Responsibility

| Team Member       | Responsibility                                                                 |
| ----------------- | ------------------------------------------------------------------------------ |
| Ekaterine Begadze | Project planning, frontend development, integration, testing and documentation |

## Academic Project

ATELIER was developed for frontend development training and evaluation.

The project demonstrates React application architecture, REST API integration, authentication, product catalog management, shopping cart functionality and a simulated checkout workflow.

Payment verification is for demonstration purposes only.

**Do not use real bank-card details.**
