// Quick test to verify everything is working
console.log("🧪 Quick Supabase Test")
console.log("=".repeat(30))

// Check environment variables
console.log("📋 Environment Check:")
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing")
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing")
console.log("EMAIL_PROVIDER:", process.env.EMAIL_PROVIDER ? "✅ Set" : "❌ Missing")
console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "✅ Set" : "❌ Missing")

// Test Supabase import
try {
  const { createClient } = require("@supabase/supabase-js")
  console.log("✅ Supabase package imported successfully")

  const supabase = createClient(
    "https://ydrzzgdtkeeblvjrvjma.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkcnp6Z2R0a2VlYmx2anJ2am1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDAyNjIsImV4cCI6MjA2NDYxNjI2Mn0.JsSTZygwFWV2aywQUtVAEMr-cEsNfIUwZcwmy4kV2AM",
  )
  console.log("✅ Supabase client created successfully")
} catch (error) {
  console.error("❌ Supabase package error:", error.message)
  console.log("💡 Run: npm install @supabase/supabase-js")
}

console.log("\n🎯 Ready to test!")
console.log("Run: npx tsx scripts/manual-setup.ts")
