package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.RoleRequest;
import com.example.compliance_service.dto.response.RoleResponse;

import java.util.List;

/**
 * Service interface for role management operations
 */
public interface IRoleService {

    /**
     * Get all available roles
     * @return List of all roles
     */
    List<RoleResponse> getAllRoles();

    /**
     * Get role by ID
     * @param id Role ID
     * @return Role details
     */
    RoleResponse getRoleById(Long id);

    /**
     * Create a new role
     * @param request Role creation details
     * @return Created role details
     */
    RoleResponse createRole(RoleRequest request);

    /**
     * Update an existing role
     * @param id Role ID
     * @param request Update details
     * @return Updated role details
     */
    RoleResponse updateRole(Long id, RoleRequest request);

    /**
     * Delete a role
     * @param id Role ID
     */
    void deleteRole(Long id);

    /**
     * Activate a role
     * @param id Role ID
     * @return Activated role details
     */
    RoleResponse activateRole(Long id);

    /**
     * Deactivate a role
     * @param id Role ID
     * @return Deactivated role details
     */
    RoleResponse deactivateRole(Long id);

    /**
     * Soft delete a role
     * @param id Role ID
     */
    void softDeleteRole(Long id);
}
