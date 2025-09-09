-- Fixed SQL script that handles the COALESCE type mismatch
-- Run this in your Supabase SQL Editor

-- Create waitlist table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 13 AND age <= 120),
  mobile VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  source VARCHAR(100) DEFAULT 'website',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_email_sent ON waitlist(email_sent);

-- Create or replace the trigger function (this is safe to run multiple times)
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_waitlist_updated_at ON waitlist;
CREATE TRIGGER update_waitlist_updated_at 
    BEFORE UPDATE ON waitlist 
    FOR EACH ROW 
    EXECUTE FUNCTION update_waitlist_updated_at();

-- Enable RLS (safe to run multiple times)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS insert_public ON waitlist;
DROP POLICY IF EXISTS admin_all ON waitlist;

-- Policy for public inserts (waitlist form)
CREATE POLICY insert_public ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy for authenticated admin access
CREATE POLICY admin_all ON waitlist 
  FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'email' IN (
    'admin@oriyali.com', 
    'people@oriyali.com'
  ));

-- Create analytics view (safe to run multiple times)
CREATE OR REPLACE VIEW waitlist_analytics AS
SELECT 
    DATE(created_at) as signup_date,
    COUNT(*) as signups,
    COUNT(CASE WHEN email_sent THEN 1 END) as emails_sent,
    AVG(age) as avg_age,
    COUNT(CASE WHEN age BETWEEN 18 AND 25 THEN 1 END) as age_18_25,
    COUNT(CASE WHEN age BETWEEN 26 AND 35 THEN 1 END) as age_26_35,
    COUNT(CASE WHEN age BETWEEN 36 AND 45 THEN 1 END) as age_36_45,
    COUNT(CASE WHEN age > 45 THEN 1 END) as age_45_plus
FROM waitlist 
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;

-- Add comments for documentation
COMMENT ON TABLE waitlist IS 'Stores user information for the Oriyali waitlist';
COMMENT ON COLUMN waitlist.id IS 'Unique identifier for each waitlist entry';
COMMENT ON COLUMN waitlist.name IS 'Full name of the user';
COMMENT ON COLUMN waitlist.age IS 'Age of the user (13-120)';
COMMENT ON COLUMN waitlist.mobile IS 'Mobile phone number';
COMMENT ON COLUMN waitlist.email IS 'Email address (unique)';
COMMENT ON COLUMN waitlist.email_sent IS 'Whether welcome email was sent';
COMMENT ON COLUMN waitlist.metadata IS 'Additional data in JSON format';

-- Fixed verification query (separate queries to avoid type mismatch)
SELECT 
    'Waitlist table setup completed successfully!' as status,
    COUNT(*) as total_records
FROM waitlist;

-- Show latest signup separately (if any records exist)
SELECT 
    'Latest signup:' as info,
    MAX(created_at) as latest_signup_time
FROM waitlist
WHERE created_at IS NOT NULL;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'waitlist' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'waitlist' 
  AND schemaname = 'public';

-- Show policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'waitlist' 
  AND schemaname = 'public';
