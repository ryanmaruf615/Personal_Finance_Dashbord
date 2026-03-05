package com.financeapp.controller;

import com.financeapp.dto.request.TransactionRequest;
import com.financeapp.dto.response.CsvImportResultResponse;
import com.financeapp.dto.response.CsvPreviewResponse;
import com.financeapp.dto.response.PageResponse;
import com.financeapp.dto.response.TransactionResponse;
import com.financeapp.enums.TransactionType;
import com.financeapp.service.CsvImportService;
import com.financeapp.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Manage income and expense transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final CsvImportService csvImportService;

    @GetMapping
    @Operation(summary = "Get transactions with filtering, pagination, and sorting")
    public ResponseEntity<PageResponse<TransactionResponse>> getTransactions(
            Authentication authentication,
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "transactionDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<TransactionResponse> response = transactionService.getTransactions(
                authentication.getName(),
                accountId, categoryId, type,
                startDate, endDate, search,
                pageable
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific transaction by ID")
    public ResponseEntity<TransactionResponse> getTransaction(
            Authentication authentication,
            @PathVariable Long id
    ) {
        TransactionResponse response = transactionService.getTransaction(authentication.getName(), id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Create a new transaction")
    public ResponseEntity<TransactionResponse> createTransaction(
            Authentication authentication,
            @Valid @RequestBody TransactionRequest request
    ) {
        TransactionResponse response = transactionService.createTransaction(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing transaction")
    public ResponseEntity<TransactionResponse> updateTransaction(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request
    ) {
        TransactionResponse response = transactionService.updateTransaction(authentication.getName(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a transaction")
    public ResponseEntity<Void> deleteTransaction(
            Authentication authentication,
            @PathVariable Long id
    ) {
        transactionService.deleteTransaction(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    // ─── CSV Import Endpoints ───────────────────────────────────────

    @PostMapping(value = "/import/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Preview a CSV file before importing (validate rows, detect duplicates)")
    public ResponseEntity<CsvPreviewResponse> previewCsvImport(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        CsvPreviewResponse response = csvImportService.previewCsv(authentication.getName(), file);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/import/confirm", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import transactions from a CSV file into a specific account")
    public ResponseEntity<CsvImportResultResponse> importCsv(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam Long accountId
    ) {
        CsvImportResultResponse response = csvImportService.importCsv(
                authentication.getName(), file, accountId
        );
        return ResponseEntity.ok(response);
    }
}
