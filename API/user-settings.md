# User Settings API

Base domain:

```text
https://service.my365biz.com
```

## Overview

This API stores user-level preferences bound to the authenticated Keycloak user.

Public routes:

- `GET /biz/settings/user`
- `PATCH /biz/settings/user`

## Authentication

User settings routes require:

```http
Authorization: Bearer access_token
```

The service calls:

```http
GET /api/v1/users/me
```

and uses `user_id` from the auth response as the durable user key.

## GET /biz/settings/user

### Request

```http
GET /biz/settings/user
```

### Success Response

```json
{
  "userId": "7cdfc38a-a114-4d3f-aeda-e544792af073",
  "language": "en"
}
```

If the user has not saved settings before, the default language is `en`.

## PATCH /biz/settings/user

### Request

```http
PATCH /biz/settings/user
Content-Type: application/json
```

```json
{
  "language": "zh"
}
```

Allowed values:

- `en`
- `zh`

### Success Response

```json
{
  "userId": "7cdfc38a-a114-4d3f-aeda-e544792af073",
  "language": "zh"
}
```

## Errors

- `401 unauthorized`: missing or invalid Bearer token
- `502 auth_unavailable`: auth server could not resolve the current user
- `502 auth_invalid`: auth server did not return `user_id`
- `400 bad_request`: invalid JSON or invalid language value
