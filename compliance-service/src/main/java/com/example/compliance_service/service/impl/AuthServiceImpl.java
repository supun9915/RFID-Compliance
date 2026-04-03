package com.example.compliance_service.service.impl;

import com.example.compliance_service.dto.request.LoginRequest;
import com.example.compliance_service.dto.request.RegisterRequest;
import com.example.compliance_service.dto.response.AuthResponse;
import com.example.compliance_service.dto.response.RoleResponse;
import com.example.compliance_service.dto.response.ScanCenterResponse;
import com.example.compliance_service.entity.Role;
import com.example.compliance_service.entity.User;
import com.example.compliance_service.exception.ResourceNotFoundException;
import com.example.compliance_service.exception.UserAlreadyExistsException;
import com.example.compliance_service.repository.RoleRepository;
import com.example.compliance_service.repository.UserRepository;
import com.example.compliance_service.security.JwtTokenProvider;
import com.example.compliance_service.service.IAuthService;
import com.example.compliance_service.service.ITokenBlacklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final ITokenBlacklistService tokenBlacklistService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
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

        // Generate token
        String token = jwtTokenProvider.generateTokenFromUsername(savedUser.getUsername());

        RoleResponse roleResponse = new RoleResponse();
        roleResponse.setId(role.getId());
        roleResponse.setName(role.getName());
        roleResponse.setDescription(role.getDescription());
        roleResponse.setActive(role.getActive());
        roleResponse.setDeleted(role.getDeleted());
        roleResponse.setCreatedAt(role.getCreatedAt());
        roleResponse.setUpdatedAt(role.getUpdatedAt());


        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(roleResponse)
                .scanCenter(null)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        String token = jwtTokenProvider.generateToken(authentication);
        User user = (User) authentication.getPrincipal();

        RoleResponse roleResponse = new RoleResponse();
        if (user.getRole() != null) {
            roleResponse.setId(user.getRole().getId());
            roleResponse.setName(user.getRole().getName());
            roleResponse.setDescription(user.getRole().getDescription());
            roleResponse.setActive(user.getRole().getActive());
            roleResponse.setDeleted(user.getRole().getDeleted());
            roleResponse.setCreatedAt(user.getRole().getCreatedAt());
            roleResponse.setUpdatedAt(user.getRole().getUpdatedAt());

        } else {
            roleResponse = null;
        }

        ScanCenterResponse scanCenterResponse = new ScanCenterResponse();
        if (user.getScanCenter() != null) {
            scanCenterResponse.setId(user.getScanCenter().getId());
            scanCenterResponse.setName(user.getScanCenter().getName());
            scanCenterResponse.setLocation(user.getScanCenter().getLocation());
            scanCenterResponse.setIsActive(user.getScanCenter().getIsActive());
            scanCenterResponse.setDeleted(user.getScanCenter().getDeleted());
            scanCenterResponse.setCreatedAt(user.getScanCenter().getCreatedAt());
            scanCenterResponse.setUpdatedAt(user.getScanCenter().getUpdatedAt());

        } else {
            scanCenterResponse = null;
        }


        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(roleResponse)
                .scanCenter(scanCenterResponse)
                .build();
    }

    @Override
    public String logout(String token) {
        // Extract the actual token from "Bearer <token>"
        String jwtToken = token;
        if (token != null && token.startsWith("Bearer ")) {
            jwtToken = token.substring(7);
        }

        // Add token to blacklist
        tokenBlacklistService.blacklistToken(jwtToken);

        return "User logged out successfully";
    }
}
