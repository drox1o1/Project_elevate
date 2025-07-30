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
      console.log("🧪 Starting simple test...")
      const result = await simpleTest()
      setTestResult(result)
      console.log("Simple test result:", result)
    } catch (error) {
      console.error("Simple test client error:", error)
      setTestResult({
        success: false,
        message: "Client-side error",
        error: error.message,
        stack: error.stack,
      })
    } finally {
      setIsTestingSimple(false)
    }
  }

  const testFormSubmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsTestingForm(true)
    setFormResult(null)

    const formData = new FormData(event.currentTarget)

    // Log form data for debugging
    console.log("📝 Form data being submitted:")
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`)
    }

    try {
      console.log("🚀 Starting form test...")
      const result = await submitWaitlistFormFixed(formData)
      setFormResult(result)
      console.log("Form test result:", result)
    } catch (error) {
      console.error("Form test client error:", error)
      setFormResult({
        success: false,
        message: "Client-side error",
        error: error.message,
        stack: error.stack,
      })
    } finally {
      setIsTestingForm(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-[#075056] dark:text-[#9ECFD6]">🔍 Oriyali Debug Center</h1>
          <p className="text-lg text-muted-foreground">Comprehensive testing suite to diagnose and fix the 500 error</p>
        </div>

        {/* Environment Info */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">🌍 Environment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Client Environment:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>
                  • User Agent: {typeof window !== "undefined" ? navigator.userAgent.slice(0, 50) + "..." : "Server"}
                </li>
                <li>• URL: {typeof window !== "undefined" ? window.location.href : "Server"}</li>
                <li>• Timestamp: {new Date().toISOString()}</li>
              </ul>
            </div>
            <div>
              <strong>Expected Environment Variables:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• NEXT_PUBLIC_SUPABASE_URL</li>
                <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>• SENDGRID_API_KEY (optional)</li>
                <li>• EMAIL_PROVIDER (optional)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Simple Test Section */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">🧪 Simple Server Action Test</h2>
          <p className="text-muted-foreground mb-4">
            This tests basic server action functionality, environment variables, and database connection.
            <strong> Run this first!</strong>
          </p>

          <Button
            onClick={runSimpleTest}
            disabled={isTestingSimple}
            className="mb-4 bg-[#FF5B04] hover:bg-[#FF5B04]/90"
          >
            {isTestingSimple ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Testing...
              </div>
            ) : (
              "🚀 Run Simple Test"
            )}
          </Button>

          {testResult && (
            <div
              className={`p-4 rounded-lg border-2 ${
                testResult.success
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{testResult.success ? "✅" : "❌"}</span>
                <h3 className="font-semibold">{testResult.success ? "Test Passed!" : "Test Failed"}</h3>
              </div>
              <div className="bg-black/5 dark:bg-white/5 p-3 rounded text-xs overflow-auto">
                <pre>{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Form Test Section */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">📝 Waitlist Form Test</h2>
          <p className="text-muted-foreground mb-4">
            This tests the complete waitlist form submission process.
            <strong> Only run this after the simple test passes!</strong>
          </p>

          <form onSubmit={testFormSubmission} className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="debug-name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <Input
                  id="debug-name"
                  name="name"
                  placeholder="Debug User"
                  defaultValue="Debug User"
                  required
                  className="focus:ring-2 focus:ring-[#FF5B04]"
                />
              </div>
              <div>
                <label htmlFor="debug-age" className="block text-sm font-medium mb-1">
                  Age
                </label>
                <Input
                  id="debug-age"
                  name="age"
                  type="number"
                  placeholder="25"
                  defaultValue="25"
                  required
                  min="13"
                  max="120"
                  className="focus:ring-2 focus:ring-[#FF5B04]"
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
                  placeholder="+1234567890"
                  defaultValue="+1234567890"
                  required
                  className="focus:ring-2 focus:ring-[#FF5B04]"
                />
              </div>
              <div>
                <label htmlFor="debug-email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="debug-email"
                  name="email"
                  type="email"
                  placeholder="debug@example.com"
                  defaultValue={`debug-${Date.now()}@example.com`}
                  required
                  className="focus:ring-2 focus:ring-[#FF5B04]"
                />
              </div>
            </div>
            <Button type="submit" disabled={isTestingForm} className="w-full bg-[#075056] hover:bg-[#075056]/90">
              {isTestingForm ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Testing Form Submission...
                </div>
              ) : (
                "📤 Test Form Submission"
              )}
            </Button>
          </form>

          {formResult && (
            <div
              className={`p-4 rounded-lg border-2 ${
                formResult.success
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{formResult.success ? "✅" : "❌"}</span>
                <h3 className="font-semibold">
                  {formResult.success ? "Form Submission Successful!" : "Form Submission Failed"}
                </h3>
              </div>
              <div className="bg-black/5 dark:bg-white/5 p-3 rounded text-xs overflow-auto">
                <pre>{JSON.stringify(formResult, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">📋 Debug Instructions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Step 1: Run Simple Test</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Click "Run Simple Test" above</li>
                <li>Check the result - it should show environment variables and database connection status</li>
                <li>If it fails, check your environment variables in your deployment platform</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium mb-2">Step 2: Check Browser Console</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Open your browser's developer tools (F12)</li>
                <li>Go to the Console tab</li>
                <li>Look for detailed logs with emoji indicators (🔍, ✅, ❌, etc.)</li>
                <li>Copy any error messages you see</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium mb-2">Step 3: Run SQL Debug Script</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Go to your Supabase dashboard</li>
                <li>Open the SQL Editor</li>
                <li>
                  Copy and paste the contents of <code>scripts/debug-database-connection.sql</code>
                </li>
                <li>Run the script and check the results</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium mb-2">Step 4: Test Form (Only if Simple Test Passes)</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Fill out the form above with test data</li>
                <li>Click "Test Form Submission"</li>
                <li>Check both the result here and the browser console</li>
                <li>Report any errors you see</li>
              </ol>
            </div>

            <div>
              <h3 className="font-medium mb-2">Step 5: Check Server Logs</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Go to your deployment platform (Vercel, Netlify, etc.)</li>
                <li>Check the function logs or server logs</li>
                <li>Look for any 500 errors or stack traces</li>
                <li>Copy the error details</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">⚠️ Common Issues & Quick Fixes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Environment Variables</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Missing NEXT_PUBLIC_SUPABASE_URL</li>
                <li>• Missing NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>• Variables not deployed to production</li>
                <li>• Incorrect variable names (check spelling)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Database Issues</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Waitlist table doesn't exist</li>
                <li>• RLS (Row Level Security) blocking inserts</li>
                <li>• Missing database permissions</li>
                <li>• Incorrect table schema</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Package Issues</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• @supabase/supabase-js not installed</li>
                <li>• Version conflicts</li>
                <li>• Import/export errors</li>
                <li>• Build-time vs runtime issues</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Server Action Issues</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Missing "use server" directive</li>
                <li>• Async/await errors</li>
                <li>• Serialization issues</li>
                <li>• Timeout errors</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back to Main Site */}
        <div className="text-center">
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="border-[#FF5B04] text-[#FF5B04] hover:bg-[#FF5B04] hover:text-white"
          >
            ← Back to Main Site
          </Button>
        </div>
      </div>
    </div>
  )
}
