package com.eventostec_api.service;

import com.eventostec_api.domain.coupon.Coupon;
import com.eventostec_api.domain.coupon.CouponRequestDTO;
import com.eventostec_api.domain.event.Event;
import com.eventostec_api.repositories.CouponRepository;
import com.eventostec_api.repositories.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
// Serviço responsável por gerenciar as operações relacionadas aos cupons, como criação, associação a eventos e consulta de cupons válidos para um evento específico.
public class CouponService {
    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private EventRepository eventRepository;

    public Coupon addCouponToEvent(UUID eventId, CouponRequestDTO couponData) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + eventId));

        Coupon coupon = new Coupon();
        coupon.setCode(couponData.code());
        coupon.setDiscount(couponData.discount());
        coupon.setValid(new Date(couponData.valid()));
        coupon.setEvent(event);

        return couponRepository.save(coupon);
    }

    public Coupon updateCoupon(UUID eventId, UUID couponId, CouponRequestDTO couponData) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found with id: " + couponId));

        if (coupon.getEvent() == null || !coupon.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("Coupon does not belong to event: " + eventId);
        }

        coupon.setCode(couponData.code());
        coupon.setDiscount(couponData.discount());
        coupon.setValid(new Date(couponData.valid()));

        return couponRepository.save(coupon);
    }

    public void deleteCoupon(UUID eventId, UUID couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found with id: " + couponId));

        if (coupon.getEvent() == null || !coupon.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("Coupon does not belong to event: " + eventId);
        }

        couponRepository.delete(coupon);
    }

    public List<Coupon> consultCoupons(UUID eventId, Date currentDate) {
        return couponRepository.findByEventIdAndValidAfter(eventId, currentDate);
    }
}
