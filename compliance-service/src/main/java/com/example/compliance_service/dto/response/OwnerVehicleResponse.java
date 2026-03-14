package com.example.compliance_service.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerVehicleResponse {
    private Long id;
    private VehicleTypeResponse vehicleType;
    private VehicleModelResponse vehicleModel;
    private String registrationNumber;
    private String vehicleNumber;
    private String chassisNumber;
    private String epc;
    private Integer registeredYear;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<DocumentResponse> documents;
}
