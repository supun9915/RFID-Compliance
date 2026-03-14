package com.example.compliance_service.repository;

import com.example.compliance_service.entity.ScanCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScanCenterRepository extends JpaRepository<ScanCenter, Long> {
}

