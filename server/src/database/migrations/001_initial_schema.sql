-- =====================================================================
-- Issue #2: PostgreSQL Schema per SAD (FR-003 / NFR-002)
-- =====================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('STUDENT', 'TECHNICIAN', 'ADMIN')),
    late_return_count INT DEFAULT 0 CHECK (late_return_count >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Laboratories Table
CREATE TABLE laboratories (
    lab_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    location_building VARCHAR(100) NOT NULL
);

-- 4. Equipment Table
CREATE TABLE equipment (
    equipment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    lab_id UUID NOT NULL REFERENCES laboratories(lab_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('AVAILABLE', 'MAINTENANCE', 'OUT_OF_ORDER')),
    calibration_expiration TIMESTAMPTZ
);

-- 5. Reservations Table (With GIST Exclusion Constraint for Overlap Prevention)
CREATE TABLE reservations (
    reservation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(equipment_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('CONFIRMED', 'CANCELLED', 'RETURNED', 'LATE_RETURNED')),
    token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    is_late BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure logical time range
    CONSTRAINT valid_reservation_time CHECK (end_time > start_time),
    
    -- Prevent overlapping reservations for the same equipment using btree_gist
    EXCLUDE USING GIST (
        equipment_id WITH =,
        tsrange(start_time, end_time) WITH &&
    )
);

-- 6. Audit Logs Table (Append-Only Enforcement)
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50) NOT NULL,
    target_id UUID,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function to block UPDATE or DELETE on audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are append-only and cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to audit_logs table
CREATE TRIGGER audit_immutable_update_delete
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();