-- Run this in your Supabase SQL Editor to fix missing columns in the students table
-- This will add the 'relations' and 'documents' columns which are required for student registration

ALTER TABLE students ADD COLUMN IF NOT EXISTS relations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE students ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;

-- Also ensure other potentially missing columns from the schema are present
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS disability TEXT DEFAULT 'No';
ALTER TABLE students ADD COLUMN IF NOT EXISTS disability_details TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS local_guardian_contact TEXT;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
