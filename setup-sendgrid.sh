#!/bin/bash
echo "🚀 Setting up SendGrid for Oriyali..."

# Install SendGrid package
echo "📦 Installing SendGrid package..."
npm install @sendgrid/mail

echo "✅ SendGrid package installed successfully!"

echo ""
echo "📧 Your SendGrid Configuration:"
echo "================================"
echo "Provider: SendGrid"
echo "From Email: people@oriyali.com"
echo "From Name: Oriyali"
echo "API Key: SG.o-wul6T... (configured)"
echo ""

echo "🔧 Next Steps:"
echo "1. Verify your sender identity in SendGrid dashboard"
echo "2. Test the email configuration"
echo "3. Set up domain authentication (recommended for production)"
echo ""

echo "🧪 Run this command to test your setup:"
echo "npx tsx scripts/test-email-setup.ts"
