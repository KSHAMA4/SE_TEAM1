-- Issue #2: PostgreSQL 3NF Schema with btree_gist extension
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    role        VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Labs table
CREATE TABLE IF NOT EXISTS labs (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    location    VARCHAR(150),
    capacity    INT NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id          SERIAL PRIMARY KEY,
    lab_id      INT NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    model       VARCHAR(100),
    status      VARCHAR(20) NOT NULL DEFAULT 'available'
                CHECK (status IN ('available', 'in_use', 'maintenance')),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations table (with overlap prevention)
CREATE TABLE IF NOT EXISTS reservations (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    equipment_id INT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    start_time  TIMESTAMPTZ NOT NULL,
    end_time    TIMESTAMPTZ NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'cancelled')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT no_overlap EXCLUDE USING gist (
    equipment_id WITH =,
    tstzrange(start_time, end_time) WITH &&
)
);