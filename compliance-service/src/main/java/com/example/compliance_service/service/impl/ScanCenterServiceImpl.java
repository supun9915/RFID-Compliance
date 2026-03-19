package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.ReadersRequest;
import com.example.compliance_service.dto.request.ScanCenterRequest;
import com.example.compliance_service.dto.response.ReaderResponse;
import com.example.compliance_service.dto.response.ScanCenterResponse;
import com.example.compliance_service.entity.Reader;
import com.example.compliance_service.entity.ScanCenter;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.repository.ReaderRepository;
import com.example.compliance_service.repository.ScanCenterRepository;
import com.example.compliance_service.service.IScanCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScanCenterServiceImpl implements IScanCenterService {

    private final ScanCenterRepository scanCenterRepository;
    private final ReaderRepository readerRepository;

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
        return mapToResponseWithReaders(scanCenter);
    }

    @Override
    public ScanCenterResponse getScanCenterByName(String name) {
        ScanCenter scanCenter = scanCenterRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Scan center not found with name: " + name));
        return mapToResponseWithReaders(scanCenter);
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
                .deleted(false)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        ScanCenter savedScanCenter = scanCenterRepository.save(scanCenter);

        // Bulk-create readers if provided
        if (request.getReaders() != null && !request.getReaders().isEmpty()) {
            List<Reader> readers = request.getReaders().stream()
                    .map(r -> buildReader(r, savedScanCenter))
                    .collect(Collectors.toList());
            readerRepository.saveAll(readers);
        }

        return mapToResponseWithReaders(savedScanCenter);
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
        scanCenter.setUpdatedAt(OffsetDateTime.now());

        ScanCenter updatedScanCenter = scanCenterRepository.save(scanCenter);

        // Sync readers
        syncReaders(updatedScanCenter, request.getReaders());

        return mapToResponseWithReaders(updatedScanCenter);
    }

    @Override
    @Transactional
    public void deleteScanCenter(Long id) {
        if (!scanCenterRepository.existsById(id)) {
            throw new ResourceNotFoundException("Scan center not found with id: " + id);
        }
        scanCenterRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ScanCenterResponse activateScanCenter(Long id) {
        ScanCenter scanCenter = scanCenterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scan center not found with id: " + id));
        scanCenter.setIsActive(true);
        scanCenter.setUpdatedAt(OffsetDateTime.now());
        return mapToResponseWithReaders(scanCenterRepository.save(scanCenter));
    }

    @Override
    @Transactional
    public ScanCenterResponse deactivateScanCenter(Long id) {
        ScanCenter scanCenter = scanCenterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scan center not found with id: " + id));
        scanCenter.setIsActive(false);
        scanCenter.setUpdatedAt(OffsetDateTime.now());
        return mapToResponseWithReaders(scanCenterRepository.save(scanCenter));
    }

    @Override
    @Transactional
    public void softDeleteScanCenter(Long id) {
        ScanCenter scanCenter = scanCenterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scan center not found with id: " + id));
        scanCenter.setIsActive(false);
        scanCenter.setDeleted(true);
        scanCenter.setUpdatedAt(OffsetDateTime.now());
        scanCenterRepository.save(scanCenter);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /**
     * Diff-sync readers for a scan center during update:
     * - Readers in the request with an existing id → update
     * - Readers in the request with no id → create
     * - Existing readers whose id is absent from the request → soft-delete
     * If the request sends null/empty readers list, existing readers are left untouched.
     */
    private void syncReaders(ScanCenter scanCenter, List<ReadersRequest> incomingReaders) {
        if (incomingReaders == null) {
            return; // no readers section in request → leave existing readers untouched
        }

        // Fetch all currently active readers for this scan center
        List<Reader> existingReaders = readerRepository.findByScanCenter_Id(scanCenter.getId());

        // Build a map of existing readers by id for quick lookup
        Map<Long, Reader> existingById = existingReaders.stream()
                .collect(Collectors.toMap(Reader::getId, r -> r));

        // Collect ids that are still present in the incoming list
        Set<Long> incomingIds = incomingReaders.stream()
                .map(ReadersRequest::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Soft-delete readers that are no longer in the incoming list
        for (Reader existing : existingReaders) {
            if (!incomingIds.contains(existing.getId())) {
                existing.setIsActive(false);
                existing.setDeleted(true);
                existing.setUpdatedAt(OffsetDateTime.now());
                readerRepository.save(existing);
            }
        }

        // Update existing or create new readers
        for (ReadersRequest req : incomingReaders) {
            if (req.getId() != null && existingById.containsKey(req.getId())) {
                // Update existing reader
                Reader existing = existingById.get(req.getId());
                existing.setName(req.getName());
                existing.setLocation(req.getLocation());
                existing.setIpAddress(req.getIpAddress());
                existing.setSerialNumber(req.getSerialNumber());
                existing.setModel(req.getModel());
                if (req.getIsActive() != null) {
                    existing.setIsActive(req.getIsActive());
                }
                existing.setUpdatedAt(OffsetDateTime.now());
                readerRepository.save(existing);
            } else {
                // Create new reader
                readerRepository.save(buildReader(req, scanCenter));
            }
        }
    }

    private Reader buildReader(ReadersRequest req, ScanCenter scanCenter) {
        return Reader.builder()
                .name(req.getName())
                .location(req.getLocation())
                .ipAddress(req.getIpAddress())
                .serialNumber(req.getSerialNumber())
                .model(req.getModel())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .deleted(false)
                .scanCenter(scanCenter)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    private ReaderResponse mapReaderToResponse(Reader reader) {
        return ReaderResponse.builder()
                .id(reader.getId())
                .name(reader.getName())
                .location(reader.getLocation())
                .ipAddress(reader.getIpAddress())
                .serialNumber(reader.getSerialNumber())
                .model(reader.getModel())
                .isActive(reader.getIsActive())
                .deleted(reader.getDeleted())
                .scanCenterId(reader.getScanCenter() != null ? reader.getScanCenter().getId() : null)
                .scanCenterName(reader.getScanCenter() != null ? reader.getScanCenter().getName() : null)
                .createdAt(reader.getCreatedAt())
                .updatedAt(reader.getUpdatedAt())
                .build();
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
                .deleted(scanCenter.getDeleted())
                .createdAt(scanCenter.getCreatedAt())
                .updatedAt(scanCenter.getUpdatedAt())
                .build();
    }

    private ScanCenterResponse mapToResponseWithReaders(ScanCenter scanCenter) {
        List<ReaderResponse> readers = readerRepository.findByScanCenter_Id(scanCenter.getId())
                .stream()
                .map(this::mapReaderToResponse)
                .collect(Collectors.toList());

        return ScanCenterResponse.builder()
                .id(scanCenter.getId())
                .name(scanCenter.getName())
                .location(scanCenter.getLocation())
                .city(scanCenter.getCity())
                .district(scanCenter.getDistrict())
                .province(scanCenter.getProvince())
                .readers(readers)
                .isActive(scanCenter.getIsActive())
                .deleted(scanCenter.getDeleted())
                .createdAt(scanCenter.getCreatedAt())
                .updatedAt(scanCenter.getUpdatedAt())
                .build();
    }
}

