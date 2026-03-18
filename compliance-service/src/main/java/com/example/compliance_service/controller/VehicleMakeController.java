package com.example.compliance_service.controller;

import com.example.compliance_service.dto.request.VehicleMakeRequest;
import com.example.compliance_service.dto.response.ApiResponse;
import com.example.compliance_service.dto.response.VehicleMakeResponse;
import com.example.compliance_service.service.IVehicleMakeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle-makes")
@RequiredArgsConstructor
public class VehicleMakeController {

    private final IVehicleMakeService vehicleMakeService;

    /**
     * Get all vehicle makes
     * GET /api/vehicle-makes
     */
    @GetMapping
    public ResponseEntity<?> getAllVehicleMakes() {
        List<VehicleMakeResponse> vehicleMakes = vehicleMakeService.getAllVehicleMakes();
        return ResponseEntity.ok(ApiResponse.success("Vehicle makes retrieved successfully", vehicleMakes));
    }

    /**
     * Get vehicle make by ID
     * GET /api/vehicle-makes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicleMakeById(@PathVariable Long id) {
        VehicleMakeResponse vehicleMake = vehicleMakeService.getVehicleMakeById(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle make retrieved successfully", vehicleMake));
    }

    /**
     * Create a new vehicle make (Admin only)
     * POST /api/vehicle-makes
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> createVehicleMake(@Valid @RequestBody VehicleMakeRequest request) {
        VehicleMakeResponse vehicleMake = vehicleMakeService.createVehicleMake(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehicle make created successfully", vehicleMake));
    }

    /**
     * Update vehicle make (Admin only)
     * PUT /api/vehicle-makes/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> updateVehicleMake(
            @PathVariable Long id,
            @Valid @RequestBody VehicleMakeRequest request) {
        VehicleMakeResponse vehicleMake = vehicleMakeService.updateVehicleMake(id, request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle make updated successfully", vehicleMake));
    }

    /**
     * Delete vehicle make (Admin only)
     * PATCH /api/vehicle-makes/{id}/delete
     */
    @PatchMapping("/{id}/delete")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> deleteVehicleMake(@PathVariable Long id) {
        vehicleMakeService.deleteVehicleMake(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle make deleted successfully", null));
    }

    /**
     * Soft delete vehicle make (Admin only)
     * PATCH /api/vehicle-makes/{id}
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> softDeleteVehicleMake(@PathVariable Long id) {
        vehicleMakeService.softDeleteVehicleMake(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle make soft-deleted successfully", null));
    }

    /**
     * Manage vehicle make active/inactive status (Admin only)
     * PATCH /api/vehicle-makes/{id}/status?active=true  → activate
     * PATCH /api/vehicle-makes/{id}/status?active=false → deactivate
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> manageVehicleMakeStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        if (active) {
            VehicleMakeResponse vehicleMake = vehicleMakeService.activateVehicleMake(id);
            return ResponseEntity.ok(ApiResponse.success("Vehicle make activated successfully", vehicleMake));
        } else {
            VehicleMakeResponse vehicleMake = vehicleMakeService.deactivateVehicleMake(id);
            return ResponseEntity.ok(ApiResponse.success("Vehicle make deactivated successfully", vehicleMake));
        }
    }
}
