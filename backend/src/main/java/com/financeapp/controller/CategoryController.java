package com.financeapp.controller;

import com.financeapp.dto.request.CategoryRequest;
import com.financeapp.dto.response.CategoryResponse;
import com.financeapp.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Manage transaction categories")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all categories (defaults + user custom)")
    public ResponseEntity<List<CategoryResponse>> getAllCategories(Authentication authentication) {
        List<CategoryResponse> categories = categoryService.getAllCategories(authentication.getName());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific category by ID")
    public ResponseEntity<CategoryResponse> getCategory(
            Authentication authentication,
            @PathVariable Long id
    ) {
        CategoryResponse category = categoryService.getCategory(authentication.getName(), id);
        return ResponseEntity.ok(category);
    }

    @PostMapping
    @Operation(summary = "Create a custom category")
    public ResponseEntity<CategoryResponse> createCategory(
            Authentication authentication,
            @Valid @RequestBody CategoryRequest request
    ) {
        CategoryResponse category = categoryService.createCategory(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a custom category (cannot modify defaults)")
    public ResponseEntity<CategoryResponse> updateCategory(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        CategoryResponse category = categoryService.updateCategory(authentication.getName(), id, request);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a custom category (cannot delete defaults)")
    public ResponseEntity<Void> deleteCategory(
            Authentication authentication,
            @PathVariable Long id
    ) {
        categoryService.deleteCategory(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
