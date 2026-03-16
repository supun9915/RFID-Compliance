package com.example.compliance_service.repository;

import com.example.compliance_service.entity.DetectionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface DetectionHistoryRepository extends JpaRepository<DetectionHistory, Long> {

    List<DetectionHistory> findByVehicleId(Long vehicleId);

    List<DetectionHistory> findByReaderId(Long readerId);

    List<DetectionHistory> findByComplianceStatus(String complianceStatus);

    @Query("SELECT d FROM DetectionHistory d WHERE d.detectedAt BETWEEN :startDate AND :endDate")
    List<DetectionHistory> findDetectionsBetween(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT d FROM DetectionHistory d WHERE d.vehicle.id = :vehicleId ORDER BY d.detectedAt DESC")
    List<DetectionHistory> findLatestDetectionsByVehicle(@Param("vehicleId") Long vehicleId);

    @Query("SELECT d FROM DetectionHistory d WHERE d.complianceStatus = 'NON_COMPLIANT' ORDER BY d.detectedAt DESC")
    List<DetectionHistory> findNonCompliantDetections();
}
