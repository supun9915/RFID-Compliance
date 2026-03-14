package com.example.compliance_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {

    private Long id;
    private VehicleTypeResponse vehicleType;
    private VehicleModelResponse vehicleModel;
    private UserResponse owner;
    private String registrationNumber;
    private String vehicleNumber;
    private String chassisNumber;
    private String epc;
    private Integer registeredYear;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
