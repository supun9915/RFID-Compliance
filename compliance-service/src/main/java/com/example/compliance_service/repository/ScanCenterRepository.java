package com.example.compliance_service.repository;

import com.example.compliance_service.entity.ScanCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScanCenterRepository extends JpaRepository<ScanCenter, Long> {

    Optional<ScanCenter> findByName(String name);

    List<ScanCenter> findByIsActiveTrue();

    boolean existsByName(String name);
}

