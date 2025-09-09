#!/bin/bash
echo "🗄️  Setting up Database for Oriyali Waitlist"
echo "============================================="

echo "Choose your database provider:"
echo "1) Supabase (Recommended - Easy setup, generous free tier)"
echo "2) Neon (PostgreSQL, serverless)"
echo "3) Keep Mock (No real data saving)"

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "📊 Setting up Supabase..."
        npm install @supabase/supabase-js
        
        echo ""
        echo "🔧 Supabase Setup Steps:"
        echo "1. Go to https://supabase.com"
        echo "2. Create a new project"
        echo "3. Go to Settings > API"
        echo "4. Copy your URL and anon key"
        echo "5. Run the SQL script to create tables"
        echo ""
        echo "Add these environment variables:"
        echo "DATABASE_PROVIDER=supabase"
        echo "SUPABASE_URL=your_supabase_url"
        echo "SUPABASE_ANON_KEY=your_supabase_anon_key"
        ;;
    2)
        echo "🐘 Setting up Neon PostgreSQL..."
        npm install @neondatabase/serverless
        
        echo ""
        echo "🔧 Neon Setup Steps:"
        echo "1. Go to https://neon.tech"
        echo "2. Create a new database"
        echo "3. Copy your connection string"
        echo "4. Run the SQL script to create tables"
        echo ""
        echo "Add these environment variables:"
        echo "DATABASE_PROVIDER=neon"
        echo "DATABASE_URL=your_neon_connection_string"
        ;;
    3)
        echo "⚠️  Keeping Mock Database"
        echo "WARNING: User data will NOT be saved!"
        echo "This is only for testing purposes."
        echo ""
        echo "Add this environment variable:"
        echo "DATABASE_PROVIDER=mock"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎯 Next Steps:"
echo "1. Set up your chosen database"
echo "2. Add environment variables"
echo "3. Run the table creation script"
echo "4. Test the waitlist form"
echo ""
echo "📝 Don't forget to update lib/database-production.ts with your choice!"
