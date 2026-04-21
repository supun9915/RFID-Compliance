package com.example.compliance_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadersRequest {

    /** Present when updating an existing reader; null when creating a new one. */
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be at most 100 characters")
    private String name;

    private String location;

    @Size(max = 45, message = "IP address must be at most 45 characters")
    private String ipAddress;

    @Size(max = 100, message = "Serial number must be at most 100 characters")
    private String serialNumber;

    @Size(max = 100, message = "Model must be at most 100 characters")
    private String model;

    private Boolean isActive = true;

    // ── MQTT Configuration ────────────────────────────────────────────────────

    @Size(max = 255, message = "MQTT broker URL must be at most 255 characters")
    private String mqttBrokerUrl;

    @Size(max = 100, message = "MQTT client ID must be at most 100 characters")
    private String mqttClientId;

    @Size(max = 255, message = "MQTT topic must be at most 255 characters")
    private String mqttTopic;

    @Size(max = 255, message = "MQTT command topic must be at most 255 characters")
    private String mqttCommandTopic;

    private Integer mqttQos = 1;

    @Size(max = 100, message = "MQTT username must be at most 100 characters")
    private String mqttUsername;

    @Size(max = 255, message = "MQTT password must be at most 255 characters")
    private String mqttPassword;
}
