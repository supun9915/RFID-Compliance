package com.example.compliance_service.service.impl;

import com.example.compliance_service.security.JwtTokenProvider;
import com.example.compliance_service.service.ITokenBlacklistService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class TokenBlacklistServiceImpl implements ITokenBlacklistService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    // Store token with its expiration time
    private final Map<String, Long> blacklistedTokens = new ConcurrentHashMap<>();

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    public void blacklistToken(String token) {
        try {
            // Extract expiration time from token
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            Date expiration = claims.getExpiration();
            blacklistedTokens.put(token, expiration.getTime());
        } catch (Exception e) {
            // If token is invalid, still add it with current time + 24 hours
            blacklistedTokens.put(token, System.currentTimeMillis() + 86400000);
        }
    }

    @Override
    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.containsKey(token);
    }

    @Override
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void cleanupExpiredTokens() {
        long currentTime = System.currentTimeMillis();
        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue() < currentTime);
    }
}

