package com.example.compliance_service.dto.request;

import com.example.compliance_service.entity.Location;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
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
public class ScanCenterRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be at most 100 characters")
    private String name;

    private Location location;

    @Size(max = 100, message = "City must be at most 100 characters")
    private String city;

    @Size(max = 100, message = "District must be at most 100 characters")
    private String district;

    @Size(max = 100, message = "Province must be at most 100 characters")
    private String province;

    private Boolean isActive = true;

    @Valid
    private List<ReadersRequest> readers;
}

