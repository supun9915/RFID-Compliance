package com.example.compliance_service.controller;

import com.example.compliance_service.dto.request.DetectionRequest;
import com.example.compliance_service.dto.response.ApiResponse;
import com.example.compliance_service.dto.response.DetectionHistoryResponse;
import com.example.compliance_service.service.IDetectionHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/detections")
@RequiredArgsConstructor
public class DetectionHistoryController {

    private final IDetectionHistoryService detectionHistoryService;

    /**
     * Record a new detection event from an RFID reader.
     * The request must include the EPC of the scanned vehicle tag
     * and either the reader model or reader IP address.
     *
     * POST /api/detections
     */
    @PostMapping
    public ResponseEntity<?> recordDetection(@Valid @RequestBody DetectionRequest request) {
        DetectionHistoryResponse response = detectionHistoryService.recordDetection(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Detection recorded successfully", response));
    }

    /**
     * Get all detection history records.
     * GET /api/detections
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> getAllDetections() {
        List<DetectionHistoryResponse> detections = detectionHistoryService.getAllDetections();
        return ResponseEntity.ok(ApiResponse.success("Detection history retrieved successfully", detections));
    }

    /**
     * Get a single detection record by ID.
     * GET /api/detections/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> getDetectionById(@PathVariable Long id) {
        DetectionHistoryResponse detection = detectionHistoryService.getDetectionById(id);
        return ResponseEntity.ok(ApiResponse.success("Detection record retrieved successfully", detection));
    }

    /**
     * Get all detections for a specific vehicle.
     * GET /api/detections/vehicle/{vehicleId}
     */
    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'OWNER')")
    public ResponseEntity<?> getDetectionsByVehicle(@PathVariable Long vehicleId) {
        List<DetectionHistoryResponse> detections = detectionHistoryService.getDetectionsByVehicleId(vehicleId);
        return ResponseEntity.ok(ApiResponse.success("Detection history retrieved successfully", detections));
    }

    /**
     * Get all detections recorded by a specific reader.
     * GET /api/detections/reader/{readerId}
     */
    @GetMapping("/reader/{readerId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> getDetectionsByReader(@PathVariable Long readerId) {
        List<DetectionHistoryResponse> detections = detectionHistoryService.getDetectionsByReaderId(readerId);
        return ResponseEntity.ok(ApiResponse.success("Detection history retrieved successfully", detections));
    }

    /**
     * Get all detections filtered by compliance status.
     * GET /api/detections/status/{status}
     * Valid statuses: FULLY_COMPLIANT, NEAR_EXPIRY, NON_COMPLIANT, UNKNOWN
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> getDetectionsByStatus(@PathVariable String status) {
        List<DetectionHistoryResponse> detections = detectionHistoryService.getDetectionsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Detection history retrieved successfully", detections));
    }
}

