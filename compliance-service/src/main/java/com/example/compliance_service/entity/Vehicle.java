package com.example.compliance_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "vehicle")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_type_id")
    private VehicleType vehicleType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_model_id")
    private VehicleModel vehicleModel;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(name = "registration_number", nullable = false, unique = true, length = 100)
    private String registrationNumber;

    @Column(name = "vehicle_number", length = 100)
    private String vehicleNumber;

    @Column(name = "chassis_number", length = 100)
    private String chassisNumber;

    @Column(nullable = false, unique = true, length = 100)
    private String epc;

    @Column(name = "registered_year")
    private Integer registeredYear;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "next_serial_number", length = 100)
    private Long nextSerialNumber;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean deleted = false;

    @Column(name = "is_printed", nullable = false)
    @Builder.Default
    private Boolean printed = false;

    @Column(name = "print_date")
    private OffsetDateTime printDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "print_by")
    private User printBy;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    private List<Document> documents;

}
