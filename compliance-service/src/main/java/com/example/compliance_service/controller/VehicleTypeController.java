package com.example.compliance_service.controller;

import com.example.compliance_service.dto.request.VehicleTypeRequest;
import com.example.compliance_service.dto.response.ApiResponse;
import com.example.compliance_service.dto.response.VehicleTypeResponse;
import com.example.compliance_service.service.IVehicleTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle-types")
@RequiredArgsConstructor
public class VehicleTypeController {

    private final IVehicleTypeService vehicleTypeService;

    /**
     * Get all vehicle types
     * GET /api/vehicle-types
     */
    @GetMapping
    public ResponseEntity<?> getAllVehicleTypes() {
        List<VehicleTypeResponse> vehicleTypes = vehicleTypeService.getAllVehicleTypes();
        return ResponseEntity.ok(ApiResponse.success("Vehicle types retrieved successfully", vehicleTypes));
    }

    /**
     * Get vehicle type by ID
     * GET /api/vehicle-types/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicleTypeById(@PathVariable Long id) {
        VehicleTypeResponse vehicleType = vehicleTypeService.getVehicleTypeById(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle type retrieved successfully", vehicleType));
    }

    /**
     * Create a new vehicle type (Admin only)
     * POST /api/vehicle-types
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> createVehicleType(@Valid @RequestBody VehicleTypeRequest request) {
        VehicleTypeResponse vehicleType = vehicleTypeService.createVehicleType(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehicle type created successfully", vehicleType));
    }

    /**
     * Update vehicle type (Admin only)
     * PUT /api/vehicle-types/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> updateVehicleType(
            @PathVariable Long id,
            @Valid @RequestBody VehicleTypeRequest request) {
        VehicleTypeResponse vehicleType = vehicleTypeService.updateVehicleType(id, request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle type updated successfully", vehicleType));
    }

    /**
     * Delete vehicle type (Admin only)
     * PATCH /api/vehicle-types/{id}/delete
     */
    @PatchMapping("/{id}/delete")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> deleteVehicleType(@PathVariable Long id) {
        vehicleTypeService.deleteVehicleType(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle type deleted successfully", null));
    }

    /**
     * Soft delete vehicle type (Admin only)
     * PATCH /api/vehicle-types/{id}
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> softDeleteVehicleType(@PathVariable Long id) {
        vehicleTypeService.softDeleteVehicleType(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle type soft-deleted successfully", null));
    }

    /**
     * Manage vehicle type active/inactive status (Admin only)
     * PATCH /api/vehicle-types/{id}/status?active=true  → activate
     * PATCH /api/vehicle-types/{id}/status?active=false → deactivate
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> manageVehicleTypeStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        if (active) {
            VehicleTypeResponse vehicleType = vehicleTypeService.activateVehicleType(id);
            return ResponseEntity.ok(ApiResponse.success("Vehicle type activated successfully", vehicleType));
        } else {
            VehicleTypeResponse vehicleType = vehicleTypeService.deactivateVehicleType(id);
            return ResponseEntity.ok(ApiResponse.success("Vehicle type deactivated successfully", vehicleType));
        }
    }
}
