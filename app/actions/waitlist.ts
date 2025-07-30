"use server"

import { saveWaitlistUser, sendWelcomeEmail, trackWaitlistSignup } from "@/lib/database"

export async function submitWaitlistForm(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string
    const age = Number.parseInt(formData.get("age") as string)
    const mobile = formData.get("mobile") as string
    const email = formData.get("email") as string

    // Basic validation
    if (!name || !age || !mobile || !email) {
      return {
        success: false,
        message: "Please fill in all required fields.",
      }
    }

    if (age < 13 || age > 120) {
      return {
        success: false,
        message: "Please enter a valid age between 13 and 120.",
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: "Please enter a valid email address.",
      }
    }

    // Phone validation (basic)
    const phoneRegex = /^[+]?[1-9][\d\s\-()]{7,15}$/
    if (!phoneRegex.test(mobile.replace(/[\s\-()]/g, ""))) {
      return {
        success: false,
        message: "Please enter a valid mobile number.",
      }
    }

    const userData = {
      name: name.trim(),
      age,
      mobile: mobile.trim(),
      email: email.trim().toLowerCase(),
    }

    console.log("🔄 Processing waitlist submission for:", userData.email)

    // Save to database
    const saveResult = await saveWaitlistUser(userData)

    if (!saveResult.success) {
      console.error("❌ Failed to save user:", saveResult.message)
      return {
        success: false,
        message: saveResult.message,
      }
    }

    console.log("✅ User saved successfully:", saveResult.userId)

    // Send welcome email (don't fail if email fails)
    try {
      console.log("📧 Sending welcome email...")
      const emailResult = await sendWelcomeEmail({
        ...userData,
        id: saveResult.userId,
        createdAt: new Date(),
      })

      if (emailResult.success) {
        console.log("✅ Welcome email sent successfully")
      } else {
        console.error("⚠️ Email sending failed:", emailResult.message)
      }
    } catch (emailError) {
      console.error("⚠️ Email sending failed, but user was saved:", emailError)
      // Continue with success response even if email fails
    }

    // Track analytics (don't fail if tracking fails)
    try {
      await trackWaitlistSignup(userData)
      console.log("📊 Analytics tracked successfully")
    } catch (trackingError) {
      console.error("⚠️ Analytics tracking failed:", trackingError)
      // Continue with success response even if tracking fails
    }

    return {
      success: true,
      message:
        "🌟 Welcome to the Oriyali family! Thank you for joining our exclusive waitlist. We're putting the finishing touches on something truly revolutionary for women's wellness. You'll be among the first to experience the future of personalized biorhythm insights. Keep an eye on your inbox – we'll be in touch soon with exciting updates!",
    }
  } catch (error) {
    console.error("❌ Waitlist submission error:", error)
    return {
      success: false,
      message: "We encountered an unexpected error. Please try again or contact us directly at people@oriyali.com.",
    }
  }
}
