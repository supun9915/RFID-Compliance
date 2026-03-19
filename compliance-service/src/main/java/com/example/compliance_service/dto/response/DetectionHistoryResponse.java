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
public class DetectionHistoryResponse {

    private Long id;

    // Vehicle info
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private String vehicleEpc;
    private VehicleTypeResponse vehicleType;
    private VehicleModelResponse vehicleModel;

    // Owner info
    private Long ownerId;
    private String ownerFullName;
    private String ownerContact;
    private String ownerNic;

    // Reader info
    private Long readerId;
    private String readerName;
    private String readerModel;
    private String readerIpAddress;

    // Scan center info
    private Long scanCenterId;
    private String scanCenterName;
    private String scanCenterCity;
    private String scanCenterDistrict;

    // Compliance info
    private String complianceStatus;
    private String complianceMessage;
    private String description;
    private String comment;

    // Document validation details
    private List<DocumentValidationResult> documentValidations;

    private OffsetDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentValidationResult {
        private Long documentId;
        private String documentTypeName;
        private Integer durationMonths;
        private String referenceNumber;
        private OffsetDateTime startDate;
        private OffsetDateTime endDate;
        private String status;       // VALID, EXPIRED, MISSING, NEAR_EXPIRY
        private String statusDetail;
    }
}

