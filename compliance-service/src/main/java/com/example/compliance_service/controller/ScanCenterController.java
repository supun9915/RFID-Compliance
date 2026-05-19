package com.example.compliance_service.controller;

import com.example.compliance_service.dto.request.ScanCenterRequest;
import com.example.compliance_service.dto.response.ApiResponse;
import com.example.compliance_service.dto.response.ScanCenterResponse;
import com.example.compliance_service.service.IScanCenterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scan-centers")
@RequiredArgsConstructor
public class ScanCenterController {

    private final IScanCenterService scanCenterService;

    /**
     * Get all scan centers
     * GET /api/scan-centers
     */
    @GetMapping
    public ResponseEntity<?> getAllScanCenters() {
        List<ScanCenterResponse> scanCenters = scanCenterService.getAllScanCenters();
        return ResponseEntity.ok(ApiResponse.success("Scan centers retrieved successfully", scanCenters));
    }

    /**
     * Get all active scan centers
     * GET /api/scan-centers/active
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveScanCenters() {
        List<ScanCenterResponse> scanCenters = scanCenterService.getActiveScanCenters();
        return ResponseEntity.ok(ApiResponse.success("Active scan centers retrieved successfully", scanCenters));
    }

    /**
     * Get scan center by ID
     * GET /api/scan-centers/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getScanCenterById(@PathVariable Long id) {
        ScanCenterResponse scanCenter = scanCenterService.getScanCenterById(id);
        return ResponseEntity.ok(ApiResponse.success("Scan center retrieved successfully", scanCenter));
    }

    /**
     * Get scan center by name
     * GET /api/scan-centers/name/{name}
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<?> getScanCenterByName(@PathVariable String name) {
        ScanCenterResponse scanCenter = scanCenterService.getScanCenterByName(name);
        return ResponseEntity.ok(ApiResponse.success("Scan center retrieved successfully", scanCenter));
    }

    /**
     * Create a new scan center (Admin only)
     * POST /api/scan-centers
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> createScanCenter(@Valid @RequestBody ScanCenterRequest request) {
        ScanCenterResponse scanCenter = scanCenterService.createScanCenter(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Scan center created successfully", scanCenter));
    }

    /**
     * Update scan center (Admin only)
     * PUT /api/scan-centers/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> updateScanCenter(
            @PathVariable Long id,
            @Valid @RequestBody ScanCenterRequest request) {
        ScanCenterResponse scanCenter = scanCenterService.updateScanCenter(id, request);
        return ResponseEntity.ok(ApiResponse.success("Scan center updated successfully", scanCenter));
    }

    /**
     * Delete scan center (Admin only)
     * PATCH /api/scan-centers/{id}/delete
     */
    @PatchMapping("/{id}/delete")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> deleteScanCenter(@PathVariable Long id) {
        scanCenterService.deleteScanCenter(id);
        return ResponseEntity.ok(ApiResponse.success("Scan center deleted successfully", null));
    }

    /**
     * Soft delete scan center (Admin only)
     * PATCH /api/scan-centers/{id}
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> softDeleteScanCenter(@PathVariable Long id) {
        scanCenterService.softDeleteScanCenter(id);
        return ResponseEntity.ok(ApiResponse.success("Scan center soft-deleted successfully", null));
    }

    /**
     * Manage scan center active/inactive status (Admin only)
     * PATCH /api/scan-centers/{id}/status?active=true  → activate
     * PATCH /api/scan-centers/{id}/status?active=false → deactivate
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> manageScanCenterStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        if (active) {
            ScanCenterResponse scanCenter = scanCenterService.activateScanCenter(id);
            return ResponseEntity.ok(ApiResponse.success("Scan center activated successfully", scanCenter));
        } else {
            ScanCenterResponse scanCenter = scanCenterService.deactivateScanCenter(id);
            return ResponseEntity.ok(ApiResponse.success("Scan center deactivated successfully", scanCenter));
        }
    }
}

