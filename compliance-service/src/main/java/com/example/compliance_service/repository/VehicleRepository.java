package com.example.compliance_service.repository;

import com.example.compliance_service.entity.Vehicle;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    boolean existsByRegistrationNumberAndActiveTrue(String registrationNumber);

    boolean existsByVehicleNumberAndActiveTrue(String vehicleNumber);

    boolean existsByChassisNumberAndActiveTrue(String chassisNumber);


    Optional<Vehicle> findByEpc(String epc);

    Vehicle findByEpcAndActiveTrue(String epc);


    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);

    List<Vehicle> findByOwnerId(Long ownerId);

    boolean existsByEpc(String epc);

    boolean existsByRegistrationNumber(String registrationNumber);


    long countByVehicleTypeIdAndOwnerId(Long vehicleTypeId, Long ownerId);

    Optional<Vehicle> findTopByOrderByIdDesc();

    boolean existsByVehicleNumber(@Size(max = 100, message = "Vehicle number must be at most 100 characters") String vehicleNumber);

    boolean existsByChassisNumber(@Size(max = 100, message = "Chassis number must be at most 100 characters") String chassisNumber);

    Optional<Vehicle> findByIdAndOwnerId(Long id, Long ownerId);

    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);

    /**
     * Search active vehicles by vehicle number or registration number (case-insensitive LIKE).
     * Only returns vehicles that have an owner assigned.
     */
    @Query("SELECT v FROM Vehicle v WHERE v.owner IS NOT NULL AND v.active = true AND " +
           "(LOWER(v.vehicleNumber) LIKE :q OR LOWER(v.registrationNumber) LIKE :q)")
    List<Vehicle> searchByVehicleNumberOrRegistration(@Param("q") String q);

    /**
     * Find an inactive vehicle with no owner that matches any of the given identifiers.
     * Used to recycle a previously detached vehicle instead of creating a new one.
     */
    @Query("SELECT v FROM Vehicle v WHERE v.owner IS NULL AND v.active = false " +
           "AND (:registrationNumber IS NOT NULL AND v.registrationNumber = :registrationNumber " +
           "OR  :vehicleNumber      IS NOT NULL AND v.vehicleNumber      = :vehicleNumber " +
           "OR  :chassisNumber      IS NOT NULL AND v.chassisNumber      = :chassisNumber)")
    Optional<Vehicle> findFirstInactiveUnownedByAnyIdentifier(
            @Param("registrationNumber") String registrationNumber,
            @Param("vehicleNumber")      String vehicleNumber,
            @Param("chassisNumber")      String chassisNumber);
}
