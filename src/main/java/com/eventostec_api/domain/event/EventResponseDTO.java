package com.eventostec_api.domain.event;

import java.util.Date;
import java.util.UUID;

// DTO para representar as informações básicas de um evento, incluindo título, descrição, data, localização e URLs associadas ao evento.
public record EventResponseDTO(UUID id, String title, String description, Date date, String city, String uf, Boolean remote, String eventUrl, String imgUrl) {

}
