package com.example.compliance_service.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AntennaRequest {

    @NotNull(message = "Reader ID is required")
    private Long readerId;

    @NotNull(message = "Antenna port is required")
    private Integer antennaPort;

    @Size(max = 100, message = "Name must be at most 100 characters")
    private String name;
}
