package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.RegisterRequest;
import com.example.compliance_service.dto.request.UpdateUserRequest;
import com.example.compliance_service.dto.request.VehicleOwnerRequest;
import com.example.compliance_service.dto.response.OwnerUserResponse;
import com.example.compliance_service.dto.response.UserResponse;
import com.example.compliance_service.dto.response.VehicleUserResponse;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

/**
 * Service interface for user management operations
 */
public interface IUserService {

    /**
     * Search users by dynamic filters
     * @param params Map of field names and values to filter by
     * @return List of matching users
     */
    List<UserResponse> getUsers(Map<String, Object> params);

    /**
     * Get owner (vehicle owner) users with all their assigned vehicles and document details
     * @param params Map of field names and values to filter by
     * @return List of owner users with vehicles and documents
     */
    List<OwnerUserResponse> getOwnerUsers(Map<String, Object> params);

    /**
     * Get user by username
     * @param username Username
     * @return User details
     */
    UserResponse getUserByUsername(String username);

    /**
     * Create a new user
     * @param request User creation details
     * @return Created user details
     */
    UserResponse createUser(RegisterRequest request);

    /**
     * Update an existing user
     * @param id User ID
     * @param request Update details
     * @return Updated user details
     */
    UserResponse updateUser(Long id, UpdateUserRequest request);

    /**
     * Delete a user
     * @param id User ID
     */
    void deleteUser(Long id);

    VehicleUserResponse createOwnerUser(Long id, @Valid VehicleOwnerRequest vehicleOwnerRequest);

    VehicleUserResponse updateOwnerUser(Long vehicleId, @Valid VehicleOwnerRequest vehicleOwnerRequest);

    VehicleUserResponse getUserById(Long id);
}
