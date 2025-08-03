import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export interface WaitlistEntry {
  id?: string
  name: string
  email: string
  age: number
  mobile: string
  created_at?: string
}

export interface DatabaseResult {
  success: boolean
  data?: any
  error?: string
}

export async function saveWaitlistEntry(
  entry: Omit<WaitlistEntry, "id" | "created_at">,
): Promise<WaitlistEntry | null> {
  try {
    console.log("💾 Saving waitlist entry to database...")

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
      .from("waitlist")
      .insert([
        {
          name: entry.name,
          email: entry.email,
          age: entry.age,
          mobile: entry.mobile,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Database error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("✅ Entry saved successfully:", data?.id)
    return data
  } catch (error) {
    console.error("❌ Failed to save waitlist entry:", error)
    throw error
  }
}

export async function checkDatabaseConnection(): Promise<DatabaseResult> {
  try {
    console.log("🔍 Testing database connection...")

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Test connection by trying to select from waitlist table
    const { data, error } = await supabase.from("waitlist").select("count", { count: "exact" }).limit(1)

    if (error) {
      console.error("❌ Database connection failed:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    console.log("✅ Database connection successful")
    return {
      success: true,
      data: { count: data },
    }
  } catch (error) {
    console.error("❌ Database connection error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}

export async function getWaitlistCount(): Promise<number> {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { count, error } = await supabase.from("waitlist").select("*", { count: "exact", head: true })

    if (error) {
      console.error("❌ Failed to get waitlist count:", error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error("❌ Error getting waitlist count:", error)
    return 0
  }
}

// Legacy functions for backward compatibility
export async function saveWaitlistUser(userData: any) {
  try {
    const entry = await saveWaitlistEntry(userData)
    return {
      success: true,
      userId: entry?.id,
      message: "User saved successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save user",
    }
  }
}

export async function sendWelcomeEmail(user: any) {
  // This is handled in the email service now
  return { success: true, message: "Email handled by email service" }
}

export async function trackWaitlistSignup(userData: any) {
  // Analytics tracking can be implemented here
  console.log("📊 Tracking waitlist signup:", userData.email)
  return { success: true }
}
