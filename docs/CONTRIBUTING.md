# Contributing

Thank you for considering contributing to the Personal Finance Dashboard! This guide will help you get started.

## Table of Contents

- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [How to Add a Feature](#how-to-add-a-feature)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Commit Convention](#commit-convention)

---

## Development Setup

### Prerequisites

- **Java 17** (JDK, not JRE)
- **Node.js 20+** and npm
- **Docker Desktop** (for PostgreSQL)
- **Maven 3.9+** (or use the bundled `mvnw`)
- **Git**

### 1. Clone and Setup

```bash
git clone https://github.com/YOUR_USERNAME/Personal_Finance_Dashbord.git
cd Personal_Finance_Dashbord
```

### 2. Start the Database

```bash
docker compose up postgres -d
```

This starts PostgreSQL 15 on port 5433 (mapped from container's 5432).

### 3. Run the Backend

```bash
cd backend
export JAVA_HOME="/path/to/jdk-17"
mvn spring-boot:run
```

The backend starts at http://localhost:8080. On first run with `ddl-auto: create`, Hibernate creates all tables. The `DemoDataSeeder` populates sample data if `app.demo-data.enabled=true`.

### 4. Run the Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

The frontend starts at http://localhost:5173. Vite proxies `/api` requests to the backend at `:8080`.

### 5. Verify Everything Works

- Open http://localhost:5173
- Login with `demo@financeapp.com` / `demo123`
- Dashboard should show charts and data

---

## Code Style

### Backend (Java)

- **Java 17** features: records, text blocks, switch expressions where appropriate
- **Lombok**: Use `@Builder`, `@Data`, `@RequiredArgsConstructor`, `@Slf4j`
- **Naming**: camelCase for fields/methods, PascalCase for classes, UPPER_SNAKE for constants
- **Package structure**: Follow existing layered pattern (controller → service → repository)
- **DTOs**: Always use request/response DTOs. Never expose entities directly.
- **Validation**: Use `@Valid` + Jakarta validation annotations on request DTOs
- **Error handling**: Throw `ResourceNotFoundException` or `DuplicateResourceException`. The `GlobalExceptionHandler` converts them to proper HTTP responses.
- **Logging**: Use `@Slf4j` and log at appropriate levels (INFO for business events, DEBUG for details)

### Frontend (React/JavaScript)

- **Plain JavaScript** with `.jsx` extensions (no TypeScript)
- **Functional components** with hooks — no class components
- **Tailwind CSS** for styling — no separate CSS files per component
- **File naming**: PascalCase for components (`TransactionList.jsx`), camelCase for hooks and utils (`useAuth.js`, `formatCurrency.js`)
- **State management**: React Context for global state, local `useState` for page data
- **API calls**: Always through the `api/` layer, never raw `axios` in components
- **Toast notifications**: Use `react-hot-toast` for all user feedback

---

## How to Add a Feature

### Adding a Backend Endpoint

1. **Entity** (if new table): Create in `entity/` with `@Entity`, `@Builder`, Lombok annotations
2. **Repository**: Create interface in `repository/` extending `JpaRepository`
3. **DTOs**: Create request/response classes in `dto/request/` and `dto/response/`
4. **Service**: Create in `service/` with `@Service`, `@Transactional`, inject repositories
5. **Controller**: Create in `controller/` with `@RestController`, `@RequestMapping`, inject service
6. **Security**: If endpoint should be public, add to `PUBLIC_URLS` in `SecurityConfig`
7. **Tests**: Add unit tests in `src/test/java/` using `@ExtendWith(MockitoExtension.class)`

Example structure for a new "Goals" feature:

```
entity/Goal.java
repository/GoalRepository.java
dto/request/GoalRequest.java
dto/response/GoalResponse.java
service/GoalService.java
controller/GoalController.java
```

### Adding a Frontend Page

1. **API**: Add functions in `api/` (e.g., `goalApi.js`)
2. **Hook**: Create `hooks/useGoals.js` for data fetching
3. **Components**: Create `components/goals/` folder with sub-components
4. **Page**: Create `pages/GoalsPage.jsx`
5. **Route**: Add to `App.jsx` inside the protected route group
6. **Nav**: Add nav item to `NAV_ITEMS` in `AppLayout.jsx`

### Adding a Chart

1. Use **Recharts** library (already installed)
2. Create component in `components/analytics/` or `components/dashboard/`
3. Follow existing pattern: accept `data` and `loading` props
4. Include a skeleton loading state
5. Include an empty state message
6. Use colors from `utils/chartColors.js`

---

## Testing

### Backend Tests

```bash
cd backend
mvn test
```

We use **JUnit 5** + **Mockito** with `@ExtendWith(MockitoExtension.class)`.

**Test structure:**
- `@Mock` for dependencies
- `@InjectMocks` for the class under test
- `@BeforeEach` to set up test data
- Use `assertThat` (AssertJ) for assertions
- Use `verify()` to check interactions

**What to test:**
- Service methods: business logic, edge cases, error paths
- Controller methods: HTTP status codes, request validation
- Do NOT test: repositories (Spring Data handles that), simple getters/setters

**Test naming convention:** `shouldDoSomethingWhenCondition`

Example:
```java
@Test
@DisplayName("Should throw when accessing other user's transaction")
void shouldThrowWhenAccessingOtherUsersTransaction() {
    when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherUser));
    when(transactionRepository.findByIdAndUserId(1L, 2L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> transactionService.getTransaction("other@test.com", 1L))
            .isInstanceOf(ResourceNotFoundException.class);
}
```

### Docker Integration Tests

```bash
bash scripts/test-docker.sh
```

This builds all containers, waits for health, then runs 15 curl-based API tests. All tests must pass before merging.

---

## Pull Request Process

### Branch Naming

```
feature/add-goals-module
fix/transaction-filter-bug
docs/update-api-documentation
refactor/extract-currency-service
```

### Steps

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes** following the code style guide above.

3. **Write tests** for any new backend logic.

4. **Run tests locally**:
   ```bash
   cd backend && mvn test
   cd frontend && npm run build
   ```

5. **Commit** using conventional commits (see below).

6. **Push** and create a Pull Request:
   ```bash
   git push origin feature/your-feature
   ```

7. **PR description** should include:
   - What changed and why
   - Screenshots (for UI changes)
   - Any migration steps needed

8. **CI must pass** — GitHub Actions runs backend tests, frontend build, and Docker build.

9. **Review** — address any feedback, then merge.

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description
```

### Types

| Type       | Description                          |
|------------|--------------------------------------|
| `feat`     | New feature                          |
| `fix`      | Bug fix                              |
| `docs`     | Documentation only                   |
| `style`    | Formatting, no code change           |
| `refactor` | Code restructuring, no feature change|
| `test`     | Adding or updating tests             |
| `ci`       | CI/CD configuration                  |
| `chore`    | Build process, dependencies          |

### Examples

```
feat(frontend): add transaction create/edit modal
fix(backend): fix duplicate category query
docs: update API documentation
test: add BudgetService unit tests
ci: add Docker build to GitHub Actions
refactor(backend): extract currency conversion to service
```

---

## Questions?

If you have questions about the codebase or need help with your contribution, open an issue on GitHub and we'll help you get started.
