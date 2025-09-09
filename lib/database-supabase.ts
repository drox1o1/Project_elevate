// REAL DATABASE OPTION 1: Supabase Integration
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export interface WaitlistUser {
  id?: string
  name: string
  age: number
  mobile: string
  email: string
  created_at?: string
  email_sent?: boolean
}

export async function saveWaitlistUserSupabase(
  userData: Omit<WaitlistUser, "id" | "created_at">,
): Promise<{ success: boolean; message: string; userId?: string }> {
  try {
    console.log("💾 Saving user to Supabase:", userData.email)

    // Check for existing user
    const { data: existingUser } = await supabase.from("waitlist").select("email").eq("email", userData.email).single()

    if (existingUser) {
      return {
        success: false,
        message: "This email is already registered on our waitlist.",
      }
    }

    // Insert new user
    const { data, error } = await supabase
      .from("waitlist")
      .insert([
        {
          name: userData.name,
          age: userData.age,
          mobile: userData.mobile,
          email: userData.email,
          created_at: new Date().toISOString(),
          email_sent: false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        message: "Failed to save user data. Please try again.",
      }
    }

    console.log("✅ User saved to Supabase successfully:", data.id)

    return {
      success: true,
      message: "User successfully added to waitlist",
      userId: data.id,
    }
  } catch (error) {
    console.error("Error saving user to Supabase:", error)
    return {
      success: false,
      message: "Failed to save user data. Please try again.",
    }
  }
}

// Update email sent status
export async function markEmailSent(userId: string): Promise<void> {
  try {
    await supabase
      .from("waitlist")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", userId)

    console.log("✅ Email status updated for user:", userId)
  } catch (error) {
    console.error("Error updating email status:", error)
  }
}

// Get waitlist statistics
export async function getWaitlistStats(): Promise<{
  total: number
  today: number
  emailsSent: number
}> {
  try {
    const today = new Date().toISOString().split("T")[0]

    const [totalResult, todayResult, emailsResult] = await Promise.all([
      supabase.from("waitlist").select("id", { count: "exact" }),
      supabase.from("waitlist").select("id", { count: "exact" }).gte("created_at", today),
      supabase.from("waitlist").select("id", { count: "exact" }).eq("email_sent", true),
    ])

    return {
      total: totalResult.count || 0,
      today: todayResult.count || 0,
      emailsSent: emailsResult.count || 0,
    }
  } catch (error) {
    console.error("Error getting waitlist stats:", error)
    return { total: 0, today: 0, emailsSent: 0 }
  }
}
