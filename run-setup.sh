#!/bin/bash
echo "🚀 Running Supabase Waitlist Setup"
echo "=================================="

# Check if tsx is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

echo "📦 Installing required packages..."
npm install @supabase/supabase-js tsx

echo ""
echo "🔧 Running manual setup script..."
npx tsx scripts/manual-setup.ts

echo ""
echo "✅ Setup completed!"
echo ""
echo "📊 Next steps:"
echo "1. Check your Supabase dashboard: https://app.supabase.com/project/ydrzzgdtkeeblvjrvjma"
echo "2. If the table wasn't created automatically, run the SQL manually"
echo "3. Test your waitlist form on the website"
echo "4. Deploy to production!"
