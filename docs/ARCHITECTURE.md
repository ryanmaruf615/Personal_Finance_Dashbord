# Architecture

## System Overview

The Personal Finance Dashboard is a full-stack monolithic application following a layered architecture pattern. The system consists of three main components running as Docker containers behind a bridge network.

```
┌──────────────┐     ┌──────────────────────────┐     ┌──────────────┐
│   Browser    │────▶│   Nginx (Frontend :80)   │     │  PostgreSQL  │
│              │◀────│   React SPA + /api proxy │     │    (:5432)   │
└──────────────┘     └──────────┬───────────────┘     └──────▲───────┘
                                │ /api/*                      │ JDBC
                     ┌──────────▼───────────────┐             │
                     │  Spring Boot (Backend)   │─────────────┘
                     │       (:8080)            │
                     │  JWT Auth + REST API     │
                     └──────────────────────────┘
```

## Backend Architecture

### Layered Package Structure

The backend follows the standard Spring Boot layered architecture:

```
com.financeapp/
├── config/              → Configuration & cross-cutting concerns
│   ├── SecurityConfig       JWT filter chain, CORS, public URLs
│   ├── JwtService           Token generation, validation, extraction
│   ├── JwtAuthFilter        OncePerRequestFilter, attaches user to context
│   ├── ApplicationConfig    UserDetailsService bean
│   ├── SwaggerConfig        OpenAPI bearer auth scheme
│   ├── CorsConfig           WebMvcConfigurer CORS mappings
│   └── DemoDataSeeder       CommandLineRunner, seeds sample data
│
├── controller/          → REST API layer (thin, delegates to services)
│   ├── AuthController       POST register/login/refresh, GET/PUT me
│   ├── AccountController    CRUD /api/accounts
│   ├── TransactionController CRUD + filters + CSV import
│   ├── CategoryController   CRUD /api/categories
│   ├── BudgetController     CRUD + status /api/budgets
│   ├── AnalyticsController  5 chart data endpoints
│   └── AdminController      @PreAuthorize("hasRole('ADMIN')")
│
├── service/             → Business logic layer
│   ├── AuthService          Register, login, refresh, profile update
│   ├── AccountService       CRUD + soft delete + balance calculation
│   ├── TransactionService   CRUD + dynamic Specification filtering
│   ├── CategoryService      CRUD + default category protection
│   ├── BudgetService        Upsert + status calculation (spent vs limit)
│   ├── AnalyticsService     5 analytics queries with data transformation
│   ├── CsvImportService     Parse, validate, detect duplicates, import
│   ├── CurrencyService      EUR conversion using DB rates
│   └── AdminService         Platform-wide statistics
│
├── repository/          → Spring Data JPA (interfaces only)
│   ├── UserRepository       findByEmail, existsByEmail
│   ├── AccountRepository    findByIdAndUserId, user-scoped queries
│   ├── TransactionRepository JpaSpecificationExecutor + 5 native SQL
│   ├── CategoryRepository   findAllAvailableForUser (defaults + owned)
│   ├── BudgetRepository     findByUserIdAndYearMonth
│   └── CurrencyRateRepository latest rate lookup
│
├── entity/              → JPA entities (Lombok @Builder)
│   ├── User                 id, email, password, role, preferredCurrency
│   ├── Account              id, name, type, currency, isArchived, user
│   ├── Transaction          id, amount, convertedAmount, currency, type
│   ├── Category             id, name, icon, isDefault, user (nullable)
│   ├── Budget               id, amountLimit, yearMonth, user, category
│   └── CurrencyRate         id, fromCurrency, toCurrency, rate, date
│
├── dto/                 → Data Transfer Objects
│   ├── request/             RegisterRequest, LoginRequest, etc. (7 DTOs)
│   └── response/            AuthResponse, PageResponse<T>, etc. (15 DTOs)
│
├── enums/               → Type-safe enumerations
│   ├── Role                 ROLE_USER, ROLE_ADMIN
│   ├── Currency             EUR, USD, GBP, CHF, PLN
│   ├── AccountType          CHECKING, SAVINGS, CASH, CREDIT_CARD
│   ├── TransactionType      INCOME, EXPENSE
│   └── CategoryIcon         FOOD, TRANSPORT, HOUSING, ... (12 values)
│
├── exception/           → Centralized error handling
│   ├── ResourceNotFoundException     → 404
│   ├── DuplicateResourceException    → 409
│   └── GlobalExceptionHandler        @RestControllerAdvice
│
└── specification/       → Dynamic query construction
    └── TransactionSpecification  Static Specification<Transaction> builders
```

### Request Flow

```
HTTP Request
    │
    ▼
┌──────────────┐
│  JwtAuthFilter│──▶ Extract token → Validate → Set SecurityContext
└──────┬───────┘
       │ (authenticated)
       ▼
┌──────────────┐
│  Controller  │──▶ @Valid request body, extract auth principal
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Service    │──▶ Business logic, user-scoped data access
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Repository  │──▶ Spring Data JPA → Hibernate → PostgreSQL
└──────────────┘
```

## Database Schema

```
┌─────────────────┐       ┌─────────────────────┐
│     users       │       │     accounts         │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │◀──┐   │ id (PK)             │
│ email (unique)  │   │   │ name                │
│ password (hash) │   │   │ type (enum)         │
│ first_name      │   ├───│ user_id (FK)        │
│ last_name       │   │   │ currency (enum)     │
│ role (enum)     │   │   │ is_archived         │
│ preferred_curr  │   │   │ created_at          │
│ created_at      │   │   └──────────┬──────────┘
└─────────────────┘   │              │
        │             │              │
        │             │   ┌──────────▼──────────┐
        │             │   │   transactions      │
        │             │   ├─────────────────────┤
        │             │   │ id (PK)             │
        │             │   │ amount              │
        │             │   │ converted_amount    │
        │             │   │ currency (enum)     │
        │             │   │ type (enum)         │
        │             │   │ description         │
        │             │   │ transaction_date    │
        │             │   │ account_id (FK) ────┘
        │             │   │ category_id (FK) ──────┐
        │             │   │ created_at          │  │
        │             │   └─────────────────────┘  │
        │             │                             │
┌───────▼─────────┐   │   ┌─────────────────────┐  │
│    budgets      │   │   │   categories        │◀─┘
├─────────────────┤   │   ├─────────────────────┤
│ id (PK)         │   │   │ id (PK)             │
│ amount_limit    │   │   │ name                │
│ year_month      │   │   │ icon (enum)         │
│ user_id (FK) ───┘   │   │ is_default          │
│ category_id (FK)────┘   │ user_id (FK, null)  │
│ created_at      │       │ created_at          │
└─────────────────┘       └─────────────────────┘

┌─────────────────────┐
│   currency_rates    │
├─────────────────────┤
│ id (PK)             │
│ from_currency       │
│ to_currency         │
│ rate                │
│ effective_date      │
└─────────────────────┘
```

### Key Relationships

- **User → Accounts**: One-to-many. Each user can have multiple accounts.
- **Account → Transactions**: One-to-many. Transactions belong to one account.
- **Category → Transactions**: One-to-many. Each transaction has one category.
- **User + Category + YearMonth → Budget**: Unique constraint. One budget per category per month per user.
- **Categories**: Default categories have `user_id = NULL` and are shared. User-created categories are scoped to their creator.

## Security Architecture

### JWT Authentication Flow

```
Registration/Login
       │
       ▼
┌──────────────────┐
│  AuthService     │──▶ BCrypt hash password
│  generate tokens │──▶ Access token (15 min) + Refresh token (7 days)
└──────────────────┘
       │
       ▼
  Client stores tokens in localStorage
       │
       ▼
  Every request: Authorization: Bearer <access_token>
       │
       ▼
┌──────────────────┐
│  JwtAuthFilter   │──▶ Extract → Validate → Load UserDetails
│  (per request)   │──▶ Set SecurityContextHolder
└──────────────────┘
       │
       ▼
  On 401 (expired):
       │
       ▼
┌──────────────────┐
│  Axios Interceptor│──▶ Auto-call /api/auth/refresh
│  (frontend)       │──▶ Retry failed request with new token
└──────────────────┘
```

### Public Endpoints (No Auth Required)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /swagger-ui/**`
- `GET /v3/api-docs/**`
- `GET /actuator/**`

### Role-Based Access

- `ROLE_USER` — All standard endpoints
- `ROLE_ADMIN` — `/api/admin/**` endpoints (platform stats, user list)

### Data Isolation

Every service method receives the authenticated user's email from `Authentication.getName()` and scopes all queries to that user's ID. Users can never access another user's data through the API.

## Frontend Architecture

```
src/
├── api/              → Axios instances with JWT interceptor
│                       Auto-refresh on 401, queue failed requests
├── context/          → React Context for global auth state
│                       Restore session from localStorage on mount
├── hooks/            → Custom hooks for data fetching
│                       useAuth, useTransactions, useBudgets, etc.
├── components/
│   ├── shared/       → Reusable UI: Modal, Button, Input, Pagination
│   ├── dashboard/    → Summary cards, Recharts (bar, pie)
│   ├── transactions/ → Filters, list/table, form modal
│   ├── accounts/     → Cards, form modal
│   ├── budgets/      → Month selector, progress cards, form
│   ├── analytics/    → 5 Recharts components
│   └── import/       → CSV drag-drop uploader
├── pages/            → Route-level components (10 pages)
├── utils/            → formatCurrency, formatDate, chartColors
└── styles/           → Tailwind CSS globals
```

### State Management

- **Auth state**: React Context (`AuthContext`) with `useAuth()` hook
- **Page data**: Local state in page components using custom hooks
- **No Redux needed**: Each page fetches its own data; shared state is minimal (just auth)

### Routing

- React Router 6 with nested layout routes
- `ProtectedRoute` wrapper checks auth state, shows spinner during session restore
- `AppLayout` provides sidebar + header + `<Outlet />` for page content

## Data Flow Example: Creating a Transaction

```
1. User fills TransactionForm, clicks "Add Transaction"
2. TransactionForm calls transactionApi.create(payload)
3. Axios interceptor attaches JWT token
4. Vite proxy forwards /api/* to localhost:8080
5. JwtAuthFilter validates token, sets SecurityContext
6. TransactionController receives @Valid @RequestBody
7. TransactionService:
   a. Looks up user by email
   b. Validates account ownership (user_id match)
   c. Validates category access (default or user-owned)
   d. Gets account currency, calls CurrencyService.convertToEur()
   e. Builds Transaction entity, saves via repository
8. Response: TransactionResponse DTO (201 Created)
9. Frontend: toast.success(), refresh transaction list
```
