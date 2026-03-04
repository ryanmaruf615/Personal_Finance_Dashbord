package com.financeapp.service;

import com.financeapp.dto.request.CategoryRequest;
import com.financeapp.dto.response.CategoryResponse;
import com.financeapp.entity.Category;
import com.financeapp.entity.User;
import com.financeapp.exception.DuplicateResourceException;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.repository.CategoryRepository;
import com.financeapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    // ─── Get All Categories (defaults + user custom) ────────────────

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(String email) {
        User user = findUserByEmail(email);

        return categoryRepository.findAllAvailableForUser(user.getId())
                .stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ─── Get Single Category ────────────────────────────────────────

    @Transactional(readOnly = true)
    public CategoryResponse getCategory(String email, Long categoryId) {
        User user = findUserByEmail(email);
        Category category = findAccessibleCategory(categoryId, user.getId());
        return CategoryResponse.fromEntity(category);
    }

    // ─── Create Custom Category ─────────────────────────────────────

    @Transactional
    public CategoryResponse createCategory(String email, CategoryRequest request) {
        User user = findUserByEmail(email);

        if (categoryRepository.existsByNameAndUserIdAndIsDefaultFalse(request.getName().trim(), user.getId())) {
            throw new DuplicateResourceException("Category", "name", request.getName());
        }

        Category category = Category.builder()
                .name(request.getName().trim())
                .icon(request.getIcon())
                .isDefault(false)
                .user(user)
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Category created: '{}' for user {}", saved.getName(), email);

        return CategoryResponse.fromEntity(saved);
    }

    // ─── Update Custom Category ─────────────────────────────────────

    @Transactional
    public CategoryResponse updateCategory(String email, Long categoryId, CategoryRequest request) {
        User user = findUserByEmail(email);
        Category category = findAccessibleCategory(categoryId, user.getId());

        if (category.getIsDefault()) {
            throw new IllegalArgumentException("Cannot modify default categories");
        }

        category.setName(request.getName().trim());
        category.setIcon(request.getIcon());

        Category updated = categoryRepository.save(category);
        log.info("Category updated: '{}' for user {}", updated.getName(), email);

        return CategoryResponse.fromEntity(updated);
    }

    // ─── Delete Custom Category ─────────────────────────────────────

    @Transactional
    public void deleteCategory(String email, Long categoryId) {
        User user = findUserByEmail(email);
        Category category = findAccessibleCategory(categoryId, user.getId());

        if (category.getIsDefault()) {
            throw new IllegalArgumentException("Cannot delete default categories");
        }

        categoryRepository.delete(category);
        log.info("Category deleted: '{}' for user {}", category.getName(), email);
    }

    // ─── Helpers ────────────────────────────────────────────────────

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Category findAccessibleCategory(Long categoryId, Long userId) {
        return categoryRepository.findByIdAndAccessibleByUser(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
    }
}
