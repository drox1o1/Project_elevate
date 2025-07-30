"use server"

// Simplified server action for debugging
export async function debugWaitlistForm(formData: FormData) {
  console.log("🔍 Debug: Server action called")

  try {
    // Step 1: Extract form data
    console.log("Step 1: Extracting form data...")
    const name = formData.get("name") as string
    const age = Number.parseInt(formData.get("age") as string)
    const mobile = formData.get("mobile") as string
    const email = formData.get("email") as string

    console.log("Form data:", { name, age, mobile, email })

    // Step 2: Basic validation
    console.log("Step 2: Validating data...")
    if (!name || !age || !mobile || !email) {
      console.error("Validation failed: Missing fields")
      return {
        success: false,
        message: "Please fill in all required fields.",
      }
    }

    // Step 3: Test environment variables
    console.log("Step 3: Checking environment...")
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables")
      return {
        success: false,
        message: "Database configuration error. Please contact support.",
      }
    }

    // Step 4: Test Supabase connection
    console.log("Step 4: Testing database connection...")
    try {
      const { createClient } = require("@supabase/supabase-js")
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Simple connection test
      const { data, error } = await supabase.from("waitlist").select("count", { count: "exact" })

      if (error) {
        console.error("Database connection error:", error.message)
        return {
          success: false,
          message: "Database connection failed. Please try again.",
        }
      }

      console.log("Database connection successful")
    } catch (dbError) {
      console.error("Database setup error:", dbError)
      return {
        success: false,
        message: "Database setup error. Please contact support.",
      }
    }

    // Step 5: Test database insert
    console.log("Step 5: Testing database insert...")
    try {
      const { createClient } = require("@supabase/supabase-js")
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data: insertData, error: insertError } = await supabase
        .from("waitlist")
        .insert([
          {
            name: name.trim(),
            age,
            mobile: mobile.trim(),
            email: email.trim().toLowerCase(),
            source: "debug_test",
            metadata: { debug: true, timestamp: new Date().toISOString() },
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error("Insert error:", insertError.message)

        if (insertError.code === "23505") {
          return {
            success: false,
            message: "This email is already registered on our waitlist.",
          }
        }

        return {
          success: false,
          message: "Failed to save your information. Please try again.",
        }
      }

      console.log("Database insert successful:", insertData.id)
    } catch (insertError) {
      console.error("Insert operation error:", insertError)
      return {
        success: false,
        message: "Database operation failed. Please try again.",
      }
    }

    // Step 6: Test email (optional - don't fail if this fails)
    console.log("Step 6: Testing email...")
    try {
      const emailProvider = process.env.EMAIL_PROVIDER
      const sendgridKey = process.env.SENDGRID_API_KEY

      if (emailProvider && sendgridKey) {
        console.log("Email configuration found, attempting to send...")
        // Email sending logic here (simplified for debugging)
      } else {
        console.log("Email configuration missing, skipping email")
      }
    } catch (emailError) {
      console.error("Email error (non-fatal):", emailError)
      // Don't fail the whole operation for email issues
    }

    console.log("✅ Debug server action completed successfully")

    return {
      success: true,
      message: "Debug test successful! Your form submission is working.",
    }
  } catch (error) {
    console.error("❌ Debug server action error:", error)
    console.error("Error stack:", error.stack)

    return {
      success: false,
      message: `Server error: ${error.message}. Please contact support.`,
    }
  }
}
