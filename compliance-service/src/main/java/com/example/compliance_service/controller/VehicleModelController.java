package com.example.compliance_service.controller;

import com.example.compliance_service.dto.request.VehicleModelRequest;
import com.example.compliance_service.dto.response.ApiResponse;
import com.example.compliance_service.dto.response.VehicleModelResponse;
import com.example.compliance_service.service.IVehicleModelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle-models")
@RequiredArgsConstructor
public class VehicleModelController {

    private final IVehicleModelService vehicleModelService;

    /**
     * Get all vehicle models
     * GET /api/vehicle-models
     */
    @GetMapping
    public ResponseEntity<?> getAllVehicleModels() {
        List<VehicleModelResponse> vehicleModels = vehicleModelService.getAllVehicleModels();
        return ResponseEntity.ok(ApiResponse.success("Vehicle models retrieved successfully", vehicleModels));
    }

    /**
     * Get vehicle models by make ID
     * GET /api/vehicle-models/make/{makeId}
     */
    @GetMapping("/make/{makeId}")
    public ResponseEntity<?> getVehicleModelsByMakeId(@PathVariable Long makeId) {
        List<VehicleModelResponse> vehicleModels = vehicleModelService.getVehicleModelsByMakeId(makeId);
        return ResponseEntity.ok(ApiResponse.success("Vehicle models retrieved successfully", vehicleModels));
    }

    /**
     * Get vehicle model by ID
     * GET /api/vehicle-models/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicleModelById(@PathVariable Long id) {
        VehicleModelResponse vehicleModel = vehicleModelService.getVehicleModelById(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle model retrieved successfully", vehicleModel));
    }

    /**
     * Create a new vehicle model (Admin only)
     * POST /api/vehicle-models
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> createVehicleModel(@Valid @RequestBody VehicleModelRequest request) {
        VehicleModelResponse vehicleModel = vehicleModelService.createVehicleModel(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehicle model created successfully", vehicleModel));
    }

    /**
     * Update vehicle model (Admin only)
     * PUT /api/vehicle-models/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> updateVehicleModel(
            @PathVariable Long id,
            @Valid @RequestBody VehicleModelRequest request) {
        VehicleModelResponse vehicleModel = vehicleModelService.updateVehicleModel(id, request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle model updated successfully", vehicleModel));
    }

    /**
     * Delete vehicle model (Admin only)
     * PATCH /api/vehicle-models/{id}/delete
     */
    @PatchMapping("/{id}/delete")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> deleteVehicleModel(@PathVariable Long id) {
        vehicleModelService.deleteVehicleModel(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle model deleted successfully", null));
    }

    /**
     * Soft delete vehicle model (Admin only)
     * PATCH /api/vehicle-models/{id}
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> softDeleteVehicleModel(@PathVariable Long id) {
        vehicleModelService.softDeleteVehicleModel(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle model soft-deleted successfully", null));
    }

    /**
     * Manage vehicle model active/inactive status (Admin only)
     * PATCH /api/vehicle-models/{id}/status?active=true  → activate
     * PATCH /api/vehicle-models/{id}/status?active=false → deactivate
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> manageVehicleModelStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        if (active) {
            VehicleModelResponse vehicleModel = vehicleModelService.activateVehicleModel(id);
            return ResponseEntity.ok(ApiResponse.success("Vehicle model activated successfully", vehicleModel));
        } else {
            VehicleModelResponse vehicleModel = vehicleModelService.deactivateVehicleModel(id);
            return ResponseEntity.ok(ApiResponse.success("Vehicle model deactivated successfully", vehicleModel));
        }
    }
}
