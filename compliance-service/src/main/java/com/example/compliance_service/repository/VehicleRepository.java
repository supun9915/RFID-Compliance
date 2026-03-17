package com.example.compliance_service.repository;

import com.example.compliance_service.entity.Vehicle;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByEpc(String epc);

    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);

    List<Vehicle> findByOwnerId(Long ownerId);

    boolean existsByEpc(String epc);

    boolean existsByRegistrationNumber(String registrationNumber);

    long countByVehicleTypeIdAndOwnerId(Long vehicleTypeId, Long ownerId);

    Optional<Vehicle> findTopByOrderByIdDesc();

    boolean existsByVehicleNumber(@Size(max = 100, message = "Vehicle number must be at most 100 characters") String vehicleNumber);

    boolean existsByChassisNumber(@Size(max = 100, message = "Chassis number must be at most 100 characters") String chassisNumber);
}
