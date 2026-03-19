package com.example.compliance_service.repository;

import com.example.compliance_service.entity.VehicleType;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleTypeRepository extends JpaRepository<VehicleType, Long> {

    static VehicleType findVehicleTypeById(@NotNull(message = "Vehicle type ID is required") Long vehicleTypeId) {
        return null;
    }

    Optional<VehicleType> findByName(String name);
}
