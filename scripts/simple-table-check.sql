-- Simple script to just check if your table is working
-- Run this after the main script to verify everything

-- Check if table exists and get basic info
SELECT 
    'Table exists!' as status,
    COUNT(*) as current_records
FROM waitlist;

-- Test a simple insert and delete
INSERT INTO waitlist (name, age, mobile, email, source) 
VALUES ('Test User', 25, '+1234567890', 'test-check@example.com', 'sql_test');

-- Verify the insert worked
SELECT 
    'Insert test successful!' as status,
    name, 
    email, 
    created_at
FROM waitlist 
WHERE email = 'test-check@example.com';

-- Clean up the test record
DELETE FROM waitlist WHERE email = 'test-check@example.com';

-- Final confirmation
SELECT 
    'Setup verification complete!' as status,
    COUNT(*) as final_record_count
FROM waitlist;
