package com.example.compliance_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "detection_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetectionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reader_id")
    private Reader reader;


    @Column(name = "detected_at")
    private OffsetDateTime detectedAt;

    @Column(name = "compliance_status", nullable = false, length = 50)
    private String complianceStatus;

    @Column(name = "violation_details", columnDefinition = "TEXT")
    private String violationDetails;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

}
