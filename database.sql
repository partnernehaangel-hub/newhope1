-- ==========================================
-- 1. STUDENTS & REGISTRATION
-- ==========================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT UNIQUE NOT NULL,
    title TEXT,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    class TEXT NOT NULL,
    section TEXT NOT NULL,
    gender TEXT,
    date_of_birth DATE,
    category TEXT,
    religion TEXT,
    caste TEXT,
    blood_group TEXT,
    email TEXT,
    mobile TEXT,
    aadhaar_number TEXT,
    pan_number TEXT,
    passport_number TEXT,
    
    -- Family Details
    father_name TEXT,
    mother_name TEXT,
    father_mobile TEXT,
    mother_mobile TEXT,
    father_income TEXT,
    father_income_source TEXT,
    mother_income TEXT,
    mother_income_source TEXT,
    
    -- Contact & Address
    residential_address TEXT,
    emergency_contact TEXT,
    local_guardian_contact TEXT,
    
    -- Health & Relations
    allergy TEXT,
    has_disability BOOLEAN DEFAULT FALSE,
    disability_details TEXT,
    relations JSONB DEFAULT '[]',
    
    -- Documents (Base64 or URLs)
    photo_url TEXT,
    documents JSONB DEFAULT '[]',
    photo TEXT,
    roll_number TEXT,
    aadhaar_card_doc TEXT,
    caste_certificate_doc TEXT,
    parents_docs TEXT,
    signature_doc TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);



-- ==========================================
-- 2. ACADEMIC MODULE
-- ==========================================

-- Timetable
CREATE TABLE IF NOT EXISTS timetable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class TEXT NOT NULL,
    section TEXT NOT NULL,
    day TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    subject TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    session TEXT DEFAULT '2024-25',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subject Teacher Assignment
CREATE TABLE IF NOT EXISTS subject_teacher_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class TEXT NOT NULL,
    section TEXT NOT NULL,
    subject TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    session TEXT DEFAULT '2024-25',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Syllabus
CREATE TABLE IF NOT EXISTS syllabus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class TEXT NOT NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Homework
CREATE TABLE IF NOT EXISTS homework (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class TEXT NOT NULL,
    section TEXT NOT NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    instructions TEXT,
    file_url TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. ATTENDANCE MODULE
-- ==========================================

-- Student Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    student_name TEXT,
    class TEXT NOT NULL,
    section TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL, -- Present, Absent, Late, Half Day
    period TEXT, -- Morning, Last Period, etc.
    marked_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Attendance
CREATE TABLE IF NOT EXISTS staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id TEXT NOT NULL,
    staff_name TEXT,
    role TEXT,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    in_time TIMESTAMPTZ,
    out_time TIMESTAMPTZ,
    method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. ROLE ASSIGNMENT & PERMISSIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY, -- User ID (e.g., admin, TCH-123, DS-123)
    name TEXT,
    password TEXT DEFAULT '12345678',
    role TEXT NOT NULL, -- admin, teacher, student, warden, super-admin, parent
    permissions TEXT[] DEFAULT '{}',
    student_id TEXT, -- For parents/students
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. HOSTEL MODULE
-- ==========================================

CREATE TABLE IF NOT EXISTS hostel_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number TEXT NOT NULL,
    floor TEXT,
    room_type TEXT, -- AC / Non-AC
    capacity INTEGER DEFAULT 4,
    gender TEXT, -- Male / Female
    category TEXT, -- Standard / Deluxe
    price_per_month NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hostel_beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES hostel_rooms(id) ON DELETE CASCADE,
    bed_number TEXT NOT NULL,
    status TEXT DEFAULT 'Available', -- Available, Occupied, Maintenance
    student_id TEXT, -- References studentId, not UUID
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hostel_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- Warden, Assistant Warden, Security, Cleaning Staff
    mobile TEXT,
    email TEXT,
    shift TEXT, -- Day / Night
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hostel_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    student_name TEXT,
    room_number TEXT,
    attendance_date DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL, -- Present, Absent, Late, Leave
    ip_address TEXT,
    location TEXT,
    marked_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hostel_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    room_id UUID REFERENCES hostel_rooms(id),
    registration_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. FRONT OFFICE
-- ==========================================

CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    father_name TEXT,
    mobile TEXT NOT NULL,
    class TEXT,
    source TEXT,
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    role TEXT DEFAULT 'Other',
    purpose TEXT,
    qualification TEXT,
    note TEXT,
    date DATE DEFAULT CURRENT_DATE,
    in_time TEXT,
    out_time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complainant_name TEXT NOT NULL,
    complaint_type TEXT,
    source TEXT,
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. FEE MANAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS fee_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class TEXT NOT NULL,
    fee_type TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    session TEXT DEFAULT '2024-25',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    student_name TEXT,
    class TEXT,
    section TEXT,
    fee_type TEXT,
    month TEXT,
    amount_payable NUMERIC(10,2),
    discount NUMERIC(10,2) DEFAULT 0,
    scholarship NUMERIC(10,2) DEFAULT 0,
    fine NUMERIC(10,2) DEFAULT 0,
    total_paid NUMERIC(10,2) NOT NULL,
    payment_mode TEXT,
    transaction_id TEXT,
    invoice_number TEXT UNIQUE,
    date DATE DEFAULT CURRENT_DATE,
    collected_by TEXT,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 8. HUMAN RESOURCE
-- ==========================================

CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT,
    designation TEXT,
    mobile TEXT,
    email TEXT,
    joining_date DATE,
    photo TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS designations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id TEXT NOT NULL,
    staff_name TEXT,
    leave_type TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Pending',
    applied_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 9. SETTINGS & MASTER DATA
-- ==========================================

CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    school_name TEXT,
    school_contact TEXT,
    school_email TEXT,
    school_gst TEXT,
    school_reg_no TEXT,
    school_address TEXT,
    school_logo TEXT,
    principal_signature TEXT,
    class_teacher_signature TEXT,
    school_stamp TEXT,
    warden_id TEXT,
    warden_password TEXT,
    camera1_name TEXT,
    camera1_url TEXT,
    camera2_name TEXT,
    camera2_url TEXT,
    camera3_name TEXT,
    camera3_url TEXT,
    camera4_name TEXT,
    camera4_url TEXT,
    tax_percentage NUMERIC(5,2) DEFAULT 0,
    categories TEXT[] DEFAULT '{"General", "OBC", "SC", "ST"}',
    castes TEXT[] DEFAULT '{"Hindu", "Muslim", "Sikh", "Christian"}',
    religions TEXT[] DEFAULT '{"Hinduism", "Islam", "Sikhism", "Christianity"}',
    titles TEXT[] DEFAULT '{"Mr.", "Ms.", "Mrs."}',
    classes TEXT[] DEFAULT '{"Nursery", "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"}',
    sections TEXT[] DEFAULT '{"A", "B", "C", "D"}',
    subjects TEXT[] DEFAULT '{"English", "Hindi", "Mathematics", "Science", "Social Science", "Computer", "Sanskrit", "EVS"}',
    genders TEXT[] DEFAULT '{"Male", "Female", "Other"}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 10. INITIAL SEED DATA
-- ==========================================

-- Insert settings with comprehensive default lists properly using standard Postgres array syntax
INSERT INTO settings (id, school_name, school_email, school_contact, categories, castes, religions, titles, classes, sections, subjects, genders)
VALUES (1, 'Digital School Systems', 'info@digitalschool.com', '+91 9876543210', 
    ARRAY['General', 'OBC', 'SC', 'ST']::TEXT[], 
    ARRAY['General', 'Yadav', 'Sharma', 'Verma']::TEXT[], 
    ARRAY['Hindu', 'Muslim', 'Sikh', 'Christian']::TEXT[], 
    ARRAY['Mr.', 'Mrs.', 'Ms.', 'Dr.']::TEXT[], 
    ARRAY['Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th']::TEXT[], 
    ARRAY['A', 'B', 'C', 'D']::TEXT[], 
    ARRAY['Math', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer', 'Sanskrit', 'Physical Education']::TEXT[], 
    ARRAY['Male', 'Female', 'Other']::TEXT[]
) ON CONFLICT (id) DO NOTHING;

-- Seed default administrative and test users
INSERT INTO users (username, password, role, permissions)
VALUES 
('admin', '12345', 'admin', ARRAY['all']::TEXT[]),
('teacher', 'teacher', 'teacher', ARRAY['all']::TEXT[]),
('stu', 'stu', 'student', ARRAY['all']::TEXT[]),
('warden', 'warden', 'warden', ARRAY['all']::TEXT[]),
('super-admin', 'DC0018', 'super-admin', ARRAY['all']::TEXT[]),
('TCH-12345', '123', 'teacher', ARRAY['QR Attendance', 'QR Late Attendance', 'QR Leaving During School', 'Leave Application', 'Syllabus', 'Home Work Assign', 'Progress Report']::TEXT[]),
('PAR-12345', '123', 'parent', ARRAY['QR Attendance', 'Leave Application', 'Fee Structure', 'Syllabus', 'Progress Report', 'Home Work Assign']::TEXT[])
ON CONFLICT (username) DO NOTHING;

-- ==========================================
-- 11. HELPER FUNCTIONS & SECURITY CONFIGURATION
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create or replace the helper to execute arbitrary SQL (Required for online management & dynamic migrations)
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result jsonb;
BEGIN
    IF sql_query ILIKE 'select%' THEN
        EXECUTE 'SELECT jsonb_agg(t) FROM (' || sql_query || ') t' INTO result;
        RETURN result;
    ELSE
        EXECUTE sql_query;
        NOTIFY pgrst, 'reload schema';
        RETURN jsonb_build_object('status', 'success');
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$;

-- Grant execution permissions explicitly to allow browser-based calls in Postgres 15+
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated, service_role;

-- ==========================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES CONSOLIDATION
-- ==========================================
-- Safely applies RLS to all created tables and creates complete CRUD policies to satisfy security linter
DO $$
DECLARE
    t text;
    p text;
BEGIN
    -- 1. Drop ALL existing policies to ensure a clean slate and resolve legacy permissive policies
    FOR t, p IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p, t);
    END LOOP;

    -- 2. Loop through all tables and apply standard, secure RLS and policies
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        -- Enable Row Level Security (RLS)
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        
        -- SELECT: Allow public read access (essential for standard public retrieval)
        EXECUTE format('CREATE POLICY "Allow Select" ON public.%I FOR SELECT USING (true)', t);
        
        -- INSERT: Allow insertion check for anon and authenticated roles
        EXECUTE format('CREATE POLICY "Allow Insert" ON public.%I FOR INSERT WITH CHECK (auth.role() = ''anon'' OR auth.role() = ''authenticated'')', t);
        
        -- UPDATE: Allow update check for anon and authenticated roles
        EXECUTE format('CREATE POLICY "Allow Update" ON public.%I FOR UPDATE USING (auth.role() = ''anon'' OR auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''anon'' OR auth.role() = ''authenticated'')', t);
        
        -- DELETE: Allow delete access for anon and authenticated roles
        EXECUTE format('CREATE POLICY "Allow Delete" ON public.%I FOR DELETE USING (auth.role() = ''anon'' OR auth.role() = ''authenticated'')', t);
    END LOOP;
END $$;

-- Trigger schema cache reload for immediate PostgREST availability
NOTIFY pgrst, 'reload schema';

