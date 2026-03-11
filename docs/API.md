# API Documentation

> Full interactive docs available at: **http://localhost:8080/swagger-ui.html**

Base URL: `http://localhost:8080`

All endpoints (except Auth) require a JWT token:
```
Authorization: Bearer <access_token>
```

---

## Table of Contents

- [Authentication](#authentication)
- [Accounts](#accounts)
- [Transactions](#transactions)
- [Categories](#categories)
- [Budgets](#budgets)
- [Analytics](#analytics)
- [CSV Import](#csv-import)
- [Admin](#admin)
- [Error Responses](#error-responses)

---

## Authentication

### Register

```
POST /api/auth/register
```

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": {
    "id": 1,
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ROLE_USER",
    "preferredCurrency": "EUR",
    "createdAt": "2026-03-10T12:00:00"
  }
}
```

### Login

```
POST /api/auth/login
```

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):** Same format as Register.

### Refresh Token

```
POST /api/auth/refresh
```

**Request:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response (200):** Same format as Register (new token pair).

### Get Current User

```
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ROLE_USER",
  "preferredCurrency": "EUR",
  "createdAt": "2026-03-10T12:00:00"
}
```

### Update Profile

```
PUT /api/auth/me
Authorization: Bearer <token>
```

**Request:**
```json
{
  "firstName": "Jonathan",
  "lastName": "Doe",
  "preferredCurrency": "USD"
}
```

**Response (200):** Updated user object.

---

## Accounts

### List Accounts

```
GET /api/accounts
GET /api/accounts?includeArchived=true
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Main Checking",
    "type": "CHECKING",
    "currency": "EUR",
    "balance": 3245.50,
    "isArchived": false,
    "createdAt": "2026-03-10T12:00:00"
  }
]
```

### Create Account

```
POST /api/accounts
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Savings Account",
  "type": "SAVINGS",
  "currency": "EUR"
}
```

**Response (201):** Account object with `balance: 0`.

Account types: `CHECKING`, `SAVINGS`, `CASH`, `CREDIT_CARD`

Currencies: `EUR`, `USD`, `GBP`, `CHF`, `PLN`

### Update Account

```
PUT /api/accounts/{id}
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Updated Name",
  "type": "SAVINGS",
  "currency": "EUR"
}
```

### Archive Account

```
DELETE /api/accounts/{id}
Authorization: Bearer <token>
```

**Response (204):** No content. Soft-deletes the account (sets `isArchived = true`).

---

## Transactions

### List Transactions (Paginated + Filtered)

```
GET /api/transactions?page=0&size=20&sort=transactionDate,desc
GET /api/transactions?type=EXPENSE&categoryId=1&startDate=2026-03-01&endDate=2026-03-31
GET /api/transactions?search=Lidl&accountId=1
Authorization: Bearer <token>
```

**Query Parameters:**

| Param       | Type    | Description                    |
|-------------|---------|--------------------------------|
| page        | int     | Page number (0-based)          |
| size        | int     | Items per page (default 20)    |
| sort        | string  | e.g. `transactionDate,desc`    |
| type        | string  | `INCOME` or `EXPENSE`          |
| categoryId  | long    | Filter by category             |
| accountId   | long    | Filter by account              |
| startDate   | string  | `yyyy-MM-dd` format            |
| endDate     | string  | `yyyy-MM-dd` format            |
| search      | string  | Search in description          |

**Response (200):**
```json
{
  "content": [
    {
      "id": 1,
      "amount": 45.50,
      "convertedAmount": 45.50,
      "currency": "EUR",
      "type": "EXPENSE",
      "description": "Lidl Grocery",
      "transactionDate": "2026-03-04",
      "accountId": 1,
      "accountName": "Main Checking",
      "categoryId": 1,
      "categoryName": "Food",
      "categoryIcon": "utensils",
      "createdAt": "2026-03-04T14:30:00"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 65,
  "totalPages": 4,
  "first": true,
  "last": false
}
```

### Create Transaction

```
POST /api/transactions
Authorization: Bearer <token>
```

**Request:**
```json
{
  "amount": 45.50,
  "type": "EXPENSE",
  "description": "Lidl Grocery",
  "transactionDate": "2026-03-04",
  "accountId": 1,
  "categoryId": 1
}
```

**Response (201):** Transaction object. Amount is automatically converted to EUR if the account currency differs.

### Update Transaction

```
PUT /api/transactions/{id}
Authorization: Bearer <token>
```

**Request:** Same format as Create.

### Delete Transaction

```
DELETE /api/transactions/{id}
Authorization: Bearer <token>
```

**Response (204):** No content.

---

## Categories

### List Categories

```
GET /api/categories
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Food",
    "icon": "FOOD",
    "isDefault": true,
    "createdAt": "2026-03-01T00:00:00"
  }
]
```

Returns 12 default categories plus any user-created custom categories.

### Create Custom Category

```
POST /api/categories
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Side Hustle",
  "icon": "OTHER"
}
```

Icons: `FOOD`, `TRANSPORT`, `HOUSING`, `SALARY`, `ENTERTAINMENT`, `HEALTH`, `SHOPPING`, `UTILITIES`, `EDUCATION`, `TRAVEL`, `GIFT`, `OTHER`

### Update / Delete Category

```
PUT /api/categories/{id}
DELETE /api/categories/{id}
Authorization: Bearer <token>
```

Note: Default categories cannot be edited or deleted.

---

## Budgets

### List Budgets for a Month

```
GET /api/budgets?yearMonth=2026-03
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "categoryId": 1,
    "categoryName": "Food",
    "categoryIcon": "utensils",
    "amountLimit": 400.00,
    "yearMonth": "2026-03",
    "createdAt": "2026-03-01T10:00:00"
  }
]
```

### Create or Update Budget

```
POST /api/budgets
Authorization: Bearer <token>
```

**Request:**
```json
{
  "categoryId": 1,
  "amountLimit": 400.00,
  "yearMonth": "2026-03"
}
```

**Response (201):** Budget object. If a budget already exists for the same user + category + month, it updates the limit instead of creating a duplicate.

### Get Budget Status

```
GET /api/budgets/status?yearMonth=2026-03
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "budgetId": 1,
    "categoryId": 1,
    "categoryName": "Food",
    "categoryIcon": "utensils",
    "amountLimit": 400.00,
    "amountSpent": 285.50,
    "amountRemaining": 114.50,
    "percentage": 71.4,
    "overBudget": false,
    "yearMonth": "2026-03"
  }
]
```

### Delete Budget

```
DELETE /api/budgets/{id}
Authorization: Bearer <token>
```

**Response (204):** No content. Does not delete transactions.

---

## Analytics

### Monthly Summary

```
GET /api/analytics/monthly-summary?months=6
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "month": "2026-01",
    "income": 3500.00,
    "expenses": 1850.00,
    "net": 1650.00
  }
]
```

### Category Breakdown

```
GET /api/analytics/category-breakdown?yearMonth=2026-03
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "categoryId": 1,
    "categoryName": "Food",
    "categoryIcon": "utensils",
    "amount": 350.00,
    "percentage": 35.0,
    "color": "#4F46E5"
  }
]
```

### Daily Spending

```
GET /api/analytics/daily-spending?yearMonth=2026-03
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  { "date": "2026-03-01", "amount": 125.50 },
  { "date": "2026-03-02", "amount": 45.30 }
]
```

### Top Categories

```
GET /api/analytics/top-categories?yearMonth=2026-03&limit=5
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "categoryId": 3,
    "categoryName": "Housing",
    "categoryIcon": "home",
    "amount": 950.00,
    "transactionCount": 1
  }
]
```

### Month Comparison

```
GET /api/analytics/comparison?month1=2026-02&month2=2026-03
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "month1": { "month": "2026-02", "income": 3500.00, "expenses": 1800.00, "net": 1700.00 },
  "month2": { "month": "2026-03", "income": 4200.00, "expenses": 2100.00, "net": 2100.00 },
  "incomeChange": 700.00,
  "expenseChange": 300.00,
  "netChange": 400.00,
  "incomeChangePercent": 20.0,
  "expenseChangePercent": 16.7
}
```

---

## CSV Import

### Preview CSV

```
POST /api/transactions/import/preview
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:** `file` = CSV file

**CSV Format:**
```
date,description,amount,type,category
2026-03-01,Monthly Salary,3500.00,INCOME,Salary
2026-03-02,REWE Supermarket,-45.30,EXPENSE,Food
```

Supported date formats: `yyyy-MM-dd`, `dd/MM/yyyy`, `MM/dd/yyyy`, `dd.MM.yyyy`

**Response (200):**
```json
{
  "rows": [
    {
      "rowNumber": 1,
      "date": "2026-03-01",
      "description": "Monthly Salary",
      "amount": "3500.00",
      "type": "INCOME",
      "category": "Salary",
      "valid": true,
      "duplicate": false,
      "errorMessage": null
    }
  ],
  "totalRows": 10,
  "validRows": 9,
  "errorRows": 1,
  "duplicateRows": 0
}
```

### Import CSV

```
POST /api/transactions/import/confirm?accountId=1
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:** `file` = same CSV file

**Response (200):**
```json
{
  "importedCount": 9,
  "skippedCount": 0,
  "errorCount": 1,
  "errors": ["Row 5: Invalid date format"]
}
```

---

## Admin

Requires `ROLE_ADMIN`. Set via database: `UPDATE users SET role='ROLE_ADMIN' WHERE email='admin@example.com';`

### Platform Stats

```
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "totalUsers": 15,
  "totalTransactions": 1250,
  "totalAccounts": 28,
  "totalBudgets": 42,
  "totalIncomeAllUsers": 52500.00,
  "totalExpensesAllUsers": 38200.00
}
```

### List All Users

```
GET /api/admin/users
Authorization: Bearer <admin_token>
```

**Response (200):** Array of user objects.

---

## Error Responses

All errors follow a consistent format:

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Transaction not found with id: '99'",
  "path": "/api/transactions/99",
  "timestamp": "2026-03-10T12:30:00"
}
```

### Validation Errors (400)

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/auth/register",
  "timestamp": "2026-03-10T12:30:00",
  "validationErrors": {
    "email": "must not be blank",
    "password": "size must be between 8 and 100"
  }
}
```

### Common Status Codes

| Code | Description                          |
|------|--------------------------------------|
| 200  | Success                              |
| 201  | Created                              |
| 204  | No Content (successful delete)       |
| 400  | Bad Request (validation failed)      |
| 401  | Unauthorized (invalid/missing token) |
| 403  | Forbidden (insufficient role)        |
| 404  | Not Found                            |
| 409  | Conflict (duplicate resource)        |
| 500  | Internal Server Error                |
