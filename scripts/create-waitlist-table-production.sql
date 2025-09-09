-- Create waitlist table for Oriyali production
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/ydrzzgdtkeeblvjrvjma/sql

-- Drop table if it exists (be careful in production!)
DROP TABLE IF EXISTS waitlist;

-- Create the waitlist table
CREATE TABLE waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    age INTEGER NOT NULL CHECK (age >= 13 AND age <= 120),
    mobile TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (for waitlist signup)
CREATE POLICY "Allow waitlist signup" ON waitlist
    FOR INSERT 
    WITH CHECK (true);

-- Create policy to allow reading (for admin/analytics)
CREATE POLICY "Allow reading waitlist" ON waitlist
    FOR SELECT 
    USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_waitlist_updated_at 
    BEFORE UPDATE ON waitlist 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert a test record to verify everything works
INSERT INTO waitlist (name, email, age, mobile) 
VALUES ('Test User', 'test@oriyali.com', 25, '+1234567890')
ON CONFLICT (email) DO NOTHING;

-- Verify the table was created successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'waitlist'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'waitlist';

-- Show current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'waitlist';

-- Show current record count
SELECT COUNT(*) as total_records FROM waitlist;
