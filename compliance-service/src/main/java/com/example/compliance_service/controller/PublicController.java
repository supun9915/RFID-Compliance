package com.example.compliance_service.controller;

import com.example.compliance_service.dto.response.ApiResponse;
import com.example.compliance_service.dto.response.RoleResponse;
import com.example.compliance_service.service.IRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final IRoleService roleService;

    /**
     * Get all available roles (Public endpoint for registration)
     * GET /api/public/roles
     */
    @GetMapping("/roles")
    public ResponseEntity<?> getAllRoles() {
        List<RoleResponse> roles = roleService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", roles));
    }

    /**
     * Health check endpoint
     * GET /api/public/health
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Service is running", "OK"));
    }
}
