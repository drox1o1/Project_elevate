-- SQL script to create waitlist table in your existing Supabase project
-- Run this in the Supabase SQL Editor

-- Create waitlist table if it doesn't exist
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_email_sent ON waitlist(email_sent);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_waitlist_updated_at 
    BEFORE UPDATE ON waitlist 
    FOR EACH ROW 
    EXECUTE FUNCTION update_waitlist_updated_at();

-- Create analytics view for dashboard
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

-- Add RLS policies for security
-- This allows only authenticated users to view waitlist data
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy for admins to see all waitlist entries
CREATE POLICY admin_all ON waitlist 
  FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'email' IN (
    'admin@oriyali.com', 
    'people@oriyali.com'
    -- Add other admin emails here
  ));

-- Policy to allow inserts from public (for the waitlist form)
CREATE POLICY insert_public ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE waitlist IS 'Stores user information for the Oriyali waitlist';
COMMENT ON COLUMN waitlist.id IS 'Unique identifier for each waitlist entry';
COMMENT ON COLUMN waitlist.name IS 'Full name of the user';
COMMENT ON COLUMN waitlist.age IS 'Age of the user (13-120)';
COMMENT ON COLUMN waitlist.mobile IS 'Mobile phone number';
COMMENT ON COLUMN waitlist.email IS 'Email address (unique)';
COMMENT ON COLUMN waitlist.email_sent IS 'Whether welcome email was sent';
COMMENT ON COLUMN waitlist.metadata IS 'Additional data in JSON format';

-- Query to check table creation
SELECT 
    'Table created successfully' as status,
    COUNT(*) as total_records,
    MAX(created_at) as latest_signup
FROM waitlist;
