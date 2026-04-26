package com.eventostec_api.domain.event;

import org.springframework.web.multipart.MultipartFile;

public record EventRequestDTO(String title, String description, Long date, String uf, String city, Boolean remote, String eventUrl, MultipartFile image) {

}
