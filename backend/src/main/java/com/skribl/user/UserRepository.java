package com.skribl.user;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailNormalized(String emailNormalized);
    Optional<User> findByUsername(String username);
    boolean existsByEmailNormalized(String emailNormalized);
    boolean existsByUsername(String username);
}
