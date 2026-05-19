package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.VehicleRequest;
import com.example.compliance_service.dto.response.*;
import com.example.compliance_service.entity.User;
import com.example.compliance_service.entity.Vehicle;
import com.example.compliance_service.entity.VehicleModel;
import com.example.compliance_service.entity.VehicleType;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.repository.UserRepository;
import com.example.compliance_service.repository.VehicleMakeRepository;
import com.example.compliance_service.repository.VehicleModelRepository;
import com.example.compliance_service.repository.VehicleRepository;
import com.example.compliance_service.repository.VehicleSequenceRepository;
import com.example.compliance_service.repository.VehicleTypeRepository;
import com.example.compliance_service.service.IVehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements IVehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final VehicleModelRepository vehicleModelRepository;
    private final UserRepository userRepository;
    private final VehicleSequenceRepository vehicleSequenceRepository;

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
        // Check if registration number already exists
        if (vehicleRepository.existsByRegistrationNumberAndActiveTrue(request.getRegistrationNumber())) {
            throw new IllegalArgumentException("Vehicle with registration number " + request.getRegistrationNumber() + " already exists");
        }

        VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with id: " + request.getVehicleTypeId()));

        VehicleModel vehicleModel = vehicleModelRepository.findById(request.getVehicleModelId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle model not found with id: " + request.getVehicleModelId()));

        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getOwnerId()));

        //Check registration number uniqueness for the same owner and vehicle type
        if (vehicleRepository.existsByRegistrationNumberAndActiveTrue(request.getRegistrationNumber())) {
            throw new IllegalArgumentException("Vehicle with registration number " + request.getRegistrationNumber() +
                    " already exists for the same owner and vehicle type");
        }

        if(!Objects.equals(owner.getRole().getName(), "OWNER")) {
            throw new IllegalArgumentException("User role must be OWNER to be assigned as vehicle owner");
        }

        EpcResponse epcResponse = generateEpc(request.getVehicleTypeId(), request.getVehicleModelId());


        Vehicle vehicle = Vehicle.builder()
                .vehicleType(vehicleType)
                .vehicleModel(vehicleModel)
                .owner(owner)
                .registrationNumber(request.getRegistrationNumber())
                .vehicleNumber(request.getVehicleNumber())
                .chassisNumber(request.getChassisNumber())
                .registeredYear(request.getRegisteredYear())
                .epc(epcResponse.getEpc())
                .active(true)
                .deleted(false)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .nextSerialNumber(epcResponse.getNextSerialNumber())
                .build();

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return mapToResponse(savedVehicle);
    }

    private EpcResponse generateEpc(Long vehicleTypeId, Long vehicleModelId) {
        // Read the current serial number from the vehicle_sequence table
        com.example.compliance_service.entity.VehicleSequence sequence =
                vehicleSequenceRepository.findTopByOrderByIdAsc()
                        .orElseGet(() -> vehicleSequenceRepository.save(
                                com.example.compliance_service.entity.VehicleSequence.builder()
                                        .serialNumber(1L)
                                        .build()));

        long nextSerial = sequence.getSerialNumber();

        // Build a 96-bit (12-byte) EPC as a 24-character uppercase hex string:
        //   Byte  0    : 0x01  – header/version
        //   Bytes 1–2  : vehicleTypeId  (16-bit, max 65535)
        //   Bytes 3–4  : vehicleModelId (16-bit, max 65535)
        //   Bytes 5–8  : 0x00000000     – reserved
        //   Bytes 9–11 : serialNumber   (24-bit, max 16777215)
        long safeTypeId  = vehicleTypeId  != null ? vehicleTypeId  & 0xFFFFL : 0L;
        long safeModelId = vehicleModelId != null ? vehicleModelId & 0xFFFFL : 0L;
        long safeSerial  = nextSerial & 0xFFFFFFL;

        String epc = String.format("05%04X%04X00000000%06X",
                safeTypeId, safeModelId, safeSerial);

        // Increment and persist the serial number back to the sequence table
        sequence.setSerialNumber(nextSerial + 1);
        vehicleSequenceRepository.save(sequence);

        EpcResponse epcResponse = new EpcResponse();
        epcResponse.setEpc(epc);
        epcResponse.setNextSerialNumber(nextSerial + 1);
        return epcResponse;
    }

    @Override
    @Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        // Check registration number uniqueness if changing
        if (!vehicle.getRegistrationNumber().equals(request.getRegistrationNumber()) 
                && vehicleRepository.existsByRegistrationNumberAndActiveTrue(request.getRegistrationNumber())) {
            throw new IllegalArgumentException("Vehicle with registration number " + request.getRegistrationNumber() + " already exists");
        }

        VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle type not found with id: " + request.getVehicleTypeId()));

        VehicleModel vehicleModel = null;
        if (request.getVehicleModelId() != null) {
            vehicleModel = vehicleModelRepository.findById(request.getVehicleModelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle model not found with id: " + request.getVehicleModelId()));
        }

        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getOwnerId()));

        vehicle.setVehicleType(vehicleType);
        vehicle.setVehicleModel(vehicleModel);
        vehicle.setOwner(owner);
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setVehicleNumber(request.getVehicleNumber());
        vehicle.setChassisNumber(request.getChassisNumber());
        vehicle.setRegisteredYear(request.getRegisteredYear());
        vehicle.setUpdatedAt(OffsetDateTime.now());

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

    @Override
    @Transactional
    public VehicleResponse activateVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        vehicle.setActive(true);
        vehicle.setUpdatedAt(OffsetDateTime.now());
        return mapToResponse(vehicleRepository.save(vehicle));
    }

    @Override
    @Transactional
    public VehicleResponse deactivateVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        vehicle.setActive(false);
        vehicle.setUpdatedAt(OffsetDateTime.now());
        return mapToResponse(vehicleRepository.save(vehicle));
    }

    @Override
    @Transactional
    public void softDeleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        vehicle.setActive(false);
        vehicle.setDeleted(true);
        vehicle.setUpdatedAt(OffsetDateTime.now());
        vehicleRepository.save(vehicle);
    }

    private VehicleResponse mapToResponse(Vehicle vehicle) {
        VehicleTypeResponse vehicleTypeResponse = null;
        if (vehicle.getVehicleType() != null) {
            vehicleTypeResponse = VehicleTypeResponse.builder()
                    .id(vehicle.getVehicleType().getId())
                    .name(vehicle.getVehicleType().getName())
                    .description(vehicle.getVehicleType().getDescription())
                    .zplCode(vehicle.getVehicleType().getZplCode())
                    .active(vehicle.getVehicleType().getActive())
                    .deleted(vehicle.getVehicleType().getDeleted())
                    .createdAt(vehicle.getVehicleType().getCreatedAt())
                    .updatedAt(vehicle.getVehicleType().getUpdatedAt())
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
                    .active(vehicle.getOwner().getActive())
                    .deleted(vehicle.getOwner().getDeleted())
                    .createdAt(vehicle.getOwner().getCreatedAt())
                    .updatedAt(vehicle.getOwner().getUpdatedAt())
                    .build();
        }

        return VehicleResponse.builder()
                .id(vehicle.getId())
                .vehicleType(vehicleTypeResponse)
                .vehicleModel(buildVehicleModelResponse(vehicle.getVehicleModel()))
                .owner(ownerResponse)
                .registrationNumber(vehicle.getRegistrationNumber())
                .vehicleNumber(vehicle.getVehicleNumber())
                .chassisNumber(vehicle.getChassisNumber())
                .epc(vehicle.getEpc())
                .registeredYear(vehicle.getRegisteredYear())
                .active(vehicle.getActive())
                .deleted(vehicle.getDeleted())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }

    private VehicleModelResponse buildVehicleModelResponse(VehicleModel vehicleModel) {
        if (vehicleModel == null) return null;
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
