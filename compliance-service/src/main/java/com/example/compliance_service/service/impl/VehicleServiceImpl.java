package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.VehicleRequest;
import com.example.compliance_service.dto.response.RoleResponse;
import com.example.compliance_service.dto.response.UserResponse;
import com.example.compliance_service.dto.response.VehicleResponse;
import com.example.compliance_service.dto.response.VehicleTypeResponse;
import com.example.compliance_service.entity.User;
import com.example.compliance_service.entity.Vehicle;
import com.example.compliance_service.entity.VehicleType;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.repository.UserRepository;
import com.example.compliance_service.repository.VehicleRepository;
import com.example.compliance_service.repository.VehicleTypeRepository;
import com.example.compliance_service.service.IVehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements IVehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final UserRepository userRepository;

    @Override
    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        return mapToResponse(vehicle);
    }

    @Override
    public VehicleResponse getVehicleByEpc(String epc) {
        Vehicle vehicle = vehicleRepository.findByEpc(epc)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with EPC: " + epc));
        return mapToResponse(vehicle);
    }

    @Override
    public VehicleResponse getVehicleByRegistrationNumber(String registrationNumber) {
        Vehicle vehicle = vehicleRepository.findByRegistrationNumber(registrationNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with registration number: " + registrationNumber));
        return mapToResponse(vehicle);
    }

    @Override
    public List<VehicleResponse> getVehiclesByOwnerId(Long ownerId) {
        return vehicleRepository.findByOwnerId(ownerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VehicleResponse createVehicle(VehicleRequest request) {
        // Check if EPC already exists
        if (vehicleRepository.existsByEpc(request.getEpc())) {
            throw new IllegalArgumentException("Vehicle with EPC " + request.getEpc() + " already exists");
        }

        // Check if registration number already exists
        if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new IllegalArgumentException("Vehicle with registration number " + request.getRegistrationNumber() + " already exists");
        }

        VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with id: " + request.getVehicleTypeId()));

        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getOwnerId()));

        Vehicle vehicle = Vehicle.builder()
                .vehicleType(vehicleType)
                .owner(owner)
                .registrationNumber(request.getRegistrationNumber())
                .epc(request.getEpc())
                .registeredYear(request.getRegisteredYear())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return mapToResponse(savedVehicle);
    }

    @Override
    @Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        // Check EPC uniqueness if changing
        if (!vehicle.getEpc().equals(request.getEpc()) && vehicleRepository.existsByEpc(request.getEpc())) {
            throw new IllegalArgumentException("Vehicle with EPC " + request.getEpc() + " already exists");
        }

        // Check registration number uniqueness if changing
        if (!vehicle.getRegistrationNumber().equals(request.getRegistrationNumber()) 
                && vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new IllegalArgumentException("Vehicle with registration number " + request.getRegistrationNumber() + " already exists");
        }

        VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with id: " + request.getVehicleTypeId()));

        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getOwnerId()));

        vehicle.setVehicleType(vehicleType);
        vehicle.setOwner(owner);
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setEpc(request.getEpc());
        vehicle.setRegisteredYear(request.getRegisteredYear());
        vehicle.setUpdatedAt(LocalDateTime.now());

        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        return mapToResponse(updatedVehicle);
    }

    @Override
    @Transactional
    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle not found with id: " + id);
        }
        vehicleRepository.deleteById(id);
    }

    private VehicleResponse mapToResponse(Vehicle vehicle) {
        VehicleTypeResponse vehicleTypeResponse = null;
        if (vehicle.getVehicleType() != null) {
            vehicleTypeResponse = VehicleTypeResponse.builder()
                    .id(vehicle.getVehicleType().getId())
                    .name(vehicle.getVehicleType().getName())
                    .zplCode(vehicle.getVehicleType().getZplCode())
                    .build();
        }

        UserResponse ownerResponse = null;
        if (vehicle.getOwner() != null) {
            RoleResponse roleResponse = null;
            if (vehicle.getOwner().getRole() != null) {
                roleResponse = RoleResponse.builder()
                        .id(vehicle.getOwner().getRole().getId())
                        .name(vehicle.getOwner().getRole().getName())
                        .description(vehicle.getOwner().getRole().getDescription())
                        .build();
            }
            ownerResponse = UserResponse.builder()
                    .id(vehicle.getOwner().getId())
                    .username(vehicle.getOwner().getUsername())
                    .email(vehicle.getOwner().getEmail())
                    .firstName(vehicle.getOwner().getFirstName())
                    .lastName(vehicle.getOwner().getLastName())
                    .contactNumber(vehicle.getOwner().getContactNumber())
                    .nic(vehicle.getOwner().getNic())
                    .role(roleResponse)
                    .createdAt(vehicle.getOwner().getCreatedAt())
                    .updatedAt(vehicle.getOwner().getUpdatedAt())
                    .build();
        }

        return VehicleResponse.builder()
                .id(vehicle.getId())
                .vehicleType(vehicleTypeResponse)
                .owner(ownerResponse)
                .registrationNumber(vehicle.getRegistrationNumber())
                .epc(vehicle.getEpc())
                .registeredYear(vehicle.getRegisteredYear())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}
