package com.example.compliance_service.dto.request;

import com.example.compliance_service.entity.Vehicle;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleOwnerRequest {
    @NotNull(message = "Vehicle type ID is required")
    private Long vehicleTypeId;

    private Long vehicleModelId;

    @NotNull(message = "Owner ID is required")
    private Long ownerId;

    @NotBlank(message = "Registration number is required")
    @Size(max = 100, message = "Registration number must be at most 100 characters")
    private String registrationNumber;

    @Size(max = 100, message = "Vehicle number must be at most 100 characters")
    private String vehicleNumber;

    @Size(max = 100, message = "Chassis number must be at most 100 characters")
    private String chassisNumber;

    private Integer registeredYear;
    private List<DocumentRequest> documentRequests;

}
