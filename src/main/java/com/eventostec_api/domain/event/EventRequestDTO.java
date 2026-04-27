package com.eventostec_api.domain.event;

import org.springframework.web.multipart.MultipartFile;

// DTO para receber os dados do evento na requisição de criação
public record EventRequestDTO(String title, String description, Long date, String city, String uf, Boolean remote, String eventUrl, MultipartFile image) {

}
