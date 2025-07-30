"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { debugWaitlistForm } from "@/app/actions/waitlist-debug"

export function DebugWaitlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleFormSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      console.log("🔍 Client: Submitting debug form...")

      const result = await debugWaitlistForm(formData)

      console.log("🔍 Client: Received result:", result)

      if (result.success) {
        setSubmitMessage({ type: "success", text: result.message })
      } else {
        setSubmitMessage({ type: "error", text: result.message })
      }
    } catch (error) {
      console.error("🔍 Client: Form submission error:", error)
      setSubmitMessage({
        type: "error",
        text: `Client error: ${error.message}`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-[#075056]">Debug Waitlist Form</h2>

      <form action={handleFormSubmit} className="space-y-4">
        <div>
          <label htmlFor="debug-name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <Input id="debug-name" name="name" placeholder="Your Name" required disabled={isSubmitting} />
        </div>

        <div>
          <label htmlFor="debug-age" className="block text-sm font-medium mb-1">
            Age
          </label>
          <Input
            id="debug-age"
            name="age"
            type="number"
            placeholder="Your Age"
            min="13"
            max="120"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="debug-mobile" className="block text-sm font-medium mb-1">
            Mobile
          </label>
          <Input
            id="debug-mobile"
            name="mobile"
            type="tel"
            placeholder="Mobile Number"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="debug-email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input id="debug-email" name="email" type="email" placeholder="Your Email" required disabled={isSubmitting} />
        </div>

        <Button type="submit" className="w-full bg-[#FF5B04] hover:bg-[#FF5B04]/90" disabled={isSubmitting}>
          {isSubmitting ? "Testing..." : "Test Debug Form"}
        </Button>
      </form>

      {submitMessage && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            submitMessage.type === "success"
              ? "bg-green-100 border border-green-300 text-green-800"
              : "bg-red-100 border border-red-300 text-red-800"
          }`}
        >
          <p className="text-sm">{submitMessage.text}</p>
        </div>
      )}
    </div>
  )
}
