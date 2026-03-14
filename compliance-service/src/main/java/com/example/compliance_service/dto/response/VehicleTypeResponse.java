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
public class VehicleTypeResponse {

    private Long id;
    private String name;
    private String description;
    private String zplCode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
