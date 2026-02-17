package com.example.compliance_service.service;

import com.example.compliance_service.dto.request.LoginRequest;
import com.example.compliance_service.dto.request.RegisterRequest;
import com.example.compliance_service.dto.response.AuthResponse;

/**
 * Service interface for authentication operations
 */
public interface IAuthService {

    /**
     * Register a new user
     * @param request Registration details
     * @return Authentication response with JWT token
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Authenticate user and generate JWT token
     * @param request Login credentials
     * @return Authentication response with JWT token
     */
    AuthResponse login(LoginRequest request);
}
