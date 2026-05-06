package com.eventostec_api.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    @Test
    void generateTokenAndParseUsername() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "0123456789abcdef0123456789abcdef");
        ReflectionTestUtils.setField(jwtService, "expirationMs", 3600000L);

        UserDetails user = User.withUsername("admin@admin.com")
                .password("ignored")
                .roles("ADMIN")
                .build();

        String token = jwtService.generateToken(user);

        assertFalse(token.isBlank());
        assertEquals("admin@admin.com", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, user));
    }
}
