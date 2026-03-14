package com.example.compliance_service.repository;

import com.example.compliance_service.entity.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleModelRepository extends JpaRepository<VehicleModel, Long> {

    List<VehicleModel> findByMakeId(Long makeId);

    boolean existsByNameAndMakeId(String name, Long makeId);
}
