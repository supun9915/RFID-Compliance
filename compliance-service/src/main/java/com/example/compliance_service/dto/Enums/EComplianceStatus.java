package com.example.compliance_service.dto.Enums;

public enum EComplianceStatus {
    VALID,          // All documents valid
    NEAR_EXPIRY,              // documents about to expire
    EXPIRED,            // document expired
    UNKNOWN
}
