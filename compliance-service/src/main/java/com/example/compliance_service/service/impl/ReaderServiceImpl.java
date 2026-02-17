package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.ReaderRequest;
import com.example.compliance_service.dto.response.ReaderResponse;
import com.example.compliance_service.entity.Reader;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.repository.ReaderRepository;
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
        Reader reader = Reader.builder()
                .name(request.getName())
                .location(request.getLocation())
                .ipAddress(request.getIpAddress())
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

        reader.setName(request.getName());
        reader.setLocation(request.getLocation());
        reader.setIpAddress(request.getIpAddress());
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

    private ReaderResponse mapToResponse(Reader reader) {
        return ReaderResponse.builder()
                .id(reader.getId())
                .name(reader.getName())
                .location(reader.getLocation())
                .ipAddress(reader.getIpAddress())
                .createdAt(reader.getCreatedAt())
                .updatedAt(reader.getUpdatedAt())
                .build();
    }
}
