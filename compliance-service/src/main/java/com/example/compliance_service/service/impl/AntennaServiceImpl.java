package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.AntennaRequest;
import com.example.compliance_service.dto.response.AntennaResponse;
import com.example.compliance_service.entity.Antenna;
import com.example.compliance_service.entity.Reader;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.repository.AntennaRepository;
import com.example.compliance_service.repository.ReaderRepository;
import com.example.compliance_service.service.IAntennaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AntennaServiceImpl implements IAntennaService {

    private final AntennaRepository antennaRepository;
    private final ReaderRepository readerRepository;

    @Override
    public List<AntennaResponse> getAllAntennas() {
        return antennaRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AntennaResponse getAntennaById(Long id) {
        Antenna antenna = antennaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Antenna not found with id: " + id));
        return mapToResponse(antenna);
    }

    @Override
    public List<AntennaResponse> getAntennasByReaderId(Long readerId) {
        return antennaRepository.findByReaderId(readerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AntennaResponse createAntenna(AntennaRequest request) {
        Reader reader = readerRepository.findById(request.getReaderId())
                .orElseThrow(() -> new ResourceNotFoundException("Reader not found with id: " + request.getReaderId()));

        Antenna antenna = Antenna.builder()
                .reader(reader)
                .antennaPort(request.getAntennaPort())
                .name(request.getName())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Antenna savedAntenna = antennaRepository.save(antenna);
        return mapToResponse(savedAntenna);
    }

    @Override
    @Transactional
    public AntennaResponse updateAntenna(Long id, AntennaRequest request) {
        Antenna antenna = antennaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Antenna not found with id: " + id));

        Reader reader = readerRepository.findById(request.getReaderId())
                .orElseThrow(() -> new ResourceNotFoundException("Reader not found with id: " + request.getReaderId()));

        antenna.setReader(reader);
        antenna.setAntennaPort(request.getAntennaPort());
        antenna.setName(request.getName());
        antenna.setUpdatedAt(LocalDateTime.now());

        Antenna updatedAntenna = antennaRepository.save(antenna);
        return mapToResponse(updatedAntenna);
    }

    @Override
    @Transactional
    public void deleteAntenna(Long id) {
        if (!antennaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Antenna not found with id: " + id);
        }
        antennaRepository.deleteById(id);
    }

    private AntennaResponse mapToResponse(Antenna antenna) {
        return AntennaResponse.builder()
                .id(antenna.getId())
                .readerId(antenna.getReader() != null ? antenna.getReader().getId() : null)
                .readerName(antenna.getReader() != null ? antenna.getReader().getName() : null)
                .antennaPort(antenna.getAntennaPort())
                .name(antenna.getName())
                .createdAt(antenna.getCreatedAt())
                .updatedAt(antenna.getUpdatedAt())
                .build();
    }
}
