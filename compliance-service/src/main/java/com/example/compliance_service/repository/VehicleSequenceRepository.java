package com.example.compliance_service.repository;

import com.example.compliance_service.entity.VehicleSequence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VehicleSequenceRepository extends JpaRepository<VehicleSequence, Long> {

    Optional<VehicleSequence> findTopByOrderByIdAsc();
}
