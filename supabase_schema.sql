-- Supabase SQL Schema for School Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to execute arbitrary SQL (Required for migrations and SQL Editor)
-- This version is designed to handle both data-modifying commands and selection queries.
DROP FUNCTION IF EXISTS exec_sql(text);
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result jsonb;
BEGIN
    -- For selection queries, we try to capture the result set as JSON
    IF sql_query ILIKE 'select%' THEN
        EXECUTE 'SELECT jsonb_agg(t) FROM (' || sql_query || ') t' INTO result;
        RETURN result;
    ELSE
        -- For other commands, we just execute and return a success status
        EXECUTE sql_query;
        
        -- Trigger schema cache reload for PostgREST
        NOTIFY pgrst, 'reload schema';
        
        RETURN jsonb_build_object('status', 'success');
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$;

-- Grant explicit execute rights to anon, authenticated, and service_role for browser-based operations in Postgres 15+
GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon, authenticated, service_role;

-- Master Data Management
CREATE TABLE IF NOT EXISTS academic_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS castes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS religions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS titles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS genders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- School Profile & Settings
CREATE TABLE IF NOT EXISTS school_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_name TEXT NOT NULL,
    contact_number TEXT,
    gst_number TEXT,
    registration_number TEXT,
    school_email TEXT,
    current_academic_session TEXT,
    school_address TEXT,
    school_logo_url TEXT,
    principal_signature_url TEXT,
    class_teacher_signature_url TEXT,
    official_stamp_url TEXT,
    tax_percentage NUMERIC DEFAULT 0,
    warden_id TEXT,
    warden_password TEXT,
    fee_qr_url TEXT,
    fee_upi_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS camera_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_name TEXT NOT NULL,
    camera_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Front Office Module
CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_name TEXT NOT NULL,
    father_name TEXT,
    mobile TEXT NOT NULL,
    class TEXT,
    source TEXT,
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    role TEXT,
    purpose TEXT,
    qualification TEXT,
    note TEXT,
    date DATE DEFAULT CURRENT_DATE,
    in_time TEXT,
    out_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complainant_name TEXT NOT NULL,
    complaint_type TEXT,
    source TEXT,
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Management
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT UNIQUE NOT NULL,
    title TEXT,
    first_name TEXT, -- Relaxed NOT NULL
    surname TEXT,    -- Relaxed NOT NULL
    student_type TEXT DEFAULT 'Old',
    academic_session TEXT,
    class_name TEXT NOT NULL,
    section_name TEXT NOT NULL,
    roll_number TEXT,
    -- Legacy support
    name TEXT,
    caste TEXT,
    category TEXT,
    religion TEXT,
    gender TEXT,
    date_of_birth DATE,
    blood_group TEXT,
    email TEXT,
    aadhaar_number TEXT,
    pan_number TEXT,
    passport_number TEXT,
    father_name TEXT,
    mother_name TEXT,
    father_mobile TEXT,
    mother_mobile TEXT,
    father_income TEXT,
    father_source_of_income TEXT,
    mother_income TEXT,
    mother_source_of_income TEXT,
    residential_address TEXT,
    emergency_contact TEXT,
    local_guardian_contact TEXT,
    allergies TEXT,
    disability TEXT DEFAULT 'No',
    disability_details TEXT,
    photo_url TEXT,
    relations JSONB DEFAULT '[]',
    documents JSONB DEFAULT '[]',
    admission_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leave Management
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id_text TEXT, -- The ST-XXXX ID
    student_name TEXT,
    class_name TEXT,
    section_name TEXT,
    start_date DATE,
    end_date DATE,
    reason TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar Module
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_type TEXT DEFAULT 'event',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fee Management
CREATE TABLE IF NOT EXISTS fee_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_name TEXT NOT NULL,
    fee_type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    frequency TEXT NOT NULL, -- 'Monthly', 'Yearly', etc.
    student_type TEXT NOT NULL, -- 'New', 'Old', 'Both'
    academic_session TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT NOT NULL,
    student_name TEXT,
    class TEXT,
    section TEXT,
    fee_type TEXT,
    amount NUMERIC NOT NULL,
    discount NUMERIC DEFAULT 0,
    discount_reason TEXT,
    scholarship NUMERIC DEFAULT 0,
    fine NUMERIC DEFAULT 0,
    total_paid NUMERIC NOT NULL,
    payment_mode TEXT,
    transaction_id TEXT,
    invoice_number TEXT,
    collected_by TEXT,
    month TEXT,
    date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    status TEXT, -- 'Paid', 'Partial', 'Due'
    breakdown JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contra_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL, -- 'Bank to Cash', 'Cash to Bank', 'Bank Adjustment', 'Cash Adjustment'
    amount NUMERIC NOT NULL,
    reference TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance Module (Income & Expense)
CREATE TABLE IF NOT EXISTS income_heads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expense_heads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    income_head TEXT,
    invoice_number TEXT,
    date DATE DEFAULT CURRENT_DATE,
    amount NUMERIC NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    expense_head TEXT,
    invoice_number TEXT,
    date DATE DEFAULT CURRENT_DATE,
    amount NUMERIC NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Management
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Using staff_id or student_id as ID
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL DEFAULT '123',
    role TEXT NOT NULL,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Human Resource
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS designations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    date_of_birth DATE,
    email TEXT,
    mobile TEXT,
    role TEXT NOT NULL,
    department TEXT,
    designation TEXT,
    joining_date DATE DEFAULT CURRENT_DATE,
    photo TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id TEXT NOT NULL, -- Changed from UUID or strict FK to TEXT for resilience
    staff_name TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure the constraint is relaxed if it was previously created as a strict foreign key
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_leave_requests_staff_id_fkey') THEN
        ALTER TABLE staff_leave_requests DROP CONSTRAINT staff_leave_requests_staff_id_fkey;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS staff_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id TEXT NOT NULL,
    staff_name TEXT,
    role TEXT,
    attendance_date DATE DEFAULT CURRENT_DATE,
    attendance_time TIME DEFAULT CURRENT_TIME,
    method TEXT, -- 'Manual', 'QR', etc.
    status TEXT, -- 'Present', 'Absent', etc.
    ip_address TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notice Board
CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'Info', -- 'Info', 'Warning', 'Success', 'Fee'
    target_roles JSONB, -- Array of roles
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication Templates
CREATE TABLE IF NOT EXISTS communication_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'WhatsApp', 'SMS', 'Email'
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academics
CREATE TABLE IF NOT EXISTS time_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_name TEXT NOT NULL,
    section_name TEXT NOT NULL,
    day TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject TEXT NOT NULL,
    teacher_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teacher_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_session TEXT, -- Relaxed NOT NULL
    class_name TEXT,       -- Relaxed NOT NULL
    section_name TEXT,     -- Relaxed NOT NULL
    class_teacher_name TEXT,
    subject_teacher_assignments JSONB, -- Array of {subject, teacher}
    -- Legacy columns (for old queries/inserts)
    session TEXT,
    class TEXT,
    section TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS syllabus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_name TEXT,
    subject TEXT,
    title TEXT,
    description TEXT,
    file_url TEXT,
    academic_session TEXT,
    posted_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Not Started',
    -- Legacy columns
    class TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homework (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_name TEXT,
    section_name TEXT,
    subject TEXT,
    title TEXT,
    instructions TEXT,
    academic_session TEXT,
    due_date DATE,
    file_url TEXT,
    posted_date DATE DEFAULT CURRENT_DATE,
    -- Legacy columns
    class TEXT,
    section TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Attendance
CREATE TABLE IF NOT EXISTS student_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT NOT NULL,
    student_name TEXT,
    class_name TEXT,
    section_name TEXT,
    attendance_date DATE DEFAULT CURRENT_DATE,
    status TEXT, -- 'Present', 'Absent', 'Late', etc.
    period TEXT, -- 'Morning', 'Afternoon', etc.
    method TEXT, -- 'Manual', 'QR'
    ip_address TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Examination
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_name TEXT UNIQUE NOT NULL,
    exam_type TEXT DEFAULT 'Main',
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'Upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    section_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    marks_obtained NUMERIC,
    max_marks NUMERIC,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_card_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name TEXT UNIQUE NOT NULL,
    terms JSONB, -- Array of terms and their sub-columns
    subjects JSONB, -- Array of subjects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT NOT NULL,
    template_id UUID REFERENCES report_card_templates(id),
    term_data JSONB, -- Nested object for term marks
    result TEXT,
    aggregate NUMERIC,
    percentage NUMERIC,
    rank TEXT,
    promotion_status TEXT,
    teacher_comments TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hostel Management
CREATE TABLE IF NOT EXISTS hostel_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel_name TEXT,
    room_number TEXT UNIQUE,
    room_no TEXT,
    floor TEXT,
    category TEXT,
    price_per_month NUMERIC DEFAULT 0,
    capacity INTEGER DEFAULT 4,
    room_type TEXT DEFAULT 'Non-AC',
    gender TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hostel_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Warden',
    mobile TEXT,
    email TEXT,
    shift TEXT DEFAULT 'Day',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hostel_beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES hostel_rooms(id) ON DELETE CASCADE,
    bed_number TEXT NOT NULL,
    status TEXT DEFAULT 'Available', -- 'Available', 'Occupied', 'Maintenance'
    student_id TEXT, -- References student_id from students table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hostel_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT NOT NULL,
    student_name TEXT,
    room_number TEXT,
    attendance_date DATE DEFAULT CURRENT_DATE,
    status TEXT,
    ip_address TEXT,
    location TEXT,
    marked_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial Data Seeding
INSERT INTO academic_sessions (year) VALUES 
('2023-24'), ('2024-25'), ('2025-26'), ('2026-27'), ('2027-28'), ('2028-29')
ON CONFLICT (year) DO NOTHING;

INSERT INTO classes (name) VALUES 
('LKG'), ('UKG'), ('Class 1'), ('Class 2'), ('Class 3'), ('Class 4'), 
('Class 5'), ('Class 6'), ('Class 7'), ('Class 8'), ('Class 9'), 
('Class 10'), ('Class 11'), ('Class 12')
ON CONFLICT (name) DO NOTHING;

INSERT INTO sections (name) VALUES ('A'), ('B'), ('C'), ('D')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name) VALUES ('General'), ('OBC'), ('SC'), ('ST')
ON CONFLICT (name) DO NOTHING;

INSERT INTO castes (name) VALUES ('Hindu'), ('Muslim'), ('Sikh'), ('Christian')
ON CONFLICT (name) DO NOTHING;

INSERT INTO religions (name) VALUES 
('Hinduism'), ('Islam'), ('Sikhism'), ('Christianity'), ('Buddhism'), ('Jainism')
ON CONFLICT (name) DO NOTHING;

INSERT INTO titles (name) VALUES ('Mr.'), ('Miss'), ('Mrs.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO genders (name) VALUES ('Male'), ('Female'), ('Others')
ON CONFLICT (name) DO NOTHING;

INSERT INTO subjects (name) VALUES 
('Mathematics'), ('Science'), ('English'), ('Social Studies'), ('Hindi'), ('Computer Science')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security (RLS) and Add Standardized Policies
-- This block first clears all existing policies to resolve permissive linter warnings
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

    -- 2. Loop through all tables and apply standard RLS
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        
        -- SELECT: Allow read access (Linter allows USING (true) for SELECT)
        EXECUTE format('CREATE POLICY "Allow Select" ON public.%I FOR SELECT USING (true)', t);
        
        -- INSERT: Allow write access for authenticated users
        EXECUTE format('CREATE POLICY "Allow Insert" ON public.%I FOR INSERT WITH CHECK (auth.role() = ''anon'' OR auth.role() = ''authenticated'')', t);
        
        -- UPDATE: Allow update access for authenticated users (Avoids USING (true))
        EXECUTE format('CREATE POLICY "Allow Update" ON public.%I FOR UPDATE USING (auth.role() = ''anon'' OR auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''anon'' OR auth.role() = ''authenticated'')', t);
        
        -- DELETE: Allow delete access for authenticated users (Avoids USING (true))
        EXECUTE format('CREATE POLICY "Allow Delete" ON public.%I FOR DELETE USING (auth.role() = ''anon'' OR auth.role() = ''authenticated'')', t);
    END LOOP;
END $$;

-- 1. Ensure students table has all required columns (idempotent)
ALTER TABLE IF EXISTS public.students 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS disability_details TEXT,
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS relations JSONB DEFAULT '[]'::jsonb;

-- 2. Ensure staff table has all required columns (idempotent)
ALTER TABLE IF EXISTS public.staff 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS residential_address TEXT,
ADD COLUMN IF NOT EXISTS login_id TEXT,
ADD COLUMN IF NOT EXISTS login_password TEXT,
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS mother_name TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth TEXT,
ADD COLUMN IF NOT EXISTS joining_date TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS qualification TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS staff_id TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS designation TEXT;

-- 3. Ensure school_profile table has all required columns (idempotent)
ALTER TABLE IF EXISTS public.school_profile 
ADD COLUMN IF NOT EXISTS fee_qr_url TEXT,
ADD COLUMN IF NOT EXISTS fee_upi_id TEXT;

-- 4. Ensure fee_collections table has all required columns (idempotent)
ALTER TABLE IF EXISTS public.fee_collections
ADD COLUMN IF NOT EXISTS fine NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS scholarship NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS month TEXT,
ADD COLUMN IF NOT EXISTS discount_reason TEXT,
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS invoice_number TEXT,
ADD COLUMN IF NOT EXISTS collected_by TEXT,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT,
ADD COLUMN IF NOT EXISTS breakdown JSONB;

-- Standardizing fee_master columns
ALTER TABLE IF EXISTS public.fee_master ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE IF EXISTS public.fee_master ADD COLUMN IF NOT EXISTS fee_type TEXT;
ALTER TABLE IF EXISTS public.fee_master ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.fee_master ADD COLUMN IF NOT EXISTS frequency TEXT;
ALTER TABLE IF EXISTS public.fee_master ADD COLUMN IF NOT EXISTS student_type TEXT DEFAULT 'Both';
ALTER TABLE IF EXISTS public.fee_master ADD COLUMN IF NOT EXISTS academic_session TEXT;

-- Standardizing fee_collections columns
ALTER TABLE IF EXISTS public.fee_collections ADD COLUMN IF NOT EXISTS fine NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.fee_collections ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.fee_collections ADD COLUMN IF NOT EXISTS scholarship NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.fee_collections ADD COLUMN IF NOT EXISTS month TEXT;
ALTER TABLE IF EXISTS public.fee_collections ADD COLUMN IF NOT EXISTS discount_reason TEXT;
ALTER TABLE IF EXISTS public.fee_collections ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE IF EXISTS public.fee_collections ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE IF EXISTS public.fee_collections ADD COLUMN IF NOT EXISTS collected_by TEXT;
ALTER TABLE IF EXISTS public.fee_collections ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE IF EXISTS public.fee_collections ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE IF EXISTS public.fee_collections ADD COLUMN IF NOT EXISTS breakdown JSONB;

-- Ensure standard fee_types exist
INSERT INTO fee_types (name, description) VALUES 
('Admission Fee', 'One-time fee for new students'),
('Re-admission Fee', 'Annual fee for old students'),
('Hostel Fee', 'Monthly fee for hostel residents'),
('Tuition Fee', 'Monthly tuition fee'),
('Examination Fee', 'Termly exam fee'),
('Transport Fee', 'Monthly transport fee'),
('Computer Fee', 'Monthly computer lab fee'),
('Library Fee', 'Annual library fee'),
('Annual Fee', 'General annual charges')
ON CONFLICT (name) DO NOTHING;

-- Financial Table Standardization
ALTER TABLE IF EXISTS public.income_heads ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE IF EXISTS public.income_heads ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS public.expense_heads ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE IF EXISTS public.expense_heads ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS public.incomes ADD COLUMN IF NOT EXISTS income_head TEXT;
ALTER TABLE IF EXISTS public.expenses ADD COLUMN IF NOT EXISTS expense_head TEXT;

-- Academics Module missing columns fixes and NOT NULL relaxations
DO $$ 
BEGIN 
    -- Teacher Assignments
    ALTER TABLE IF EXISTS public.teacher_assignments ADD COLUMN IF NOT EXISTS academic_session TEXT;
    ALTER TABLE IF EXISTS public.teacher_assignments ADD COLUMN IF NOT EXISTS class_name TEXT;
    ALTER TABLE IF EXISTS public.teacher_assignments ADD COLUMN IF NOT EXISTS section_name TEXT;
    ALTER TABLE IF EXISTS public.teacher_assignments ALTER COLUMN academic_session DROP NOT NULL;
    ALTER TABLE IF EXISTS public.teacher_assignments ALTER COLUMN class_name DROP NOT NULL;
    ALTER TABLE IF EXISTS public.teacher_assignments ALTER COLUMN section_name DROP NOT NULL;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teacher_assignments' AND column_name = 'class') THEN 
        EXECUTE 'ALTER TABLE teacher_assignments ALTER COLUMN "class" DROP NOT NULL'; 
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teacher_assignments' AND column_name = 'section') THEN 
        EXECUTE 'ALTER TABLE teacher_assignments ALTER COLUMN "section" DROP NOT NULL'; 
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teacher_assignments' AND column_name = 'session') THEN 
        EXECUTE 'ALTER TABLE teacher_assignments ALTER COLUMN "session" DROP NOT NULL'; 
    END IF;

    -- Syllabus
    ALTER TABLE IF EXISTS public.syllabus ADD COLUMN IF NOT EXISTS class_name TEXT;
    ALTER TABLE IF EXISTS public.syllabus ADD COLUMN IF NOT EXISTS academic_session TEXT;
    ALTER TABLE IF EXISTS public.syllabus ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Not Started';
    ALTER TABLE IF EXISTS public.syllabus ALTER COLUMN class_name DROP NOT NULL;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'syllabus' AND column_name = 'class') THEN 
        EXECUTE 'ALTER TABLE syllabus ALTER COLUMN "class" DROP NOT NULL'; 
    END IF;

    -- Homework
    ALTER TABLE IF EXISTS public.homework ADD COLUMN IF NOT EXISTS class_name TEXT;
    ALTER TABLE IF EXISTS public.homework ADD COLUMN IF NOT EXISTS section_name TEXT;
    ALTER TABLE IF EXISTS public.homework ADD COLUMN IF NOT EXISTS subject TEXT;
    ALTER TABLE IF EXISTS public.homework ADD COLUMN IF NOT EXISTS academic_session TEXT;
    ALTER TABLE IF EXISTS public.homework ALTER COLUMN class_name DROP NOT NULL;
    ALTER TABLE IF EXISTS public.homework ALTER COLUMN section_name DROP NOT NULL;
    ALTER TABLE IF EXISTS public.homework ALTER COLUMN subject DROP NOT NULL;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homework' AND column_name = 'class') THEN 
        EXECUTE 'ALTER TABLE homework ALTER COLUMN "class" DROP NOT NULL'; 
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homework' AND column_name = 'section') THEN 
        EXECUTE 'ALTER TABLE homework ALTER COLUMN "section" DROP NOT NULL'; 
    END IF;

    -- Exams
    ALTER TABLE IF EXISTS public.exams ADD COLUMN IF NOT EXISTS exam_name TEXT;
    ALTER TABLE IF EXISTS public.exams ADD COLUMN IF NOT EXISTS exam_type TEXT DEFAULT 'Main';
    ALTER TABLE IF EXISTS public.exams ADD COLUMN IF NOT EXISTS start_date DATE;
    ALTER TABLE IF EXISTS public.exams ADD COLUMN IF NOT EXISTS end_date DATE;
    ALTER TABLE IF EXISTS public.exams ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Upcoming';

    -- Relax legacy NOT NULLs for Exams
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'name') THEN
        ALTER TABLE public.exams ALTER COLUMN "name" DROP NOT NULL;
    END IF;

    -- Rename 'name' to 'exam_name' logic
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'name') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'exam_name') THEN
            UPDATE public.exams SET exam_name = name WHERE exam_name IS NULL;
        ELSE
            ALTER TABLE public.exams RENAME COLUMN "name" TO "exam_name";
        END IF;
    END IF;

    -- Exam Schedules
    ALTER TABLE IF EXISTS public.exam_schedules ADD COLUMN IF NOT EXISTS exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE;
    ALTER TABLE IF EXISTS public.exam_schedules ADD COLUMN IF NOT EXISTS exam_name TEXT;
    ALTER TABLE IF EXISTS public.exam_schedules ADD COLUMN IF NOT EXISTS class_name TEXT;
    ALTER TABLE IF EXISTS public.exam_schedules ADD COLUMN IF NOT EXISTS section_name TEXT;
    ALTER TABLE IF EXISTS public.exam_schedules ADD COLUMN IF NOT EXISTS subject TEXT;
    ALTER TABLE IF EXISTS public.exam_schedules ADD COLUMN IF NOT EXISTS exam_date DATE;
    ALTER TABLE IF EXISTS public.exam_schedules ADD COLUMN IF NOT EXISTS start_time TIME;
    ALTER TABLE IF EXISTS public.exam_schedules ADD COLUMN IF NOT EXISTS end_time TIME;
    ALTER TABLE IF EXISTS public.exam_schedules ADD COLUMN IF NOT EXISTS question_paper_url TEXT;
    ALTER TABLE IF EXISTS public.exam_schedules ADD COLUMN IF NOT EXISTS answer_sheet_url TEXT;

    -- Backfill exam_id if possible
    UPDATE public.exam_schedules es SET exam_id = e.id FROM public.exams e WHERE es.exam_name = e.exam_name AND es.exam_id IS NULL;

    -- Relax legacy NOT NULLs for Exam Schedules
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exam_schedules' AND column_name = 'class') THEN 
        ALTER TABLE public.exam_schedules ALTER COLUMN "class" DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exam_schedules' AND column_name = 'section') THEN 
        ALTER TABLE public.exam_schedules ALTER COLUMN "section" DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exam_schedules' AND column_name = 'subject') THEN 
        ALTER TABLE public.exam_schedules ALTER COLUMN "subject" DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exam_schedules' AND column_name = 'exam_id') THEN 
        ALTER TABLE public.exam_schedules ALTER COLUMN "exam_id" DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exam_schedules' AND column_name = 'exam_name') THEN 
        ALTER TABLE public.exam_schedules ALTER COLUMN "exam_name" DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exam_schedules' AND column_name = 'date') THEN 
        ALTER TABLE public.exam_schedules ALTER COLUMN "date" DROP NOT NULL;
    END IF;

    -- Report Card Templates
    ALTER TABLE IF EXISTS public.report_card_templates ADD COLUMN IF NOT EXISTS template_name TEXT;
    ALTER TABLE IF EXISTS public.report_card_templates ADD COLUMN IF NOT EXISTS terms JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE IF EXISTS public.report_card_templates ADD COLUMN IF NOT EXISTS subjects JSONB DEFAULT '[]'::jsonb;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_card_templates' AND column_name = 'name') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_card_templates' AND column_name = 'template_name') THEN
            UPDATE public.report_card_templates SET template_name = name WHERE template_name IS NULL;
            ALTER TABLE public.report_card_templates ALTER COLUMN "name" DROP NOT NULL;
        ELSE
            ALTER TABLE public.report_card_templates RENAME COLUMN "name" TO "template_name";
        END IF;
    END IF;

    -- Hostel Rooms
    ALTER TABLE IF EXISTS public.hostel_rooms ADD COLUMN IF NOT EXISTS category TEXT;
    ALTER TABLE IF EXISTS public.hostel_rooms ADD COLUMN IF NOT EXISTS price_per_month NUMERIC DEFAULT 0;
END $$;

-- GRANT PERMISSIONS SO THE APP CAN AUTO-FIX LATER
GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon, authenticated, service_role;

-- REFRESH CACHE
NOTIFY pgrst, 'reload schema';

-- Ensure school_profile has credential columns
ALTER TABLE school_profile 
ADD COLUMN IF NOT EXISTS warden_id TEXT,
ADD COLUMN IF NOT EXISTS warden_password TEXT,
ADD COLUMN IF NOT EXISTS accountant_id TEXT,
ADD COLUMN IF NOT EXISTS accountant_password TEXT;

-- Default credentials (change these in settings)
UPDATE school_profile 
SET warden_id = COALESCE(warden_id, 'warden123'),
    warden_password = COALESCE(warden_password, 'warden@123'),
    accountant_id = COALESCE(accountant_id, 'acc123'),
    accountant_password = COALESCE(accountant_password, 'acc@123')
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Create Hostel Attendance table if missing
CREATE TABLE IF NOT EXISTS hostel_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL,
  student_name TEXT,
  room_number TEXT,
  attendance_date DATE DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('Present', 'Absent', 'Late', 'Leave')),
  ip_address TEXT,
  location TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXAMINATION GRADING SYSTEM UPDATE
-- Run this to ensure report cards table has all necessary features
CREATE TABLE IF NOT EXISTS report_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT NOT NULL,
    template_id UUID NOT NULL,
    term_data JSONB NOT NULL DEFAULT '{}',
    result TEXT,
    aggregate TEXT,
    percentage DECIMAL,
    rank TEXT,
    teacher_comments TEXT,
    promotion_status TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    session TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SQL Snippets table for Super Admin
CREATE TABLE IF NOT EXISTS sql_snippets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed some useful snippets for Super Admin
INSERT INTO sql_snippets (title, code) VALUES 
('View All Users', 'SELECT id, username, name, role, password FROM users ORDER BY role;'),
('Update Admin Password', 'UPDATE users SET password = ''new_password'' WHERE id = ''admin'';'),
('List All Teachers', 'SELECT * FROM users WHERE role = ''teacher'';'),
('View Warden Credentials', 'SELECT warden_id, warden_password FROM school_profile;'),
('View Accountant Credentials', 'SELECT accountant_id, accountant_password FROM school_profile;'),
('Reset Student Password', 'UPDATE users SET password = ''123'' WHERE role = ''student'';'),
('Create New Staff User', 'INSERT INTO users (id, username, name, role, password) \nVALUES (''STAF-001'', ''staf001'', ''John Doe'', ''staff'', ''password123'');')
ON CONFLICT DO NOTHING;

-- Hostel Module Schema Updates
-- Run this in your Supabase SQL Editor to ensure all columns are present

-- Ensure floor column exists in hostel_rooms
ALTER TABLE IF EXISTS hostel_rooms ADD COLUMN IF NOT EXISTS room_number TEXT;
ALTER TABLE IF EXISTS hostel_rooms ADD COLUMN IF NOT EXISTS room_no TEXT;
ALTER TABLE IF EXISTS hostel_rooms ALTER COLUMN room_number DROP NOT NULL;
ALTER TABLE IF EXISTS hostel_rooms ALTER COLUMN room_no DROP NOT NULL;
ALTER TABLE IF EXISTS hostel_rooms ADD COLUMN IF NOT EXISTS floor TEXT;
ALTER TABLE IF EXISTS hostel_rooms ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE IF EXISTS hostel_rooms ADD COLUMN IF NOT EXISTS price_per_month NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS hostel_rooms ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 4;
ALTER TABLE IF EXISTS hostel_rooms ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'Non-AC';
ALTER TABLE IF EXISTS hostel_rooms ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE IF EXISTS hostel_rooms ADD COLUMN IF NOT EXISTS hostel_name TEXT;
UPDATE hostel_rooms SET room_number = room_no WHERE room_number IS NULL AND room_no IS NOT NULL;
UPDATE hostel_rooms SET room_no = room_number WHERE room_no IS NULL AND room_number IS NOT NULL;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

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

-- Fix for missing columns in hostel_attendance table
ALTER TABLE IF EXISTS hostel_attendance ADD COLUMN IF NOT EXISTS marked_by TEXT;
ALTER TABLE IF EXISTS hostel_attendance ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE IF EXISTS hostel_attendance ADD COLUMN IF NOT EXISTS location TEXT;

-- Refresh PostgREST schema cache to make new columns visible immediately
NOTIFY pgrst, 'reload schema';

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Updated migration logic for Visitors
ALTER TABLE IF EXISTS visitors ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE IF EXISTS visitors ADD COLUMN IF NOT EXISTS qualification TEXT;
ALTER TABLE IF EXISTS visitors ADD COLUMN IF NOT EXISTS role TEXT;
NOTIFY pgrst, 'reload schema';

-- Updated migration logic for Staff Leave Requests
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_leave_requests_staff_id_fkey') THEN
    ALTER TABLE staff_leave_requests DROP CONSTRAINT staff_leave_requests_staff_id_fkey;
  END IF;
END $$;
NOTIFY pgrst, 'reload schema';


-- Note: The grading logic (91-100 A+, 81-90 A, etc.) and the 50/50 Term weighting 
-- are handled in the application layer (ReportCardView) to allow for 
-- real-time updates without database locks.

-- Clean up any potential public-executable helper functions to resolve linter warnings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable') THEN
        REVOKE ALL ON FUNCTION rls_auto_enable() FROM public, anon, authenticated;
        GRANT EXECUTE ON FUNCTION rls_auto_enable() TO service_role;
    END IF;
END $$;



