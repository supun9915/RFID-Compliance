package com.example.compliance_service.controller;

import com.example.compliance_service.dto.request.DocumentTypeRequest;
import com.example.compliance_service.dto.response.ApiResponse;
import com.example.compliance_service.dto.response.DocumentTypeResponse;
import com.example.compliance_service.service.IDocumentTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/document-types")
@RequiredArgsConstructor
public class DocumentTypeController {

    private final IDocumentTypeService documentTypeService;

    /**
     * Get all document types
     * GET /api/document-types
     */
    @GetMapping
    public ResponseEntity<?> getAllDocumentTypes() {
        List<DocumentTypeResponse> documentTypes = documentTypeService.getAllDocumentTypes();
        return ResponseEntity.ok(ApiResponse.success("Document types retrieved successfully", documentTypes));
    }

    /**
     * Get document type by ID
     * GET /api/document-types/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDocumentTypeById(@PathVariable Long id) {
        DocumentTypeResponse documentType = documentTypeService.getDocumentTypeById(id);
        return ResponseEntity.ok(ApiResponse.success("Document type retrieved successfully", documentType));
    }

    /**
     * Create a new document type (Admin only)
     * POST /api/document-types
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> createDocumentType(@Valid @RequestBody DocumentTypeRequest request) {
        DocumentTypeResponse documentType = documentTypeService.createDocumentType(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document type created successfully", documentType));
    }

    /**
     * Update document type (Admin only)
     * PUT /api/document-types/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> updateDocumentType(
            @PathVariable Long id,
            @Valid @RequestBody DocumentTypeRequest request) {
        DocumentTypeResponse documentType = documentTypeService.updateDocumentType(id, request);
        return ResponseEntity.ok(ApiResponse.success("Document type updated successfully", documentType));
    }

    /**
     * Delete document type (Admin only)
     * PATCH /api/document-types/{id}/delete
     */
    @PatchMapping("/{id}/delete")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> deleteDocumentType(@PathVariable Long id) {
        documentTypeService.deleteDocumentType(id);
        return ResponseEntity.ok(ApiResponse.success("Document type deleted successfully", null));
    }

    /**
     * Soft delete document type (Admin only)
     * PATCH /api/document-types/{id}
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> softDeleteDocumentType(@PathVariable Long id) {
        documentTypeService.softDeleteDocumentType(id);
        return ResponseEntity.ok(ApiResponse.success("Document type soft-deleted successfully", null));
    }

    /**
     * Manage document type active/inactive status (Admin only)
     * PATCH /api/document-types/{id}/status?active=true  → activate
     * PATCH /api/document-types/{id}/status?active=false → deactivate
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> manageDocumentTypeStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        if (active) {
            DocumentTypeResponse documentType = documentTypeService.activateDocumentType(id);
            return ResponseEntity.ok(ApiResponse.success("Document type activated successfully", documentType));
        } else {
            DocumentTypeResponse documentType = documentTypeService.deactivateDocumentType(id);
            return ResponseEntity.ok(ApiResponse.success("Document type deactivated successfully", documentType));
        }
    }
}
