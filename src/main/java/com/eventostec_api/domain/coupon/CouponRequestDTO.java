package com.eventostec_api.domain.coupon;

public record CouponRequestDTO(String code, Double discount, Long valid) {
}
