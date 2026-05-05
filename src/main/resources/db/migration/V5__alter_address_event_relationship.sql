ALTER TABLE address
    ALTER COLUMN event_id SET NOT NULL;

ALTER TABLE address
    ADD CONSTRAINT uk_address_event_id UNIQUE (event_id);
