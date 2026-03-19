package com.example.compliance_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetectionRequest {

    /**
     * EPC number of the vehicle tag read by the RFID reader.
     */
    @NotBlank(message = "EPC number is required")
    private String epc;

    /**
     * Reader model name (e.g. "Impinj R420").
     * Either readerModel or readerIpAddress must be provided.
     */
    private String readerModel;

    /**
     * Reader IP address (e.g. "192.168.1.10").
     * Either readerModel or readerIpAddress must be provided.
     */
    private String readerIpAddress;
}

