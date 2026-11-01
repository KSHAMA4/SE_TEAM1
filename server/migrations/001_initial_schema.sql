
-- Issue #2 - Smart Lab Database Schema

CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- ENUM TYPES
-- =========================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'user_role'
    ) THEN
        CREATE TYPE user_role AS ENUM (
            'STUDENT',
            'TECHNICIAN',
            'ADMIN'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'equipment_status'
    ) THEN
        CREATE TYPE equipment_status AS ENUM (
            'AVAILABLE',
            'MAINTENANCE',
            'OUT_OF_ORDER'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'reservation_status'
    ) THEN
        CREATE TYPE reservation_status AS ENUM (
            'CONFIRMED',
            'CANCELLED',
            'RETURNED',
            'LATE_RETURNED'
        );
    END IF;
END
$$;

-- =========================
-- USERS
-- =========================

CREATE TABLE IF NOT EXISTS users (
    user_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    late_return_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- LABORATORIES
-- =========================

CREATE TABLE IF NOT EXISTS laboratories (
    lab_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(150),
    location_building VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- EQUIPMENT
-- =========================

CREATE TABLE IF NOT EXISTS equipment (
    equipment_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    model_number VARCHAR(150),
    lab_id BIGINT NOT NULL REFERENCES laboratories(lab_id)
        ON DELETE CASCADE,
    status equipment_status NOT NULL DEFAULT 'AVAILABLE',
    calibration_expiration TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- RESERVATIONS
-- =========================

CREATE TABLE IF NOT EXISTS reservations (
    reservation_id BIGSERIAL PRIMARY KEY,

    equipment_id BIGINT NOT NULL
        REFERENCES equipment(equipment_id)
        ON DELETE CASCADE,

    student_id BIGINT NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,

    status reservation_status NOT NULL DEFAULT 'CONFIRMED',

    token UUID NOT NULL DEFAULT gen_random_uuid(),

    is_late BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_end_after_start
        CHECK (end_time > start_time),

    CONSTRAINT no_overlapping_reservations
        EXCLUDE USING gist (
            equipment_id WITH =,
            tstzrange(start_time, end_time, '[)') WITH &&
        )
);

-- =========================
-- AUDIT LOGS
-- =========================

CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id BIGSERIAL PRIMARY KEY,
    actor_user_id BIGINT REFERENCES users(user_id)
        ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(100),
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- =========================
-- INDEXES
-- =========================

CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

CREATE INDEX IF NOT EXISTS idx_equipment_lab
    ON equipment(lab_id);

CREATE INDEX IF NOT EXISTS idx_equipment_status
    ON equipment(status);

CREATE INDEX IF NOT EXISTS idx_reservations_student
    ON reservations(student_id);

CREATE INDEX IF NOT EXISTS idx_reservations_equipment
    ON reservations(equipment_id);

CREATE INDEX IF NOT EXISTS idx_reservations_start_time
    ON reservations(start_time);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user
    ON audit_logs(actor_user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
    ON audit_logs(created_at);
