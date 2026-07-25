-- Hostel Module Schema Updates
-- Run this in your Supabase SQL Editor to ensure all columns are present

-- Ensure floor column exists in hostel_rooms
ALTER TABLE IF EXISTS hostel_rooms ADD COLUMN IF NOT EXISTS floor TEXT;
ALTER TABLE IF EXISTS hostel_rooms ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE IF EXISTS hostel_rooms ADD COLUMN IF NOT EXISTS price_per_month NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS hostel_rooms ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 4;
ALTER TABLE IF EXISTS hostel_rooms ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'Non-AC';
ALTER TABLE IF EXISTS hostel_rooms ADD COLUMN IF NOT EXISTS gender TEXT;

-- Verify hostel_beds
CREATE TABLE IF NOT EXISTS hostel_beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES hostel_rooms(id) ON DELETE CASCADE,
    bed_number TEXT NOT NULL,
    status TEXT DEFAULT 'Available',
    student_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verify hostel_staff
CREATE TABLE IF NOT EXISTS hostel_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Warden',
    mobile TEXT,
    email TEXT,
    shift TEXT DEFAULT 'Day',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verify hostel_attendance
CREATE TABLE IF NOT EXISTS hostel_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT,
    student_name TEXT,
    room_number TEXT,
    attendance_date DATE DEFAULT CURRENT_DATE,
    status TEXT,
    ip_address TEXT,
    location TEXT,
    marked_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist in hostel_attendance (for existing tables)
ALTER TABLE IF EXISTS hostel_attendance ADD COLUMN IF NOT EXISTS marked_by TEXT;
ALTER TABLE IF EXISTS hostel_attendance ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE IF EXISTS hostel_attendance ADD COLUMN IF NOT EXISTS location TEXT;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
