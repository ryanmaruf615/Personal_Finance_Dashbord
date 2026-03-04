package com.financeapp.dto.response;

import com.financeapp.entity.Category;
import com.financeapp.enums.CategoryIcon;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private Long id;
    private String name;
    private CategoryIcon icon;
    private Boolean isDefault;
    private LocalDateTime createdAt;

    public static CategoryResponse fromEntity(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .isDefault(category.getIsDefault())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
