package com.eventostec_api.controller;

import com.eventostec_api.domain.event.EventDetailsDTO;
import com.eventostec_api.domain.event.EventRequestDTO;
import com.eventostec_api.domain.event.Event;
import com.eventostec_api.domain.event.EventResponseDTO;
import com.eventostec_api.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/events")
// Controlador responsável por gerenciar as operações relacionadas aos eventos, como criação, consulta de eventos futuros, consulta de eventos filtrados e obtenção de detalhes de um evento específico.
public class EventController {

    @Autowired
    private EventService eventService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Event> createEvent(@RequestParam("title") String title,
                                             @RequestParam(value = "description", required = false) String description,
                                             @RequestParam("date") Long date,
                                             @RequestParam("city") String city,
                                             @RequestParam("uf") String uf,
                                             @RequestParam("remote") Boolean remote,
                                             @RequestParam("eventUrl") String eventUrl,
                                             @RequestParam(value = "image", required = false) MultipartFile image) {
        EventRequestDTO eventRequestDTO = new EventRequestDTO(title, description, date, city, uf, remote, eventUrl, image);
        Event newEvent = this.eventService.createEvent(eventRequestDTO);
        return ResponseEntity.ok(newEvent);
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventDetailsDTO> getEventDetails(@PathVariable UUID eventId) {
        // Lógica para buscar o evento pelo ID e retornar os detalhes
        EventDetailsDTO eventDetails = this.eventService.getEventDetails(eventId);
        return ResponseEntity.ok(eventDetails);
    }

    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> getEvents(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        // Lógica para buscar o evento pelo ID e retornar os detalhes
        List<EventResponseDTO> allEvents = this.eventService.getUpcomingEvents(page, size);

        return ResponseEntity.ok(allEvents);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<EventResponseDTO>> getFilteredEvents(@RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "10") int size,
                                                                    @RequestParam(required = false) String title,
                                                                    @RequestParam(required = false) String city,
                                                                    @RequestParam(required = false) String uf,
                                                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
                                                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate) {
        // Lógica para buscar o evento pelo ID e retornar os detalhes
        List<EventResponseDTO> filteredEvents = this.eventService.getFilteredEvents(page, size, title, city, uf, startDate, endDate);
        return ResponseEntity.ok(filteredEvents);
    }

    @PutMapping(value = "/{eventId}", consumes = "multipart/form-data")
    public ResponseEntity<EventResponseDTO> updateEvent(
            @PathVariable UUID eventId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("date") Long date,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "uf", required = false) String uf,
            @RequestParam("remote") Boolean remote,
            @RequestParam("eventUrl") String eventUrl,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        EventRequestDTO eventRequestDTO = new EventRequestDTO(
                title, description, date, city, uf, remote, eventUrl, image
        );

        Event updatedEvent = this.eventService.updateEvent(eventId, eventRequestDTO);
        return ResponseEntity.ok(new EventResponseDTO(
                updatedEvent.getId(),
                updatedEvent.getTitle(),
                updatedEvent.getDescription(),
                updatedEvent.getDate(),
                updatedEvent.getAddress() != null ? updatedEvent.getAddress().getCity() : "",
                updatedEvent.getAddress() != null ? updatedEvent.getAddress().getUf() : "",
                updatedEvent.getRemote(),
                updatedEvent.getEventUrl(),
                updatedEvent.getImgUrl()
        ));
    }
}

