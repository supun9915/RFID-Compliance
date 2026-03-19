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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id")
    private User owner;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "scancenter_id")
    private ScanCenter scanCenter;

    @Column(name = "compliance_status", nullable = false, length = 50)
    private String complianceStatus;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "compliance_message", columnDefinition = "TEXT")
    private String complianceMessage;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

}
