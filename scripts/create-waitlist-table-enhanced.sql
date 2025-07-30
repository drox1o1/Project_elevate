-- Enhanced SQL script to create waitlist table with analytics
-- Run this in your database (Supabase SQL Editor or Neon Console)

-- Create waitlist table
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
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_email_sent ON waitlist(email_sent);
CREATE INDEX IF NOT EXISTS idx_waitlist_source ON waitlist(source);
CREATE INDEX IF NOT EXISTS idx_waitlist_age ON waitlist(age);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_waitlist_updated_at 
    BEFORE UPDATE ON waitlist 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create analytics view
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
COMMENT ON TABLE waitlist IS 'Stores user information for the Oriyali waitlist with analytics';
COMMENT ON COLUMN waitlist.id IS 'Unique identifier for each waitlist entry';
COMMENT ON COLUMN waitlist.name IS 'Full name of the user';
COMMENT ON COLUMN waitlist.age IS 'Age of the user (13-120)';
COMMENT ON COLUMN waitlist.mobile IS 'Mobile phone number';
COMMENT ON COLUMN waitlist.email IS 'Email address (unique)';
COMMENT ON COLUMN waitlist.email_sent IS 'Whether welcome email was sent successfully';
COMMENT ON COLUMN waitlist.metadata IS 'Additional data in JSON format';
COMMENT ON COLUMN waitlist.utm_source IS 'Marketing source tracking';

-- Insert sample data for testing (optional)
-- INSERT INTO waitlist (name, age, mobile, email, source) VALUES 
-- ('Test User', 28, '+1234567890', 'test@example.com', 'website');

-- Query to check table creation
SELECT 
    'Table created successfully' as status,
    COUNT(*) as total_records,
    MAX(created_at) as latest_signup
FROM waitlist;
