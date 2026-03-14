package com.example.compliance_service.entity;

import com.example.compliance_service.entity.ScanCenter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_center_id")
    private ScanCenter scanCenter;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


}
