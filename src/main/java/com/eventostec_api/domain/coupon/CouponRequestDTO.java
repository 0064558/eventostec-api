package com.eventostec_api.domain.coupon;

// DTO para representar os dados necessários para criar ou atualizar um cupom de desconto, incluindo o código do cupom, o valor do desconto e a data de validade.
public record CouponRequestDTO(String code, Double discount, Long valid) {
}
