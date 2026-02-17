package com.example.compliance_service.repository;

import com.example.compliance_service.entity.Antenna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AntennaRepository extends JpaRepository<Antenna, Long> {

    List<Antenna> findByReaderId(Long readerId);

    List<Antenna> findByReaderIdAndAntennaPort(Long readerId, Integer antennaPort);
}
