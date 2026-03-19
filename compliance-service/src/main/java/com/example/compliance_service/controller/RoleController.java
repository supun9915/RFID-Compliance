package com.example.compliance_service.controller;

import com.example.compliance_service.dto.request.RoleRequest;
import com.example.compliance_service.dto.response.ApiResponse;
import com.example.compliance_service.dto.response.RoleResponse;
import com.example.compliance_service.service.IRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final IRoleService roleService;

    /**
     * Get all roles
     * GET /api/roles
     */
    @GetMapping
    public ResponseEntity<?> getAllRoles() {
        List<RoleResponse> roles = roleService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", roles));
    }

    /**
     * Get role by ID
     * GET /api/roles/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getRoleById(@PathVariable Long id) {
        RoleResponse role = roleService.getRoleById(id);
        return ResponseEntity.ok(ApiResponse.success("Role retrieved successfully", role));
    }

    /**
     * Create a new role (SuperAdmin only)
     * POST /api/roles
     */
    @PostMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> createRole(@Valid @RequestBody RoleRequest request) {
        RoleResponse role = roleService.createRole(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Role created successfully", role));
    }

    /**
     * Update role (SuperAdmin only)
     * PUT /api/roles/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleRequest request) {
        RoleResponse role = roleService.updateRole(id, request);
        return ResponseEntity.ok(ApiResponse.success("Role updated successfully", role));
    }

    /**
     * Delete role (SuperAdmin only)
     * PATCH /api/roles/{id}/delete
     */
    @PatchMapping("/{id}/delete")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok(ApiResponse.success("Role deleted successfully", null));
    }

    /**
     * Soft delete role (SuperAdmin only)
     * PATCH /api/roles/{id}
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> softDeleteRole(@PathVariable Long id) {
        roleService.softDeleteRole(id);
        return ResponseEntity.ok(ApiResponse.success("Role soft-deleted successfully", null));
    }

    /**
     * Manage role active/inactive status (SuperAdmin only)
     * PATCH /api/roles/{id}/status?active=true  → activate
     * PATCH /api/roles/{id}/status?active=false → deactivate
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> manageRoleStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        if (active) {
            RoleResponse role = roleService.activateRole(id);
            return ResponseEntity.ok(ApiResponse.success("Role activated successfully", role));
        } else {
            RoleResponse role = roleService.deactivateRole(id);
            return ResponseEntity.ok(ApiResponse.success("Role deactivated successfully", role));
        }
    }
}
