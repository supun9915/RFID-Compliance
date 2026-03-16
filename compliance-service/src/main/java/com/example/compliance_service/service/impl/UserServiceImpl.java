package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.RegisterRequest;
import com.example.compliance_service.dto.request.UpdateUserRequest;
import com.example.compliance_service.dto.request.VehicleOwnerRequest;
import com.example.compliance_service.dto.response.*;
import com.example.compliance_service.entity.*;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.exception.UserAlreadyExistsException;
import com.example.compliance_service.repository.*;
import com.example.compliance_service.service.IUserService;
import jakarta.validation.constraints.NotNull;
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
    private final VehicleTypeRepository vehicleTypeRepository;
    private final VehicleModelRepository vehicleModelRepository;
    private final DocumentRepository DocumentRepository;
    private final DocumentTypeRepository documentTypeRepository;

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

    @Override
    public VehicleUserResponse createOwnerUser(Long id, VehicleOwnerRequest vehicleOwnerRequest) {
       User user = userRepository.findById(id)
               .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

         // Create new vehicle
        Vehicle vehicle = Vehicle.builder()
                .owner(user)
                .vehicleType(vehicleOwnerRequest.getVehicleTypeId() != null ? resolveVehicleType(vehicleOwnerRequest.getVehicleTypeId()) : null)
                .vehicleModel(vehicleOwnerRequest.getVehicleModelId() != null ? resolveVehicleModel(vehicleOwnerRequest.getVehicleModelId()) : null)
                .registrationNumber(vehicleOwnerRequest.getRegistrationNumber())
                .vehicleNumber(vehicleOwnerRequest.getVehicleNumber())
                .chassisNumber(vehicleOwnerRequest.getChassisNumber())
                .epc(null)
                .registeredYear(vehicleOwnerRequest.getRegisteredYear())
                .build();

        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        // Handle documents if provided
        List<Document> savedDocuments = Collections.emptyList();
        if (vehicleOwnerRequest.getDocumentRequests() != null) {
            List<Document> documents = vehicleOwnerRequest.getDocumentRequests().stream()
                    .map(docReq -> Document.builder()
                            .vehicle(savedVehicle)
                            .documentType(docReq.getDocumentTypeId() != null ? resolveDocumentType(docReq.getDocumentTypeId()) : null)
                            .referenceNumber(docReq.getReferenceNumber())
                            .imageUrl(docReq.getImageUrl())
                            .startDate(docReq.getStartDate())
                            .endDate(docReq.getEndDate())
                            .build())
                    .collect(Collectors.toList());
            savedDocuments = documentRepository.saveAll(documents);
        }

        // Map saved documents to DocumentResponse
        List<DocumentResponse> documentResponses = savedDocuments.stream()
                .map(doc -> DocumentResponse.builder()
                        .id(doc.getId())
                        .vehicleId(savedVehicle.getId())
                        .vehicleRegistrationNumber(savedVehicle.getRegistrationNumber())
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

        // Build VehicleDocumentResponse
        VehicleTypeResponse vehicleTypeResponse = savedVehicle.getVehicleType() != null
                ? VehicleTypeResponse.builder()
                        .id(savedVehicle.getVehicleType().getId())
                        .name(savedVehicle.getVehicleType().getName())
                        .description(savedVehicle.getVehicleType().getDescription())
                        .zplCode(savedVehicle.getVehicleType().getZplCode())
                        .createdAt(savedVehicle.getVehicleType().getCreatedAt())
                        .updatedAt(savedVehicle.getVehicleType().getUpdatedAt())
                        .build()
                : null;

        VehicleModelResponse vehicleModelResponse = savedVehicle.getVehicleModel() != null
                ? VehicleModelResponse.builder()
                        .id(savedVehicle.getVehicleModel().getId())
                        .name(savedVehicle.getVehicleModel().getName())
                        .description(savedVehicle.getVehicleModel().getDescription())
                        .make(savedVehicle.getVehicleModel().getMake() != null
                                ? VehicleMakeResponse.builder()
                                        .id(savedVehicle.getVehicleModel().getMake().getId())
                                        .name(savedVehicle.getVehicleModel().getMake().getName())
                                        .description(savedVehicle.getVehicleModel().getMake().getDescription())
                                        .createdAt(savedVehicle.getVehicleModel().getMake().getCreatedAt())
                                        .updatedAt(savedVehicle.getVehicleModel().getMake().getUpdatedAt())
                                        .build()
                                : null)
                        .createdAt(savedVehicle.getVehicleModel().getCreatedAt())
                        .updatedAt(savedVehicle.getVehicleModel().getUpdatedAt())
                        .build()
                : null;

        VehicleDocumentResponse vehicleDocumentResponse = VehicleDocumentResponse.builder()
                .id(savedVehicle.getId())
                .vehicleType(vehicleTypeResponse)
                .vehicleModel(vehicleModelResponse)
                .owner(mapToUserResponse(user))
                .registrationNumber(savedVehicle.getRegistrationNumber())
                .vehicleNumber(savedVehicle.getVehicleNumber())
                .chassisNumber(savedVehicle.getChassisNumber())
                .epc(savedVehicle.getEpc())
                .registeredYear(savedVehicle.getRegisteredYear())
                .createdAt(savedVehicle.getCreatedAt())
                .updatedAt(savedVehicle.getUpdatedAt())
                .documents(documentResponses)
                .build();

        return VehicleUserResponse.builder()
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
                .vehicleDocumentResponseList(List.of(vehicleDocumentResponse))
                .build();

    }

    @Override
    @Transactional
    public VehicleUserResponse updateOwnerUser(Long vehicleId, VehicleOwnerRequest vehicleOwnerRequest) {

        // 1. Load vehicle
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        // 2. Update vehicle fields
        if (vehicleOwnerRequest.getVehicleTypeId() != null) {
            vehicle.setVehicleType(resolveVehicleType(vehicleOwnerRequest.getVehicleTypeId()));
        }
        if (vehicleOwnerRequest.getVehicleModelId() != null) {
            vehicle.setVehicleModel(resolveVehicleModel(vehicleOwnerRequest.getVehicleModelId()));
        }
        if (vehicleOwnerRequest.getOwnerId() != null) {
            User newOwner = userRepository.findById(vehicleOwnerRequest.getOwnerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + vehicleOwnerRequest.getOwnerId()));
            vehicle.setOwner(newOwner);
        }
        if (vehicleOwnerRequest.getRegistrationNumber() != null) {
            vehicle.setRegistrationNumber(vehicleOwnerRequest.getRegistrationNumber());
        }
        if (vehicleOwnerRequest.getVehicleNumber() != null) {
            vehicle.setVehicleNumber(vehicleOwnerRequest.getVehicleNumber());
        }
        if (vehicleOwnerRequest.getChassisNumber() != null) {
            vehicle.setChassisNumber(vehicleOwnerRequest.getChassisNumber());
        }
        if (vehicleOwnerRequest.getRegisteredYear() != null) {
            vehicle.setRegisteredYear(vehicleOwnerRequest.getRegisteredYear());
        }
        vehicle.setUpdatedAt(java.time.OffsetDateTime.now());
        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        // 3. Sync documents by documentTypeId
        List<Document> existingDocuments = documentRepository.findByVehicleId(savedVehicle.getId());

        if (vehicleOwnerRequest.getDocumentRequests() != null) {
            // Build a map of existing docs keyed by documentTypeId for quick lookup
            java.util.Map<Long, Document> existingByTypeId = existingDocuments.stream()
                    .filter(d -> d.getDocumentType() != null)
                    .collect(Collectors.toMap(
                            d -> d.getDocumentType().getId(),
                            d -> d,
                            (a, b) -> a   // keep first if duplicates
                    ));

            // Collect incoming documentTypeIds
            java.util.Set<Long> incomingTypeIds = vehicleOwnerRequest.getDocumentRequests().stream()
                    .filter(r -> r.getDocumentTypeId() != null)
                    .map(com.example.compliance_service.dto.request.DocumentRequest::getDocumentTypeId)
                    .collect(Collectors.toSet());

            // Delete documents whose documentTypeId is no longer in the request
            existingDocuments.stream()
                    .filter(d -> d.getDocumentType() == null || !incomingTypeIds.contains(d.getDocumentType().getId()))
                    .forEach(documentRepository::delete);

            // Add or update documents
            for (com.example.compliance_service.dto.request.DocumentRequest docReq : vehicleOwnerRequest.getDocumentRequests()) {
                if (docReq.getDocumentTypeId() == null) continue;

                if (existingByTypeId.containsKey(docReq.getDocumentTypeId())) {
                    // Update existing document
                    Document existing = existingByTypeId.get(docReq.getDocumentTypeId());
                    existing.setReferenceNumber(docReq.getReferenceNumber());
                    existing.setImageUrl(docReq.getImageUrl());
                    existing.setStartDate(docReq.getStartDate());
                    existing.setEndDate(docReq.getEndDate());
                    existing.setUpdatedAt(java.time.OffsetDateTime.now());
                    documentRepository.save(existing);
                } else {
                    // Insert new document
                    Document newDoc = Document.builder()
                            .vehicle(savedVehicle)
                            .documentType(resolveDocumentType(docReq.getDocumentTypeId()))
                            .referenceNumber(docReq.getReferenceNumber())
                            .imageUrl(docReq.getImageUrl())
                            .startDate(docReq.getStartDate())
                            .endDate(docReq.getEndDate())
                            .createdAt(java.time.OffsetDateTime.now())
                            .updatedAt(java.time.OffsetDateTime.now())
                            .build();
                    documentRepository.save(newDoc);
                }
            }
        }

        // 4. Reload fresh data and build response
        Vehicle refreshedVehicle = vehicleRepository.findById(savedVehicle.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + savedVehicle.getId()));
        User owner = refreshedVehicle.getOwner();
        UserResponse ownerResponse = mapToUserResponse(owner);

        List<DocumentResponse> documentResponses = documentRepository.findByVehicleId(refreshedVehicle.getId())
                .stream()
                .map(doc -> DocumentResponse.builder()
                        .id(doc.getId())
                        .vehicleId(refreshedVehicle.getId())
                        .vehicleRegistrationNumber(refreshedVehicle.getRegistrationNumber())
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

        VehicleTypeResponse vehicleTypeResponse = refreshedVehicle.getVehicleType() != null
                ? VehicleTypeResponse.builder()
                        .id(refreshedVehicle.getVehicleType().getId())
                        .name(refreshedVehicle.getVehicleType().getName())
                        .description(refreshedVehicle.getVehicleType().getDescription())
                        .zplCode(refreshedVehicle.getVehicleType().getZplCode())
                        .createdAt(refreshedVehicle.getVehicleType().getCreatedAt())
                        .updatedAt(refreshedVehicle.getVehicleType().getUpdatedAt())
                        .build()
                : null;

        VehicleModelResponse vehicleModelResponse = null;
        if (refreshedVehicle.getVehicleModel() != null) {
            VehicleMakeResponse makeResponse = refreshedVehicle.getVehicleModel().getMake() != null
                    ? VehicleMakeResponse.builder()
                            .id(refreshedVehicle.getVehicleModel().getMake().getId())
                            .name(refreshedVehicle.getVehicleModel().getMake().getName())
                            .description(refreshedVehicle.getVehicleModel().getMake().getDescription())
                            .createdAt(refreshedVehicle.getVehicleModel().getMake().getCreatedAt())
                            .updatedAt(refreshedVehicle.getVehicleModel().getMake().getUpdatedAt())
                            .build()
                    : null;
            vehicleModelResponse = VehicleModelResponse.builder()
                    .id(refreshedVehicle.getVehicleModel().getId())
                    .name(refreshedVehicle.getVehicleModel().getName())
                    .description(refreshedVehicle.getVehicleModel().getDescription())
                    .make(makeResponse)
                    .createdAt(refreshedVehicle.getVehicleModel().getCreatedAt())
                    .updatedAt(refreshedVehicle.getVehicleModel().getUpdatedAt())
                    .build();
        }

        VehicleDocumentResponse vehicleDocumentResponse = VehicleDocumentResponse.builder()
                .id(refreshedVehicle.getId())
                .vehicleType(vehicleTypeResponse)
                .vehicleModel(vehicleModelResponse)
                .owner(ownerResponse)
                .registrationNumber(refreshedVehicle.getRegistrationNumber())
                .vehicleNumber(refreshedVehicle.getVehicleNumber())
                .chassisNumber(refreshedVehicle.getChassisNumber())
                .epc(refreshedVehicle.getEpc())
                .registeredYear(refreshedVehicle.getRegisteredYear())
                .createdAt(refreshedVehicle.getCreatedAt())
                .updatedAt(refreshedVehicle.getUpdatedAt())
                .documents(documentResponses)
                .build();

        // Build all vehicles for this owner to return in vehicleDocumentResponseList
        List<Vehicle> allOwnerVehicles = vehicleRepository.findByOwnerId(owner.getId());
        List<VehicleDocumentResponse> allVehicleDocumentResponses = allOwnerVehicles.stream()
                .map(v -> {
                    if (v.getId().equals(refreshedVehicle.getId())) {
                        return vehicleDocumentResponse; // already built above
                    }
                    List<DocumentResponse> otherDocs = documentRepository.findByVehicleId(v.getId())
                            .stream()
                            .map(doc -> DocumentResponse.builder()
                                    .id(doc.getId())
                                    .vehicleId(v.getId())
                                    .vehicleRegistrationNumber(v.getRegistrationNumber())
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

                    VehicleTypeResponse vt = v.getVehicleType() != null
                            ? VehicleTypeResponse.builder()
                                    .id(v.getVehicleType().getId())
                                    .name(v.getVehicleType().getName())
                                    .description(v.getVehicleType().getDescription())
                                    .zplCode(v.getVehicleType().getZplCode())
                                    .createdAt(v.getVehicleType().getCreatedAt())
                                    .updatedAt(v.getVehicleType().getUpdatedAt())
                                    .build()
                            : null;

                    VehicleModelResponse vm = null;
                    if (v.getVehicleModel() != null) {
                        VehicleMakeResponse mk = v.getVehicleModel().getMake() != null
                                ? VehicleMakeResponse.builder()
                                        .id(v.getVehicleModel().getMake().getId())
                                        .name(v.getVehicleModel().getMake().getName())
                                        .description(v.getVehicleModel().getMake().getDescription())
                                        .createdAt(v.getVehicleModel().getMake().getCreatedAt())
                                        .updatedAt(v.getVehicleModel().getMake().getUpdatedAt())
                                        .build()
                                : null;
                        vm = VehicleModelResponse.builder()
                                .id(v.getVehicleModel().getId())
                                .name(v.getVehicleModel().getName())
                                .description(v.getVehicleModel().getDescription())
                                .make(mk)
                                .createdAt(v.getVehicleModel().getCreatedAt())
                                .updatedAt(v.getVehicleModel().getUpdatedAt())
                                .build();
                    }

                    return VehicleDocumentResponse.builder()
                            .id(v.getId())
                            .vehicleType(vt)
                            .vehicleModel(vm)
                            .owner(ownerResponse)
                            .registrationNumber(v.getRegistrationNumber())
                            .vehicleNumber(v.getVehicleNumber())
                            .chassisNumber(v.getChassisNumber())
                            .epc(v.getEpc())
                            .registeredYear(v.getRegisteredYear())
                            .createdAt(v.getCreatedAt())
                            .updatedAt(v.getUpdatedAt())
                            .documents(otherDocs)
                            .build();
                })
                .collect(Collectors.toList());

        return VehicleUserResponse.builder()
                .id(owner.getId())
                .username(owner.getUsername())
                .email(owner.getEmail())
                .firstName(owner.getFirstName())
                .lastName(owner.getLastName())
                .contactNumber(owner.getContactNumber())
                .nic(owner.getNic())
                .district(owner.getDistrict())
                .province(owner.getProvince())
                .scanCenterId(owner.getScanCenter() != null ? owner.getScanCenter().getId() : null)
                .scanCenterName(owner.getScanCenter() != null ? owner.getScanCenter().getName() : null)
                .role(RoleResponse.builder()
                        .id(owner.getRole().getId())
                        .name(owner.getRole().getName())
                        .description(owner.getRole().getDescription())
                        .build())
                .createdAt(owner.getCreatedAt())
                .updatedAt(owner.getUpdatedAt())
                .vehicleDocumentResponseList(allVehicleDocumentResponses)
                .build();
    }

    @Override
    public VehicleUserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        List<Vehicle> vehicles = vehicleRepository.findByOwnerId(user.getId());

        UserResponse userResponse = mapToUserResponse(user);

        List<VehicleDocumentResponse> vehicleDocumentResponses = vehicles.stream()
                .map(vehicle -> {
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

                    return VehicleDocumentResponse.builder()
                            .id(vehicle.getId())
                            .vehicleType(vehicleTypeResponse)
                            .vehicleModel(vehicleModelResponse)
                            .owner(userResponse)
                            .registrationNumber(vehicle.getRegistrationNumber())
                            .vehicleNumber(vehicle.getVehicleNumber())
                            .chassisNumber(vehicle.getChassisNumber())
                            .epc(vehicle.getEpc())
                            .registeredYear(vehicle.getRegisteredYear())
                            .createdAt(vehicle.getCreatedAt())
                            .updatedAt(vehicle.getUpdatedAt())
                            .documents(documentResponses)
                            .build();
                })
                .collect(Collectors.toList());

        return VehicleUserResponse.builder()
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
                .vehicleDocumentResponseList(vehicleDocumentResponses)
                .build();
    }

    private VehicleType resolveVehicleType(@NotNull(message = "Vehicle type ID is required") Long vehicleTypeId) {
        VehicleType vehicleType = VehicleTypeRepository.findVehicleTypeById(vehicleTypeId);
        if (vehicleType == null) {
            throw new ResourceNotFoundException("Vehicle type not found with id: " + vehicleTypeId);
        }
        return vehicleType;
    }

    private VehicleModel resolveVehicleModel(@NotNull(message = "Vehicle model ID is required") Long vehicleModelId) {
        if (vehicleModelId == null) return null;
        return vehicleModelRepository.findById(vehicleModelId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle model not found with id: " + vehicleModelId));
    }

    private DocumentType resolveDocumentType(@NotNull(message = "Document type ID is required") Long documentTypeId) {
        if (documentTypeId == null) return null;
        DocumentType documentType = documentTypeRepository.findById(documentTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Document type not found with id: " + documentTypeId));
        return documentType;

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



