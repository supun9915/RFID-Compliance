package com.example.compliance_service.config;

import com.example.compliance_service.entity.Role;
import com.example.compliance_service.entity.User;
import com.example.compliance_service.repository.RoleRepository;
import com.example.compliance_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    @Profile("dev")
    public CommandLineRunner initSuperAdminPassword() {
        return args -> {
            Optional<User> superadminOpt = userRepository.findByUsername("superadmin");
            if (superadminOpt.isPresent()) {
                User superadmin = superadminOpt.get();
                // Update password to "superadmin" using the configured PasswordEncoder
                String encodedPassword = passwordEncoder.encode("superadmin");
                superadmin.setPassword(encodedPassword);
                userRepository.save(superadmin);
                log.info("Superadmin password has been reset to 'superadmin'");
            }
        };
    }

    @Bean
    public CommandLineRunner initDefaultRoles() {
        return args -> {
            Map<String, String> defaultRoles = Map.of(
                "SCAN_CENTER_ADMIN", "Scan Center Administrator with management access to a scan center",
                "SCAN_CENTER_USER",  "Scan Center User with operational access to a scan center"
            );

            for (Map.Entry<String, String> entry : defaultRoles.entrySet()) {
                String roleName = entry.getKey();
                if (roleRepository.findByName(roleName).isEmpty()) {
                    Role role = Role.builder()
                            .name(roleName)
                            .description(entry.getValue())
                            .build();
                    roleRepository.save(role);
                    log.info("Created default role: {}", roleName);
                } else {
                    log.debug("Role already exists, skipping: {}", roleName);
                }
            }
        };
    }
}
