package com.example.compliance_service.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentRequest {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Document type ID is required")
    private Long documentTypeId;

    @Size(max = 100, message = "Reference number must be at most 100 characters")
    private String referenceNumber;

    private OffsetDateTime startDate;

    private OffsetDateTime endDate;

    @Size(max = 500, message = "Image URL must be at most 500 characters")
    private String imageUrl;
}
