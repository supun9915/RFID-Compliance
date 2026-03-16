package com.example.compliance_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleUserResponse {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String contactNumber;
    private String nic;
    private String district;
    private String province;
    private Long scanCenterId;
    private String scanCenterName;
    private RoleResponse role;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<VehicleDocumentResponse> vehicleDocumentResponseList;
}
