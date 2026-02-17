package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.RegisterRequest;
import com.example.compliance_service.dto.request.UpdateUserRequest;
import com.example.compliance_service.dto.response.UserResponse;

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
}
