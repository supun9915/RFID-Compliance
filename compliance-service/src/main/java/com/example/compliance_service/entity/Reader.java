package com.example.compliance_service.entity;

import com.example.compliance_service.entity.ScanCenter;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "fix_reader")

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reader {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    private String location;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(length = 100)
    private String model;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean deleted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_center_id")
    private ScanCenter scanCenter;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    // ── MQTT Configuration ────────────────────────────────────────────────────

    /** MQTT broker URL, e.g. ssl://broker.emqxsl.com:8883 */
    @Column(name = "mqtt_broker_url", length = 255)
    private String mqttBrokerUrl;

    /** Unique MQTT client ID for this reader */
    @Column(name = "mqtt_client_id", length = 100)
    private String mqttClientId;


    /** MQTT QoS level (0, 1, or 2) */
    @Column(name = "mqtt_qos")
    @Builder.Default
    private Integer mqttQos = 1;

    /** MQTT broker username */
    @Column(name = "mqtt_username", length = 100)
    private String mqttUsername;

    /** MQTT broker password */
    @Column(name = "mqtt_password", length = 255)
    private String mqttPassword;
}
