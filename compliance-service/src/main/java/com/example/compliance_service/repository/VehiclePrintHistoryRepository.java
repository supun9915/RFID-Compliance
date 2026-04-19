package com.example.compliance_service.repository;

import com.example.compliance_service.entity.VehiclePrintHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehiclePrintHistoryRepository extends JpaRepository<VehiclePrintHistory, Long> {

    List<VehiclePrintHistory> findByVehicleId(Long vehicleId);

    boolean existsByEpc(String epc);
}

