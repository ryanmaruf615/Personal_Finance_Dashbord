package com.financeapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main entry point for the Personal Finance Dashboard backend.
 *
 * @SpringBootApplication combines:
 *   - @Configuration:       marks this as a source of bean definitions
 *   - @EnableAutoConfiguration: tells Spring Boot to auto-configure based on dependencies
 *   - @ComponentScan:       scans com.financeapp.* for @Service, @Controller, @Repository, etc.
 *
 * @EnableJpaAuditing enables automatic population of @CreatedDate and @LastModifiedDate
 * fields on our entity classes, so we never have to manually set timestamps.
 */
@SpringBootApplication
@EnableJpaAuditing
public class FinanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinanceApplication.class, args);
    }
}
