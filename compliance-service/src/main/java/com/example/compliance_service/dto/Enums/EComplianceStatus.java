package com.example.compliance_service.dto.Enums;

public enum EComplianceStatus {
    FULLY_COMPLIANT,          // All documents valid
    NEAR_EXPIRY,              // documents about to expire
    NON_COMPLIANT,            // document expired
    UNKNOWN
}
