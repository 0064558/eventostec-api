package com.eventostec_api.repositories;

import com.eventostec_api.domain.address.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

// Repositório para gerenciar as operações de persistência relacionadas à entidade Address, permitindo realizar operações CRUD (Create, Read, Update, Delete) no banco de dados.
public interface AddressRepository extends JpaRepository<Address, UUID> {
}
