-- Issue #2: PostgreSQL 3NF Schema
-- Smart Lab Equipment Slot Reservation Portal

CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    user_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
        CHECK (role IN ('STUDENT', 'TECHNICIAN', 'ADMIN')),
    full_name VARCHAR(100) NOT NULL,
    late_return_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS laboratories (
    lab_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    location_building VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS equipment (
    equipment_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    model_number VARCHAR(100),
    lab_id BIGINT REFERENCES laboratories(lab_id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL
        CHECK (status IN ('AVAILABLE', 'MAINTENANCE', 'OUT_OF_ORDER')),
    calibration_expiration TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
    reservation_id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT REFERENCES equipment(equipment_id)
        ON DELETE RESTRICT NOT NULL,
    student_id BIGINT REFERENCES users(user_id)
        ON DELETE RESTRICT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED'
        CHECK (status IN (
            'CONFIRMED',
            'CANCELLED',
            'RETURNED',
            'LATE_RETURNED'
        )),
    token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    is_late BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_end_after_start
        CHECK (end_time > start_time),

    CONSTRAINT no_overlapping_reservations
        EXCLUDE USING gist (
            equipment_id WITH =,
            tstzrange(start_time, end_time) WITH &&
        )
        WHERE (status = 'CONFIRMED')
);

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    actor_user_id BIGINT REFERENCES users(user_id)
        ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipment_lab
    ON equipment(lab_id);

CREATE INDEX IF NOT EXISTS idx_equipment_status
    ON equipment(status);

CREATE INDEX IF NOT EXISTS idx_reservations_equipment
    ON reservations(equipment_id);

CREATE INDEX IF NOT EXISTS idx_reservations_student
    ON reservations(student_id);