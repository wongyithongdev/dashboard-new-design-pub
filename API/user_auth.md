# User Auth API

Public base URL:

```text
https://auth.my365biz.com/auth
```

## Verify Invite Code

Checks whether an invite code currently exists and can still be used.

This endpoint does not consume the invite code and does not move it to
`pending`.

```http
POST /api/v1/invites/verify
```

Full URL:

```text
https://auth.my365biz.com/auth/api/v1/invites/verify
```

Request:

```json
{
  "invite_code": "inv_xxx"
}
```

Valid response:

```json
{
  "valid": true,
  "book_id": "book_test_modular",
  "book_name": "Test Modular Book",
  "role": "employee",
  "expires_at": "2026-06-20T12:00:00Z"
}
```

Invalid or expired response:

```json
{
  "valid": false
}
```

Rules:

- `invite_code` is required.
- Only active, unexpired invite codes return `valid: true`.
- Successful registration still requires the normal registration endpoints.

## Registration Flow

Standard registration is invite-only and has two steps:

1. `POST /api/v1/register/start`
2. `POST /api/v1/register/verify-mfa`

### Start Registration

Starts invite-only registration and returns a TOTP MFA QR code.

```http
POST /api/v1/register/start
```

Full URL:

```text
https://auth.my365biz.com/auth/api/v1/register/start
```

Request:

```json
{
  "invite_code": "inv_xxx",
  "username": "alice",
  "email": "alice@example.com",
  "password": "strong-password"
}
```

Success:

```http
201 Created
```

```json
{
  "setup_token": "setup_xxx",
  "book_id": "book_test_modular",
  "book_name": "Test Modular Book",
  "role": "employee",
  "mfa": {
    "type": "totp",
    "issuer": "my365biz",
    "otp_auth_uri": "otpauth://totp/...",
    "qr_code_png_base64": "iVBORw0KGgo...",
    "expires_at": "2026-06-10T12:30:00Z"
  }
}
```

Rules:

- `invite_code`, `username`, `email`, and `password` are required.
- Invite codes are one-time use.
- The new Keycloak user is created disabled until MFA is verified.
- `setup_token` expires after 15 minutes.
- The QR code is returned as base64 PNG.

### Verify Registration MFA

Completes registration after the user scans the QR code and submits the 6-digit
TOTP code.

```http
POST /api/v1/register/verify-mfa
```

Full URL:

```text
https://auth.my365biz.com/auth/api/v1/register/verify-mfa
```

Request:

```json
{
  "setup_token": "setup_xxx",
  "otp_code": "123456"
}
```

Success:

```http
201 Created
```

```json
{
  "user_id": "3a5d8a64-0f11-4c0d-be4c-6bad6a259028",
  "username": "alice",
  "color": "blue",
  "email": "alice@example.com",
  "book_id": "book_test_modular",
  "book_name": "Test Modular Book",
  "role": "employee",
  "mfa_enabled": true
}
```

Rules:

- Registration only completes after this step succeeds.
- The user is bound to the invite's Book with role `employee`.
- A profile color is assigned automatically.
- After success, call `POST /api/v1/login` to get tokens.

## Google Login Flow

Google login is handled by Keycloak, not by Google APIs directly from this
service.

Current Keycloak public settings:

```text
realm: dev
client_id: dev-app
issuer: https://auth.my365biz.com/auth/realms/dev
```

### Step 1: Redirect the user to Keycloak

Authorization endpoint:

```text
https://auth.my365biz.com/auth/realms/dev/protocol/openid-connect/auth
```

Required query parameters:

- `client_id=dev-app`
- `response_type=code`
- `scope=openid profile email`
- `redirect_uri=<your frontend callback URL>`
- `kc_idp_hint=google`

Example:

```text
https://auth.my365biz.com/auth/realms/dev/protocol/openid-connect/auth?client_id=dev-app&response_type=code&scope=openid%20profile%20email&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback&kc_idp_hint=google
```

Notes:

- `redirect_uri` must be allowed in the Keycloak client `dev-app`.
- In the current dev realm, the allowed frontend callback bases are:
  - `http://localhost:3000/*`
  - `http://localhost:5173/*`
  - `http://127.0.0.1:3000/*`
  - `http://127.0.0.1:5173/*`

### Step 2: User completes Google sign-in

After Google authentication succeeds, Keycloak redirects the browser back to
your frontend `redirect_uri` with an authorization `code`.

Example callback URL:

```text
http://localhost:3000/auth/callback?code=...&state=...
```

### Step 3: Exchange the code for tokens

Token endpoint:

```text
https://auth.my365biz.com/auth/realms/dev/protocol/openid-connect/token
```

Example request:

```http
POST /auth/realms/dev/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded
```

Body:

```text
grant_type=authorization_code
client_id=dev-app
code=<authorization_code>
redirect_uri=<same redirect_uri used in step 1>
```

Success response example:

```json
{
  "access_token": "eyJ...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJ...",
  "token_type": "Bearer",
  "scope": "openid profile email"
}
```

### Step 4: Decide whether this is login or first-time Book binding

Case A: existing user already bound to one or more Books

- Use the token directly.
- Call `GET /api/v1/users/me`.

Case B: Google user exists in Keycloak but is not yet bound to a Book

- Call `POST /api/v1/register/google/complete`
- Pass the user's `invite_code`
- Use the same `access_token` as bearer token

## Google Invite Binding

Use this endpoint after Google login if the user still needs invite-based Book
binding.

```http
POST /api/v1/register/google/complete
Authorization: Bearer access_token
```

Full URL:

```text
https://auth.my365biz.com/auth/api/v1/register/google/complete
```

Request:

```json
{
  "invite_code": "inv_xxx"
}
```

Success:

```http
201 Created
```

```json
{
  "user_id": "3a5d8a64-0f11-4c0d-be4c-6bad6a259028",
  "username": "alice@gmail.com",
  "color": "blue",
  "email": "alice@gmail.com",
  "book_id": "book_test_modular",
  "book_name": "Test Modular Book",
  "role": "employee"
}
```

Rules:

- The bearer token must be a valid user access token.
- The Keycloak user must be linked to the `google` identity provider.
- `invite_code` is required and one-time use.
- Success binds the user to the invite's Book with role `employee`.

## Login

Logs in with email, password, and MFA code.

```http
POST /api/v1/login
```

Full URL:

```text
https://auth.my365biz.com/auth/api/v1/login
```

Request:

```json
{
  "email": "alice@example.com",
  "password": "strong-password",
  "otp_code": "123456"
}
```

Success:

```http
200 OK
```

```json
{
  "access_token": "eyJ...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJ...",
  "token_type": "Bearer",
  "scope": "profile email",
  "need_setup": false
}
```

Rules:

- `email` and `password` are required.
- `otp_code` is required for users with MFA.
- A user without MFA cannot complete this login flow.
- `need_setup=true` means the user still has no language configured in
  `public.user_profile_settings`.

## Refresh Token

Refreshes a Keycloak token through the Go Auth API.

```http
POST /api/v1/refresh
```

Full URL:

```text
https://auth.my365biz.com/auth/api/v1/refresh
```

Request:

```json
{
  "refresh_token": "eyJ..."
}
```

Success:

```json
{
  "access_token": "eyJ...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJ...",
  "token_type": "Bearer",
  "scope": "profile email"
}
```

## Logout

Logs out by revoking the refresh token.

```http
POST /api/v1/logout
```

Full URL:

```text
https://auth.my365biz.com/auth/api/v1/logout
```

Request:

```json
{
  "refresh_token": "eyJ..."
}
```

Success:

```json
{
  "logged_out": true
}
```
