package com.financeapp.config;

import com.financeapp.entity.*;
import com.financeapp.enums.*;
import com.financeapp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final CurrencyRateRepository currencyRateRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo-data.enabled:false}")
    private boolean demoDataEnabled;

    private static final String DEMO_EMAIL = "demo@financeapp.com";
    private static final Random RANDOM = new Random(42);

    @Override
    @Transactional
    public void run(String... args) {
        if (!demoDataEnabled) {
            log.info("Demo data seeder is disabled. Set app.demo-data.enabled=true to enable.");
            return;
        }

        if (userRepository.existsByEmail(DEMO_EMAIL)) {
            log.info("Demo user already exists. Skipping seed.");
            return;
        }

        log.info("=== Seeding demo data ===");

        seedCurrencyRates();
        seedCategories();
        User user = seedUser();
        Account checking = seedAccount(user, "Main Checking", AccountType.CHECKING);
        Account savings = seedAccount(user, "Savings", AccountType.SAVINGS);
        Map<String, Category> cats = getCategoryMap();
        seedTransactions(user, checking, savings, cats);
        seedBudgets(user, cats);

        log.info("=== Demo data seeded successfully ===");
        log.info("Login: {} / demo123", DEMO_EMAIL);
    }

    private void seedCurrencyRates() {
        if (currencyRateRepository.count() > 0) return;
        log.info("Seeding currency rates...");

        LocalDate effectiveDate = LocalDate.of(2026, 1, 1);
        String[][] rates = {
            {"EUR", "USD", "1.080000"}, {"EUR", "GBP", "0.860000"},
            {"EUR", "CHF", "0.950000"}, {"EUR", "PLN", "4.320000"},
            {"USD", "EUR", "0.925926"}, {"GBP", "EUR", "1.162791"},
            {"CHF", "EUR", "1.052632"}, {"PLN", "EUR", "0.231481"},
        };
        for (String[] r : rates) {
            CurrencyRate rate = CurrencyRate.builder()
                    .fromCurrency(Currency.valueOf(r[0]))
                    .toCurrency(Currency.valueOf(r[1]))
                    .rate(new BigDecimal(r[2]))
                    .effectiveDate(effectiveDate)
                    .build();
            currencyRateRepository.save(rate);
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) return;
        log.info("Seeding default categories...");

        CategoryIcon[] icons = CategoryIcon.values();
        String[] names = {"Food", "Transport", "Housing", "Salary", "Entertainment",
                "Health", "Shopping", "Utilities", "Education", "Travel", "Gifts", "Other"};
        for (int i = 0; i < names.length; i++) {
            Category cat = Category.builder()
                    .name(names[i])
                    .icon(icons[i])
                    .isDefault(true)
                    .build();
            categoryRepository.save(cat);
        }
    }

    private User seedUser() {
        log.info("Creating demo user...");
        User user = User.builder()
                .email(DEMO_EMAIL)
                .password(passwordEncoder.encode("demo123"))
                .firstName("Max")
                .lastName("Mustermann")
                .role(Role.ROLE_USER)
                .preferredCurrency(Currency.EUR)
                .build();
        return userRepository.save(user);
    }

    private Account seedAccount(User user, String name, AccountType type) {
        Account account = Account.builder()
                .name(name)
                .type(type)
                .currency(Currency.EUR)
                .user(user)
                .build();
        return accountRepository.save(account);
    }

    private Map<String, Category> getCategoryMap() {
        List<Category> all = categoryRepository.findAll();
        return Map.ofEntries(
                all.stream()
                        .map(c -> Map.entry(c.getName(), c))
                        .toArray(Map.Entry[]::new)
        );
    }

    private void seedTransactions(User user, Account checking, Account savings, Map<String, Category> cats) {
        log.info("Seeding transactions...");

        YearMonth now = YearMonth.now();

        // ─── 4 months of salary ─────────────────────────────────────
        for (int m = 3; m >= 0; m--) {
            LocalDate salaryDate = now.minusMonths(m).atDay(1);
            addTx(checking, cats.get("Salary"), "Gehalt - TechCorp GmbH", "3850.00", "INCOME", salaryDate);

            // Freelance income every other month
            if (m % 2 == 0) {
                addTx(checking, cats.get("Salary"), "Freelance Web Project", "750.00", "INCOME", salaryDate.plusDays(14));
            }
        }

        // ─── Savings transfers ──────────────────────────────────────
        for (int m = 3; m >= 0; m--) {
            addTx(savings, cats.get("Other"), "Monthly Savings Transfer", "500.00", "INCOME", now.minusMonths(m).atDay(5));
        }

        // ─── Recurring monthly expenses (4 months) ──────────────────
        for (int m = 3; m >= 0; m--) {
            YearMonth month = now.minusMonths(m);

            // Housing
            addTx(checking, cats.get("Housing"), "Miete - Wohnung Frankfurt", "950.00", "EXPENSE", month.atDay(1));
            addTx(checking, cats.get("Utilities"), "Stadtwerke Frankfurt - Strom", "85.00", "EXPENSE", month.atDay(3));
            addTx(checking, cats.get("Utilities"), "Vodafone Internet", "39.99", "EXPENSE", month.atDay(5));

            // Entertainment subscriptions
            addTx(checking, cats.get("Entertainment"), "Netflix Premium", "17.99", "EXPENSE", month.atDay(6));
            addTx(checking, cats.get("Entertainment"), "Spotify Family", "14.99", "EXPENSE", month.atDay(6));

            // Health
            addTx(checking, cats.get("Health"), "TK Krankenkasse", "108.00", "EXPENSE", month.atDay(2));

            // Transport
            addTx(checking, cats.get("Transport"), "Deutschlandticket", "49.00", "EXPENSE", month.atDay(1));
        }

        // ─── Variable grocery shopping (current + last 3 months) ────
        String[][] groceries = {
            {"REWE Berger Straße", "47.83"}, {"Lidl Bockenheim", "32.15"},
            {"ALDI Sachsenhausen", "28.90"}, {"Edeka Nordend", "55.20"},
            {"dm Drogerie", "22.45"}, {"REWE Online Lieferung", "68.30"},
            {"Lidl Bornheim", "19.75"}, {"Metzgerei Schmitt", "15.80"},
            {"Wochenmarkt Konstablerwache", "24.50"}, {"REWE City", "38.60"},
            {"Alnatura Bio", "42.10"}, {"Lidl Ostend", "26.33"},
        };
        for (int m = 3; m >= 0; m--) {
            YearMonth month = now.minusMonths(m);
            int groceryCount = 5 + RANDOM.nextInt(4); // 5-8 grocery trips per month
            for (int i = 0; i < groceryCount; i++) {
                int idx = RANDOM.nextInt(groceries.length);
                int day = 2 + RANDOM.nextInt(26);
                BigDecimal amount = new BigDecimal(groceries[idx][1])
                        .add(BigDecimal.valueOf(RANDOM.nextDouble() * 15 - 5))
                        .max(BigDecimal.valueOf(8.50))
                        .setScale(2, java.math.RoundingMode.HALF_UP);
                addTx(checking, cats.get("Food"), groceries[idx][0], amount.toString(), "EXPENSE", month.atDay(day));
            }
        }

        // ─── Restaurants & Cafés ────────────────────────────────────
        String[][] dining = {
            {"Café Kante - Frühstück", "16.50"}, {"Apfelweinwirtschaft Wagner", "28.00"},
            {"Pizzeria Da Mario", "22.50"}, {"Asia Wok Zeil", "12.80"},
            {"Starbucks Hauptwache", "6.90"}, {"Döner Kebab Berger Str.", "7.50"},
        };
        for (int m = 2; m >= 0; m--) {
            YearMonth month = now.minusMonths(m);
            int dineCount = 3 + RANDOM.nextInt(3);
            for (int i = 0; i < dineCount; i++) {
                int idx = RANDOM.nextInt(dining.length);
                int day = 3 + RANDOM.nextInt(25);
                addTx(checking, cats.get("Food"), dining[idx][0], dining[idx][1], "EXPENSE", month.atDay(day));
            }
        }

        // ─── Transport extras ───────────────────────────────────────
        addTx(checking, cats.get("Transport"), "Deutsche Bahn - Berlin ICE", "89.00", "EXPENSE", now.minusMonths(2).atDay(15));
        addTx(checking, cats.get("Transport"), "ADAC Mitgliedschaft", "59.00", "EXPENSE", now.minusMonths(1).atDay(10));
        addTx(checking, cats.get("Transport"), "Shell Tankstelle", "72.50", "EXPENSE", now.atDay(8));
        addTx(checking, cats.get("Transport"), "Flixbus Frankfurt-München", "24.99", "EXPENSE", now.minusMonths(1).atDay(22));

        // ─── Shopping ───────────────────────────────────────────────
        addTx(checking, cats.get("Shopping"), "Amazon.de - Bücher", "34.99", "EXPENSE", now.minusMonths(2).atDay(12));
        addTx(checking, cats.get("Shopping"), "Zalando - Winterjacke", "129.99", "EXPENSE", now.minusMonths(2).atDay(18));
        addTx(checking, cats.get("Shopping"), "MediaMarkt - USB-C Kabel", "19.99", "EXPENSE", now.minusMonths(1).atDay(7));
        addTx(checking, cats.get("Shopping"), "IKEA Frankfurt", "87.50", "EXPENSE", now.atDay(10));
        addTx(checking, cats.get("Shopping"), "Amazon.de - Kopfhörer", "59.99", "EXPENSE", now.atDay(14));

        // ─── Education ──────────────────────────────────────────────
        addTx(checking, cats.get("Education"), "Udemy - Java Masterclass", "13.99", "EXPENSE", now.minusMonths(3).atDay(20));
        addTx(checking, cats.get("Education"), "O'Reilly Safari Books", "29.00", "EXPENSE", now.minusMonths(1).atDay(1));

        // ─── Entertainment extras ───────────────────────────────────
        addTx(checking, cats.get("Entertainment"), "CineStar Frankfurt", "14.50", "EXPENSE", now.minusMonths(1).atDay(18));
        addTx(checking, cats.get("Entertainment"), "Steam - Cyberpunk DLC", "29.99", "EXPENSE", now.atDay(3));
        addTx(checking, cats.get("Entertainment"), "Commerzbank Arena Tickets", "45.00", "EXPENSE", now.minusMonths(2).atDay(25));

        // ─── Health extras ──────────────────────────────────────────
        addTx(checking, cats.get("Health"), "Apotheke - Medikamente", "24.50", "EXPENSE", now.minusMonths(1).atDay(12));
        addTx(checking, cats.get("Health"), "FitX Gym - Monatsbeitrag", "24.99", "EXPENSE", now.atDay(1));

        // ─── Gifts ──────────────────────────────────────────────────
        addTx(checking, cats.get("Gifts"), "Geburtstag Geschenk - Mama", "50.00", "EXPENSE", now.minusMonths(1).atDay(20));
        addTx(checking, cats.get("Gifts"), "Blumenstrauß Valentinstag", "35.00", "EXPENSE", now.minusMonths(1).atDay(14));

        // ─── Travel ─────────────────────────────────────────────────
        addTx(checking, cats.get("Travel"), "Booking.com - Hotel Berlin", "189.00", "EXPENSE", now.minusMonths(2).atDay(15));
        addTx(checking, cats.get("Travel"), "Ryanair - Frankfurt-Barcelona", "79.00", "EXPENSE", now.atDay(2));

        log.info("Seeded {} transactions", transactionRepository.count());
    }

    private void seedBudgets(User user, Map<String, Category> cats) {
        log.info("Seeding budgets for current month...");

        String currentMonth = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        addBudget(user, cats.get("Food"), "400.00", currentMonth);
        addBudget(user, cats.get("Transport"), "150.00", currentMonth);
        addBudget(user, cats.get("Housing"), "1100.00", currentMonth);
        addBudget(user, cats.get("Entertainment"), "80.00", currentMonth);
        addBudget(user, cats.get("Shopping"), "200.00", currentMonth);
        addBudget(user, cats.get("Health"), "150.00", currentMonth);
        addBudget(user, cats.get("Utilities"), "150.00", currentMonth);
    }

    // ─── Helpers ─────────────────────────────────────────────────────

    private void addTx(Account account, Category category, String desc, String amount, String type, LocalDate date) {
        BigDecimal amt = new BigDecimal(amount);
        Transaction tx = Transaction.builder()
                .amount(amt)
                .convertedAmount(amt) // EUR to EUR = same
                .currency(account.getCurrency())
                .type(TransactionType.valueOf(type))
                .description(desc)
                .transactionDate(date)
                .account(account)
                .category(category)
                .build();
        transactionRepository.save(tx);
    }

    private void addBudget(User user, Category category, String limit, String yearMonth) {
        Budget budget = Budget.builder()
                .amountLimit(new BigDecimal(limit))
                .yearMonth(yearMonth)
                .user(user)
                .category(category)
                .build();
        budgetRepository.save(budget);
    }
}
