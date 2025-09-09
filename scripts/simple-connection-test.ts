// Simple test to verify your Supabase connection after SQL setup
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ydrzzgdtkeeblvjrvjma.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkcnp6Z2R0a2VlYmx2anJ2am1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDAyNjIsImV4cCI6MjA2NDYxNjI2Mn0.JsSTZygwFWV2aywQUtVAEMr-cEsNfIUwZcwmy4kV2AM"

const supabase = createClient(supabaseUrl, supabaseKey)

async function simpleConnectionTest() {
  console.log("🔍 Simple Supabase Connection Test")
  console.log("=".repeat(35))

  try {
    // Test 1: Basic table access
    console.log("1️⃣ Testing table access...")

    const { data, error } = await supabase.from("waitlist").select("count", { count: "exact" })

    if (error) {
      console.error("❌ Table access failed:", error.message)
      console.log("\n💡 This might mean:")
      console.log("   - Table doesn't exist yet")
      console.log("   - RLS policies are blocking access")
      console.log("   - Connection issue")
      return false
    }

    console.log("✅ Table access successful!")
    console.log(`   Current records: ${data?.length || 0}`)

    // Test 2: Simple insert test
    console.log("\n2️⃣ Testing insert...")

    const testEmail = `simple-test-${Date.now()}@example.com`

    const { data: insertData, error: insertError } = await supabase
      .from("waitlist")
      .insert([
        {
          name: "Simple Test",
          age: 25,
          mobile: "+1234567890",
          email: testEmail,
          source: "simple_test",
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error("❌ Insert failed:", insertError.message)
      return false
    }

    console.log("✅ Insert successful!")
    console.log(`   Record ID: ${insertData.id}`)

    // Test 3: Clean up
    console.log("\n3️⃣ Cleaning up...")

    const { error: deleteError } = await supabase.from("waitlist").delete().eq("id", insertData.id)

    if (deleteError) {
      console.log("⚠️  Cleanup warning:", deleteError.message)
    } else {
      console.log("✅ Cleanup successful!")
    }

    console.log("\n🎉 All tests passed!")
    console.log("✅ Your Supabase waitlist table is working correctly!")

    return true
  } catch (error) {
    console.error("❌ Test failed:", error)
    return false
  }
}

// Run the test
simpleConnectionTest().then((success) => {
  if (success) {
    console.log("\n🚀 Ready to test your waitlist form!")
    console.log("Next step: Test the form on your website")
  } else {
    console.log("\n🔧 Please check your Supabase setup")
  }
})
