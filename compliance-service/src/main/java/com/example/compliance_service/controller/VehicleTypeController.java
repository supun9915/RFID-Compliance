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
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
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
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> updateVehicleType(
            @PathVariable Long id,
            @Valid @RequestBody VehicleTypeRequest request) {
        VehicleTypeResponse vehicleType = vehicleTypeService.updateVehicleType(id, request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle type updated successfully", vehicleType));
    }

    /**
     * Delete vehicle type (Admin only)
     * DELETE /api/vehicle-types/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> deleteVehicleType(@PathVariable Long id) {
        vehicleTypeService.deleteVehicleType(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle type deleted successfully", null));
    }
}
