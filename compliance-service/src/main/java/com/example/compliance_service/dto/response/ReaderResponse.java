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
public class ReaderResponse {

    private Long id;
    private String name;
    private String location;
    private String ipAddress;
    private String serialNumber;
    private String model;
    private Boolean isActive;
    private Boolean deleted;
    private Long scanCenterId;
    private String scanCenterName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
