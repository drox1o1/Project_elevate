-- Debug script to check database setup
-- Run this in your Supabase SQL Editor

-- Check if waitlist table exists
SELECT 
    'Checking waitlist table...' as step,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'waitlist' AND table_schema = 'public'
        ) 
        THEN 'Table exists ✅' 
        ELSE 'Table missing ❌' 
    END as result;

-- Check table structure if it exists
SELECT 
    'Table columns:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'waitlist' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
    'RLS Policies:' as info,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'waitlist' AND schemaname = 'public';

-- Test basic insert (this will help identify RLS issues)
DO $$
BEGIN
    -- Try to insert a test record
    INSERT INTO waitlist (name, age, mobile, email, source) 
    VALUES ('SQL Test', 25, '+1234567890', 'sql-debug-test@example.com', 'sql_debug');
    
    RAISE NOTICE 'Insert test successful ✅';
    
    -- Clean up the test record
    DELETE FROM waitlist WHERE email = 'sql-debug-test@example.com';
    
    RAISE NOTICE 'Cleanup successful ✅';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Insert test failed: %', SQLERRM;
END $$;

-- Get current record count
SELECT 
    'Current status:' as info,
    COUNT(*) as total_records,
    COUNT(CASE WHEN email_sent THEN 1 END) as emails_sent
FROM waitlist;
