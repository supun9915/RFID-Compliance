package com.example.compliance_service.controller;

import com.example.compliance_service.dto.request.ReaderRequest;
import com.example.compliance_service.dto.response.ApiResponse;
import com.example.compliance_service.dto.response.ReaderResponse;
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
     * Get reader by ID
     * GET /api/readers/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getReaderById(@PathVariable Long id) {
        ReaderResponse reader = readerService.getReaderById(id);
        return ResponseEntity.ok(ApiResponse.success("Reader retrieved successfully", reader));
    }

    /**
     * Get reader by name
     * GET /api/readers/name/{name}
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<?> getReaderByName(@PathVariable String name) {
        ReaderResponse reader = readerService.getReaderByName(name);
        return ResponseEntity.ok(ApiResponse.success("Reader retrieved successfully", reader));
    }

    /**
     * Get reader by IP address
     * GET /api/readers/ip/{ipAddress}
     */
    @GetMapping("/ip/{ipAddress}")
    public ResponseEntity<?> getReaderByIpAddress(@PathVariable String ipAddress) {
        ReaderResponse reader = readerService.getReaderByIpAddress(ipAddress);
        return ResponseEntity.ok(ApiResponse.success("Reader retrieved successfully", reader));
    }

    /**
     * Create a new reader (Admin only)
     * POST /api/readers
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> createReader(@Valid @RequestBody ReaderRequest request) {
        ReaderResponse reader = readerService.createReader(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reader created successfully", reader));
    }

    /**
     * Update reader (Admin only)
     * PUT /api/readers/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> updateReader(
            @PathVariable Long id,
            @Valid @RequestBody ReaderRequest request) {
        ReaderResponse reader = readerService.updateReader(id, request);
        return ResponseEntity.ok(ApiResponse.success("Reader updated successfully", reader));
    }

    /**
     * Delete reader (Admin only)
     * PATCH /api/readers/{id}/delete
     */
    @PatchMapping("/{id}/delete")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> deleteReader(@PathVariable Long id) {
        readerService.deleteReader(id);
        return ResponseEntity.ok(ApiResponse.success("Reader deleted successfully", null));
    }

    /**
     * Soft delete reader (Admin only)
     * PATCH /api/readers/{id}
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> softDeleteReader(@PathVariable Long id) {
        readerService.softDeleteReader(id);
        return ResponseEntity.ok(ApiResponse.success("Reader soft-deleted successfully", null));
    }

    /**
     * Manage reader active/inactive status (Admin only)
     * PATCH /api/readers/{id}/status?active=true  → activate
     * PATCH /api/readers/{id}/status?active=false → deactivate
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
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
}
