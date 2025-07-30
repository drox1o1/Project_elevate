// Pre-deployment verification script
async function deploymentCheck() {
  console.log("🚀 Pre-deployment Check for Oriyali")
  console.log("=".repeat(40))

  // Check environment variables
  const requiredEnvVars = ["EMAIL_PROVIDER", "SENDGRID_API_KEY", "FROM_EMAIL", "FROM_NAME"]

  console.log("📋 Checking environment variables...")
  let allEnvVarsSet = true

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar]
    if (value) {
      console.log(`✅ ${envVar}: Set`)
    } else {
      console.log(`❌ ${envVar}: Missing`)
      allEnvVarsSet = false
    }
  }

  if (!allEnvVarsSet) {
    console.log("\n❌ Missing required environment variables!")
    console.log("Please set these in your deployment platform:")
    console.log("EMAIL_PROVIDER=sendgrid")
    console.log("SENDGRID_API_KEY=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")
    console.log("FROM_EMAIL=people@oriyali.com")
    console.log("FROM_NAME=Oriyali")
    return false
  }

  console.log("\n✅ All environment variables are set!")
  console.log("\n🎯 Ready for deployment!")
  console.log("\nDeployment platforms:")
  console.log("• Vercel: https://vercel.com")
  console.log("• Netlify: https://netlify.com")
  console.log("• Railway: https://railway.app")

  return true
}

deploymentCheck()
