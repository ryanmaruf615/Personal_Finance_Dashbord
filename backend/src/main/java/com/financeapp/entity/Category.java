package com.financeapp.entity;

import com.financeapp.enums.CategoryIcon;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Category entity — used to classify transactions (Food, Transport, Salary, etc.)
 *
 * Two types of categories:
 * 1. DEFAULT categories: isDefault=true, user=null
 *    → Seeded by Flyway migration V8, available to ALL users
 *    → Cannot be edited or deleted by users
 *
 * 2. CUSTOM categories: isDefault=false, user=<owner>
 *    → Created by individual users for their specific needs
 *    → Only visible to the user who created them
 *
 * The CategoryRepository query combines both: "WHERE isDefault=true OR user.id=:userId"
 */
@Entity
@Table(name = "categories")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoryIcon icon;

    /**
     * true  = system default category (Food, Transport, etc.) — shared by all users
     * false = custom category created by a specific user
     */
    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    /**
     * null  = this is a default category (belongs to everyone)
     * <User> = this is a custom category (belongs to this user only)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
