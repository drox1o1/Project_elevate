-- Create waitlist table for production
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  age INTEGER NOT NULL CHECK (age >= 13 AND age <= 120),
  mobile TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Create index for created_at for analytics
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (for new signups)
CREATE POLICY "Allow public inserts" ON waitlist
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- Create policy to allow reads for authenticated users only (for admin)
CREATE POLICY "Allow authenticated reads" ON waitlist
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Add updated_at trigger
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON waitlist TO anon;
GRANT SELECT ON waitlist TO authenticated;
