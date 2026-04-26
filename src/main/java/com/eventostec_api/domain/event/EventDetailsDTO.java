package com.eventostec_api.domain.event;

import java.util.Date;
import java.util.List;
import java.util.UUID;

public record EventDetailsDTO(
        UUID ID,
        String title,
        String description,
        Date date,
        String city,
        String uf,
        String imgUrl,
        String eventUrl,
        List<CouponDTO> coupons

) {
    public record CouponDTO(
            String code,
            Double discount,
            Date validUntil) {
    }
}
