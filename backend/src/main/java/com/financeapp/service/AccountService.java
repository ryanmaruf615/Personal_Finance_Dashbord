package com.financeapp.service;

import com.financeapp.dto.request.AccountRequest;
import com.financeapp.dto.response.AccountResponse;
import com.financeapp.entity.Account;
import com.financeapp.entity.User;
import com.financeapp.enums.Currency;
import com.financeapp.exception.DuplicateResourceException;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.repository.AccountRepository;
import com.financeapp.repository.TransactionRepository;
import com.financeapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    // ─── Get All Accounts ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AccountResponse> getAllAccounts(String email, boolean includeArchived) {
        User user = findUserByEmail(email);

        List<Account> accounts = includeArchived
                ? accountRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                : accountRepository.findByUserIdAndIsArchivedFalseOrderByCreatedAtDesc(user.getId());

        return accounts.stream()
                .map(account -> {
                    BigDecimal balance = transactionRepository.calculateBalanceByAccountId(account.getId());
                    return AccountResponse.fromEntity(account, balance);
                })
                .collect(Collectors.toList());
    }

    // ─── Get Single Account ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public AccountResponse getAccount(String email, Long accountId) {
        User user = findUserByEmail(email);
        Account account = findAccountByIdAndUser(accountId, user.getId());
        BigDecimal balance = transactionRepository.calculateBalanceByAccountId(account.getId());
        return AccountResponse.fromEntity(account, balance);
    }

    // ─── Create Account ─────────────────────────────────────────────

    @Transactional
    public AccountResponse createAccount(String email, AccountRequest request) {
        User user = findUserByEmail(email);

        if (accountRepository.existsByNameAndUserId(request.getName().trim(), user.getId())) {
            throw new DuplicateResourceException("Account", "name", request.getName());
        }

        Account account = Account.builder()
                .name(request.getName().trim())
                .type(request.getType())
                .currency(request.getCurrency() != null ? request.getCurrency() : Currency.EUR)
                .user(user)
                .build();

        Account saved = accountRepository.save(account);
        log.info("Account created: '{}' for user {}", saved.getName(), email);

        return AccountResponse.fromEntity(saved, BigDecimal.ZERO);
    }

    // ─── Update Account ─────────────────────────────────────────────

    @Transactional
    public AccountResponse updateAccount(String email, Long accountId, AccountRequest request) {
        User user = findUserByEmail(email);
        Account account = findAccountByIdAndUser(accountId, user.getId());

        account.setName(request.getName().trim());
        account.setType(request.getType());
        if (request.getCurrency() != null) {
            account.setCurrency(request.getCurrency());
        }

        Account updated = accountRepository.save(account);
        BigDecimal balance = transactionRepository.calculateBalanceByAccountId(updated.getId());
        log.info("Account updated: '{}' for user {}", updated.getName(), email);

        return AccountResponse.fromEntity(updated, balance);
    }

    // ─── Delete (Archive) Account ───────────────────────────────────

    @Transactional
    public void deleteAccount(String email, Long accountId) {
        User user = findUserByEmail(email);
        Account account = findAccountByIdAndUser(accountId, user.getId());

        account.setIsArchived(true);
        accountRepository.save(account);
        log.info("Account archived: '{}' for user {}", account.getName(), email);
    }

    // ─── Helpers ────────────────────────────────────────────────────

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Account findAccountByIdAndUser(Long accountId, Long userId) {
        return accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));
    }
}
