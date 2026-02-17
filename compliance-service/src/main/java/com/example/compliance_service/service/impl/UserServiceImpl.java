package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.RegisterRequest;
import com.example.compliance_service.dto.request.UpdateUserRequest;
import com.example.compliance_service.dto.response.RoleResponse;
import com.example.compliance_service.dto.response.UserResponse;
import com.example.compliance_service.entity.Role;
import com.example.compliance_service.entity.User;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.exception.UserAlreadyExistsException;
import com.example.compliance_service.repository.RoleRepository;
import com.example.compliance_service.repository.UserRepository;
import com.example.compliance_service.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

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
                    try {
                        // Check if the field exists in User entity
                        var field = root.get(key);
                        Class<?> fieldType = field.getJavaType();

                        if (fieldType.equals(Long.class) || fieldType.equals(long.class)) {
                            // Exact match for ID fields
                            predicates.add(criteriaBuilder.equal(field, Long.parseLong(value.toString())));
                        } else if (fieldType.equals(String.class)) {
                            // Case-insensitive LIKE match for String fields
                            predicates.add(criteriaBuilder.like(
                                    criteriaBuilder.lower(field.as(String.class)),
                                    "%" + value.toString().toLowerCase() + "%"
                            ));
                        } else {
                            // Exact match for other types
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

        // Update role if provided
        if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + request.getRoleId()));
            user.setRole(role);
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

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .contactNumber(user.getContactNumber())
                .nic(user.getNic())
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
