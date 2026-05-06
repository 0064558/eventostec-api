CREATE TABLE IF NOT EXISTS app_user (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO app_user (id, email, password_hash, role, enabled, created_at)
SELECT gen_random_uuid(),
       'admin@admin.com',
       '$2a$10$qaQV.yK9jdc5fZkz8vqQfeAKIn3bZgL38rSDx.WAAgIAMaAjeCLyS',
       'ADMIN',
       true,
       NOW()
    WHERE NOT EXISTS (
    SELECT 1 FROM app_user WHERE email = 'admin@admin.com'
);