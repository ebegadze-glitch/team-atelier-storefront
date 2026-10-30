# ADR 0003 — Profile verification and validation

## Status

Accepted

## Context

The profile update endpoint `PATCH /auth/me` requires the user's current password for **all** account changes, including changing only the name. The form also validates email, new-password policy and confirmation. Address CRUD is handled independently by the Addresses API without password verification.

## Decision

Keep the current-password field within the profile edit form, using the shared `PasswordInput` control. Validate its presence in the centralized `profileSchema` (not in the submit handler). Send the current password with **only modified** account fields. Route API errors to the relevant field and focus the error field so users can correct the problem. Refresh the shared authenticated-user state after successful edits, and clear the password inputs.

## Consequences

- Every account update requires deliberate re-authentication, reducing the impact of a left-unlocked device.
- Users can see which fields are being edited without an additional modal.
- Schema-based errors are consistent with the rest of the form.
- Addresses remain a separate, password-free operation as required by the live API.
