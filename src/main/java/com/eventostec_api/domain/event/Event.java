package com.eventostec_api.domain.event;

import com.eventostec_api.domain.address.Address;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.UUID;

@Table(name = "event")
@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
// Entidade para representar um evento, contendo informações como título, descrição, URL da imagem, URL do evento, se é remoto ou presencial, data e endereço associado.
public class Event {
    @Id
    @GeneratedValue
    private UUID id;


    private String title;
    private String description;
    private String imgUrl;
    private String eventUrl;
    private Boolean remote;
    private Date date;

    @OneToOne(mappedBy = "event", cascade = CascadeType.ALL)
    private Address address;
}
