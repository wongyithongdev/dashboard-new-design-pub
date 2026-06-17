# User Team API

Public base URL:

```text
https://auth.my365biz.com/auth
```

All endpoints in this document require:

```http
Authorization: Bearer access_token
```

These endpoints use the caller's current selected Book.

## Create Invite For Current Book

```http
POST /api/v1/users/me/current-book/invites
Content-Type: application/json
```

Full URL:

```text
https://auth.my365biz.com/auth/api/v1/users/me/current-book/invites
```

Request:

```json
{
  "role": "support"
}
```

Success:

```json
{
  "id": "1533f6f6-990e-4927-8dd9-2b4e02a60526",
  "invite_code": "inv_xxx",
  "code_prefix": "inv_xxx",
  "book_id": "book_test_modular",
  "role": "support",
  "status": "active",
  "expires_at": "2026-06-23T12:00:00Z",
  "created_by": "keycloak-user-id",
  "created_at": "2026-06-16T12:00:00Z"
}
```

Rules:

- `owner` can create invites for `admin`, `employee`, and `support`
- `admin` can create invites for `employee` and `support`
- no one can create an `owner` invite
- `employee` and `support` receive `403 forbidden`
- the raw `invite_code` is returned only once

## List Current Book Team

```http
GET /api/v1/users/me/current-book/team
```

Full URL:

```text
https://auth.my365biz.com/auth/api/v1/users/me/current-book/team
```

Success:

```json
[
  {
    "user_id": "7cdfc38a-a114-4d3f-aeda-e544792af073",
    "username": "demo",
    "email": "demo@example.local",
    "display_name": "Demo User",
    "role": "employee"
  }
]
```

Visibility rules:

- `owner` and `admin` see the full current-book member list
- `employee` and `support` only see their own membership row
- each row includes `username`, `email`, and `display_name`

## Update Team Member Role

```http
PATCH /api/v1/users/me/current-book/team/{user_id}
Content-Type: application/json
```

Full URL:

```text
https://auth.my365biz.com/auth/api/v1/users/me/current-book/team/{user_id}
```

Request:

```json
{
  "role": "support"
}
```

Allowed role values:

- `owner`
- `admin`
- `employee`
- `support`

Success:

```json
{
  "user_id": "7cdfc38a-a114-4d3f-aeda-e544792af073",
  "book_id": "book_test_modular",
  "role": "support"
}
```

Rules:

- `owner` can update any member role
- `admin` cannot update an `owner`
- `admin` cannot assign `owner`
- `employee` and `support` cannot update roles
- the last remaining `owner` cannot be demoted
- target user must already belong to the current Book

## Remove Team Member

```http
DELETE /api/v1/users/me/current-book/team/{user_id}
```

Full URL:

```text
https://auth.my365biz.com/auth/api/v1/users/me/current-book/team/{user_id}
```

Success:

```json
{
  "deleted": true,
  "user_id": "7cdfc38a-a114-4d3f-aeda-e544792af073",
  "book_id": "book_test_modular"
}
```

Rules:

- `owner` can remove any member
- `admin` cannot remove an `owner`
- `admin` can remove `admin`, `employee`, and `support`
- `employee` and `support` cannot remove members
- the last remaining `owner` cannot be removed
- target user must already belong to the current Book
