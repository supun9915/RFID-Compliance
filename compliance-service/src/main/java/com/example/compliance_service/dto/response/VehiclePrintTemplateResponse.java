package com.example.compliance_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehiclePrintTemplateResponse {

    private Long vehicleId;
    private String registrationNumber;
    private String vehicleNumber;
    private String chassisNumber;
    private Integer registeredYear;
    private String ownerName;
    private String vehicleTypeName;
    private String vehicleModelName;
    private String epc;
    private String zplCode;
    private Boolean isPrinted;
}

