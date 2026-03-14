package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.ReaderRequest;
import com.example.compliance_service.dto.response.ReaderResponse;
import com.example.compliance_service.entity.Reader;
import com.example.compliance_service.entity.ScanCenter;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.repository.ReaderRepository;
import com.example.compliance_service.repository.ScanCenterRepository;
import com.example.compliance_service.service.IReaderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReaderServiceImpl implements IReaderService {

    private final ReaderRepository readerRepository;
    private final ScanCenterRepository scanCenterRepository;

    @Override
    public List<ReaderResponse> getAllReaders() {
        return readerRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ReaderResponse getReaderById(Long id) {
        Reader reader = readerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reader not found with id: " + id));
        return mapToResponse(reader);
    }

    @Override
    public ReaderResponse getReaderByName(String name) {
        Reader reader = readerRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Reader not found with name: " + name));
        return mapToResponse(reader);
    }

    @Override
    public ReaderResponse getReaderByIpAddress(String ipAddress) {
        Reader reader = readerRepository.findByIpAddress(ipAddress)
                .orElseThrow(() -> new ResourceNotFoundException("Reader not found with IP address: " + ipAddress));
        return mapToResponse(reader);
    }

    @Override
    @Transactional
    public ReaderResponse createReader(ReaderRequest request) {
        ScanCenter scanCenter = resolveScanCenter(request.getScanCenterId());

        Reader reader = Reader.builder()
                .name(request.getName())
                .location(request.getLocation())
                .ipAddress(request.getIpAddress())
                .serialNumber(request.getSerialNumber())
                .model(request.getModel())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .scanCenter(scanCenter)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Reader savedReader = readerRepository.save(reader);
        return mapToResponse(savedReader);
    }

    @Override
    @Transactional
    public ReaderResponse updateReader(Long id, ReaderRequest request) {
        Reader reader = readerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reader not found with id: " + id));

        ScanCenter scanCenter = resolveScanCenter(request.getScanCenterId());

        reader.setName(request.getName());
        reader.setLocation(request.getLocation());
        reader.setIpAddress(request.getIpAddress());
        reader.setSerialNumber(request.getSerialNumber());
        reader.setModel(request.getModel());
        if (request.getIsActive() != null) {
            reader.setIsActive(request.getIsActive());
        }
        reader.setScanCenter(scanCenter);
        reader.setUpdatedAt(LocalDateTime.now());

        Reader updatedReader = readerRepository.save(reader);
        return mapToResponse(updatedReader);
    }

    @Override
    @Transactional
    public void deleteReader(Long id) {
        if (!readerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Reader not found with id: " + id);
        }
        readerRepository.deleteById(id);
    }

    private ScanCenter resolveScanCenter(Long scanCenterId) {
        if (scanCenterId == null) return null;
        return scanCenterRepository.findById(scanCenterId)
                .orElseThrow(() -> new ResourceNotFoundException("ScanCenter not found with id: " + scanCenterId));
    }

    private ReaderResponse mapToResponse(Reader reader) {
        return ReaderResponse.builder()
                .id(reader.getId())
                .name(reader.getName())
                .location(reader.getLocation())
                .ipAddress(reader.getIpAddress())
                .serialNumber(reader.getSerialNumber())
                .model(reader.getModel())
                .isActive(reader.getIsActive())
                .scanCenterId(reader.getScanCenter() != null ? reader.getScanCenter().getId() : null)
                .scanCenterName(reader.getScanCenter() != null ? reader.getScanCenter().getName() : null)
                .createdAt(reader.getCreatedAt())
                .updatedAt(reader.getUpdatedAt())
                .build();
    }
}
