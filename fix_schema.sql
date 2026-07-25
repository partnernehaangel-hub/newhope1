-- Comprehensive fix for students table schema
-- Run this in your Supabase SQL Editor to add missing columns

ALTER TABLE students ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS roll_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS residential_address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS religion TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS caste TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_mobile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_mobile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_income TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_income_source TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_income TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_income_source TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS local_guardian_contact TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS student_type TEXT DEFAULT 'Old';
ALTER TABLE students ADD COLUMN IF NOT EXISTS allergy TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS has_disability BOOLEAN DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS disability_details TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS aadhaar_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS pan_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS relation_in_school JSONB DEFAULT '[]'::jsonb;
ALTER TABLE students ADD COLUMN IF NOT EXISTS aadhaar_card_doc TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS caste_certificate_doc TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parents_docs TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS signature_doc TEXT;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students'
ORDER BY column_name;
