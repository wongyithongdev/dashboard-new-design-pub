# User Profile API

Public base URL:

```text
https://auth.my365biz.com/auth
```

All endpoints in this document require:

```http
Authorization: Bearer access_token
```

## Current User

Returns the current user profile, Book bindings, roles, and MFA status.

```http
GET /api/v1/users/me
```

Full URL:

```text
https://auth.my365biz.com/auth/api/v1/users/me
```

Success:

```json
{
  "user_id": "3a5d8a64-0f11-4c0d-be4c-6bad6a259028",
  "username": "alice",
  "first_name": "Alice",
  "last_name": "Tan",
  "job_title": "Software Engineer",
  "color": "blue",
  "display_name": "Alice Tan",
  "email": "alice@example.com",
  "books": [
    {
      "book_id": "book_test_modular",
      "book_name": "Test Modular Book",
      "role": "employee"
    }
  ],
  "mfa_enabled": true
}
```

Field notes:

- `first_name`, `last_name`, and `email` come from Keycloak.
- `job_title` and `color` come from AuthServer.
- `books` lists all active Books bound to the current user.

## Current User Context

Returns the current user's email, all active Books, and the currently selected
Book.

```http
GET /api/v1/users/me/context
```

Full URL:

```text
https://auth.my365biz.com/auth/api/v1/users/me/context
```

Success:

```json
{
  "user_id": "3a5d8a64-0f11-4c0d-be4c-6bad6a259028",
  "email": "alice@example.com",
  "books": [
    {
      "id": "book-row-uuid",
      "book_id": "book_test_modular",
      "book_name": "Test Modular Book",
      "status": "active",
      "role": "employee",
      "bound_at": "2026-06-10T12:00:00Z"
    }
  ],
  "current_book": {
    "book_id": "book_test_modular",
    "book_name": "Test Modular Book",
    "role": "employee"
  },
  "need_setup": false
}
```

Rules:

- `email` is returned directly from Keycloak.
- `books` returns all active Books bound to the user.
- `current_book` is the stored selection for the user.
- If the user has no stored selection yet, AuthServer automatically picks one
  active Book and stores it as `current_book`.
- `need_setup=true` means the user still has no language configured in
  `public.user_profile_settings`.

## Set Current Book

Stores the currently selected Book for the current user.

```http
PUT /api/v1/users/me/current-book
Content-Type: application/json
```

Full URL:

```text
https://auth.my365biz.com/auth/api/v1/users/me/current-book
```

Request:

```json
{
  "book_id": "book_test_modular"
}
```

Success:

```json
{
  "current_book": {
    "book_id": "book_test_modular",
    "book_name": "Test Modular Book",
    "role": "employee"
  }
}
```

Rules:

- `book_id` is required.
- The user must already be bound to that active Book.
- If the user is not allowed to select that Book, the API returns `403 forbidden`.

## Update Current User Profile

Updates the current user's profile.

```http
PATCH /api/v1/users/me/profile
Content-Type: application/json
```

Full URL:

```text
https://auth.my365biz.com/auth/api/v1/users/me/profile
```

Request:

```json
{
  "first_name": "Alice",
  "last_name": "Tan",
  "email": "alice@example.com",
  "job_title": "Software Engineer"
}
```

Success:

```json
{
  "user_id": "3a5d8a64-0f11-4c0d-be4c-6bad6a259028",
  "username": "alice",
  "first_name": "Alice",
  "last_name": "Tan",
  "job_title": "Software Engineer",
  "color": "blue",
  "display_name": "Alice Tan",
  "email": "alice@example.com"
}
```

Rules:

- At least one field is required.
- `first_name` and `last_name` can be cleared with an empty string.
- `email` cannot be empty and must be valid.
- `job_title` can be cleared with an empty string and has max length `100`.
- `username` cannot be changed through this endpoint.
- `color` is assigned automatically and is not user-editable.
