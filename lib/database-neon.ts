// REAL DATABASE OPTION 2: Neon PostgreSQL Integration
import { neon } from "@neondatabase/serverless"
import type { WaitlistUser } from "./types" // Declare the WaitlistUser variable

const sql = neon(process.env.DATABASE_URL!)

export async function saveWaitlistUserNeon(
  userData: Omit<WaitlistUser, "id" | "created_at">,
): Promise<{ success: boolean; message: string; userId?: string }> {
  try {
    console.log("💾 Saving user to Neon PostgreSQL:", userData.email)

    // Check for existing user
    const existingUser = await sql`
      SELECT email FROM waitlist WHERE email = ${userData.email}
    `

    if (existingUser.length > 0) {
      return {
        success: false,
        message: "This email is already registered on our waitlist.",
      }
    }

    // Insert new user
    const result = await sql`
      INSERT INTO waitlist (name, age, mobile, email, created_at, email_sent)
      VALUES (${userData.name}, ${userData.age}, ${userData.mobile}, ${userData.email}, ${new Date().toISOString()}, false)
      RETURNING id
    `

    const userId = result[0].id

    console.log("✅ User saved to Neon successfully:", userId)

    return {
      success: true,
      message: "User successfully added to waitlist",
      userId: userId,
    }
  } catch (error) {
    console.error("Error saving user to Neon:", error)
    return {
      success: false,
      message: "Failed to save user data. Please try again.",
    }
  }
}

// Update email sent status
export async function markEmailSentNeon(userId: string): Promise<void> {
  try {
    await sql`
      UPDATE waitlist 
      SET email_sent = true, email_sent_at = ${new Date().toISOString()}
      WHERE id = ${userId}
    `

    console.log("✅ Email status updated for user:", userId)
  } catch (error) {
    console.error("Error updating email status:", error)
  }
}

// Get waitlist statistics
export async function getWaitlistStatsNeon(): Promise<{
  total: number
  today: number
  emailsSent: number
}> {
  try {
    const today = new Date().toISOString().split("T")[0]

    const [totalResult, todayResult, emailsResult] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM waitlist`,
      sql`SELECT COUNT(*) as count FROM waitlist WHERE created_at >= ${today}`,
      sql`SELECT COUNT(*) as count FROM waitlist WHERE email_sent = true`,
    ])

    return {
      total: Number.parseInt(totalResult[0].count),
      today: Number.parseInt(todayResult[0].count),
      emailsSent: Number.parseInt(emailsResult[0].count),
    }
  } catch (error) {
    console.error("Error getting waitlist stats:", error)
    return { total: 0, today: 0, emailsSent: 0 }
  }
}
