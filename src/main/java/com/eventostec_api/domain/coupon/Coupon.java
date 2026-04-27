package com.eventostec_api.domain.coupon;

import com.eventostec_api.domain.event.Event;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "coupon")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// Entidade para representar um cupom de desconto associado a um evento, contendo informações como código do cupom, valor do desconto e data de validade.
public class Coupon {
    @Id
    @GeneratedValue
    private UUID id;

    private String code;
    private Double discount;
    private Date valid;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;
}
