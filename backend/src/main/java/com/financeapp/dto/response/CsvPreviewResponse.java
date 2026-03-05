package com.financeapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CsvPreviewResponse {

    private List<CsvRowPreview> rows;
    private int totalRows;
    private int validRows;
    private int errorRows;
    private int duplicateRows;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CsvRowPreview {
        private int rowNumber;
        private String date;
        private String description;
        private String amount;
        private String type;
        private String category;
        private boolean valid;
        private boolean duplicate;
        private String errorMessage;
    }
}
