package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.RegisterRequest;
import com.example.compliance_service.dto.request.UpdateUserRequest;
import com.example.compliance_service.dto.response.*;
import com.example.compliance_service.entity.Role;
import com.example.compliance_service.entity.ScanCenter;
import com.example.compliance_service.entity.User;
import com.example.compliance_service.entity.Vehicle;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.exception.UserAlreadyExistsException;
import com.example.compliance_service.repository.DocumentRepository;
import com.example.compliance_service.repository.RoleRepository;
import com.example.compliance_service.repository.ScanCenterRepository;
import com.example.compliance_service.repository.UserRepository;
import com.example.compliance_service.repository.VehicleRepository;
import com.example.compliance_service.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.jpa.domain.Specification;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ScanCenterRepository scanCenterRepository;
    private final VehicleRepository vehicleRepository;
    private final DocumentRepository documentRepository;

    @Override
    public List<UserResponse> getUsers(Map<String, Object> params) {
        Specification<User> spec = buildSpecification(params);
        List<User> users = userRepository.findAll(spec);
        return users.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    private Specification<User> buildSpecification(Map<String, Object> params) {
        return (root, query, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();

            params.forEach((key, value) -> {
                if (value != null && !value.toString().isEmpty()) {
                    // Handle role filter specially — join to role and match by name
                    if ("role".equalsIgnoreCase(key)) {
                        jakarta.persistence.criteria.Join<?, ?> roleJoin = root.join("role");
                        if (value instanceof java.util.List<?> roleList && !((java.util.List<?>) roleList).isEmpty()) {
                            // Multiple roles: use IN with exact (case-insensitive) match
                            List<String> upperRoles = ((java.util.List<?>) roleList).stream()
                                    .map(r -> r.toString().toUpperCase())
                                    .collect(Collectors.toList());
                            predicates.add(criteriaBuilder.upper(roleJoin.get("name").as(String.class))
                                    .in(upperRoles));
                        } else {
                            // Single role string: keep original LIKE behaviour
                            predicates.add(criteriaBuilder.like(
                                    criteriaBuilder.lower(roleJoin.get("name").as(String.class)),
                                    "%" + value.toString().toLowerCase() + "%"
                            ));
                        }
                        return;
                    }
                    try {
                        var field = root.get(key);
                        Class<?> fieldType = field.getJavaType();

                        if (fieldType.equals(Long.class) || fieldType.equals(long.class)) {
                            predicates.add(criteriaBuilder.equal(field, Long.parseLong(value.toString())));
                        } else if (fieldType.equals(String.class)) {
                            predicates.add(criteriaBuilder.like(
                                    criteriaBuilder.lower(field.as(String.class)),
                                    "%" + value.toString().toLowerCase() + "%"
                            ));
                        } else {
                            predicates.add(criteriaBuilder.equal(field, value));
                        }
                    } catch (IllegalArgumentException e) {
                        // Field doesn't exist in entity, skip it
                    }
                }
            });

            return criteriaBuilder.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    @Override
    public List<OwnerUserResponse> getOwnerUsers(Map<String, Object> params) {
        Specification<User> spec = buildSpecification(params);
        List<User> users = userRepository.findAll(spec);
        return users.stream()
                .map(this::mapToOwnerUserResponse)
                .collect(Collectors.toList());
    }

    private OwnerUserResponse mapToOwnerUserResponse(User user) {
        List<Vehicle> vehicles = vehicleRepository.findByOwnerId(user.getId());
        List<OwnerVehicleResponse> vehicleResponses = vehicles.stream()
                .map(this::mapToOwnerVehicleResponse)
                .collect(Collectors.toList());

        return OwnerUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .contactNumber(user.getContactNumber())
                .nic(user.getNic())
                .district(user.getDistrict())
                .province(user.getProvince())
                .scanCenterId(user.getScanCenter() != null ? user.getScanCenter().getId() : null)
                .scanCenterName(user.getScanCenter() != null ? user.getScanCenter().getName() : null)
                .role(RoleResponse.builder()
                        .id(user.getRole().getId())
                        .name(user.getRole().getName())
                        .description(user.getRole().getDescription())
                        .build())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .vehicles(vehicleResponses)
                .build();
    }

    private OwnerVehicleResponse mapToOwnerVehicleResponse(Vehicle vehicle) {
        List<DocumentResponse> documentResponses = documentRepository.findByVehicleId(vehicle.getId())
                .stream()
                .map(doc -> DocumentResponse.builder()
                        .id(doc.getId())
                        .vehicleId(vehicle.getId())
                        .vehicleRegistrationNumber(vehicle.getRegistrationNumber())
                        .documentType(doc.getDocumentType() != null
                                ? DocumentTypeResponse.builder()
                                        .id(doc.getDocumentType().getId())
                                        .name(doc.getDocumentType().getName())
                                        .description(doc.getDocumentType().getDescription())
                                        .build()
                                : null)
                        .referenceNumber(doc.getReferenceNumber())
                        .imageUrl(doc.getImageUrl())
                        .startDate(doc.getStartDate())
                        .endDate(doc.getEndDate())
                        .createdAt(doc.getCreatedAt())
                        .updatedAt(doc.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

        VehicleTypeResponse vehicleTypeResponse = vehicle.getVehicleType() != null
                ? VehicleTypeResponse.builder()
                        .id(vehicle.getVehicleType().getId())
                        .name(vehicle.getVehicleType().getName())
                        .description(vehicle.getVehicleType().getDescription())
                        .zplCode(vehicle.getVehicleType().getZplCode())
                        .createdAt(vehicle.getVehicleType().getCreatedAt())
                        .updatedAt(vehicle.getVehicleType().getUpdatedAt())
                        .build()
                : null;

        VehicleModelResponse vehicleModelResponse = null;
        if (vehicle.getVehicleModel() != null) {
            VehicleMakeResponse makeResponse = vehicle.getVehicleModel().getMake() != null
                    ? VehicleMakeResponse.builder()
                            .id(vehicle.getVehicleModel().getMake().getId())
                            .name(vehicle.getVehicleModel().getMake().getName())
                            .description(vehicle.getVehicleModel().getMake().getDescription())
                            .createdAt(vehicle.getVehicleModel().getMake().getCreatedAt())
                            .updatedAt(vehicle.getVehicleModel().getMake().getUpdatedAt())
                            .build()
                    : null;
            vehicleModelResponse = VehicleModelResponse.builder()
                    .id(vehicle.getVehicleModel().getId())
                    .name(vehicle.getVehicleModel().getName())
                    .description(vehicle.getVehicleModel().getDescription())
                    .make(makeResponse)
                    .createdAt(vehicle.getVehicleModel().getCreatedAt())
                    .updatedAt(vehicle.getVehicleModel().getUpdatedAt())
                    .build();
        }

        return OwnerVehicleResponse.builder()
                .id(vehicle.getId())
                .vehicleType(vehicleTypeResponse)
                .vehicleModel(vehicleModelResponse)
                .registrationNumber(vehicle.getRegistrationNumber())
                .vehicleNumber(vehicle.getVehicleNumber())
                .chassisNumber(vehicle.getChassisNumber())
                .epc(vehicle.getEpc())
                .registeredYear(vehicle.getRegisteredYear())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .documents(documentResponses)
                .build();
    }

    @Override
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(RegisterRequest request) {
        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username is already taken");
        }

        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email is already registered");
        }

        // Get role (default to OWNER if not specified)
        Role role;
        if (request.getRoleId() != null) {
            role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + request.getRoleId()));
        } else {
            role = roleRepository.findByName("OWNER")
                    .orElseThrow(() -> new ResourceNotFoundException("Default role OWNER not found"));
        }

        // Create new user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .contactNumber(request.getContactNumber())
                .nic(request.getNic())
                .district(request.getDistrict())
                .province(request.getProvince())
                .scanCenter(request.getScanCenterId() != null ? resolveScanCenter(request.getScanCenterId()) : null)
                .role(role)
                .build();

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Check username uniqueness if changing
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new UserAlreadyExistsException("Username is already taken");
            }
            user.setUsername(request.getUsername());
        }

        // Check email uniqueness if changing
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new UserAlreadyExistsException("Email is already registered");
            }
            user.setEmail(request.getEmail());
        }

        // Update password if provided
        if (request.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Update other fields
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getContactNumber() != null) {
            user.setContactNumber(request.getContactNumber());
        }
        if (request.getNic() != null) {
            user.setNic(request.getNic());
        }
        if (request.getDistrict() != null) {
            user.setDistrict(request.getDistrict());
        }
        if (request.getProvince() != null) {
            user.setProvince(request.getProvince());
        }

        // Update role if provided
        if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + request.getRoleId()));
            user.setRole(role);
        }

        // Update scan center if provided
        if (request.getScanCenterId() != null) {
            user.setScanCenter(resolveScanCenter(request.getScanCenterId()));
        }

        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }

    private ScanCenter resolveScanCenter(Long scanCenterId) {
        if (scanCenterId == null) return null;
        return scanCenterRepository.findById(scanCenterId)
                .orElseThrow(() -> new ResourceNotFoundException("ScanCenter not found with id: " + scanCenterId));
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .contactNumber(user.getContactNumber())
                .nic(user.getNic())
                .district(user.getDistrict())
                .province(user.getProvince())
                .scanCenterId(user.getScanCenter() != null ? user.getScanCenter().getId() : null)
                .scanCenterName(user.getScanCenter() != null ? user.getScanCenter().getName() : null)
                .role(RoleResponse.builder()
                        .id(user.getRole().getId())
                        .name(user.getRole().getName())
                        .description(user.getRole().getDescription())
                        .build())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
