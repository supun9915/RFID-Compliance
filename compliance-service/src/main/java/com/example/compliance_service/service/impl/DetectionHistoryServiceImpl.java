package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.Enums.EComplianceStatus;
import com.example.compliance_service.dto.request.DetectionRequest;
import com.example.compliance_service.dto.response.DetectionHistoryResponse;
import com.example.compliance_service.dto.response.VehicleModelResponse;
import com.example.compliance_service.dto.response.VehicleTypeResponse;
import com.example.compliance_service.entity.*;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.repository.*;
import com.example.compliance_service.service.IDetectionHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DetectionHistoryServiceImpl implements IDetectionHistoryService {

    // Number of days before expiry that triggers NEAR_EXPIRY status
    private static final int NEAR_EXPIRY_DAYS = 30;

    private final DetectionHistoryRepository detectionHistoryRepository;
    private final VehicleRepository vehicleRepository;
    private final ReaderRepository readerRepository;
    private final DocumentRepository documentRepository;

    // ── Record Detection ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public DetectionHistoryResponse recordDetection(DetectionRequest request) {

        // 1. Validate that at least one reader identifier is provided
        if ((request.getReaderModel() == null || request.getReaderModel().isBlank())
                && (request.getReaderIpAddress() == null || request.getReaderIpAddress().isBlank())) {
            throw new IllegalArgumentException("Either readerModel or readerIpAddress must be provided");
        }

        // 2. Resolve Reader → ScanCenter
        Reader reader = resolveReader(request);
        ScanCenter scanCenter = reader.getScanCenter();

        // 3. Resolve Vehicle by EPC
        Vehicle vehicle = vehicleRepository.findByEpcAndActiveTrue(request.getEpc());
        if (vehicle == null) {
            log.info("Vehicle not found for EPC: {}. Recording detection with UNKNOWN vehicle.", request.getEpc());
            return null;
        }

        // 4. Resolve Owner from vehicle
        User owner = vehicle.getOwner();

        // 5. Load active, non-deleted documents for this vehicle
        List<Document> documents = documentRepository.findByVehicleId(vehicle.getId())
                .stream()
                .filter(d -> Boolean.TRUE.equals(d.getActive()) && Boolean.FALSE.equals(d.getDeleted()))
                .collect(Collectors.toList());

        // 6. Validate each document against its document-type duration
        OffsetDateTime now = OffsetDateTime.now();
        List<DetectionHistoryResponse.DocumentValidationResult> validationResults = new ArrayList<>();
        List<String> issues = new ArrayList<>();

        for (Document doc : documents) {
            DetectionHistoryResponse.DocumentValidationResult result =
                    validateDocument(doc, now, issues);
            validationResults.add(result);
        }

        // 7. Determine overall compliance status
        EComplianceStatus overallStatus = determineOverallStatus(validationResults, documents);

        // 8. Build human-readable description and compliance message
        String description = buildDescription(vehicle, owner, scanCenter, validationResults, overallStatus);
        String complianceMessage = buildComplianceMessage(overallStatus, validationResults);

        // 9. Persist detection history
        DetectionHistory detectionHistory = DetectionHistory.builder()
                .vehicle(vehicle)
                .reader(reader)
                .owner(owner)
                .scanCenter(scanCenter)
                .complianceStatus(overallStatus.name())
                .description(description)
                .complianceMessage(complianceMessage)
                .comment(null)
                .createdAt(now)
                .build();

        DetectionHistory saved = detectionHistoryRepository.save(detectionHistory);

        // 10. Map to response
        return mapToResponse(saved, validationResults);
    }

    // ── Queries ────────────────────────────────────────────────────────────────

    @Override
    public List<DetectionHistoryResponse> getAllDetections() {
        return detectionHistoryRepository.findAll().stream()
                .map(d -> mapToResponse(d, null))
                .collect(Collectors.toList());
    }

    @Override
    public List<DetectionHistoryResponse> getDetectionsByVehicleId(Long vehicleId) {
        return detectionHistoryRepository.findByVehicleId(vehicleId).stream()
                .map(d -> mapToResponse(d, null))
                .collect(Collectors.toList());
    }

    @Override
    public List<DetectionHistoryResponse> getDetectionsByReaderId(Long readerId) {
        return detectionHistoryRepository.findByReaderId(readerId).stream()
                .map(d -> mapToResponse(d, null))
                .collect(Collectors.toList());
    }

    @Override
    public List<DetectionHistoryResponse> getDetectionsByStatus(String status) {
        return detectionHistoryRepository.findByComplianceStatus(status).stream()
                .map(d -> mapToResponse(d, null))
                .collect(Collectors.toList());
    }

    @Override
    public DetectionHistoryResponse getDetectionById(Long id) {
        DetectionHistory history = detectionHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Detection history not found with id: " + id));
        return mapToResponse(history, null);
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    /**
     * Resolve the Reader entity by model name or IP address (IP takes precedence).
     */
    private Reader resolveReader(DetectionRequest request) {
        if (request.getReaderIpAddress() != null && !request.getReaderIpAddress().isBlank()) {
            return readerRepository.findByIpAddress(request.getReaderIpAddress())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "No reader found with IP address: " + request.getReaderIpAddress()));
        }
        return readerRepository.findFirstByModel(request.getReaderModel())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No reader found with model: " + request.getReaderModel()));
    }

    /**
     * Validate a single document against its document-type duration.
     * Duration stored on DocumentType is in months.
     */
    private DetectionHistoryResponse.DocumentValidationResult validateDocument(
            Document doc, OffsetDateTime now, List<String> issues) {

        DocumentType docType = doc.getDocumentType();
        int durationMonths = (docType.getDuration() != null) ? docType.getDuration() : 0;

        String docStatus;
        String statusDetail;

        if (doc.getStartDate() == null || doc.getEndDate() == null) {
            docStatus = "MISSING";
            statusDetail = "Document '" + docType.getName() + "' has no valid dates set.";
            issues.add(statusDetail);
        } else if (now.isAfter(doc.getEndDate())) {
            // Expired: end date is in the past
            docStatus = "EXPIRED";
            long daysOverdue = java.time.Duration.between(doc.getEndDate(), now).toDays();
            statusDetail = "Document '" + docType.getName() + "' expired " + daysOverdue + " day(s) ago"
                    + " (expired on " + doc.getEndDate().toLocalDate() + ").";
            issues.add(statusDetail);
        } else if (now.isAfter(doc.getEndDate().minusDays(NEAR_EXPIRY_DAYS))) {
            // Near expiry: within 30 days
            docStatus = "NEAR_EXPIRY";
            long daysLeft = java.time.Duration.between(now, doc.getEndDate()).toDays();
            statusDetail = "Document '" + docType.getName() + "' expires in " + daysLeft + " day(s)"
                    + " (expires on " + doc.getEndDate().toLocalDate() + ").";
            issues.add(statusDetail);
        } else {
            docStatus = "VALID";
            long daysLeft = java.time.Duration.between(now, doc.getEndDate()).toDays();
            statusDetail = "Document '" + docType.getName() + "' is valid for " + daysLeft + " more day(s)"
                    + " (expires on " + doc.getEndDate().toLocalDate() + ").";
        }

        return DetectionHistoryResponse.DocumentValidationResult.builder()
                .documentId(doc.getId())
                .documentTypeName(docType.getName())
                .durationMonths(durationMonths)
                .referenceNumber(doc.getReferenceNumber())
                .startDate(doc.getStartDate())
                .endDate(doc.getEndDate())
                .status(docStatus)
                .statusDetail(statusDetail)
                .build();
    }

    /**
     * Determine the overall compliance status based on individual document validations.
     *
     * Rules:
     *  - Any EXPIRED or MISSING  → NON_COMPLIANT
     *  - Any NEAR_EXPIRY (no expired/missing) → NEAR_EXPIRY
     *  - All VALID → FULLY_COMPLIANT
     *  - No documents at all → UNKNOWN
     */
    private EComplianceStatus determineOverallStatus(
            List<DetectionHistoryResponse.DocumentValidationResult> results,
            List<Document> documents) {

        if (documents.isEmpty()) {
            return EComplianceStatus.UNKNOWN;
        }
        boolean hasExpiredOrMissing = results.stream()
                .anyMatch(r -> "EXPIRED".equals(r.getStatus()) || "MISSING".equals(r.getStatus()));
        if (hasExpiredOrMissing) {
            return EComplianceStatus.NON_COMPLIANT;
        }
        boolean hasNearExpiry = results.stream()
                .anyMatch(r -> "NEAR_EXPIRY".equals(r.getStatus()));
        if (hasNearExpiry) {
            return EComplianceStatus.NEAR_EXPIRY;
        }
        return EComplianceStatus.FULLY_COMPLIANT;
    }

    /**
     * Build a human-readable description summarising the detection event.
     */
    private String buildDescription(Vehicle vehicle, User owner, ScanCenter scanCenter,
                                    List<DetectionHistoryResponse.DocumentValidationResult> results,
                                    EComplianceStatus status) {
        StringBuilder sb = new StringBuilder();
        sb.append("Vehicle [").append(vehicle.getRegistrationNumber()).append("]");

        if (owner != null) {
            sb.append(" owned by ").append(owner.getFirstName()).append(" ").append(owner.getLastName());
            sb.append(" (NIC: ").append(owner.getNic()).append(")");
        }
        if (scanCenter != null) {
            sb.append(" detected at scan center '").append(scanCenter.getName()).append("'");
        }
        sb.append(". Overall compliance: ").append(status.name()).append(".");

        if (!results.isEmpty()) {
            sb.append(" Document details: ");
            for (DetectionHistoryResponse.DocumentValidationResult r : results) {
                sb.append("[").append(r.getDocumentTypeName())
                        .append(" - ").append(r.getStatus())
                        .append(": ").append(r.getStatusDetail()).append("] ");
            }
        }
        return sb.toString().trim();
    }

    /**
     * Build a concise, user-facing compliance message summarising the overall status
     * and listing only the problematic documents.
     */
    private String buildComplianceMessage(EComplianceStatus status,
                                          List<DetectionHistoryResponse.DocumentValidationResult> results) {
        if (results.isEmpty()) {
            return "No documents found. Status: UNKNOWN.";
        }

        // Build a short per-document summary: "Insurance: Valid | Revenue Licence: Expired | ..."
        String docSummary = results.stream()
                .map(r -> {
                    String label;
                    switch (r.getStatus()) {
                        case "VALID":       label = "Valid";       break;
                        case "EXPIRED":     label = "Expired";     break;
                        case "NEAR_EXPIRY": label = "Near Expiry"; break;
                        case "MISSING":     label = "Missing";     break;
                        default:            label = r.getStatus(); break;
                    }
                    return r.getDocumentTypeName() + ": " + label;
                })
                .collect(Collectors.joining(" | "));

        // Append a one-line overall verdict
        String verdict;
        switch (status) {
            case FULLY_COMPLIANT: verdict = "All documents valid.";           break;
            case NEAR_EXPIRY:     verdict = "Some documents expiring soon.";  break;
            case NON_COMPLIANT:   verdict = "Action required.";               break;
            default:              verdict = "Status unknown.";                break;
        }

        return docSummary + " — " + verdict;
    }

    /**
     * Map a persisted DetectionHistory entity to its response DTO.
     */
    private DetectionHistoryResponse mapToResponse(
            DetectionHistory h,
            List<DetectionHistoryResponse.DocumentValidationResult> validationResults) {

        Vehicle vehicle = h.getVehicle();
        User owner = h.getOwner();
        Reader reader = h.getReader();
        ScanCenter scanCenter = h.getScanCenter();

        return DetectionHistoryResponse.builder()
                // vehicle
                .id(h.getId())
                .vehicleId(vehicle != null ? vehicle.getId() : null)
                .vehicleRegistrationNumber(vehicle != null ? vehicle.getRegistrationNumber() : null)
                .vehicleEpc(vehicle != null ? vehicle.getEpc() : null)
                .vehicleType(vehicle != null && vehicle.getVehicleType() != null
                        ? VehicleTypeResponse.builder()
                                .id(vehicle.getVehicleType().getId())
                                .name(vehicle.getVehicleType().getName())
                                .description(vehicle.getVehicleType().getDescription())
                                .active(vehicle.getVehicleType().getActive())
                                .deleted(vehicle.getVehicleType().getDeleted())
                                .build()
                        : null)
                .vehicleModel(vehicle != null && vehicle.getVehicleModel() != null
                        ? VehicleModelResponse.builder()
                                .id(vehicle.getVehicleModel().getId())
                                .name(vehicle.getVehicleModel().getName())
                                .description(vehicle.getVehicleModel().getDescription())
                                .active(vehicle.getVehicleModel().getActive())
                                .deleted(vehicle.getVehicleModel().getDeleted())
                                .build()
                        : null)
                // owner
                .ownerId(owner != null ? owner.getId() : null)
                .ownerFullName(owner != null ? owner.getFirstName() + " " + owner.getLastName() : null)
                .ownerContact(owner != null ? owner.getContactNumber() : null)
                .ownerNic(owner != null ? owner.getNic() : null)
                // reader
                .readerId(reader != null ? reader.getId() : null)
                .readerName(reader != null ? reader.getName() : null)
                .readerModel(reader != null ? reader.getModel() : null)
                .readerIpAddress(reader != null ? reader.getIpAddress() : null)
                // scan center
                .scanCenterId(scanCenter != null ? scanCenter.getId() : null)
                .scanCenterName(scanCenter != null ? scanCenter.getName() : null)
                .scanCenterCity(scanCenter != null ? scanCenter.getCity() : null)
                .scanCenterDistrict(scanCenter != null ? scanCenter.getDistrict() : null)
                // compliance
                .complianceStatus(h.getComplianceStatus())
                .complianceMessage(h.getComplianceMessage())
                .description(h.getDescription())
                .comment(h.getComment())
                .documentValidations(validationResults)
                .createdAt(h.getCreatedAt())
                .build();
    }
}





