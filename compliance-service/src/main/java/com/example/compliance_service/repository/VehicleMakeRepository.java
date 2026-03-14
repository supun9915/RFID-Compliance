package com.example.compliance_service.repository;

import com.example.compliance_service.entity.VehicleMake;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleMakeRepository extends JpaRepository<VehicleMake, Long> {

    Optional<VehicleMake> findByName(String name);

    boolean existsByName(String name);
}
