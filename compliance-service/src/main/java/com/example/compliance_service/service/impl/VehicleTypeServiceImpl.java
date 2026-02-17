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
                .zplCode(request.getZplCode())
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
        vehicleType.setZplCode(request.getZplCode());

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

    private VehicleTypeResponse mapToResponse(VehicleType vehicleType) {
        return VehicleTypeResponse.builder()
                .id(vehicleType.getId())
                .name(vehicleType.getName())
                .zplCode(vehicleType.getZplCode())
                .build();
    }
}
