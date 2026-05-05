package com.eventostec_api.domain.address;

import com.eventostec_api.domain.event.Event;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "address")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// Entidade para representar o endereço de um evento, contendo informações como cidade e estado (UF).
public class Address {
    @Id
    @GeneratedValue
    private UUID id;

    private String uf;
    private String city;

    @OneToOne
    @JoinColumn(name = "event_id")
    private Event event;
}
