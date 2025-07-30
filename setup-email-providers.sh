#!/bin/bash
# Email Provider Setup Script

echo "🚀 Setting up Email Providers for Oriyali Waitlist"
echo "=================================================="

# Function to setup Resend (Recommended)
setup_resend() {
    echo "📧 Setting up Resend Email Service..."
    
    # Install Resend package
    npm install resend
    
    echo "✅ Resend package installed"
    echo ""
    echo "📝 Next steps for Resend:"
    echo "1. Go to https://resend.com"
    echo "2. Sign up for a free account (100 emails/day free)"
    echo "3. Verify your domain or use resend.dev for testing"
    echo "4. Create an API key in the dashboard"
    echo "5. Add RESEND_API_KEY to your environment variables"
    echo ""
}

# Function to setup SendGrid
setup_sendgrid() {
    echo "📧 Setting up SendGrid Email Service..."
    
    # Install SendGrid package
    npm install @sendgrid/mail
    
    echo "✅ SendGrid package installed"
    echo ""
    echo "📝 Next steps for SendGrid:"
    echo "1. Go to https://sendgrid.com"
    echo "2. Sign up for a free account (100 emails/day free)"
    echo "3. Verify your sender identity"
    echo "4. Create an API key in Settings > API Keys"
    echo "5. Add SENDGRID_API_KEY to your environment variables"
    echo ""
}

# Ask user which provider they want
echo "Which email provider would you like to set up?"
echo "1) Resend (Recommended - easier setup)"
echo "2) SendGrid (More features)"
echo "3) Both"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        setup_resend
        echo "EMAIL_PROVIDER=resend" >> .env.local
        ;;
    2)
        setup_sendgrid
        echo "EMAIL_PROVIDER=sendgrid" >> .env.local
        ;;
    3)
        setup_resend
        setup_sendgrid
        echo "EMAIL_PROVIDER=resend" >> .env.local
        echo "# Change to 'sendgrid' if you prefer SendGrid" >> .env.local
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo "🎉 Email provider setup complete!"
echo "Don't forget to add your API keys to .env.local"
