package com.financeapp.service;

import com.financeapp.dto.request.TransactionRequest;
import com.financeapp.dto.response.PageResponse;
import com.financeapp.dto.response.TransactionResponse;
import com.financeapp.entity.Account;
import com.financeapp.entity.Category;
import com.financeapp.entity.Transaction;
import com.financeapp.entity.User;
import com.financeapp.enums.Currency;
import com.financeapp.enums.TransactionType;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.repository.AccountRepository;
import com.financeapp.repository.CategoryRepository;
import com.financeapp.repository.TransactionRepository;
import com.financeapp.repository.UserRepository;
import com.financeapp.specification.TransactionSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CurrencyService currencyService;

    // ─── Get Filtered + Paginated Transactions ──────────────────────

    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getTransactions(
            String email,
            Long accountId,
            Long categoryId,
            TransactionType type,
            LocalDate startDate,
            LocalDate endDate,
            String search,
            Pageable pageable
    ) {
        User user = findUserByEmail(email);

        Specification<Transaction> spec = Specification
                .where(TransactionSpecification.belongsToUser(user.getId()));

        if (accountId != null) {
            spec = spec.and(TransactionSpecification.hasAccountId(accountId));
        }
        if (categoryId != null) {
            spec = spec.and(TransactionSpecification.hasCategoryId(categoryId));
        }
        if (type != null) {
            spec = spec.and(TransactionSpecification.hasType(type));
        }
        if (startDate != null) {
            spec = spec.and(TransactionSpecification.afterDate(startDate));
        }
        if (endDate != null) {
            spec = spec.and(TransactionSpecification.beforeDate(endDate));
        }
        if (search != null && !search.isBlank()) {
            spec = spec.and(TransactionSpecification.descriptionContains(search));
        }

        Page<Transaction> page = transactionRepository.findAll(spec, pageable);

        return PageResponse.from(page, TransactionResponse::fromEntity);
    }

    // ─── Get Single Transaction ─────────────────────────────────────

    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(String email, Long transactionId) {
        User user = findUserByEmail(email);
        Transaction transaction = findTransactionByIdAndUser(transactionId, user.getId());
        return TransactionResponse.fromEntity(transaction);
    }

    // ─── Create Transaction ─────────────────────────────────────────

    @Transactional
    public TransactionResponse createTransaction(String email, TransactionRequest request) {
        User user = findUserByEmail(email);

        // Validate account ownership
        Account account = accountRepository.findByIdAndUserId(request.getAccountId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", request.getAccountId()));

        // Validate category access (default or owned by user)
        Category category = categoryRepository.findByIdAndAccessibleByUser(request.getCategoryId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        // Set currency from account and calculate converted amount
        Currency txCurrency = account.getCurrency();
        BigDecimal convertedAmount = currencyService.convertToEur(request.getAmount(), txCurrency);

        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .convertedAmount(convertedAmount)
                .currency(txCurrency)
                .type(request.getType())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .transactionDate(request.getTransactionDate())
                .account(account)
                .category(category)
                .build();

        Transaction saved = transactionRepository.save(transaction);
        log.info("Transaction created: {} {} {} for user {}",
                saved.getType(), saved.getAmount(), saved.getCurrency(), email);

        return TransactionResponse.fromEntity(saved);
    }

    // ─── Update Transaction ─────────────────────────────────────────

    @Transactional
    public TransactionResponse updateTransaction(String email, Long transactionId, TransactionRequest request) {
        User user = findUserByEmail(email);
        Transaction transaction = findTransactionByIdAndUser(transactionId, user.getId());

        // Validate new account if changed
        Account account;
        if (!transaction.getAccount().getId().equals(request.getAccountId())) {
            account = accountRepository.findByIdAndUserId(request.getAccountId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Account", "id", request.getAccountId()));
        } else {
            account = transaction.getAccount();
        }

        // Validate new category if changed
        Category category;
        if (!transaction.getCategory().getId().equals(request.getCategoryId())) {
            category = categoryRepository.findByIdAndAccessibleByUser(request.getCategoryId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        } else {
            category = transaction.getCategory();
        }

        // Recalculate converted amount
        Currency txCurrency = account.getCurrency();
        BigDecimal convertedAmount = currencyService.convertToEur(request.getAmount(), txCurrency);

        transaction.setAmount(request.getAmount());
        transaction.setConvertedAmount(convertedAmount);
        transaction.setCurrency(txCurrency);
        transaction.setType(request.getType());
        transaction.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setAccount(account);
        transaction.setCategory(category);

        Transaction updated = transactionRepository.save(transaction);
        log.info("Transaction updated: id={} for user {}", updated.getId(), email);

        return TransactionResponse.fromEntity(updated);
    }

    // ─── Delete Transaction ─────────────────────────────────────────

    @Transactional
    public void deleteTransaction(String email, Long transactionId) {
        User user = findUserByEmail(email);
        Transaction transaction = findTransactionByIdAndUser(transactionId, user.getId());

        transactionRepository.delete(transaction);
        log.info("Transaction deleted: id={} for user {}", transactionId, email);
    }

    // ─── Helpers ────────────────────────────────────────────────────

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Transaction findTransactionByIdAndUser(Long transactionId, Long userId) {
        return transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", transactionId));
    }
}
