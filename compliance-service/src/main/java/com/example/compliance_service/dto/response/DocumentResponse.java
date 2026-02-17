package com.example.compliance_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {

    private Long id;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private DocumentTypeResponse documentType;
    private String referenceNumber;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
