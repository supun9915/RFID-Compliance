package com.example.compliance_service.repository;

import com.example.compliance_service.entity.Reader;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReaderRepository extends JpaRepository<Reader, Long> {

    Optional<Reader> findByName(String name);

    Optional<Reader> findByIpAddress(String ipAddress);

    Optional<Reader> findFirstByModel(String model);

    List<Reader> findByScanCenterId(Long scanCenterId);

    Optional<Reader> findByIdAndScanCenterId(Long id, Long scanCenterId);

    boolean existsByIdAndScanCenterId(Long id, Long scanCenterId);

    List<Reader> findByScanCenter_Id(Long id);
}
