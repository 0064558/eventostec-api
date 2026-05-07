package com.eventostec_api.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.eventostec_api.domain.address.Address;
import com.eventostec_api.domain.coupon.Coupon;
import com.eventostec_api.domain.event.Event;
import com.eventostec_api.domain.event.EventDetailsDTO;
import com.eventostec_api.domain.event.EventRequestDTO;
import com.eventostec_api.domain.event.EventResponseDTO;
import com.eventostec_api.repositories.EventRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EventService {

    @Value("${aws.bucket.name}")
    private String bucketName;

    @Autowired
    private AmazonS3 s3Client;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AddressService addressService;

    @Autowired
    private CouponService couponService;

    public Event createEvent(EventRequestDTO data) {
        String imgUrl = null;

        if (data.image() != null && !data.image().isEmpty()) {
            imgUrl = this.uploadImg(data.image());
        }

        Event newEvent = new Event();
        newEvent.setTitle(data.title());
        newEvent.setDescription(data.description());
        newEvent.setDate(new Date(data.date()));
        newEvent.setRemote(data.remote());
        newEvent.setEventUrl(data.eventUrl());
        newEvent.setImgUrl(imgUrl);

        eventRepository.save(newEvent);

        if (!data.remote()) {
            addressService.createAddress(data, newEvent);
        }

        return newEvent;
    }

    public List<EventResponseDTO> getUpcomingEvents(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Event> eventsPage = this.eventRepository.findUpComingEvents(new Date(), pageable);
        return eventsPage.map(event -> new EventResponseDTO(
                        event.getId(),
                        event.getTitle(),
                        event.getDescription(),
                        event.getDate(),
                        event.getAddress() != null ? event.getAddress().getCity() : "",
                        event.getAddress() != null ? event.getAddress().getUf() : "",
                        event.getRemote(),
                        event.getEventUrl(),
                        event.getImgUrl()))
                .stream().toList();
    }

    public List<EventResponseDTO> getFilteredEvents(
            int page,
            int size,
            String title,
            String city,
            String uf,
            Date startDate,
            Date endDate
    ) {
        title = (title != null) ? title : "";
        city = (city != null) ? city : "";
        uf = (uf != null) ? uf : "";

        Date now = Date.from(Instant.now());
        ZoneId zoneId = ZoneId.systemDefault();

        if (startDate == null) {
            startDate = now;
        } else {
            LocalDate startLocalDate = startDate.toInstant().atZone(zoneId).toLocalDate();
            startDate = Date.from(startLocalDate.atStartOfDay(zoneId).toInstant());
        }

        if (endDate == null) {
            LocalDate farFuture = LocalDate.now(zoneId).plusYears(50);
            endDate = Date.from(farFuture.atTime(LocalTime.MAX).atZone(zoneId).toInstant());
        } else {
            LocalDate endLocalDate = endDate.toInstant().atZone(zoneId).toLocalDate();
            endDate = Date.from(endLocalDate.atTime(LocalTime.MAX).atZone(zoneId).toInstant());
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Event> eventsPage = this.eventRepository.findFilteredEvents(
                title, city, uf, startDate, endDate, pageable
        );

        return eventsPage.map(event -> new EventResponseDTO(
                        event.getId(),
                        event.getTitle(),
                        event.getDescription(),
                        event.getDate(),
                        event.getAddress() != null ? event.getAddress().getCity() : "",
                        event.getAddress() != null ? event.getAddress().getUf() : "",
                        event.getRemote(),
                        event.getEventUrl(),
                        event.getImgUrl()))
                .stream().toList();
    }

    public EventDetailsDTO getEventDetails(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        List<Coupon> coupons = couponService.consultCoupons(eventId, new Date());
        List<EventDetailsDTO.CouponDTO> couponDTOS = coupons.stream()
                .map(coupon -> new EventDetailsDTO.CouponDTO(
                        coupon.getCode(),
                        coupon.getDiscount(),
                        coupon.getValid()))
                .collect(Collectors.toList());

        return new EventDetailsDTO(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getDate(),
                event.getAddress() != null ? event.getAddress().getCity() : "",
                event.getAddress() != null ? event.getAddress().getUf() : "",
                event.getImgUrl(),
                event.getEventUrl(),
                couponDTOS
        );
    }

    @Transactional
    public Event updateEvent(UUID eventId, EventRequestDTO data) {
        Event updateEvent = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        validateUpdateRequest(data);

        updateEvent.setTitle(data.title());
        updateEvent.setDescription(data.description());
        updateEvent.setDate(new Date(data.date()));
        updateEvent.setRemote(data.remote());
        updateEvent.setEventUrl(data.eventUrl());

        boolean shouldRemoveImage = Boolean.TRUE.equals(data.removeImage());
        if (shouldRemoveImage) {
            removeEventImage(updateEvent);
        }

        if (data.image() != null && !data.image().isEmpty() && !shouldRemoveImage) {
            removeEventImage(updateEvent);
            updateEvent.setImgUrl(this.uploadImg(data.image()));
        }

        Address currentAddress = updateEvent.getAddress();

        if (!data.remote()) {
            if (currentAddress != null) {
                currentAddress.setCity(data.city());
                currentAddress.setUf(data.uf());
            } else {
                addressService.createAddress(data, updateEvent);
            }
        } else if (currentAddress != null) {
            addressService.deleteAddress(currentAddress);
        }

        eventRepository.save(updateEvent);
        return updateEvent;
    }

    public void deleteEvent(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        removeEventImage(event);
        eventRepository.delete(event);
    }

    private String extractKeyFromUrl(String imgUrl) {
        URI uri = URI.create(imgUrl);
        return uri.getPath().substring(1);
    }

    private void removeEventImage(Event event) {
        if (event == null) {
            return;
        }

        String imgUrl = event.getImgUrl();
        if (imgUrl != null && !imgUrl.isBlank()) {
            String key = extractKeyFromUrl(imgUrl);
            try {
                s3Client.deleteObject(bucketName, key);
            } catch (Exception ex) {
                System.out.println("Error to delete image: " + ex.getMessage());
            }
        }

        event.setImgUrl(null);
    }

    private void validateUpdateRequest(EventRequestDTO data) {
        if (data.title() == null || data.title().isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }

        if (data.description() == null || data.description().isBlank()) {
            throw new IllegalArgumentException("Description is required");
        }

        if (data.eventUrl() == null || data.eventUrl().isBlank()) {
            throw new IllegalArgumentException("Event URL is required");
        }

        if (data.date() == null) {
            throw new IllegalArgumentException("Date is required");
        }

        if (data.remote() == null) {
            throw new IllegalArgumentException("Remote is required");
        }

        boolean hasCity = data.city() != null && !data.city().isBlank();
        boolean hasUf = data.uf() != null && !data.uf().isBlank();

        if (Boolean.TRUE.equals(data.remote()) && (hasCity || hasUf)) {
            throw new IllegalArgumentException("Remote event must not have city or uf");
        }

        if (Boolean.FALSE.equals(data.remote()) && (!hasCity || !hasUf)) {
            throw new IllegalArgumentException("Presential event requires city and uf");
        }
    }

    private String uploadImg(MultipartFile multipartFile) {
        String originalName = multipartFile.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = "image";
        }

        String fileName = UUID.randomUUID() + "-" + originalName.replaceAll("\\s+", "_");

        try (var inputStream = multipartFile.getInputStream()) {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(multipartFile.getSize());
            if (multipartFile.getContentType() != null && !multipartFile.getContentType().isBlank()) {
                metadata.setContentType(multipartFile.getContentType());
            }

            s3Client.putObject(bucketName, fileName, inputStream, metadata);
            return s3Client.getUrl(bucketName, fileName).toString();
        } catch (Exception e) {
            throw new IllegalStateException("Error to upload file to S3: " + e.getMessage(), e);
        }
    }
}
