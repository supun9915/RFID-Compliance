package com.example.compliance_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDocumentResponse {
    private Long id;
    private VehicleTypeResponse vehicleType;
    private VehicleModelResponse vehicleModel;
    private UserResponse owner;
    private String registrationNumber;
    private String vehicleNumber;
    private String chassisNumber;
    private String epc;
    private Integer registeredYear;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<DocumentResponse> documents;
}
