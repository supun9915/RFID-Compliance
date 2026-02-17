package com.example.compliance_service.controller;

import com.example.compliance_service.dto.request.DocumentRequest;
import com.example.compliance_service.dto.response.ApiResponse;
import com.example.compliance_service.dto.response.DocumentResponse;
import com.example.compliance_service.service.IDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final IDocumentService documentService;

    /**
     * Get all documents
     * GET /api/documents
     */
    @GetMapping
    public ResponseEntity<?> getAllDocuments() {
        List<DocumentResponse> documents = documentService.getAllDocuments();
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved successfully", documents));
    }

    /**
     * Get document by ID
     * GET /api/documents/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDocumentById(@PathVariable Long id) {
        DocumentResponse document = documentService.getDocumentById(id);
        return ResponseEntity.ok(ApiResponse.success("Document retrieved successfully", document));
    }

    /**
     * Get documents by vehicle ID
     * GET /api/documents/vehicle/{vehicleId}
     */
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<?> getDocumentsByVehicleId(@PathVariable Long vehicleId) {
        List<DocumentResponse> documents = documentService.getDocumentsByVehicleId(vehicleId);
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved successfully", documents));
    }

    /**
     * Get documents by document type ID
     * GET /api/documents/type/{documentTypeId}
     */
    @GetMapping("/type/{documentTypeId}")
    public ResponseEntity<?> getDocumentsByDocumentTypeId(@PathVariable Long documentTypeId) {
        List<DocumentResponse> documents = documentService.getDocumentsByDocumentTypeId(documentTypeId);
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved successfully", documents));
    }

    /**
     * Get expired documents by vehicle ID
     * GET /api/documents/vehicle/{vehicleId}/expired
     */
    @GetMapping("/vehicle/{vehicleId}/expired")
    public ResponseEntity<?> getExpiredDocumentsByVehicleId(@PathVariable Long vehicleId) {
        List<DocumentResponse> documents = documentService.getExpiredDocumentsByVehicleId(vehicleId);
        return ResponseEntity.ok(ApiResponse.success("Expired documents retrieved successfully", documents));
    }

    /**
     * Get valid documents by vehicle ID
     * GET /api/documents/vehicle/{vehicleId}/valid
     */
    @GetMapping("/vehicle/{vehicleId}/valid")
    public ResponseEntity<?> getValidDocumentsByVehicleId(@PathVariable Long vehicleId) {
        List<DocumentResponse> documents = documentService.getValidDocumentsByVehicleId(vehicleId);
        return ResponseEntity.ok(ApiResponse.success("Valid documents retrieved successfully", documents));
    }

    /**
     * Get documents expiring soon
     * GET /api/documents/expiring-soon?days=30
     */
    @GetMapping("/expiring-soon")
    public ResponseEntity<?> getDocumentsExpiringSoon(@RequestParam(defaultValue = "30") int days) {
        List<DocumentResponse> documents = documentService.getDocumentsExpiringSoon(days);
        return ResponseEntity.ok(ApiResponse.success("Documents expiring soon retrieved successfully", documents));
    }

    /**
     * Create a new document (Admin only)
     * POST /api/documents
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> createDocument(@Valid @RequestBody DocumentRequest request) {
        DocumentResponse document = documentService.createDocument(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document created successfully", document));
    }

    /**
     * Update document (Admin only)
     * PUT /api/documents/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> updateDocument(
            @PathVariable Long id,
            @Valid @RequestBody DocumentRequest request) {
        DocumentResponse document = documentService.updateDocument(id, request);
        return ResponseEntity.ok(ApiResponse.success("Document updated successfully", document));
    }

    /**
     * Delete document (Admin only)
     * DELETE /api/documents/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }
}
