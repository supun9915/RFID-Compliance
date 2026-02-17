package com.example.compliance_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicle_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "zpl_code", columnDefinition = "TEXT")
    private String zplCode;

}
