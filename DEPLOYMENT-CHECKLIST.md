# Oriyali Production Deployment Checklist

## ✅ Pre-Deployment Steps

### 1. Environment Variables Setup
Add these to your Vercel/Netlify environment variables:

\`\`\`bash
# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=https://ydrzzgdtkeeblvjrvjma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkcnp6Z2R0a2VlYmx2anJ2am1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDAyNjIsImV4cCI6MjA2NDYxNjI2Mn0.JsSTZygwFWV2aywQUtVAEMr-cEsNfIUwZcwmy4kV2AM

# Email Service (Choose one)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=people@oriyali.com
FROM_NAME=Oriyali

# OR use Resend
# EMAIL_PROVIDER=resend
# RESEND_API_KEY=your_resend_key
\`\`\`

### 2. Database Setup
1. Go to your Supabase project: https://supabase.com/dashboard/project/ydrzzgdtkeeblvjrvjma
2. Navigate to SQL Editor
3. Run the script: `scripts/create-waitlist-table-production.sql`

### 3. Email Service Setup

#### Option A: SendGrid (Recommended)
1. Sign up at https://sendgrid.com
2. Create an API key with "Mail Send" permissions
3. Verify your sender email (people@oriyali.com)
4. Add SENDGRID_API_KEY to environment variables

#### Option B: Resend
1. Sign up at https://resend.com
2. Create an API key
3. Verify your domain or use their test domain
4. Add RESEND_API_KEY to environment variables

## 🚀 Deployment Steps

### 1. Deploy to Vercel
\`\`\`bash
# If using Vercel CLI
vercel --prod

# Or push to main branch if connected to GitHub
git push origin main
\`\`\`

### 2. Verify Deployment
1. Visit: `https://your-domain.com/api/health`
2. Check all services show ✅
3. Test the waitlist form
4. Verify email delivery

### 3. Custom Domain (Optional)
1. Add oriyali.com in Vercel dashboard
2. Update DNS records as instructed
3. Enable SSL certificate

## 🔍 Testing Checklist

- [ ] Health check endpoint returns all ✅
- [ ] Waitlist form submits successfully
- [ ] Welcome email is received
- [ ] Database entry is created
- [ ] Mobile responsiveness works
- [ ] All navigation links work
- [ ] Theme toggle functions
- [ ] Animations load properly

## 🐛 Troubleshooting

### 500 Error on Form Submit
1. Check `/api/health` endpoint
2. Verify all environment variables are set
3. Ensure database table exists
4. Check Vercel function logs

### Email Not Sending
1. Verify email provider API key
2. Check sender email is verified
3. Look for email in spam folder
4. Check provider dashboard for delivery status

### Database Connection Issues
1. Verify Supabase URL and keys
2. Check if table exists in Supabase dashboard
3. Ensure RLS policies are correct
4. Test connection in Supabase SQL editor

## 📊 Monitoring

### Analytics to Track
- Waitlist signups per day
- Email delivery rates
- Form abandonment rates
- Page load performance
- Error rates

### Useful Queries
\`\`\`sql
-- Total signups
SELECT COUNT(*) FROM waitlist;

-- Signups by day
SELECT DATE(created_at) as date, COUNT(*) as signups 
FROM waitlist 
GROUP BY DATE(created_at) 
ORDER BY date DESC;

-- Recent signups
SELECT name, email, created_at 
FROM waitlist 
ORDER BY created_at DESC 
LIMIT 10;
\`\`\`

## 🔒 Security Notes

- All user data is encrypted in transit and at rest
- Row Level Security is enabled on database
- Email addresses are validated before storage
- Rate limiting is handled by Vercel
- CORS is properly configured
- No sensitive data is logged

## 📞 Support

If you encounter issues:
1. Check the health endpoint first
2. Review Vercel function logs
3. Check Supabase logs
4. Verify email provider status
5. Contact support if needed

---

**Ready to launch! 🚀**
