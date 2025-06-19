"use server"

import { saveWaitlistUser } from "@/lib/database"

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

    // Save to database
    const result = await saveWaitlistUser({
      name: name.trim(),
      age,
      mobile: mobile.trim(),
      email: email.trim().toLowerCase(),
    })

    if (result.success) {
      return {
        success: true,
        message:
          "Welcome to the Oriyali family! 🌟 Thank you for joining our exclusive waitlist. We're putting the finishing touches on something truly revolutionary for women's wellness. You'll be among the first to experience the future of personalized biorhythm insights. Keep an eye on your inbox – we'll be in touch soon with exciting updates!",
      }
    } else {
      return {
        success: false,
        message: "We encountered an issue saving your information. Please try again or contact us directly.",
      }
    }
  } catch (error) {
    console.error("Waitlist submission error:", error)
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    }
  }
}
