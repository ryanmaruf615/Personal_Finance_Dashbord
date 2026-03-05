package com.financeapp.service;

import com.financeapp.dto.response.CsvImportResultResponse;
import com.financeapp.dto.response.CsvPreviewResponse;
import com.financeapp.dto.response.CsvPreviewResponse.CsvRowPreview;
import com.financeapp.entity.Account;
import com.financeapp.entity.Category;
import com.financeapp.entity.Transaction;
import com.financeapp.entity.User;
import com.financeapp.enums.TransactionType;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.repository.AccountRepository;
import com.financeapp.repository.CategoryRepository;
import com.financeapp.repository.TransactionRepository;
import com.financeapp.repository.UserRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CsvImportService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CurrencyService currencyService;

    private static final DateTimeFormatter[] DATE_FORMATS = {
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),
            DateTimeFormatter.ofPattern("dd.MM.yyyy")
    };

    // ─── Preview CSV ────────────────────────────────────────────────

    public CsvPreviewResponse previewCsv(String email, MultipartFile file) {
        User user = findUserByEmail(email);
        List<String[]> csvRows = parseCsv(file);
        List<Category> categories = categoryRepository.findAllAvailableForUser(user.getId());

        List<CsvRowPreview> previews = new ArrayList<>();
        int validCount = 0;
        int errorCount = 0;
        int duplicateCount = 0;

        // Skip header row (index 0)
        for (int i = 1; i < csvRows.size(); i++) {
            String[] row = csvRows.get(i);
            CsvRowPreview preview = validateRow(row, i, categories);
            previews.add(preview);

            if (preview.isDuplicate()) {
                duplicateCount++;
            } else if (preview.isValid()) {
                validCount++;
            } else {
                errorCount++;
            }
        }

        return CsvPreviewResponse.builder()
                .rows(previews)
                .totalRows(previews.size())
                .validRows(validCount)
                .errorRows(errorCount)
                .duplicateRows(duplicateCount)
                .build();
    }

    // ─── Import CSV ─────────────────────────────────────────────────

    @Transactional
    public CsvImportResultResponse importCsv(String email, MultipartFile file, Long accountId) {
        User user = findUserByEmail(email);

        Account account = accountRepository.findByIdAndUserId(accountId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));

        List<Category> categories = categoryRepository.findAllAvailableForUser(user.getId());
        List<String[]> csvRows = parseCsv(file);

        int importedCount = 0;
        int skippedCount = 0;
        List<String> errors = new ArrayList<>();

        for (int i = 1; i < csvRows.size(); i++) {
            String[] row = csvRows.get(i);

            try {
                if (row.length < 4) {
                    errors.add("Row " + i + ": insufficient columns");
                    continue;
                }

                LocalDate date = parseDate(row[0].trim());
                if (date == null) {
                    errors.add("Row " + i + ": invalid date '" + row[0].trim() + "'");
                    continue;
                }

                String description = row[1].trim();
                BigDecimal amount = parseAmount(row[2].trim());
                if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) {
                    errors.add("Row " + i + ": invalid amount '" + row[2].trim() + "'");
                    continue;
                }

                TransactionType type = parseType(row[3].trim());
                if (type == null) {
                    errors.add("Row " + i + ": invalid type '" + row[3].trim() + "' (use INCOME or EXPENSE)");
                    continue;
                }

                // Category matching (column 5 if present, else default to "Other")
                Category category = matchCategory(row.length > 4 ? row[4].trim() : "Other", categories);

                // Duplicate check: same account, date, amount, description
                boolean isDuplicate = isDuplicate(account, date, amount.abs(), description, type);
                if (isDuplicate) {
                    skippedCount++;
                    continue;
                }

                BigDecimal absAmount = amount.abs();
                BigDecimal convertedAmount = currencyService.convertToEur(absAmount, account.getCurrency());

                Transaction transaction = Transaction.builder()
                        .amount(absAmount)
                        .convertedAmount(convertedAmount)
                        .currency(account.getCurrency())
                        .type(type)
                        .description(description)
                        .transactionDate(date)
                        .account(account)
                        .category(category)
                        .build();

                transactionRepository.save(transaction);
                importedCount++;

            } catch (Exception e) {
                errors.add("Row " + i + ": " + e.getMessage());
            }
        }

        log.info("CSV import: {} imported, {} skipped, {} errors for user {}",
                importedCount, skippedCount, errors.size(), email);

        return CsvImportResultResponse.builder()
                .importedCount(importedCount)
                .skippedCount(skippedCount)
                .errorCount(errors.size())
                .errors(errors)
                .build();
    }

    // ─── Helpers ────────────────────────────────────────────────────

    private List<String[]> parseCsv(MultipartFile file) {
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            return reader.readAll();
        } catch (IOException | CsvException e) {
            throw new IllegalArgumentException("Failed to parse CSV file: " + e.getMessage());
        }
    }

    private CsvRowPreview validateRow(String[] row, int rowNumber, List<Category> categories) {
        CsvRowPreview.CsvRowPreviewBuilder builder = CsvRowPreview.builder()
                .rowNumber(rowNumber);

        if (row.length < 4) {
            return builder.valid(false).errorMessage("Insufficient columns (need: date, description, amount, type)").build();
        }

        builder.date(row[0].trim())
               .description(row[1].trim())
               .amount(row[2].trim())
               .type(row[3].trim());

        if (row.length > 4) {
            builder.category(row[4].trim());
        }

        // Validate date
        LocalDate date = parseDate(row[0].trim());
        if (date == null) {
            return builder.valid(false).errorMessage("Invalid date format").build();
        }

        // Validate amount
        BigDecimal amount = parseAmount(row[2].trim());
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) {
            return builder.valid(false).errorMessage("Invalid amount").build();
        }

        // Validate type
        TransactionType type = parseType(row[3].trim());
        if (type == null) {
            return builder.valid(false).errorMessage("Invalid type (use INCOME or EXPENSE)").build();
        }

        return builder.valid(true).duplicate(false).build();
    }

    private LocalDate parseDate(String dateStr) {
        for (DateTimeFormatter fmt : DATE_FORMATS) {
            try {
                return LocalDate.parse(dateStr, fmt);
            } catch (DateTimeParseException ignored) {}
        }
        return null;
    }

    private BigDecimal parseAmount(String amountStr) {
        try {
            String cleaned = amountStr.replace(",", ".").replaceAll("[^\\d.\\-]", "");
            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private TransactionType parseType(String typeStr) {
        try {
            return TransactionType.valueOf(typeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private Category matchCategory(String categoryName, List<Category> categories) {
        // Try exact match first
        for (Category c : categories) {
            if (c.getName().equalsIgnoreCase(categoryName)) {
                return c;
            }
        }
        // Try partial match
        for (Category c : categories) {
            if (c.getName().toLowerCase().contains(categoryName.toLowerCase()) ||
                categoryName.toLowerCase().contains(c.getName().toLowerCase())) {
                return c;
            }
        }
        // Default to "Other"
        for (Category c : categories) {
            if (c.getName().equalsIgnoreCase("Other")) {
                return c;
            }
        }
        return categories.get(0);
    }

    private boolean isDuplicate(Account account, LocalDate date, BigDecimal amount,
                                String description, TransactionType type) {
        // Simple duplicate detection: same account, date, absolute amount, description
        return transactionRepository.findAll(
                com.financeapp.specification.TransactionSpecification.hasAccountId(account.getId())
                        .and((root, query, cb) -> cb.equal(root.get("transactionDate"), date))
                        .and((root, query, cb) -> cb.equal(root.get("amount"), amount))
                        .and((root, query, cb) -> cb.equal(root.get("type"), type))
                        .and((root, query, cb) -> cb.like(cb.lower(root.get("description")),
                                description.toLowerCase()))
        ).size() > 0;
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
}
