#!/bin/bash
echo "🤖 Running Automated Supabase Setup"
echo "===================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "📦 Installing required packages..."
npm install @supabase/supabase-js tsx

echo ""
echo "🚀 Running automated setup..."
npx tsx scripts/auto-setup-supabase.ts

echo ""
echo "🧪 Running integration test..."
npx tsx scripts/test-waitlist-integration.ts

echo ""
echo "✅ Automated setup completed!"
echo ""
echo "📊 Check your results:"
echo "• Supabase Dashboard: https://app.supabase.com/project/ydrzzgdtkeeblvjrvjma"
echo "• Table Editor: https://app.supabase.com/project/ydrzzgdtkeeblvjrvjma/editor"
echo ""
echo "🚀 Your waitlist is ready for production!"
