package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.VehicleMakeRequest;
import com.example.compliance_service.dto.response.VehicleMakeResponse;
import com.example.compliance_service.entity.VehicleMake;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.repository.VehicleMakeRepository;
import com.example.compliance_service.service.IVehicleMakeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleMakeServiceImpl implements IVehicleMakeService {

    private final VehicleMakeRepository vehicleMakeRepository;

    @Override
    public List<VehicleMakeResponse> getAllVehicleMakes() {
        return vehicleMakeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleMakeResponse getVehicleMakeById(Long id) {
        VehicleMake vehicleMake = vehicleMakeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle make not found with id: " + id));
        return mapToResponse(vehicleMake);
    }

    @Override
    @Transactional
    public VehicleMakeResponse createVehicleMake(VehicleMakeRequest request) {
        if (vehicleMakeRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Vehicle make with name '" + request.getName() + "' already exists");
        }

        VehicleMake vehicleMake = VehicleMake.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return mapToResponse(vehicleMakeRepository.save(vehicleMake));
    }

    @Override
    @Transactional
    public VehicleMakeResponse updateVehicleMake(Long id, VehicleMakeRequest request) {
        VehicleMake vehicleMake = vehicleMakeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle make not found with id: " + id));

        if (!vehicleMake.getName().equals(request.getName())
                && vehicleMakeRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Vehicle make with name '" + request.getName() + "' already exists");
        }

        vehicleMake.setName(request.getName());
        vehicleMake.setDescription(request.getDescription());
        vehicleMake.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(vehicleMakeRepository.save(vehicleMake));
    }

    @Override
    @Transactional
    public void deleteVehicleMake(Long id) {
        if (!vehicleMakeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle make not found with id: " + id);
        }
        vehicleMakeRepository.deleteById(id);
    }

    private VehicleMakeResponse mapToResponse(VehicleMake vehicleMake) {
        return VehicleMakeResponse.builder()
                .id(vehicleMake.getId())
                .name(vehicleMake.getName())
                .description(vehicleMake.getDescription())
                .createdAt(vehicleMake.getCreatedAt())
                .updatedAt(vehicleMake.getUpdatedAt())
                .build();
    }
}
