package com.example.compliance_service.repository;

import com.example.compliance_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    /**
     * Search owner users by first name, last name, full name, or NIC (case-insensitive LIKE).
     */
    @org.springframework.data.jpa.repository.Query(
        "SELECT u FROM User u WHERE u.role.name = 'OWNER' AND u.deleted = false AND (" +
        "LOWER(u.firstName) LIKE :q OR LOWER(u.lastName) LIKE :q OR " +
        "LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE :q OR LOWER(u.nic) LIKE :q)")
    List<User> searchOwnersByNameOrNic(@org.springframework.data.repository.query.Param("q") String q);
}
