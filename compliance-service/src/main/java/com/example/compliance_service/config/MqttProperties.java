package com.example.compliance_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Binds all mqtt.* properties from application.properties / application-dev.properties.
 */
@Data
@Component
@ConfigurationProperties(prefix = "mqtt")
public class MqttProperties {

    /** HiveMQ broker URL, e.g. tcp://localhost:1883 or ssl://broker.hivemq.com:8883 */
    private String brokerUrl = "tcp://localhost:1883";

    /** Unique client identifier for this service */
    private String clientId = "compliance-service";

    /** MQTT topic the FX9600 reader publishes tag-reads to */
    private String topic = "rfid/fx9600/tag-reads";

    /** MQTT QoS level (0, 1, or 2) */
    private int qos = 1;

    /** Optional HiveMQ username */
    private String username;

    /** Optional HiveMQ password */
    private String password;

    /** Reader model label (e.g. "Zebra FX9600 / AN720") */
    private String readerModel = "Zebra FX9600";

    /** Fallback reader IP when it is not included in the MQTT payload */
    private String readerIpFallback = "192.168.1.100";
}

