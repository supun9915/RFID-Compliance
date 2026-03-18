package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.VehicleTypeRequest;
import com.example.compliance_service.dto.response.VehicleTypeResponse;
import com.example.compliance_service.entity.VehicleType;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.repository.VehicleTypeRepository;
import com.example.compliance_service.service.IVehicleTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleTypeServiceImpl implements IVehicleTypeService {

    private final VehicleTypeRepository vehicleTypeRepository;

    @Override
    public List<VehicleTypeResponse> getAllVehicleTypes() {
        return vehicleTypeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleTypeResponse getVehicleTypeById(Long id) {
        VehicleType vehicleType = vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with id: " + id));
        return mapToResponse(vehicleType);
    }

    @Override
    @Transactional
    public VehicleTypeResponse createVehicleType(VehicleTypeRequest request) {
        VehicleType vehicleType = VehicleType.builder()
                .name(request.getName())
                .description(request.getDescription())
                .zplCode(request.getZplCode())
                .active(true)
                .deleted(false)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        VehicleType savedVehicleType = vehicleTypeRepository.save(vehicleType);
        return mapToResponse(savedVehicleType);
    }

    @Override
    @Transactional
    public VehicleTypeResponse updateVehicleType(Long id, VehicleTypeRequest request) {
        VehicleType vehicleType = vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with id: " + id));

        vehicleType.setName(request.getName());
        vehicleType.setDescription(request.getDescription());
        vehicleType.setZplCode(request.getZplCode());
        vehicleType.setUpdatedAt(OffsetDateTime.now());

        VehicleType updatedVehicleType = vehicleTypeRepository.save(vehicleType);
        return mapToResponse(updatedVehicleType);
    }

    @Override
    @Transactional
    public void deleteVehicleType(Long id) {
        if (!vehicleTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle type not found with id: " + id);
        }
        vehicleTypeRepository.deleteById(id);
    }

    @Override
    @Transactional
    public VehicleTypeResponse activateVehicleType(Long id) {
        VehicleType vehicleType = vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with id: " + id));
        vehicleType.setActive(true);
        vehicleType.setUpdatedAt(OffsetDateTime.now());
        return mapToResponse(vehicleTypeRepository.save(vehicleType));
    }

    @Override
    @Transactional
    public VehicleTypeResponse deactivateVehicleType(Long id) {
        VehicleType vehicleType = vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with id: " + id));
        vehicleType.setActive(false);
        vehicleType.setUpdatedAt(OffsetDateTime.now());
        return mapToResponse(vehicleTypeRepository.save(vehicleType));
    }

    @Override
    @Transactional
    public void softDeleteVehicleType(Long id) {
        VehicleType vehicleType = vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with id: " + id));
        vehicleType.setActive(false);
        vehicleType.setDeleted(true);
        vehicleType.setUpdatedAt(OffsetDateTime.now());
        vehicleTypeRepository.save(vehicleType);
    }

    private VehicleTypeResponse mapToResponse(VehicleType vehicleType) {
        return VehicleTypeResponse.builder()
                .id(vehicleType.getId())
                .name(vehicleType.getName())
                .description(vehicleType.getDescription())
                .zplCode(vehicleType.getZplCode())
                .active(vehicleType.getActive())
                .deleted(vehicleType.getDeleted())
                .createdAt(vehicleType.getCreatedAt())
                .updatedAt(vehicleType.getUpdatedAt())
                .build();
    }
}
