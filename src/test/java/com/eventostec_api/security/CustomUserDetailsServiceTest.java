package com.eventostec_api.security;

import com.eventostec_api.domain.auth.user.AppUser;
import com.eventostec_api.domain.enums.Role;
import com.eventostec_api.repositories.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private AppUserRepository repository;

    @Test
    void loadUserByUsernameReturnsUserDetails() {
        AppUser user = new AppUser();
        user.setId(UUID.randomUUID());
        user.setEmail("admin@admin.com");
        user.setPasswordHash("hashed-password");
        user.setRole(Role.ADMIN);
        user.setEnabled(true);

        when(repository.findByEmail("admin@admin.com")).thenReturn(Optional.of(user));

        CustomUserDetailsService service = new CustomUserDetailsService(repository);
        UserDetails details = service.loadUserByUsername("admin@admin.com");

        assertEquals("admin@admin.com", details.getUsername());
        assertEquals("hashed-password", details.getPassword());
        assertTrue(details.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority())));
    }

    @Test
    void loadUserByUsernameThrowsWhenMissing() {
        when(repository.findByEmail("missing@admin.com")).thenReturn(Optional.empty());

        CustomUserDetailsService service = new CustomUserDetailsService(repository);

        assertThrows(UsernameNotFoundException.class,
                () -> service.loadUserByUsername("missing@admin.com"));
    }
}
