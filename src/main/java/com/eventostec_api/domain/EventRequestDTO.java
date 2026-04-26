package com.eventostec_api.domain;

import org.springframework.web.multipart.MultipartFile;

import java.util.Date;

public record EventRequestDTO(String title, String description, Long date, String uf, String city, Boolean remote, String eventUrl, MultipartFile image) {

}
