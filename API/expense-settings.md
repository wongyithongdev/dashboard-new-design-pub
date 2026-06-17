# Expense Settings API

Base domain:

```text
https://service.my365biz.com
```

## Overview

This document describes how expense categories are read and updated.

Expense settings are stored inside the company settings API. There is no
separate expense-only route in the current version.

Public routes:

- `GET /biz/settings/company`
- `PATCH /biz/settings/company`

Expense field:

- `expenseCategories`

## Authentication

All requests require:

```http
Authorization: Bearer access_token
```

The service resolves the Book from:

```http
GET /api/v1/users/me
```

Then it verifies permissions through:

```http
POST /api/v1/permissions/check
```

Rules:

- reading expense categories requires `book.read`
- updating expense categories requires `book.settings.update`
- updating also requires `role` to be `owner` or `admin`

## Read Current Expense Categories

### Request

```http
GET /biz/settings/company
```

### Success Response

```json
{
  "bookId": "book_test_modular",
  "companyDescription": "Construction and renovation supplier",
  "expenseCategories": [
    "EPF",
    "SOSCO",
    "Tax Expense",
    "Rental",
    "Staff Allowance",
    "Water Expense",
    "Staff Cost",
    "Communication"
  ],
  "canEdit": true
}
```

## Update Expense Categories

### Request

```http
PATCH /biz/settings/company
Content-Type: application/json
```

```json
{
  "companyDescription": "Construction and renovation supplier",
  "expenseCategories": [
    "EPF",
    "SOSCO",
    "Tax Expense",
    "Rental",
    "Staff Allowance",
    "Water Expense",
    "Staff Cost",
    "Communication",
    "New Expense"
  ]
}
```

## Update Behavior

Expense categories are updated as a full list replacement.

This means:

- add an item by submitting a new list with the item included
- remove an item by submitting a new list without the item
- rename an item by submitting a new list with the new name
- reorder items by submitting the list in the new order

The service does not provide item-level endpoints such as:

- `POST /expense`
- `PATCH /expense/{id}`
- `DELETE /expense/{id}`

## Validation Rules

- maximum `50` items
- each item is trimmed
- empty string items are allowed
- duplicate items are removed while preserving first-seen order
- each item maximum length is `100`

## Success Response

```json
{
  "bookId": "book_test_modular",
  "companyDescription": "Construction and renovation supplier",
  "expenseCategories": [
    "EPF",
    "SOSCO",
    "Tax Expense",
    "Rental",
    "Staff Allowance",
    "Water Expense",
    "Staff Cost",
    "Communication",
    "New Expense"
  ],
  "canEdit": true
}
```

## Errors

- `401 unauthorized`: missing or invalid Bearer token
- `403 forbidden`: permission denied or role not allowed for editing
- `409 book_context_required`: multiple Books are bound to the token
- `502 auth_unavailable`: auth server could not resolve identity or permissions
- `502 auth_invalid`: auth server did not return `book_id` or `user_id`
- `400 bad_request`: invalid JSON or invalid expense category payload
