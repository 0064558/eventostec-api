package com.eventostec_api.controller;

import com.eventostec_api.domain.coupon.Coupon;
import com.eventostec_api.domain.coupon.CouponRequestDTO;
import com.eventostec_api.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping
// Controlador responsável por gerenciar as operações relacionadas aos cupons, como criação, associação a eventos e consulta de cupons válidos para um evento específico.
public class CouponController {
    @Autowired
    private CouponService couponService;

    @PostMapping("/events/{eventId}")
    public ResponseEntity<Void> addCouponToEvent(@PathVariable UUID eventId, @RequestBody CouponRequestDTO couponData) {
        couponService.addCouponToEvent(eventId, couponData);
        return ResponseEntity.noContent().build();
    }
}
