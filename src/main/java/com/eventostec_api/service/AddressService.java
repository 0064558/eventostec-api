package com.eventostec_api.service;

import com.eventostec_api.domain.address.Address;
import com.eventostec_api.domain.event.Event;
import com.eventostec_api.domain.event.EventRequestDTO;
import com.eventostec_api.repositories.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
// Serviço responsável por gerenciar as operações relacionadas ao endereço dos eventos, como criação e persistência no banco de dados.
public class AddressService {
    @Autowired
    private AddressRepository addressRepository;

    public Address createAddress(EventRequestDTO data, Event event) {
        Address address = new Address();
        address.setCity(data.city());
        address.setUf(data.uf());
        address.setEvent(event);

        return addressRepository.save(address);
    }
}
