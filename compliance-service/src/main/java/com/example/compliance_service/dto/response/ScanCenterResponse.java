package com.example.compliance_service.dto.response;

import com.example.compliance_service.entity.Location;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanCenterResponse {

    private Long id;
    private String name;
    private Location location;
    private String city;
    private String district;
    private String province;
    private Boolean isActive;
    private Boolean deleted;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
