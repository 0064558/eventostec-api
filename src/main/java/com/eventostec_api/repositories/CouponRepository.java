package com.eventostec_api.repositories;

import com.eventostec_api.domain.coupon.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Date;
import java.util.List;
import java.util.UUID;

// Repositório para gerenciar as operações de persistência relacionadas à entidade Coupon, permitindo realizar operações CRUD (Create, Read, Update, Delete) no banco de dados.
public interface CouponRepository extends JpaRepository<Coupon, UUID> {
    List<Coupon> findByEventIdAndValidAfter(UUID eventId, Date currentDate);
}
