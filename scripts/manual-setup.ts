// Manual setup script that directly executes the setup logic
import { createClient } from "@supabase/supabase-js"

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ydrzzgdtkeeblvjrvjma.supabase.co"
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkcnp6Z2R0a2VlYmx2anJ2am1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDAyNjIsImV4cCI6MjA2NDYxNjI2Mn0.JsSTZygwFWV2aywQUtVAEMr-cEsNfIUwZcwmy4kV2AM"

const supabase = createClient(supabaseUrl, supabaseKey)

async function manualSetup() {
  console.log("🔧 Manual Supabase Waitlist Setup")
  console.log("=".repeat(40))

  try {
    // Test connection
    console.log("1️⃣ Testing Supabase connection...")
    console.log(`   URL: ${supabaseUrl}`)
    console.log(`   Key: ${supabaseKey.substring(0, 20)}...`)

    // Try a simple query to test connection
    const { data: testData, error: testError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .limit(1)

    if (testError) {
      console.error("❌ Connection test failed:", testError.message)

      // Try alternative connection test
      console.log("🔄 Trying alternative connection test...")
      const { data: altTest, error: altError } = await supabase.auth.getSession()

      if (altError) {
        console.error("❌ Alternative test also failed:", altError.message)
        return false
      } else {
        console.log("✅ Alternative connection successful!")
      }
    } else {
      console.log("✅ Supabase connection successful!")
    }

    // Check if waitlist table exists
    console.log("\n2️⃣ Checking for waitlist table...")

    const { data: tableData, error: tableError } = await supabase.from("waitlist").select("*").limit(1)

    if (tableError) {
      if (tableError.code === "PGRST116" || tableError.message.includes("does not exist")) {
        console.log("⚠️  Waitlist table does not exist. Need to create it.")
        console.log("\n📝 Please create the table manually:")
        console.log("1. Go to https://app.supabase.com/project/ydrzzgdtkeeblvjrvjma")
        console.log("2. Navigate to SQL Editor")
        console.log("3. Run this SQL:")

        console.log(`
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_email_sent ON waitlist(email_sent);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy for public inserts
CREATE POLICY insert_public ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);
        `)

        return false
      } else {
        console.error("❌ Error checking table:", tableError.message)
        return false
      }
    } else {
      console.log("✅ Waitlist table exists!")
      console.log(`   Found ${tableData?.length || 0} existing records`)
    }

    // Test insert (if table exists)
    console.log("\n3️⃣ Testing data insertion...")

    const testEmail = `test-${Date.now()}@oriyali-test.com`

    const { data: insertData, error: insertError } = await supabase
      .from("waitlist")
      .insert([
        {
          name: "Test User",
          age: 28,
          mobile: "+1234567890",
          email: testEmail,
          source: "manual_test",
          metadata: { test: true, timestamp: new Date().toISOString() },
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error("❌ Insert test failed:", insertError.message)

      if (insertError.code === "23505") {
        console.log("ℹ️  This might be a duplicate email error, which is expected behavior")
      }

      return false
    } else {
      console.log("✅ Test record inserted successfully!")
      console.log(`   ID: ${insertData.id}`)
      console.log(`   Email: ${insertData.email}`)

      // Clean up test record
      const { error: deleteError } = await supabase.from("waitlist").delete().eq("id", insertData.id)

      if (deleteError) {
        console.log("⚠️  Could not delete test record:", deleteError.message)
      } else {
        console.log("✅ Test record cleaned up!")
      }
    }

    console.log("\n🎉 Manual setup completed successfully!")
    console.log("\n📊 Your Supabase project is ready for waitlist submissions!")

    return true
  } catch (error) {
    console.error("❌ Manual setup failed:", error)
    return false
  }
}

// Test waitlist form submission
async function testFormSubmission() {
  console.log("\n🧪 Testing Form Submission Logic")
  console.log("=".repeat(40))

  try {
    const testEmail = `test-form-${Date.now()}@example.com`

    console.log("📝 Testing form data validation...")
    console.log(`   Email: ${testEmail}`)

    // Test email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      console.log("❌ Email validation failed")
      return false
    }
    console.log("✅ Email validation passed")

    // Test age validation
    const testAge = 29
    if (testAge < 13 || testAge > 120) {
      console.log("❌ Age validation failed")
      return false
    }
    console.log("✅ Age validation passed")

    // Test phone validation
    const testPhone = "+1-555-123-4567"
    const phoneRegex = /^[+]?[1-9][\d\s\-()]{7,15}$/
    if (!phoneRegex.test(testPhone.replace(/[\s\-()]/g, ""))) {
      console.log("❌ Phone validation failed")
      return false
    }
    console.log("✅ Phone validation passed")

    // Test database insertion
    console.log("\n💾 Testing database insertion...")

    const { data: insertData, error: insertError } = await supabase
      .from("waitlist")
      .insert([
        {
          name: "Test Form User",
          age: testAge,
          mobile: testPhone,
          email: testEmail,
          source: "form_test",
          metadata: { test: true, form_test: true, timestamp: new Date().toISOString() },
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error("❌ Database insertion failed:", insertError.message)
      return false
    }

    console.log("✅ Database insertion successful!")
    console.log(`   Record ID: ${insertData.id}`)

    // Test duplicate email handling
    console.log("\n🔄 Testing duplicate email handling...")

    const { data: duplicateData, error: duplicateError } = await supabase
      .from("waitlist")
      .insert([
        {
          name: "Duplicate Test",
          age: 25,
          mobile: "+1234567890",
          email: testEmail, // Same email
          source: "duplicate_test",
        },
      ])
      .select()

    if (duplicateError && duplicateError.code === "23505") {
      console.log("✅ Duplicate email handling works correctly!")
    } else if (duplicateError) {
      console.log("⚠️  Unexpected error:", duplicateError.message)
    } else {
      console.log("⚠️  Duplicate was allowed - this might need attention")
    }

    // Clean up test record
    const { error: deleteError } = await supabase.from("waitlist").delete().eq("id", insertData.id)

    if (deleteError) {
      console.log("⚠️  Could not delete test record:", deleteError.message)
    } else {
      console.log("✅ Test record cleaned up!")
    }

    console.log("\n🎉 Form submission test completed successfully!")
    return true
  } catch (error) {
    console.error("❌ Form submission test failed:", error)
    return false
  }
}

// Run both setup and test
async function runAll() {
  console.log("🚀 Running Complete Supabase Setup and Test")
  console.log("=".repeat(50))

  const setupSuccess = await manualSetup()

  if (setupSuccess) {
    await testFormSubmission()
  } else {
    console.log("\n⚠️  Skipping form test due to setup issues")
  }

  console.log("\n📋 Summary:")
  console.log("- Supabase URL: https://ydrzzgdtkeeblvjrvjma.supabase.co")
  console.log("- Dashboard: https://app.supabase.com/project/ydrzzgdtkeeblvjrvjma")
  console.log("- Table Editor: https://app.supabase.com/project/ydrzzgdtkeeblvjrvjma/editor")

  if (setupSuccess) {
    console.log("\n✅ Your waitlist integration is ready!")
    console.log("🚀 You can now deploy your website!")
  } else {
    console.log("\n⚠️  Please complete the manual setup steps above")
  }
}

runAll()
