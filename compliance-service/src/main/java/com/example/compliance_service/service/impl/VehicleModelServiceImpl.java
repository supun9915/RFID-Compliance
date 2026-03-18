package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.VehicleModelRequest;
import com.example.compliance_service.dto.response.VehicleMakeResponse;
import com.example.compliance_service.dto.response.VehicleModelResponse;
import com.example.compliance_service.entity.VehicleMake;
import com.example.compliance_service.entity.VehicleModel;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.repository.VehicleMakeRepository;
import com.example.compliance_service.repository.VehicleModelRepository;
import com.example.compliance_service.service.IVehicleModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleModelServiceImpl implements IVehicleModelService {

    private final VehicleModelRepository vehicleModelRepository;
    private final VehicleMakeRepository vehicleMakeRepository;

    @Override
    public List<VehicleModelResponse> getAllVehicleModels() {
        return vehicleModelRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleModelResponse> getVehicleModelsByMakeId(Long makeId) {
        if (!vehicleMakeRepository.existsById(makeId)) {
            throw new ResourceNotFoundException("Vehicle make not found with id: " + makeId);
        }
        return vehicleModelRepository.findByMakeId(makeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleModelResponse getVehicleModelById(Long id) {
        VehicleModel vehicleModel = vehicleModelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle model not found with id: " + id));
        return mapToResponse(vehicleModel);
    }

    @Override
    @Transactional
    public VehicleModelResponse createVehicleModel(VehicleModelRequest request) {
        VehicleMake make = vehicleMakeRepository.findById(request.getMakeId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle make not found with id: " + request.getMakeId()));

        if (vehicleModelRepository.existsByNameAndMakeId(request.getName(), request.getMakeId())) {
            throw new IllegalArgumentException(
                    "Vehicle model '" + request.getName() + "' already exists for this make");
        }

        VehicleModel vehicleModel = VehicleModel.builder()
                .name(request.getName())
                .make(make)
                .description(request.getDescription())
                .active(true)
                .deleted(false)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        return mapToResponse(vehicleModelRepository.save(vehicleModel));
    }

    @Override
    @Transactional
    public VehicleModelResponse updateVehicleModel(Long id, VehicleModelRequest request) {
        VehicleModel vehicleModel = vehicleModelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle model not found with id: " + id));

        VehicleMake make = vehicleMakeRepository.findById(request.getMakeId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle make not found with id: " + request.getMakeId()));

        boolean nameOrMakeChanged = !vehicleModel.getName().equals(request.getName())
                || !vehicleModel.getMake().getId().equals(request.getMakeId());

        if (nameOrMakeChanged && vehicleModelRepository.existsByNameAndMakeId(request.getName(), request.getMakeId())) {
            throw new IllegalArgumentException(
                    "Vehicle model '" + request.getName() + "' already exists for this make");
        }

        vehicleModel.setName(request.getName());
        vehicleModel.setMake(make);
        vehicleModel.setDescription(request.getDescription());
        vehicleModel.setUpdatedAt(OffsetDateTime.now());

        return mapToResponse(vehicleModelRepository.save(vehicleModel));
    }

    @Override
    @Transactional
    public void deleteVehicleModel(Long id) {
        if (!vehicleModelRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle model not found with id: " + id);
        }
        vehicleModelRepository.deleteById(id);
    }

    @Override
    @Transactional
    public VehicleModelResponse activateVehicleModel(Long id) {
        VehicleModel vehicleModel = vehicleModelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle model not found with id: " + id));
        vehicleModel.setActive(true);
        vehicleModel.setUpdatedAt(OffsetDateTime.now());
        return mapToResponse(vehicleModelRepository.save(vehicleModel));
    }

    @Override
    @Transactional
    public VehicleModelResponse deactivateVehicleModel(Long id) {
        VehicleModel vehicleModel = vehicleModelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle model not found with id: " + id));
        vehicleModel.setActive(false);
        vehicleModel.setUpdatedAt(OffsetDateTime.now());
        return mapToResponse(vehicleModelRepository.save(vehicleModel));
    }

    @Override
    @Transactional
    public void softDeleteVehicleModel(Long id) {
        VehicleModel vehicleModel = vehicleModelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle model not found with id: " + id));
        vehicleModel.setActive(false);
        vehicleModel.setDeleted(true);
        vehicleModel.setUpdatedAt(OffsetDateTime.now());
        vehicleModelRepository.save(vehicleModel);
    }

    private VehicleModelResponse mapToResponse(VehicleModel vehicleModel) {
        VehicleMakeResponse makeResponse = null;
        if (vehicleModel.getMake() != null) {
            makeResponse = VehicleMakeResponse.builder()
                    .id(vehicleModel.getMake().getId())
                    .name(vehicleModel.getMake().getName())
                    .description(vehicleModel.getMake().getDescription())
                    .active(vehicleModel.getMake().getActive())
                    .deleted(vehicleModel.getMake().getDeleted())
                    .createdAt(vehicleModel.getMake().getCreatedAt())
                    .updatedAt(vehicleModel.getMake().getUpdatedAt())
                    .build();
        }

        return VehicleModelResponse.builder()
                .id(vehicleModel.getId())
                .name(vehicleModel.getName())
                .make(makeResponse)
                .description(vehicleModel.getDescription())
                .active(vehicleModel.getActive())
                .deleted(vehicleModel.getDeleted())
                .createdAt(vehicleModel.getCreatedAt())
                .updatedAt(vehicleModel.getUpdatedAt())
                .build();
    }
}
