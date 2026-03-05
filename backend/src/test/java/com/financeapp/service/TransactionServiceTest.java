package com.financeapp.service;

import com.financeapp.dto.request.TransactionRequest;
import com.financeapp.dto.response.PageResponse;
import com.financeapp.dto.response.TransactionResponse;
import com.financeapp.entity.Account;
import com.financeapp.entity.Category;
import com.financeapp.entity.Transaction;
import com.financeapp.entity.User;
import com.financeapp.enums.*;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.repository.AccountRepository;
import com.financeapp.repository.CategoryRepository;
import com.financeapp.repository.TransactionRepository;
import com.financeapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionService Unit Tests")
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrencyService currencyService;

    @InjectMocks
    private TransactionService transactionService;

    private User testUser;
    private User otherUser;
    private Account testAccount;
    private Account usdAccount;
    private Category foodCategory;
    private Transaction testTransaction;
    private TransactionRequest transactionRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@test.com")
                .password("hashed")
                .firstName("John")
                .lastName("Doe")
                .role(Role.ROLE_USER)
                .preferredCurrency(Currency.EUR)
                .createdAt(LocalDateTime.now())
                .build();

        otherUser = User.builder()
                .id(2L)
                .email("other@test.com")
                .password("hashed")
                .firstName("Jane")
                .lastName("Smith")
                .role(Role.ROLE_USER)
                .preferredCurrency(Currency.EUR)
                .createdAt(LocalDateTime.now())
                .build();

        testAccount = Account.builder()
                .id(1L)
                .name("Main Checking")
                .type(AccountType.CHECKING)
                .currency(Currency.EUR)
                .isArchived(false)
                .user(testUser)
                .createdAt(LocalDateTime.now())
                .build();

        usdAccount = Account.builder()
                .id(2L)
                .name("USD Account")
                .type(AccountType.CHECKING)
                .currency(Currency.USD)
                .isArchived(false)
                .user(testUser)
                .createdAt(LocalDateTime.now())
                .build();

        foodCategory = Category.builder()
                .id(1L)
                .name("Food")
                .icon(CategoryIcon.FOOD)
                .isDefault(true)
                .createdAt(LocalDateTime.now())
                .build();

        testTransaction = Transaction.builder()
                .id(1L)
                .amount(new BigDecimal("45.50"))
                .convertedAmount(new BigDecimal("45.50"))
                .currency(Currency.EUR)
                .type(TransactionType.EXPENSE)
                .description("Lidl Grocery")
                .transactionDate(LocalDate.of(2026, 3, 4))
                .account(testAccount)
                .category(foodCategory)
                .createdAt(LocalDateTime.now())
                .build();

        transactionRequest = TransactionRequest.builder()
                .amount(new BigDecimal("45.50"))
                .type(TransactionType.EXPENSE)
                .description("Lidl Grocery")
                .transactionDate(LocalDate.of(2026, 3, 4))
                .accountId(1L)
                .categoryId(1L)
                .build();
    }

    // ─── Create Tests ───────────────────────────────────────────────

    @Test
    @DisplayName("Should create transaction with converted amount (EUR account)")
    void shouldCreateWithConvertedAmount() {
        // Given
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testAccount));
        when(categoryRepository.findByIdAndAccessibleByUser(1L, 1L)).thenReturn(Optional.of(foodCategory));
        when(currencyService.convertToEur(new BigDecimal("45.50"), Currency.EUR))
                .thenReturn(new BigDecimal("45.50"));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        // When
        TransactionResponse response = transactionService.createTransaction("test@test.com", transactionRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAmount()).isEqualByComparingTo("45.50");
        assertThat(response.getConvertedAmount()).isEqualByComparingTo("45.50");
        assertThat(response.getCurrency()).isEqualTo(Currency.EUR);
        assertThat(response.getType()).isEqualTo(TransactionType.EXPENSE);
        assertThat(response.getAccountName()).isEqualTo("Main Checking");
        assertThat(response.getCategoryName()).isEqualTo("Food");

        // Verify transaction was saved with correct converted amount
        ArgumentCaptor<Transaction> txCaptor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(txCaptor.capture());
        assertThat(txCaptor.getValue().getConvertedAmount()).isEqualByComparingTo("45.50");
    }

    @Test
    @DisplayName("Should create USD transaction with EUR converted amount")
    void shouldCreateUsdTransactionWithConvertedAmount() {
        // Given
        TransactionRequest usdRequest = TransactionRequest.builder()
                .amount(new BigDecimal("100.00"))
                .type(TransactionType.EXPENSE)
                .description("Amazon US")
                .transactionDate(LocalDate.of(2026, 3, 5))
                .accountId(2L)
                .categoryId(1L)
                .build();

        Transaction usdTransaction = Transaction.builder()
                .id(2L)
                .amount(new BigDecimal("100.00"))
                .convertedAmount(new BigDecimal("92.59"))
                .currency(Currency.USD)
                .type(TransactionType.EXPENSE)
                .description("Amazon US")
                .transactionDate(LocalDate.of(2026, 3, 5))
                .account(usdAccount)
                .category(foodCategory)
                .createdAt(LocalDateTime.now())
                .build();

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(accountRepository.findByIdAndUserId(2L, 1L)).thenReturn(Optional.of(usdAccount));
        when(categoryRepository.findByIdAndAccessibleByUser(1L, 1L)).thenReturn(Optional.of(foodCategory));
        when(currencyService.convertToEur(new BigDecimal("100.00"), Currency.USD))
                .thenReturn(new BigDecimal("92.59"));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(usdTransaction);

        // When
        TransactionResponse response = transactionService.createTransaction("test@test.com", usdRequest);

        // Then
        assertThat(response.getCurrency()).isEqualTo(Currency.USD);
        assertThat(response.getAmount()).isEqualByComparingTo("100.00");
        assertThat(response.getConvertedAmount()).isEqualByComparingTo("92.59");

        verify(currencyService).convertToEur(new BigDecimal("100.00"), Currency.USD);
    }

    // ─── Pagination Test ────────────────────────────────────────────

    @Test
    @DisplayName("Should return paginated transactions")
    @SuppressWarnings("unchecked")
    void shouldReturnPaginatedTransactions() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        List<Transaction> transactions = List.of(testTransaction);
        Page<Transaction> page = new PageImpl<>(transactions, pageable, 1);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(transactionRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        // When
        PageResponse<TransactionResponse> response = transactionService.getTransactions(
                "test@test.com", null, null, null, null, null, null, pageable
        );

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getPage()).isZero();
        assertThat(response.getSize()).isEqualTo(20);
        assertThat(response.getTotalElements()).isEqualTo(1);
        assertThat(response.isFirst()).isTrue();
        assertThat(response.isLast()).isTrue();
        assertThat(response.getContent().get(0).getDescription()).isEqualTo("Lidl Grocery");
    }

    // ─── Filter Tests ───────────────────────────────────────────────

    @Test
    @DisplayName("Should apply date range filter")
    @SuppressWarnings("unchecked")
    void shouldFilterByDateRange() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        LocalDate startDate = LocalDate.of(2026, 3, 1);
        LocalDate endDate = LocalDate.of(2026, 3, 31);
        Page<Transaction> emptyPage = new PageImpl<>(List.of(), pageable, 0);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(transactionRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(emptyPage);

        // When
        PageResponse<TransactionResponse> response = transactionService.getTransactions(
                "test@test.com", null, null, null, startDate, endDate, null, pageable
        );

        // Then
        assertThat(response).isNotNull();
        verify(transactionRepository).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    @DisplayName("Should apply category and type filter")
    @SuppressWarnings("unchecked")
    void shouldFilterByCategoryAndType() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        List<Transaction> filtered = List.of(testTransaction);
        Page<Transaction> page = new PageImpl<>(filtered, pageable, 1);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(transactionRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        // When
        PageResponse<TransactionResponse> response = transactionService.getTransactions(
                "test@test.com", null, 1L, TransactionType.EXPENSE, null, null, null, pageable
        );

        // Then
        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getType()).isEqualTo(TransactionType.EXPENSE);
        assertThat(response.getContent().get(0).getCategoryId()).isEqualTo(1L);
    }

    // ─── Access Control Test ────────────────────────────────────────

    @Test
    @DisplayName("Should throw when accessing other user's transaction")
    void shouldThrowWhenAccessingOtherUsersTransaction() {
        // Given
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherUser));
        when(transactionRepository.findByIdAndUserId(1L, 2L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> transactionService.getTransaction("other@test.com", 1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Transaction");

        verify(transactionRepository).findByIdAndUserId(1L, 2L);
    }

    // ─── Delete Tests ───────────────────────────────────────────────

    @Test
    @DisplayName("Should delete transaction owned by user")
    void shouldDelete() {
        // Given
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(transactionRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testTransaction));

        // When
        transactionService.deleteTransaction("test@test.com", 1L);

        // Then
        verify(transactionRepository).delete(any(Transaction.class));
        verify(transactionRepository).findByIdAndUserId(1L, 1L);
    }

    @Test
    @DisplayName("Should throw when deleting non-existent transaction")
    void shouldThrowWhenDeletingNonExistent() {
        // Given
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(transactionRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> transactionService.deleteTransaction("test@test.com", 999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Transaction");

        verify(transactionRepository, never()).delete(any(Transaction.class));
    }
}