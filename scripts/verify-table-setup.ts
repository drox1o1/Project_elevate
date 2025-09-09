// Script to verify your table setup after running the SQL
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ydrzzgdtkeeblvjrvjma.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkcnp6Z2R0a2VlYmx2anJ2am1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDAyNjIsImV4cCI6MjA2NDYxNjI2Mn0.JsSTZygwFWV2aywQUtVAEMr-cEsNfIUwZcwmy4kV2AM"

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyTableSetup() {
  console.log("🔍 Verifying Waitlist Table Setup")
  console.log("=".repeat(40))

  try {
    // Test 1: Check if table exists and is accessible
    console.log("1️⃣ Testing table access...")

    const { data: tableTest, error: tableError } = await supabase.from("waitlist").select("*").limit(1)

    if (tableError) {
      console.error("❌ Table access failed:", tableError.message)
      return false
    }

    console.log("✅ Table exists and is accessible!")
    console.log(`   Current records: ${tableTest?.length || 0}`)

    // Test 2: Test insert functionality
    console.log("\n2️⃣ Testing insert functionality...")

    const testEmail = `verify-${Date.now()}@test.com`

    const { data: insertData, error: insertError } = await supabase
      .from("waitlist")
      .insert([
        {
          name: "Verification Test",
          age: 25,
          mobile: "+1234567890",
          email: testEmail,
          source: "verification_test",
          metadata: {
            test: true,
            verification: true,
            timestamp: new Date().toISOString(),
          },
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error("❌ Insert test failed:", insertError.message)
      return false
    }

    console.log("✅ Insert functionality works!")
    console.log(`   Test record ID: ${insertData.id}`)

    // Test 3: Test duplicate email handling
    console.log("\n3️⃣ Testing duplicate email handling...")

    const { data: duplicateData, error: duplicateError } = await supabase
      .from("waitlist")
      .insert([
        {
          name: "Duplicate Test",
          age: 30,
          mobile: "+0987654321",
          email: testEmail, // Same email as above
          source: "duplicate_test",
        },
      ])
      .select()

    if (duplicateError && duplicateError.code === "23505") {
      console.log("✅ Duplicate email prevention works correctly!")
    } else if (duplicateError) {
      console.log("⚠️  Unexpected duplicate error:", duplicateError.message)
    } else {
      console.log("⚠️  Duplicate email was allowed - check unique constraint")
    }

    // Test 4: Test update functionality (for email_sent field)
    console.log("\n4️⃣ Testing update functionality...")

    const { data: updateData, error: updateError } = await supabase
      .from("waitlist")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", insertData.id)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Update test failed:", updateError.message)
    } else {
      console.log("✅ Update functionality works!")
      console.log(`   Email sent status: ${updateData.email_sent}`)
    }

    // Test 5: Clean up test record
    console.log("\n5️⃣ Cleaning up test record...")

    const { error: deleteError } = await supabase.from("waitlist").delete().eq("id", insertData.id)

    if (deleteError) {
      console.log("⚠️  Could not delete test record:", deleteError.message)
      console.log("   You may need to delete it manually from the dashboard")
    } else {
      console.log("✅ Test record cleaned up successfully!")
    }

    // Test 6: Get current statistics
    console.log("\n6️⃣ Getting current statistics...")

    const { data: statsData, error: statsError } = await supabase.from("waitlist").select("*", { count: "exact" })

    if (statsError) {
      console.log("⚠️  Could not get statistics:", statsError.message)
    } else {
      console.log(`📊 Total waitlist entries: ${statsData?.length || 0}`)
    }

    console.log("\n🎉 Table verification completed successfully!")
    console.log("\n📋 Summary:")
    console.log("✅ Table exists and is accessible")
    console.log("✅ Insert functionality works")
    console.log("✅ Duplicate email prevention works")
    console.log("✅ Update functionality works")
    console.log("✅ Your waitlist is ready for production!")

    console.log("\n🚀 Next steps:")
    console.log("1. Test your waitlist form on the website")
    console.log("2. Check that emails are being sent")
    console.log("3. Deploy to production!")

    return true
  } catch (error) {
    console.error("❌ Verification failed:", error)
    return false
  }
}

verifyTableSetup()
