package com.eventostec_api.domain.event;

import java.util.Date;
import java.util.List;
import java.util.UUID;

// DTO para representar os detalhes de um evento, incluindo informações como título, descrição, data, localização e uma lista de cupons de desconto associados ao evento.
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
    // DTO aninhado para representar os detalhes de um cupom de desconto, contendo informações como código do cupom, valor do desconto e data de validade.
    public record CouponDTO(
            String code,
            Double discount,
            Date validUntil) {
    }
}
