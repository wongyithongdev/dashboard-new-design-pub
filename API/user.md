# User/Auth API

Public base URL:

```text
https://auth.my365biz.com/auth
```

This is the external user API index.

It only covers public user-facing APIs.

It does not cover:

- internal `/internal/...` APIs
- machine APIs
- Keycloak admin console

## Authentication

Protected endpoints require:

```http
Authorization: Bearer access_token
```

User `access_token` is issued by Keycloak.

Typical claims:

```json
{
  "iss": "https://auth.my365biz.com/auth/realms/dev",
  "sub": "keycloak-user-id",
  "preferred_username": "alice@example.com",
  "email": "alice@example.com",
  "exp": 1760000000,
  "iat": 1759999700,
  "azp": "dev-app",
  "scope": "openid profile email"
}
```

Use `sub` as the stable user id.

Do not read Book access from the token. Book membership and role must be read
through AuthServer APIs.

## Error Format

All Go Auth API errors use:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Request is invalid."
  }
}
```

Common errors:

| HTTP | Code |
| --- | --- |
| 400 | `invalid_json` |
| 400 | `invalid_request` |
| 400 | `invalid_email` |
| 400 | `invalid_invite_code` |
| 400 | `invalid_job_title` |
| 400 | `profile_update_required` |
| 400 | `registration_pending_expired` |
| 401 | `invalid_credentials` |
| 401 | `invalid_mfa_code` |
| 401 | `invalid_refresh_token` |
| 401 | `invalid_token` |
| 401 | `mfa_required` |
| 401 | `bearer_token_required` |
| 403 | `forbidden` |
| 403 | `google_account_required` |
| 403 | `mfa_not_configured` |
| 409 | `email_already_exists` |
| 409 | `invite_code_already_used` |
| 409 | `user_already_bound_to_book` |
| 409 | `user_already_exists` |
| 500 | `database_error` |
| 502 | `keycloak_create_user_failed` |
| 502 | `keycloak_enable_user_failed` |
| 502 | `keycloak_get_user_failed` |
| 502 | `keycloak_identity_check_failed` |
| 502 | `keycloak_login_failed` |
| 502 | `keycloak_logout_failed` |
| 502 | `keycloak_refresh_failed` |
| 502 | `keycloak_token_verify_failed` |
| 502 | `keycloak_update_user_failed` |

## Documents

- [user_auth.md](/home/ubuntu/KeyclockAuth/api/user_auth.md)
  - invite verification
  - registration
  - Google login and invite binding
  - login / refresh / logout

- [user_profile.md](/home/ubuntu/KeyclockAuth/api/user_profile.md)
  - `GET /users/me`
  - `GET /users/me/context`
  - `PUT /users/me/current-book`
  - `PATCH /users/me/profile`

- [user_book.md](/home/ubuntu/KeyclockAuth/api/user_book.md)
  - `GET /users/me/books`
  - `POST /permissions/check`
  - audit event APIs
  - Book machine online status API
