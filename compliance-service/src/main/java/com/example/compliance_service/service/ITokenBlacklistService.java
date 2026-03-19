package com.example.compliance_service.service;

/**
 * Service interface for managing blacklisted tokens
 */
public interface ITokenBlacklistService {

    /**
     * Add token to blacklist
     * @param token JWT token to blacklist
     */
    void blacklistToken(String token);

    /**
     * Check if token is blacklisted
     * @param token JWT token to check
     * @return true if token is blacklisted, false otherwise
     */
    boolean isTokenBlacklisted(String token);

    /**
     * Remove expired tokens from blacklist
     */
    void cleanupExpiredTokens();
}
