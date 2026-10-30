# ADR 0001 — Frontend Stack

## Status

Accepted

## Context

FE-001 requires three authentication screens:
Login, Register, and Forgot Password.

The screens need reusable UI components, client-side validation,
responsive layouts, keyboard accessibility, and a consistent design system.

## Decision

We will use:

- React for the user interface
- Vite for development and build tooling
- TypeScript for type safety
- React Router for client-side routing
- React Hook Form for form state and validation flow
- Zod for validation schemas
- ESLint for code quality
- CSS custom properties for design tokens and styling

Reusable components will be placed in:

`src/shared/ui/`

Colors, spacing, sizes, borders, and other reusable design values
will come from design tokens instead of being hardcoded in components.

TanStack Query is not required for FE-001 because this task has no API.
It can be added later when server state is introduced.

## Consequences

This approach keeps authentication forms reusable, maintainable,
consistent with the Atelier design system, and ready for future
screens such as cart, checkout, and profile.
