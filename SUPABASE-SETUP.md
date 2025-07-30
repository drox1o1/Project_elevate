# Supabase Integration for Oriyali Waitlist

## 🔧 Setup Instructions

### 1. Create Waitlist Table

Run the SQL script in your Supabase SQL Editor:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to SQL Editor
4. Create a new query
5. Copy and paste the contents of `scripts/create-waitlist-table.sql`
6. Run the query

### 2. Set Environment Variables

Add these environment variables to your deployment platform:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

You can find these values in your Supabase dashboard under Settings > API.

### 3. Test the Integration

Run the test script to verify everything is working:

\`\`\`bash
npx tsx scripts/test-supabase-connection.ts
\`\`\`

## 📊 Accessing Waitlist Data

### Via Supabase Dashboard

1. Go to your Supabase Dashboard
2. Select your project
3. Go to Table Editor
4. Select the "waitlist" table

### Via SQL

You can run SQL queries in the SQL Editor:

\`\`\`sql
-- Get all waitlist entries
SELECT * FROM waitlist ORDER BY created_at DESC;

-- Get count by day
SELECT DATE(created_at) as day, COUNT(*) as signups
FROM waitlist
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- Get email statistics
SELECT 
  COUNT(*) as total_signups,
  COUNT(CASE WHEN email_sent THEN 1 END) as emails_sent,
  ROUND(COUNT(CASE WHEN email_sent THEN 1 END)::numeric / COUNT(*) * 100, 2) as email_success_rate
FROM waitlist;
\`\`\`

### Via API

You can also access the data programmatically:

\`\`\`typescript
import { supabaseAdmin } from "@/lib/supabase-server"

// Get all waitlist entries
const { data, error } = await supabaseAdmin
  .from("waitlist")
  .select("*")
  .order("created_at", { ascending: false })
\`\`\`

## 🔒 Security

The waitlist table has Row Level Security (RLS) policies configured:

1. Public users can only insert new records (for the waitlist form)
2. Only authenticated admin users can view or modify the data

To add more admin users, update the RLS policy in the SQL Editor:

\`\`\`sql
CREATE POLICY admin_all ON waitlist 
  FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'email' IN (
    'admin@oriyali.com', 
    'people@oriyali.com',
    'your-new-admin@example.com'
  ));
\`\`\`

## 📈 Analytics View

A view called `waitlist_analytics` has been created for easy reporting:

\`\`\`sql
SELECT * FROM waitlist_analytics;
\`\`\`

This provides daily signup counts, email statistics, and age demographics.
