# Purchase Invoice API

Base domain:

```text
https://service.my365biz.com
```

## Overview

This API reads purchase invoice data from the business database after verifying
that the caller is allowed to read the target Book.

Public routes:

- `GET /biz/purchase-invoice`
- `GET /biz/purchase-invoices`
- `GET /biz/purchase-invoice/detail`

## Authentication

Purchase invoice routes require:

```http
Authorization: Bearer access_token
```

The service calls:

```http
POST /api/v1/permissions/check
```

with:

```json
{
  "book_id": "book_xxx",
  "action": "book.read"
}
```

The final database query uses the `book_id` returned by the permission check
response when present.

The service first calls `GET /api/v1/users/me` and resolves the Book from the
token:

- if exactly one Book is bound, it is used automatically
- if multiple Books are bound, the API returns a context error

## Public API

### Request

```http
GET /biz/purchase-invoice?limit=50&offset=0
GET /biz/purchase-invoices?limit=50&offset=0
```

Query parameters:

- `limit` optional, default `50`, max `200`
- `offset` optional, default `0`
- `sort_by` optional: `invoiceNo`, `agent`, `status`, `amount`, `date`
- `status` optional filter: `unpaid`, `partial`, `paid`, `overdue`

Sort behavior:

- `invoiceNo`: latest invoice number first
- `agent`: A-Z
- `status`: attention first
- `amount`: higher first
- `date`: newest first

### Success Response

```json
{
  "book_id": "book_xxx",
  "limit": 50,
  "offset": 0,
  "items": [
    {
      "invoiceNo": "PI-2606-0023",
      "creditor": "PHT HARDWARE (BUKIT MERTAJAM) SDN BHD",
      "creditorType": "Retail & Supermarket",
      "date": "2026-06-08",
      "agent": "OFFICE",
      "amount": 585.63,
      "status": "unpaid",
      "canPay": true
    }
  ]
}
```

## Public Detail API

### Request

```http
GET /biz/purchase-invoice/detail?docKey=3136166
```

Query parameters:

- `docKey` required

### Success Response

```json
{
  "success": true,
  "header": {
    "docKey": "3136166",
    "invoiceNo": "PI-2606-0023",
    "supplierInvoiceNo": "P26060457",
    "creditorCode": "400-P007",
    "supplier": "PHT HARDWARE (BUKIT MERTAJAM) SDN BHD",
    "creditorType": "Retail & Supermarket",
    "agent": "OFFICE",
    "currency": "MYR",
    "date": "2026-06-08",
    "grandTotal": 585.63,
    "amount": 585.63,
    "outstandingAmount": 585.63,
    "canCreateAPPayment": true
  },
  "details": [
    {
      "itemCode": "6153",
      "description": "6153-2ton ROCKEY HAND PULLER 手拉布力 (12 set)",
      "uom": "SET",
      "qty": 6,
      "unitPrice": 106.5,
      "amount": 191.7,
      "taxCode": null,
      "accNo": "610-0000"
    }
  ]
}
```

### Detail Fields

- `header.docKey`: purchase invoice document key
- `header.invoiceNo`: purchase invoice document number
- `header.supplierInvoiceNo`: supplier invoice number
- `header.creditorCode`: supplier code
- `header.supplier`: supplier name
- `header.creditorType`: AI-classified creditor type from `sync_meta.creditor_ai_jobs`
- `header.agent`: purchase agent
- `header.currency`: currency code
- `header.date`: purchase invoice document date
- `header.grandTotal`: total amount from `PI.Total`
- `header.amount`: net amount from `PI.NetTotal`
- `header.outstandingAmount`: outstanding amount from matched `APInvoice.Outstanding`
- `header.canCreateAPPayment`: `true` when `outstandingAmount > 0`
- `details[].itemCode`: item code
- `details[].description`: detail description
- `details[].uom`: unit of measure
- `details[].qty`: quantity
- `details[].unitPrice`: unit price
- `details[].amount`: line amount
- `details[].taxCode`: tax code
- `details[].accNo`: account number

### Item Fields

- `invoiceNo`: purchase invoice document number from `PI.DocNo`
- `creditor`: supplier name, falls back to description when supplier name is empty
- `creditorType`: AI-classified creditor type from `sync_meta.creditor_ai_jobs`
- `date`: purchase invoice document date
- `agent`: purchase agent from `PI.PurchaseAgent`
- `amount`: net total from `PI.NetTotal`
- `status`: payment status derived from invoice and AP invoice state
- `canPay`: whether the invoice is currently payable

`status=attention first` sorts in this order:

1. `overdue`
2. `partial`
3. `unpaid`
4. `paid`
5. `cancelled`

## Status Rules

Status is computed in this order:

1. `cancelled`
2. `paid`
3. `overdue`
4. `partial`
5. `unpaid`

Applied rules:

- `cancelled`: invoice is cancelled
- `paid`: `outstandingAmount <= 0`
- `overdue`: `dueDate < current_date` and still outstanding
- `partial`: `outstandingAmount > 0` and `outstandingAmount < grandTotal`
- `unpaid`: all other outstanding invoices

`canPay` is `true` when:

- invoice is not cancelled
- `outstandingAmount > 0`

Otherwise `canPay` is `false`.

## AI Creditor Type

`creditorType` comes from the latest `committed` row in:

```text
sync_meta.creditor_ai_jobs
```

Matched by:

- `book_id`
- `CreditorCode`

If no AI classification exists yet, `creditorType` returns `null`.

## Error Responses

### Missing Token

```json
{
  "error": "unauthorized",
  "message": "Authorization Bearer token is required"
}
```

### Multiple Books Bound

```json
{
  "error": "book_context_required",
  "message": "multiple books are bound to this access token"
}
```

### No Books Bound

```json
{
  "error": "forbidden",
  "message": "no books are bound to this access token"
}
```

### Missing Doc Key

```json
{
  "error": "bad_request",
  "message": "docKey is required"
}
```

### Access Denied

```json
{
  "error": "forbidden",
  "message": "book access denied"
}
```

### Auth Server Failure

```json
{
  "error": "auth_unavailable",
  "message": "failed to verify book access"
}
```

### Query Failure

```json
{
  "error": "internal_error",
  "message": "failed to query purchase invoices"
}
```

### Detail Not Found

```json
{
  "error": "not_found",
  "message": "purchase invoice not found"
}
```
