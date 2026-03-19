package com.example.compliance_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

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
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private String imageUrl;
    private Boolean active;
    private Boolean deleted;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
