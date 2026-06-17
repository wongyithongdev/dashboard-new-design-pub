# AP Invoice API

Base domain:

```text
https://service.my365biz.com
```

## Overview

This API reads AP Invoice data from the business database after verifying that
the caller is allowed to read the target Book.

Public routes:

- `GET /biz/ap-invoice`
- `GET /biz/ap-invoices`
- `GET /biz/ap-invoice/detail`

## Authentication

AP invoice routes require:

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

## Public List API

### Request

```http
GET /biz/ap-invoice?limit=50&offset=0
GET /biz/ap-invoices?limit=50&offset=0
```

Query parameters:

- `limit` optional, default `50`, max `200`
- `offset` optional, default `0`
- `search` optional
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
      "docKey": "3136201",
      "invoiceNo": "PI-2606-0023",
      "creditor": "PHT HARDWARE (BUKIT MERTAJAM) SDN BHD",
      "creditorType": "Retail & Supermarket",
      "date": "2026-06-08",
      "status": "unpaid",
      "amount": 585.63,
      "canPay": true
    }
  ]
}
```

### Item Fields

- `docKey`: AP invoice document key
- `invoiceNo`: AP invoice document number from `APInvoice.DocNo`
- `creditor`: supplier name from `Creditor.CompanyName`, falls back to `APInvoice.Description`
- `creditorType`: AI-classified creditor type from `sync_meta.creditor_ai_jobs`
- `date`: AP invoice document date
- `status`: payment status derived from AP invoice state
- `amount`: net total from `APInvoice.NetTotal`
- `canPay`: whether the invoice is currently payable

`status=attention first` sorts in this order:

1. `overdue`
2. `partial`
3. `unpaid`
4. `paid`
5. `cancelled`

## Public Detail API

### Request

```http
GET /biz/ap-invoice/detail?docKey=3136201
```

Query parameters:

- `docKey` required

### Success Response

```json
{
  "success": true,
  "bookId": "book_xxx",
  "docKey": "3136201",
  "header": {
    "docKey": "3136201",
    "invoiceNo": "PI-2606-0023",
    "supplierInvoiceNo": "P26060457",
    "creditorCode": "400-P007",
    "companyName": "PHT HARDWARE (BUKIT MERTAJAM) SDN BHD",
    "description": "PURCHASE INVOICE",
    "creditorType": "Retail & Supermarket",
    "currency": "MYR",
    "currencyRate": 1,
    "date": "2026-06-08",
    "netTotal": 585.63,
    "outstanding": 585.63,
    "outstandingAmount": 585.63,
    "canCreateAPPayment": true
  },
  "details": [
    {
      "seq": 1,
      "dtlKey": "3136202",
      "accNo": "610-0000",
      "description": "6153-2ton ROCKEY HAND PULLER 手拉布力 (12 set)",
      "projNo": "",
      "deptNo": "",
      "taxCode": "",
      "amount": 191.7,
      "netAmount": 191.7,
      "localNetAmount": 191.7,
      "tax": 0,
      "localTax": 0
    }
  ]
}
```

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
  "message": "failed to query ap invoices"
}
```

### Detail Not Found

```json
{
  "error": "not_found",
  "message": "ap invoice not found"
}
```
