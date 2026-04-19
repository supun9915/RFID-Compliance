package com.example.compliance_service.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehiclePrintTemplateRequest {

    @NotEmpty(message = "At least one registration number is required")
    private List<String> registrationNumbers;
}

