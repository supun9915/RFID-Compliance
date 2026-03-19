package com.example.compliance_service.controller;

import com.example.compliance_service.dto.response.VehicleDocumentResponse;
import com.example.compliance_service.dto.request.RegisterRequest;
import com.example.compliance_service.dto.request.UpdateUserRequest;
import com.example.compliance_service.dto.request.VehicleOwnerRequest;
import com.example.compliance_service.dto.response.ApiResponse;
import com.example.compliance_service.dto.response.OwnerUserResponse;
import com.example.compliance_service.dto.response.UserResponse;
import com.example.compliance_service.dto.response.VehicleUserResponse;
import com.example.compliance_service.service.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    /**
     * Search/filter users by query parameters (Admin only)
     * GET /api/users?id=1&username=john&email=john@example.com&firstName=John&lastName=Doe
     * GET /api/users?role=OWNER  — returns owner users with all assigned vehicles and documents
     * Any parameter matching User entity field will be used for filtering
     * If no params provided, returns all users
     */
    @GetMapping
    public ResponseEntity<?> getUsers(@RequestParam Map<String, Object> params) {
        if (params.containsKey("role")) {
            List<String> roles = Arrays.stream(params.get("role").toString().split(","))
                    .map(String::trim)
                    .map(String::toUpperCase)
                    .filter(r -> !r.isEmpty())
                    .collect(Collectors.toList());

            // Replace the raw string with the parsed list so the service can use it
            params.put("role", roles);

            if (roles.size() == 1 && "OWNER".equals(roles.get(0))) {
                List<OwnerUserResponse> owners = userService.getOwnerUsers(params);
                return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", owners));
            }
        }
        List<UserResponse> users = userService.getUsers(params);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    /**
     * Get current logged-in user profile
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserResponse user = userService.getUserByUsername(username);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", user));
    }

    /**
     * Create a new user (SuperAdmin, System Admin or Admin only)
     * POST /api/users
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = userService.createUser(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", user));
    }

    /**
     * Create a new vehicle owner user (SuperAdmin, System Admin or Admin only)
     * POST /api/users/owner/{id}
     */
    @PostMapping("/owner/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> createOwnerUser( @PathVariable Long id, @Valid @RequestBody VehicleOwnerRequest vehicleOwnerRequest) {
        VehicleUserResponse vehicleUserResponse = userService.createOwnerUser(id , vehicleOwnerRequest);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Owner user created successfully", vehicleUserResponse));
    }

    /**
     * Update a new vehicle owner user (SuperAdmin, System Admin or Admin only)
     * PUT /api/users/owner/{id}
     */
    @PutMapping("/owner/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> updateOwnerUser( @PathVariable Long id, @Valid @RequestBody VehicleOwnerRequest vehicleOwnerRequest) {
        VehicleUserResponse vehicleUserResponse = userService.updateOwnerUser(id , vehicleOwnerRequest);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Owner user updated successfully", vehicleUserResponse));
    }

    /**
     * Remove a vehicle from an owner user (SuperAdmin, System Admin or Admin only)
     * Clears the vehicle's owner and sets it as inactive.
     * PATCH /api/users/{userId}/vehicles/{vehicleId}/remove
     */
    @PatchMapping("/{userId}/vehicles/{vehicleId}/remove")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> removeVehicleFromOwner(
            @PathVariable Long userId,
            @PathVariable Long vehicleId) {
        VehicleDocumentResponse response = userService.removeVehicleFromOwner(userId, vehicleId);
        return ResponseEntity.ok(ApiResponse.success("Vehicle removed from owner successfully", response));
    }

    /**
     * Get user details by ID
     * POST /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        VehicleUserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    /**
     * Update user (SuperAdmin, System Admin or Admin only)
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse user = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
    }

    /**
     * Delete user (SuperAdmin or System Admin only)
     * PATCH /api/users/{id}/delete
     */
    @PatchMapping("/{id}/delete")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    /**
     * Soft delete user (SuperAdmin or System Admin only)
     * PATCH /api/users/{id}
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> softDeleteUser(@PathVariable Long id) {
        userService.softDeleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User soft-deleted successfully", null));
    }

    /**
     * Manage user active/inactive status (SuperAdmin or System Admin only)
     * PATCH /api/users/{id}/status?active=true  → activate
     * PATCH /api/users/{id}/status?active=false → deactivate
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> manageUserStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        if (active) {
            UserResponse user = userService.activateUser(id);
            return ResponseEntity.ok(ApiResponse.success("User activated successfully", user));
        } else {
            UserResponse user = userService.deactivateUser(id);
            return ResponseEntity.ok(ApiResponse.success("User deactivated successfully", user));
        }
    }
}
