<p align="center">
  <img src="docs/screenshots/logo.png" alt="FinTrack Logo" width="80" />
</p>

<h1 align="center">Personal Finance Dashboard</h1>

<p align="center">
  A full-stack personal finance management application built with Java Spring Boot and React.
  <br />
  Track expenses, manage budgets, visualize spending — all in one place.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk&logoColor=white" alt="Java 17" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.2-green?style=flat-square&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="MIT License" />
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-api-documentation">API Docs</a> •
  <a href="#-screenshots">Screenshots</a>
</p>

---

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="Dashboard Screenshot" width="900" />
</p>

## 🚀 Quick Start

Get the entire application running in **one command** with Docker:

```bash
git clone https://github.com/YOUR_USERNAME/Personal_Finance_Dashbord.git
cd Personal_Finance_Dashbord
docker compose up --build
```

Then open:

| Service   | URL                                  |
|-----------|--------------------------------------|
| Frontend  | http://localhost:3000                 |
| Backend   | http://localhost:8080                 |
| Swagger   | http://localhost:8080/swagger-ui.html |

**Demo Account:**
- Email: `demo@financeapp.com`
- Password: `demo123`

The demo account comes pre-loaded with 60+ realistic transactions, multiple accounts, and budget data.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login/register with access & refresh tokens, role-based access (User/Admin)
- 💳 **Multi-Account Management** — Checking, savings, cash, credit card accounts with multi-currency support (EUR, USD, GBP, CHF, PLN)
- 💸 **Transaction Tracking** — Full CRUD with filtering by date range, category, type, search, and pagination
- 📊 **Interactive Dashboard** — Summary cards, income vs expense bar charts, category donut chart, budget alerts, recent transactions
- 📈 **Advanced Analytics** — Monthly trends with net savings line, daily spending area chart, top categories ranking, month-over-month comparison
- 💰 **Budget Management** — Set monthly spending limits per category with visual progress bars (green/yellow/red), month selector navigation
- 📁 **CSV Import** — 3-step drag & drop flow: upload → preview with validation (valid/error/duplicate rows) → import results
- 👤 **User Profile** — Edit name, preferred currency, change password, danger zone with account deletion
- 🐳 **Docker Ready** — Multi-stage builds, docker-compose with PostgreSQL + Spring Boot + Nginx, one-command deployment
- ✅ **27 Unit Tests** — JUnit 5 + Mockito covering auth, transactions, budgets, analytics, CSV import, and controller layer

---

## 🛠 Tech Stack

| Layer        | Technology                                                    |
|-------------|---------------------------------------------------------------|
| **Backend**  | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA   |
| **Auth**     | JWT (jjwt), BCrypt password hashing, refresh token rotation   |
| **Database** | PostgreSQL 15, Flyway migrations, HikariCP connection pool    |
| **Frontend** | React 18, React Router 6, Tailwind CSS 3, Recharts           |
| **API Docs** | SpringDoc OpenAPI 3 (Swagger UI)                              |
| **Build**    | Maven 3.9, Vite 5, npm                                       |
| **DevOps**   | Docker, docker-compose, GitHub Actions CI, Nginx              |
| **Testing**  | JUnit 5, Mockito, H2 (test profile)                          |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│              React 18 + Tailwind + Recharts                  │
│                    (Nginx :80)                               │
└─────────────────┬───────────────────────────────────────────┘
                  │  /api/* proxy
┌─────────────────▼───────────────────────────────────────────┐
│                        BACKEND                               │
│             Spring Boot 3.2 (Tomcat :8080)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   Auth   │ │  Accounts│ │   Txns   │ │ Analytics│       │
│  │ (JWT)    │ │  CRUD    │ │ CRUD+CSV │ │ Charts   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Budgets  │ │Categories│ │ Currency │ │  Admin   │       │
│  │ Status   │ │ Defaults │ │ Convert  │ │ Stats    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────┬───────────────────────────────────────────┘
                  │  JDBC
┌─────────────────▼───────────────────────────────────────────┐
│                      DATABASE                                │
│              PostgreSQL 15 (:5432)                            │
│     users, accounts, transactions, categories,               │
│     budgets, currency_rates                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Development Setup

### Prerequisites

- Java 17 (JDK)
- Node.js 20+
- Docker & Docker Compose
- Maven 3.9+ (or use `./mvnw`)

### 1. Start the Database

```bash
docker compose up postgres -d
```

### 2. Run the Backend

```bash
cd backend
export JAVA_HOME="/path/to/jdk-17"
mvn spring-boot:run
```

Backend starts at http://localhost:8080

### 3. Run the Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Frontend starts at http://localhost:5173 (Vite dev server proxies `/api` to `:8080`)

---

## 📖 API Documentation

Interactive Swagger UI available at: **http://localhost:8080/swagger-ui.html**

### Key Endpoints

| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | `/api/auth/register`              | Register new user        |
| POST   | `/api/auth/login`                 | Login, get JWT tokens    |
| POST   | `/api/auth/refresh`               | Refresh access token     |
| GET    | `/api/auth/me`                    | Current user profile     |
| CRUD   | `/api/accounts`                   | Account management       |
| CRUD   | `/api/transactions`               | Transaction management   |
| GET    | `/api/transactions?type=EXPENSE`  | Filter transactions      |
| POST   | `/api/transactions/import/preview`| CSV import preview       |
| POST   | `/api/transactions/import/confirm`| CSV import execute       |
| CRUD   | `/api/budgets`                    | Budget management        |
| GET    | `/api/budgets/status`             | Budget vs actual         |
| GET    | `/api/analytics/monthly-summary`  | Income/expense by month  |
| GET    | `/api/analytics/category-breakdown`| Spending by category    |
| GET    | `/api/analytics/daily-spending`   | Daily expense totals     |
| GET    | `/api/analytics/top-categories`   | Top spending categories  |
| GET    | `/api/analytics/comparison`       | Month vs month compare   |
| GET    | `/api/admin/stats`                | Platform statistics      |
| GET    | `/api/admin/users`                | All users (admin only)   |

All endpoints except auth require a `Bearer` token in the `Authorization` header.

---

## 📁 Project Structure

```
Personal_Finance_Dashbord/
├── backend/
│   ├── src/main/java/com/financeapp/
│   │   ├── config/          # Security, JWT, CORS, Swagger, DemoSeeder
│   │   ├── controller/      # REST controllers (8 modules)
│   │   ├── dto/             # Request/response DTOs
│   │   ├── entity/          # JPA entities
│   │   ├── enums/           # Role, Currency, AccountType, etc.
│   │   ├── exception/       # Global error handling
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── service/         # Business logic layer
│   │   └── specification/   # Dynamic query filters
│   ├── src/main/resources/
│   │   ├── application.yml           # Main config
│   │   ├── application-docker.yml    # Docker profile
│   │   └── db/migration/            # Flyway SQL scripts (V1-V8)
│   ├── src/test/                    # 27 unit tests
│   ├── Dockerfile                   # Multi-stage build
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API layer with JWT interceptor
│   │   ├── components/      # Reusable UI components
│   │   │   ├── shared/      # Modal, Button, Input, Pagination, etc.
│   │   │   ├── dashboard/   # Summary cards, charts
│   │   │   ├── transactions/# Filters, list, form modal
│   │   │   ├── accounts/    # Card, form modal
│   │   │   ├── budgets/     # Month selector, card, form
│   │   │   ├── analytics/   # 5 chart components
│   │   │   └── import/      # CSV uploader
│   │   ├── context/         # AuthContext (global auth state)
│   │   ├── hooks/           # useAuth, useTransactions, useBudgets, etc.
│   │   ├── pages/           # 10 page components
│   │   ├── utils/           # formatCurrency, formatDate, chartColors
│   │   └── styles/          # Tailwind globals
│   ├── Dockerfile           # Multi-stage build (Node → Nginx)
│   ├── nginx.conf           # SPA routing + API proxy
│   └── package.json
├── docker-compose.yml       # PostgreSQL + Backend + Frontend
├── scripts/
│   └── test-docker.sh       # Automated integration tests (15 checks)
├── .github/workflows/
│   └── ci.yml               # GitHub Actions CI pipeline
└── README.md
```

---

## 🧪 Testing

### Backend Unit Tests (27 tests)

```bash
cd backend
mvn test
```

| Test Class              | Tests | Coverage                                    |
|------------------------|-------|---------------------------------------------|
| AuthServiceTest        | 4     | Register, login, duplicate email, bad password |
| TransactionServiceTest | 8     | CRUD, filters, pagination, access control   |
| BudgetServiceTest      | 4     | Create, update, status calc, over-budget    |
| AnalyticsServiceTest   | 3     | Monthly summary, breakdown, top categories  |
| CsvImportServiceTest   | 4     | Parse, duplicates, errors, valid-only       |
| AuthControllerTest     | 4     | 201 register, 400 invalid, 200 login, 401  |

### Docker Integration Tests (15 checks)

```bash
bash scripts/test-docker.sh
```

Builds all containers, waits for health, then runs curl-based API tests covering registration, login, CRUD operations, analytics, and frontend proxy.

---

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Login Page
<img src="docs/screenshots/login.png" alt="Login" width="800" />

### Dashboard
<img src="docs/screenshots/dashboard.png" alt="Dashboard" width="800" />

### Transactions
<img src="docs/screenshots/transactions.png" alt="Transactions" width="800" />

### Analytics
<img src="docs/screenshots/analytics.png" alt="Analytics" width="800" />

### Budgets
<img src="docs/screenshots/budgets.png" alt="Budgets" width="800" />

### Accounts
<img src="docs/screenshots/accounts.png" alt="Accounts" width="800" />

### CSV Import
<img src="docs/screenshots/import.png" alt="Import" width="800" />

### Profile
<img src="docs/screenshots/profile.png" alt="Profile" width="800" />

</details>

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ☕ Java + ⚛️ React by <a href="https://github.com/YOUR_USERNAME">Md Maruf Hossain</a>
</p>
