package com.example.compliance_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(name = "vehicle_print_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehiclePrintHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String epc;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @Column(name = "print_date")
    private OffsetDateTime printDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "print_by")
    private User printBy;



}
