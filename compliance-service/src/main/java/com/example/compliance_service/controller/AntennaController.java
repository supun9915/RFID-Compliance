package com.example.compliance_service.controller;

import com.example.compliance_service.dto.request.AntennaRequest;
import com.example.compliance_service.dto.response.AntennaResponse;
import com.example.compliance_service.dto.response.ApiResponse;
import com.example.compliance_service.service.IAntennaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/antennas")
@RequiredArgsConstructor
public class AntennaController {

    private final IAntennaService antennaService;

    /**
     * Get all antennas
     * GET /api/antennas
     */
    @GetMapping
    public ResponseEntity<?> getAllAntennas() {
        List<AntennaResponse> antennas = antennaService.getAllAntennas();
        return ResponseEntity.ok(ApiResponse.success("Antennas retrieved successfully", antennas));
    }

    /**
     * Get antenna by ID
     * GET /api/antennas/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAntennaById(@PathVariable Long id) {
        AntennaResponse antenna = antennaService.getAntennaById(id);
        return ResponseEntity.ok(ApiResponse.success("Antenna retrieved successfully", antenna));
    }

    /**
     * Get antennas by reader ID
     * GET /api/antennas/reader/{readerId}
     */
    @GetMapping("/reader/{readerId}")
    public ResponseEntity<?> getAntennasByReaderId(@PathVariable Long readerId) {
        List<AntennaResponse> antennas = antennaService.getAntennasByReaderId(readerId);
        return ResponseEntity.ok(ApiResponse.success("Antennas retrieved successfully", antennas));
    }

    /**
     * Create a new antenna (Admin only)
     * POST /api/antennas
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> createAntenna(@Valid @RequestBody AntennaRequest request) {
        AntennaResponse antenna = antennaService.createAntenna(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Antenna created successfully", antenna));
    }

    /**
     * Update antenna (Admin only)
     * PUT /api/antennas/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> updateAntenna(
            @PathVariable Long id,
            @Valid @RequestBody AntennaRequest request) {
        AntennaResponse antenna = antennaService.updateAntenna(id, request);
        return ResponseEntity.ok(ApiResponse.success("Antenna updated successfully", antenna));
    }

    /**
     * Delete antenna (Admin only)
     * DELETE /api/antennas/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> deleteAntenna(@PathVariable Long id) {
        antennaService.deleteAntenna(id);
        return ResponseEntity.ok(ApiResponse.success("Antenna deleted successfully", null));
    }
}
