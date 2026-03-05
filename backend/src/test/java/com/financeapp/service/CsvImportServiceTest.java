package com.financeapp.service;

import com.financeapp.dto.response.CsvImportResultResponse;
import com.financeapp.dto.response.CsvPreviewResponse;
import com.financeapp.entity.Account;
import com.financeapp.entity.Category;
import com.financeapp.entity.Transaction;
import com.financeapp.entity.User;
import com.financeapp.enums.*;
import com.financeapp.repository.AccountRepository;
import com.financeapp.repository.CategoryRepository;
import com.financeapp.repository.TransactionRepository;
import com.financeapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CsvImportService Unit Tests")
class CsvImportServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private UserRepository userRepository;
    @Mock private CurrencyService currencyService;

    @InjectMocks
    private CsvImportService csvImportService;

    private User testUser;
    private Account testAccount;
    private List<Category> categories;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L).email("test@test.com").password("hashed")
                .firstName("John").lastName("Doe")
                .role(Role.ROLE_USER).preferredCurrency(Currency.EUR)
                .createdAt(LocalDateTime.now()).build();

        testAccount = Account.builder()
                .id(1L).name("Main Checking").type(AccountType.CHECKING)
                .currency(Currency.EUR).isArchived(false).user(testUser)
                .createdAt(LocalDateTime.now()).build();

        categories = List.of(
                Category.builder().id(1L).name("Food").icon(CategoryIcon.FOOD)
                        .isDefault(true).createdAt(LocalDateTime.now()).build(),
                Category.builder().id(4L).name("Salary").icon(CategoryIcon.SALARY)
                        .isDefault(true).createdAt(LocalDateTime.now()).build(),
                Category.builder().id(12L).name("Other").icon(CategoryIcon.OTHER)
                        .isDefault(true).createdAt(LocalDateTime.now()).build()
        );
    }

    private MockMultipartFile createCsvFile(String content) {
        return new MockMultipartFile("file", "test.csv", "text/csv",
                content.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    @DisplayName("Should parse valid CSV and preview all rows")
    void shouldParseValidCsv() {
        String csv = "date,description,amount,type,category\n" +
                "2026-03-01,Monthly Salary,3500.00,INCOME,Salary\n" +
                "2026-03-02,REWE Supermarket,-45.30,EXPENSE,Food\n";

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(categoryRepository.findAllAvailableForUser(1L)).thenReturn(categories);

        CsvPreviewResponse response = csvImportService.previewCsv("test@test.com", createCsvFile(csv));

        assertThat(response.getTotalRows()).isEqualTo(2);
        assertThat(response.getValidRows()).isEqualTo(2);
        assertThat(response.getErrorRows()).isZero();
        assertThat(response.getRows().get(0).getDate()).isEqualTo("2026-03-01");
        assertThat(response.getRows().get(0).getDescription()).isEqualTo("Monthly Salary");
        assertThat(response.getRows().get(0).isValid()).isTrue();
        assertThat(response.getRows().get(1).getType()).isEqualTo("EXPENSE");
    }

    @Test
    @DisplayName("Should detect and skip duplicate transactions on import")
    void shouldDetectDuplicates() {
        String csv = "date,description,amount,type,category\n" +
                "2026-03-01,Monthly Salary,3500.00,INCOME,Salary\n";

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testAccount));
        when(categoryRepository.findAllAvailableForUser(1L)).thenReturn(categories);

        // Simulate duplicate found
        when(transactionRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class)))
                .thenReturn(List.of(Transaction.builder().id(99L).build()));

        CsvImportResultResponse response = csvImportService.importCsv("test@test.com", createCsvFile(csv), 1L);

        assertThat(response.getImportedCount()).isZero();
        assertThat(response.getSkippedCount()).isEqualTo(1);
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    @DisplayName("Should report errors for invalid rows")
    void shouldReportErrors() {
        String csv = "date,description,amount,type,category\n" +
                "invalid-date,Bad Row,abc,WRONG,Food\n" +
                "2026-03-01,Good Row,100.00,INCOME,Salary\n";

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testAccount));
        when(categoryRepository.findAllAvailableForUser(1L)).thenReturn(categories);
        when(currencyService.convertToEur(any(), eq(Currency.EUR))).thenReturn(new BigDecimal("100.00"));
        // No duplicate for good row
        when(transactionRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class)))
                .thenReturn(Collections.emptyList());
        when(transactionRepository.save(any(Transaction.class)))
                .thenReturn(Transaction.builder().id(1L).build());

        CsvImportResultResponse response = csvImportService.importCsv("test@test.com", createCsvFile(csv), 1L);

        assertThat(response.getErrorCount()).isGreaterThan(0);
        assertThat(response.getErrors()).anyMatch(e -> e.contains("Row 1"));
    }

    @Test
    @DisplayName("Should import only valid rows and skip bad ones")
    void shouldImportValidRowsOnly() {
        String csv = "date,description,amount,type,category\n" +
                "2026-03-01,Monthly Salary,3500.00,INCOME,Salary\n" +
                "bad-date,Bad Entry,xxx,NOPE,Food\n" +
                "2026-03-03,Netflix,-12.99,EXPENSE,Other\n";

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(accountRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testAccount));
        when(categoryRepository.findAllAvailableForUser(1L)).thenReturn(categories);
        when(currencyService.convertToEur(any(), eq(Currency.EUR))).thenAnswer(inv -> inv.getArgument(0));
        // No duplicates
        when(transactionRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class)))
                .thenReturn(Collections.emptyList());
        when(transactionRepository.save(any(Transaction.class)))
                .thenReturn(Transaction.builder().id(1L).build());

        CsvImportResultResponse response = csvImportService.importCsv("test@test.com", createCsvFile(csv), 1L);

        assertThat(response.getImportedCount()).isEqualTo(2);
        assertThat(response.getErrorCount()).isGreaterThan(0);
        verify(transactionRepository, times(2)).save(any(Transaction.class));
    }
}
