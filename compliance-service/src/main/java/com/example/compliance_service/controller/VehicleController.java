package com.example.compliance_service.controller;

import com.example.compliance_service.dto.request.VehicleRequest;
import com.example.compliance_service.dto.response.ApiResponse;
import com.example.compliance_service.dto.response.VehicleResponse;
import com.example.compliance_service.service.IUserService;
import com.example.compliance_service.service.IVehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final IVehicleService vehicleService;
    private final IUserService userService;

    /**
     * Get all vehicles
     * GET /api/vehicles
     */
    @GetMapping
    public ResponseEntity<?> getAllVehicles() {
        List<VehicleResponse> vehicles = vehicleService.getAllVehicles();
        return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved successfully", vehicles));
    }

    /**
     * Get vehicle by ID
     * GET /api/vehicles/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicleById(@PathVariable Long id) {
        VehicleResponse vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle retrieved successfully", vehicle));
    }

    /**
     * Get vehicle by EPC
     * GET /api/vehicles/epc/{epc}
     */
    @GetMapping("/epc/{epc}")
    public ResponseEntity<?> getVehicleByEpc(@PathVariable String epc) {
        VehicleResponse vehicle = vehicleService.getVehicleByEpc(epc);
        return ResponseEntity.ok(ApiResponse.success("Vehicle retrieved successfully", vehicle));
    }

    /**
     * Get vehicle by registration number
     * GET /api/vehicles/registration/{registrationNumber}
     */
    @GetMapping("/registration/{registrationNumber}")
    public ResponseEntity<?> getVehicleByRegistrationNumber(@PathVariable String registrationNumber) {
        VehicleResponse vehicle = vehicleService.getVehicleByRegistrationNumber(registrationNumber);
        return ResponseEntity.ok(ApiResponse.success("Vehicle retrieved successfully", vehicle));
    }

    /**
     * Get vehicles by owner ID
     * GET /api/vehicles/owner/{ownerId}
     */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getVehiclesByOwnerId(@PathVariable Long ownerId) {
        List<VehicleResponse> vehicles = vehicleService.getVehiclesByOwnerId(ownerId);
        return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved successfully", vehicles));
    }

    /**
     * Search vehicles by vehicle number, registration number, owner name, or NIC.
     * GET /api/vehicles/search?q={query}
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'OWNER', 'SCAN_CENTER_ADMIN', 'SCAN_CENTER_USER')")
    public ResponseEntity<?> searchVehicles(@RequestParam String q) {
        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Search query must not be empty"));
        }
        return ResponseEntity.ok(
                ApiResponse.success("Search completed", userService.searchVehicles(q)));
    }

    /**
     * Create a new vehicle (Admin only)
     * POST /api/vehicles
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'OWNER')")
    public ResponseEntity<?> createVehicle(@Valid @RequestBody VehicleRequest request) {
        VehicleResponse vehicle = vehicleService.createVehicle(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehicle created successfully", vehicle));
    }

    /**
     * Update vehicle (Admin only)
     * PUT /api/vehicles/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'OWNER')")
    public ResponseEntity<?> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request) {
        VehicleResponse vehicle = vehicleService.updateVehicle(id, request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle updated successfully", vehicle));
    }

    /**
     * Delete vehicle (Admin only)
     * PATCH /api/vehicles/{id}/delete
     */
    @PatchMapping("/{id}/delete")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle deleted successfully", null));
    }

    /**
     * Soft delete vehicle (Admin only)
     * PATCH /api/vehicles/{id}
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> softDeleteVehicle(@PathVariable Long id) {
        vehicleService.softDeleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle soft-deleted successfully", null));
    }

    /**
     * Manage vehicle active/inactive status (Admin only)
     * PATCH /api/vehicles/{id}/status?active=true  → activate
     * PATCH /api/vehicles/{id}/status?active=false → deactivate
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> manageVehicleStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        if (active) {
            VehicleResponse vehicle = vehicleService.activateVehicle(id);
            return ResponseEntity.ok(ApiResponse.success("Vehicle activated successfully", vehicle));
        } else {
            VehicleResponse vehicle = vehicleService.deactivateVehicle(id);
            return ResponseEntity.ok(ApiResponse.success("Vehicle deactivated successfully", vehicle));
        }
    }
}
