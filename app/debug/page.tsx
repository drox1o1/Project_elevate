"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { submitWaitlistFormFixed } from "@/app/actions/waitlist-fixed"
import { simpleTest } from "@/app/actions/simple-test"

export default function DebugPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [formResult, setFormResult] = useState<any>(null)
  const [isTestingSimple, setIsTestingSimple] = useState(false)
  const [isTestingForm, setIsTestingForm] = useState(false)

  const runSimpleTest = async () => {
    setIsTestingSimple(true)
    setTestResult(null)

    try {
      const result = await simpleTest()
      setTestResult(result)
      console.log("Simple test result:", result)
    } catch (error) {
      setTestResult({
        success: false,
        message: "Client-side error",
        error: error.message,
      })
      console.error("Simple test error:", error)
    } finally {
      setIsTestingSimple(false)
    }
  }

  const testFormSubmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsTestingForm(true)
    setFormResult(null)

    const formData = new FormData(event.currentTarget)

    try {
      const result = await submitWaitlistFormFixed(formData)
      setFormResult(result)
      console.log("Form test result:", result)
    } catch (error) {
      setFormResult({
        success: false,
        message: "Client-side error",
        error: error.message,
      })
      console.error("Form test error:", error)
    } finally {
      setIsTestingForm(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">Debug Page</h1>

        {/* Simple Test Section */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Simple Server Action Test</h2>
          <p className="text-muted-foreground mb-4">
            This tests basic server action functionality, environment variables, and database connection.
          </p>

          <Button onClick={runSimpleTest} disabled={isTestingSimple} className="mb-4">
            {isTestingSimple ? "Testing..." : "Run Simple Test"}
          </Button>

          {testResult && (
            <div
              className={`p-4 rounded-lg ${testResult.success ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}
            >
              <h3 className="font-semibold mb-2">Test Result:</h3>
              <pre className="text-sm overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Form Test Section */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Waitlist Form Test</h2>
          <p className="text-muted-foreground mb-4">This tests the complete waitlist form submission process.</p>

          <form onSubmit={testFormSubmission} className="space-y-4 mb-4">
            <Input name="name" placeholder="Test Name" defaultValue="Debug User" required />
            <Input name="age" type="number" placeholder="Age" defaultValue="25" required />
            <Input name="mobile" type="tel" placeholder="Mobile" defaultValue="+1234567890" required />
            <Input
              name="email"
              type="email"
              placeholder="Email"
              defaultValue={`debug-${Date.now()}@example.com`}
              required
            />
            <Button type="submit" disabled={isTestingForm} className="w-full">
              {isTestingForm ? "Testing Form..." : "Test Form Submission"}
            </Button>
          </form>

          {formResult && (
            <div
              className={`p-4 rounded-lg ${formResult.success ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}
            >
              <h3 className="font-semibold mb-2">Form Result:</h3>
              <pre className="text-sm overflow-auto">{JSON.stringify(formResult, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Debug Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>First run the "Simple Test" to check basic functionality</li>
            <li>Check your browser console (F12) for detailed logs</li>
            <li>If simple test passes, try the form submission</li>
            <li>Check your deployment platform's server logs for backend errors</li>
            <li>Run the SQL debug script in your Supabase dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
