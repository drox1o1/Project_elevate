// Setup script to create waitlist table and test connection
import { supabaseAdmin } from "../lib/supabase-server"

async function setupSupabaseWaitlist() {
  console.log("🚀 Setting up Supabase Waitlist for Oriyali")
  console.log("=".repeat(50))

  try {
    // Test connection first
    console.log("1️⃣ Testing Supabase connection...")

    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .limit(1)

    if (connectionError) {
      console.error("❌ Connection failed:", connectionError.message)
      return false
    }

    console.log("✅ Supabase connection successful!")
    console.log(`   Project URL: https://ydrzzgdtkeeblvjrvjma.supabase.co`)

    // Check if waitlist table exists
    console.log("\n2️⃣ Checking if waitlist table exists...")

    const { data: tableCheck, error: tableError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "waitlist")
      .eq("table_schema", "public")

    if (tableError) {
      console.error("❌ Error checking table:", tableError.message)
      return false
    }

    if (tableCheck && tableCheck.length > 0) {
      console.log("✅ Waitlist table already exists!")
    } else {
      console.log("⚠️  Waitlist table not found. Creating it now...")

      // Create the table using raw SQL
      const createTableSQL = `
        -- Create waitlist table
        CREATE TABLE IF NOT EXISTS waitlist (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          age INTEGER NOT NULL CHECK (age >= 13 AND age <= 120),
          mobile VARCHAR(50) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          email_sent BOOLEAN DEFAULT FALSE,
          email_sent_at TIMESTAMP WITH TIME ZONE,
          source VARCHAR(100) DEFAULT 'website',
          metadata JSONB DEFAULT '{}'::jsonb
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
        CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_waitlist_email_sent ON waitlist(email_sent);

        -- Create updated_at trigger
        CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_waitlist_updated_at 
            BEFORE UPDATE ON waitlist 
            FOR EACH ROW 
            EXECUTE FUNCTION update_waitlist_updated_at();

        -- Enable RLS
        ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

        -- Policy for public inserts (waitlist form)
        CREATE POLICY insert_public ON waitlist
          FOR INSERT
          TO anon
          WITH CHECK (true);

        -- Policy for authenticated admin access
        CREATE POLICY admin_all ON waitlist 
          FOR ALL 
          TO authenticated 
          USING (auth.jwt() ->> 'email' IN (
            'admin@oriyali.com', 
            'people@oriyali.com'
          ));
      `

      const { error: createError } = await supabaseAdmin.rpc("exec_sql", {
        sql: createTableSQL,
      })

      if (createError) {
        console.error("❌ Error creating table:", createError.message)
        console.log("\n📝 Please create the table manually:")
        console.log("1. Go to https://app.supabase.com/project/ydrzzgdtkeeblvjrvjma")
        console.log("2. Navigate to SQL Editor")
        console.log("3. Run the SQL script from scripts/create-waitlist-table.sql")
        return false
      }

      console.log("✅ Waitlist table created successfully!")
    }

    // Test inserting a record
    console.log("\n3️⃣ Testing waitlist functionality...")

    const testEmail = `test-${Date.now()}@oriyali-test.com`

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from("waitlist")
      .insert([
        {
          name: "Test User",
          age: 28,
          mobile: "+1234567890",
          email: testEmail,
          source: "setup_test",
          metadata: { test: true, timestamp: new Date().toISOString() },
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error("❌ Error inserting test record:", insertError.message)
      return false
    }

    console.log("✅ Test record inserted successfully!")
    console.log(`   ID: ${insertData.id}`)
    console.log(`   Email: ${insertData.email}`)

    // Clean up test record
    const { error: deleteError } = await supabaseAdmin.from("waitlist").delete().eq("id", insertData.id)

    if (deleteError) {
      console.error("⚠️  Could not delete test record:", deleteError.message)
    } else {
      console.log("✅ Test record cleaned up successfully!")
    }

    // Get current stats
    console.log("\n4️⃣ Getting waitlist statistics...")

    const { data: stats, error: statsError } = await supabaseAdmin.from("waitlist").select("*", { count: "exact" })

    if (statsError) {
      console.error("⚠️  Could not get stats:", statsError.message)
    } else {
      console.log(`📊 Current waitlist entries: ${stats?.length || 0}`)
    }

    console.log("\n🎉 Supabase waitlist setup completed successfully!")
    console.log("\n📝 Next steps:")
    console.log("1. Your waitlist form is now ready to accept submissions")
    console.log("2. Data will be saved to your Supabase project")
    console.log("3. You can view entries at: https://app.supabase.com/project/ydrzzgdtkeeblvjrvjma/editor")
    console.log("4. Deploy your website to start collecting signups!")

    return true
  } catch (error) {
    console.error("❌ Setup failed:", error)
    console.log("\n🔧 Troubleshooting:")
    console.log("1. Check your Supabase credentials")
    console.log("2. Ensure your project is active")
    console.log("3. Try creating the table manually in the Supabase dashboard")
    return false
  }
}

setupSupabaseWaitlist()
