package com.example.compliance_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private RoleResponse role;
    private ScanCenterResponse scanCenter;

}
