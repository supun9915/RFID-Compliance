package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.ScanCenterRequest;
import com.example.compliance_service.dto.response.ScanCenterResponse;
import com.example.compliance_service.entity.ScanCenter;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.repository.ScanCenterRepository;
import com.example.compliance_service.service.IScanCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScanCenterServiceImpl implements IScanCenterService {

    private final ScanCenterRepository scanCenterRepository;

    @Override
    public List<ScanCenterResponse> getAllScanCenters() {
        return scanCenterRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ScanCenterResponse> getActiveScanCenters() {
        return scanCenterRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ScanCenterResponse getScanCenterById(Long id) {
        ScanCenter scanCenter = scanCenterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scan center not found with id: " + id));
        return mapToResponse(scanCenter);
    }

    @Override
    public ScanCenterResponse getScanCenterByName(String name) {
        ScanCenter scanCenter = scanCenterRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Scan center not found with name: " + name));
        return mapToResponse(scanCenter);
    }

    @Override
    @Transactional
    public ScanCenterResponse createScanCenter(ScanCenterRequest request) {
        ScanCenter scanCenter = ScanCenter.builder()
                .name(request.getName())
                .location(request.getLocation())
                .city(request.getCity())
                .district(request.getDistrict())
                .province(request.getProvince())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ScanCenter savedScanCenter = scanCenterRepository.save(scanCenter);
        return mapToResponse(savedScanCenter);
    }

    @Override
    @Transactional
    public ScanCenterResponse updateScanCenter(Long id, ScanCenterRequest request) {
        ScanCenter scanCenter = scanCenterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scan center not found with id: " + id));

        scanCenter.setName(request.getName());
        scanCenter.setLocation(request.getLocation());
        scanCenter.setCity(request.getCity());
        scanCenter.setDistrict(request.getDistrict());
        scanCenter.setProvince(request.getProvince());
        if (request.getIsActive() != null) {
            scanCenter.setIsActive(request.getIsActive());
        }
        scanCenter.setUpdatedAt(LocalDateTime.now());

        ScanCenter updatedScanCenter = scanCenterRepository.save(scanCenter);
        return mapToResponse(updatedScanCenter);
    }

    @Override
    @Transactional
    public void deleteScanCenter(Long id) {
        if (!scanCenterRepository.existsById(id)) {
            throw new ResourceNotFoundException("Scan center not found with id: " + id);
        }
        scanCenterRepository.deleteById(id);
    }

    private ScanCenterResponse mapToResponse(ScanCenter scanCenter) {
        return ScanCenterResponse.builder()
                .id(scanCenter.getId())
                .name(scanCenter.getName())
                .location(scanCenter.getLocation())
                .city(scanCenter.getCity())
                .district(scanCenter.getDistrict())
                .province(scanCenter.getProvince())
                .isActive(scanCenter.getIsActive())
                .createdAt(scanCenter.getCreatedAt())
                .updatedAt(scanCenter.getUpdatedAt())
                .build();
    }
}

