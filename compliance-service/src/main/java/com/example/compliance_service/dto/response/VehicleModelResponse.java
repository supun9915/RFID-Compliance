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
public class VehicleModelResponse {

    private Long id;
    private String name;
    private VehicleMakeResponse make;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
