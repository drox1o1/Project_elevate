"use server"

export async function simpleTest() {
  console.log("🧪 Simple test server action called")

  try {
    // Test 1: Basic functionality
    console.log("✅ Server action is working")

    // Test 2: Environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("Environment check:")
    console.log("- SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
    console.log("- SUPABASE_KEY:", supabaseKey ? "✅ Set" : "❌ Missing")

    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        message: "Environment variables missing",
        details: {
          supabaseUrl: !!supabaseUrl,
          supabaseKey: !!supabaseKey,
        },
      }
    }

    // Test 3: Supabase import
    try {
      const { createClient } = await import("@supabase/supabase-js")
      console.log("✅ Supabase import successful")

      // Test 4: Create client
      const supabase = createClient(supabaseUrl, supabaseKey)
      console.log("✅ Supabase client created")

      // Test 5: Simple query
      const { data, error } = await supabase.from("waitlist").select("count", { count: "exact", head: true })

      if (error) {
        console.error("❌ Database query error:", error)
        return {
          success: false,
          message: "Database query failed",
          error: error.message,
          code: error.code,
        }
      }

      console.log("✅ Database query successful")

      return {
        success: true,
        message: "All tests passed!",
        details: {
          environment: "✅",
          supabaseImport: "✅",
          clientCreation: "✅",
          databaseQuery: "✅",
          recordCount: data || 0,
        },
      }
    } catch (importError) {
      console.error("❌ Supabase import failed:", importError)
      return {
        success: false,
        message: "Supabase import failed",
        error: importError.message,
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error)
    return {
      success: false,
      message: "Test failed",
      error: error.message,
      stack: error.stack,
    }
  }
}
