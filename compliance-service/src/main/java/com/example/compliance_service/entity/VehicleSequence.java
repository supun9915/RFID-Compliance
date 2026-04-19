package com.example.compliance_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicle_sequence")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "serial_number", nullable = false)
    private Long serialNumber;
}

