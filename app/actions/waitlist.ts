"use server"

import { saveWaitlistEntry } from "@/lib/database"
import { sendWelcomeEmail } from "@/lib/email-service"

export interface WaitlistFormResult {
  success: boolean
  message: string
  data?: any
}

export async function submitWaitlistForm(formData: FormData): Promise<WaitlistFormResult> {
  try {
    console.log("🚀 Server Action: Starting waitlist form submission")

    // Extract and validate form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const age = formData.get("age") as string
    const mobile = formData.get("mobile") as string

    console.log("📋 Form data received:", {
      name: name?.substring(0, 10) + "...",
      email: email?.substring(0, 5) + "***@***",
      age,
      mobile: mobile?.substring(0, 3) + "***",
    })

    // Validate required fields
    if (!name || !email || !age || !mobile) {
      console.log("❌ Validation failed: Missing required fields")
      return {
        success: false,
        message: "Please fill in all required fields.",
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Validation failed: Invalid email format")
      return {
        success: false,
        message: "Please enter a valid email address.",
      }
    }

    // Validate age
    const ageNum = Number.parseInt(age)
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      console.log("❌ Validation failed: Invalid age")
      return {
        success: false,
        message: "Please enter a valid age between 13 and 120.",
      }
    }

    // Validate mobile (basic check)
    if (mobile.length < 10) {
      console.log("❌ Validation failed: Invalid mobile number")
      return {
        success: false,
        message: "Please enter a valid mobile number.",
      }
    }

    console.log("✅ Validation passed, saving to database...")

    // Save to database
    const entry = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      age: ageNum,
      mobile: mobile.trim(),
    }

    const savedEntry = await saveWaitlistEntry(entry)
    console.log("✅ Database save successful:", savedEntry?.id)

    // Send welcome email (don't fail if email fails)
    try {
      console.log("📧 Sending welcome email...")
      await sendWelcomeEmail(entry.email, entry.name)
      console.log("✅ Welcome email sent successfully")
    } catch (emailError) {
      console.error("⚠️ Email sending failed (non-critical):", emailError)
      // Don't fail the entire operation if email fails
    }

    return {
      success: true,
      message: `Welcome to Oriyali, ${name}! 🌟 You're now on our exclusive waitlist. Check your email for confirmation and stay tuned for updates about your personalized bio-rhythm journey.`,
      data: { id: savedEntry?.id },
    }
  } catch (error) {
    console.error("❌ Server Action Error:", error)

    // Provide user-friendly error messages
    let errorMessage = "Something went wrong. Please try again."

    if (error instanceof Error) {
      if (error.message.includes("duplicate key") || error.message.includes("already exists")) {
        errorMessage = "This email is already registered. Thank you for your interest!"
      } else if (error.message.includes("connection") || error.message.includes("network")) {
        errorMessage = "Connection issue. Please check your internet and try again."
      } else if (error.message.includes("Database error")) {
        errorMessage = "Database temporarily unavailable. Please try again in a moment."
      }
    }

    return {
      success: false,
      message: errorMessage,
    }
  }
}
