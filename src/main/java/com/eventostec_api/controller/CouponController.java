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
public class CouponController {
    @Autowired
    private CouponService couponService;

    @PostMapping("/events/{eventId}")
    public ResponseEntity<Coupon> addCouponToEvent(@PathVariable UUID eventId, @RequestBody CouponRequestDTO couponData) {
        Coupon coupons = couponService.addCouponToEvent(eventId, couponData);
        return ResponseEntity.ok(coupons);
    }
}
