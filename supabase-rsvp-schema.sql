-- Create RSVP table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS rsvp (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  is_attending BOOLEAN NOT NULL DEFAULT true,
  number_of_guests INTEGER NOT NULL DEFAULT 1,
  plus_one_first_name TEXT,
  plus_one_last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_rsvp_email ON rsvp(email);

-- Create index on is_attending for filtering
CREATE INDEX IF NOT EXISTS idx_rsvp_is_attending ON rsvp(is_attending);

-- Enable Row Level Security (RLS)
ALTER TABLE rsvp ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for RSVP submissions)
CREATE POLICY "Allow public insert" ON rsvp
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create policy to allow anyone to update their own RSVP (by email)
CREATE POLICY "Allow public update" ON rsvp
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow anyone to read (for viewing RSVPs - adjust if you want to restrict)
CREATE POLICY "Allow public read" ON rsvp
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at on row update
CREATE TRIGGER update_rsvp_updated_at
  BEFORE UPDATE ON rsvp
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
