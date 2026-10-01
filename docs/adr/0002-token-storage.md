# ADR 0002: Access Token Storage

## Status

Accepted

## Context

The application needs to keep the authenticated user's access token between page reloads so protected routes can remain available after refresh.

The API returns an access token after successful login or registration.

The application also uses `/auth/me` to verify the stored token and load the current user.

## Decision

The access token is stored in `localStorage` through a small `tokenStorage` utility.

The application does not use `localStorage` directly from pages or UI components.

All token access is centralized in:

`src/features/auth/model/tokenStorage.ts`

The utility provides:

- `get()`
- `set(token)`
- `remove()`

On application startup, `AuthProvider` checks whether a token exists.

If a token exists, the application calls `/auth/me`.

If the token is valid, the authentication state becomes `authenticated`.

If the token is missing, invalid, or expired, the token is removed and the authentication state becomes `unauthenticated`.

When the API returns `401 TOKEN_EXPIRED`, the API client removes the token and notifies the authentication layer so the user is redirected to the login page.

Password reset tokens are not stored in `localStorage`. They are kept only in component state for the duration of the password reset flow.

## Consequences

### Benefits

- Authentication survives page refreshes.
- Token access is centralized.
- UI components do not manage storage directly.
- Expired tokens are handled consistently.
- Password reset tokens are not persisted.

### Trade-offs

`localStorage` is accessible to JavaScript, so an XSS vulnerability could expose the access token.

For this project, `localStorage` is used because the backend provides bearer tokens and does not provide an HttpOnly cookie-based authentication flow.
