// Test script to verify Supabase connection and waitlist table
import { supabaseAdmin } from "../lib/supabase-server"

async function testSupabaseConnection() {
  console.log("🧪 Testing Supabase Connection for Oriyali Waitlist")
  console.log("=".repeat(50))

  try {
    // Test basic connection
    console.log("1️⃣ Testing Supabase connection...")
    const { data: connectionTest, error: connectionError } = await supabaseAdmin.from("_test").select("*").limit(1)

    if (connectionError) {
      if (connectionError.code === "PGRST116") {
        // This error is expected as _test table doesn't exist
        console.log("✅ Supabase connection successful!")
      } else {
        console.error("❌ Connection error:", connectionError.message)
        return false
      }
    } else {
      console.log("✅ Supabase connection successful!")
    }

    // Check if waitlist table exists
    console.log("\n2️⃣ Checking waitlist table...")
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "waitlist")
      .limit(1)

    if (tableError) {
      console.error("❌ Error checking table:", tableError.message)
      return false
    }

    if (tableInfo && tableInfo.length > 0) {
      console.log("✅ Waitlist table exists!")
    } else {
      console.log("❌ Waitlist table not found!")
      console.log("\n⚠️ Please run the SQL script to create the waitlist table:")
      console.log("1. Go to your Supabase dashboard")
      console.log("2. Navigate to SQL Editor")
      console.log("3. Run the SQL script from scripts/create-waitlist-table.sql")
      return false
    }

    // Test inserting a test record
    console.log("\n3️⃣ Testing waitlist table with a test record...")

    // First check if test record exists
    const { data: existingTest } = await supabaseAdmin
      .from("waitlist")
      .select("*")
      .eq("email", "test@oriyali-test.com")
      .maybeSingle()

    if (existingTest) {
      console.log("✅ Test record already exists!")
    } else {
      // Insert test record
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from("waitlist")
        .insert([
          {
            name: "Test User",
            age: 30,
            mobile: "+1234567890",
            email: "test@oriyali-test.com",
            source: "test_script",
            metadata: { test: true, timestamp: new Date().toISOString() },
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error("❌ Error inserting test record:", insertError.message)
        return false
      }

      console.log("✅ Test record inserted successfully!")
      console.log("   ID:", insertData.id)
    }

    // Clean up test record
    console.log("\n4️⃣ Cleaning up test record...")
    const { error: deleteError } = await supabaseAdmin.from("waitlist").delete().eq("email", "test@oriyali-test.com")

    if (deleteError) {
      console.error("❌ Error deleting test record:", deleteError.message)
    } else {
      console.log("✅ Test record deleted successfully!")
    }

    console.log("\n🎉 Supabase waitlist integration is working perfectly!")
    console.log("\n📝 Next steps:")
    console.log("1. Deploy your website")
    console.log("2. Test the waitlist form on the live site")
    console.log("3. Check your Supabase dashboard for new entries")
    console.log("4. Monitor email delivery in SendGrid")

    return true
  } catch (error) {
    console.error("❌ Unexpected error:", error)
    return false
  }
}

testSupabaseConnection()
