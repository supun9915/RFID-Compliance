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
public class VehiclePrintHistoryResponse {

    private Long id;
    private String epc;
    private Long vehicleId;
    private String registrationNumber;
    private OffsetDateTime printDate;
    private String printByUsername;
}

