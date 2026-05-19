package com.example.compliance_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogUserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String contactNumber;
    private String nic;
    private String district;
    private String province;
    private Boolean active;
    private Boolean deleted;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private RoleResponse role;
    private ScanCenterResponse scanCenter;
}
