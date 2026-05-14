package com.example.compliance_service.controller;

import com.example.compliance_service.dto.request.ReadersRequest;
import com.example.compliance_service.dto.request.ReaderCommandRequest;
import com.example.compliance_service.dto.response.ApiResponse;
import com.example.compliance_service.dto.response.ReaderResponse;
import com.example.compliance_service.dto.response.ReaderCommandResponse;
import com.example.compliance_service.service.IReaderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/readers")
@RequiredArgsConstructor
public class ReaderController {

    private final IReaderService readerService;

    /**
     * Get all readers
     * GET /api/readers
     */
    @GetMapping
    public ResponseEntity<?> getAllReaders() {
        List<ReaderResponse> readers = readerService.getAllReaders();
        return ResponseEntity.ok(ApiResponse.success("Readers retrieved successfully", readers));
    }

    /**
     * Manage reader active/inactive status (Admin only)
     * PATCH /api/readers/{id}/status?active=true  → activate
     * PATCH /api/readers/{id}/status?active=false → deactivate
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> manageReaderStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        if (active) {
            ReaderResponse reader = readerService.activateReader(id);
            return ResponseEntity.ok(ApiResponse.success("Reader activated successfully", reader));
        } else {
            ReaderResponse reader = readerService.deactivateReader(id);
            return ResponseEntity.ok(ApiResponse.success("Reader deactivated successfully", reader));
        }
    }

    // ── Scan-center-scoped endpoints ───────────────────────────────────────────

    /**
     * Get all readers for a scan center
     * GET /api/readers/scan-center/{scanCenterId}
     */
    @GetMapping("/scan-center/{scanCenterId}")
    public ResponseEntity<?> getReadersByScanCenter(@PathVariable Long scanCenterId) {
        List<ReaderResponse> readers = readerService.getReadersByScanCenter(scanCenterId);
        return ResponseEntity.ok(ApiResponse.success("Readers retrieved successfully", readers));
    }

    /**
     * Get a single reader by ID within a scan center
     * GET /api/readers/scan-center/{scanCenterId}/{readerId}
     */
    @GetMapping("/scan-center/{scanCenterId}/{readerId}")
    public ResponseEntity<?> getReaderByScanCenterAndId(
            @PathVariable Long scanCenterId,
            @PathVariable Long readerId) {
        ReaderResponse reader = readerService.getReaderByScanCenterAndId(scanCenterId, readerId);
        return ResponseEntity.ok(ApiResponse.success("Reader retrieved successfully", reader));
    }

    /**
     * Create a reader for a specific scan center (Admin only)
     * POST /api/readers/scan-center/{scanCenterId}
     */
    @PostMapping("/scan-center/{scanCenterId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'SCAN_CENTER_ADMIN')")
    public ResponseEntity<?> createReaderForScanCenter(
            @PathVariable Long scanCenterId,
            @Valid @RequestBody ReadersRequest request) {
        ReaderResponse reader = readerService.createReaderForScanCenter(scanCenterId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reader created successfully", reader));
    }

    /**
     * Update a reader that belongs to a specific scan center (Admin only)
     * PUT /api/readers/scan-center/{scanCenterId}/{readerId}
     */
    @PutMapping("/scan-center/{scanCenterId}/{readerId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'SCAN_CENTER_ADMIN')")
    public ResponseEntity<?> updateReaderForScanCenter(
            @PathVariable Long scanCenterId,
            @PathVariable Long readerId,
            @Valid @RequestBody ReadersRequest request) {
        ReaderResponse reader = readerService.updateReaderForScanCenter(scanCenterId, readerId, request);
        return ResponseEntity.ok(ApiResponse.success("Reader updated successfully", reader));
    }

    /**
     * Soft-delete a reader that belongs to a specific scan center (Admin only)
     * DELETE /api/readers/scan-center/{scanCenterId}/{readerId}
     */
    @DeleteMapping("/scan-center/{scanCenterId}/{readerId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'SCAN_CENTER_ADMIN')")
    public ResponseEntity<?> deleteReaderForScanCenter(
            @PathVariable Long scanCenterId,
            @PathVariable Long readerId) {
        readerService.deleteReaderForScanCenter(scanCenterId, readerId);
        return ResponseEntity.ok(ApiResponse.success("Reader deleted successfully", null));
    }

    /**
     * Send a start or stop command to a reader via MQTT.
     * POST /api/readers/{readerId}/command
     *
     * Request body:
     * {
     *   "commandId": "abcd1234",
     *   "command":   "start" | "stop"
     * }
     */
    @PostMapping("/{readerId}/command")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'SCAN_CENTER_ADMIN')")
    public ResponseEntity<?> sendReaderCommand(
            @PathVariable Long readerId,
            @Valid @RequestBody ReaderCommandRequest request) {
        ReaderCommandResponse response = readerService.sendReaderCommand(readerId, request);
        return ResponseEntity.ok(ApiResponse.success("Reader command processed", response));
    }
}
