# Oriyali Production Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Database Setup (Supabase)
- [ ] **Supabase Project**: `https://ydrzzgdtkeeblvjrvjma.supabase.co`
- [ ] **Run SQL Script**: Execute `scripts/create-waitlist-table-production.sql` in Supabase SQL Editor
- [ ] **Verify Table**: Check that `waitlist` table exists with proper columns and RLS policies
- [ ] **Test Connection**: Ensure database is accessible

### 2. Environment Variables (Vercel)
Set these in your Vercel project settings:

\`\`\`bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://ydrzzgdtkeeblvjrvjma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkcnp6Z2R0a2VlYmx2anJ2am1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDAyNjIsImV4cCI6MjA2NDYxNjI2Mn0.JsSTZygwFWV2aywQUtVAEMr-cEsNfIUwZcwmy4kV2AM

# Email Service (Required - Choose SendGrid OR Resend)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=people@oriyali.com
FROM_NAME=Oriyali

# OR use Resend instead:
# EMAIL_PROVIDER=resend
# RESEND_API_KEY=your_resend_api_key
\`\`\`

### 3. Email Service Setup

#### Option A: SendGrid (Recommended)
1. **Create Account**: [SendGrid.com](https://sendgrid.com)
2. **Verify Domain**: Add `oriyali.com` as verified sender
3. **Get API Key**: Create API key with Mail Send permissions
4. **Set Environment Variables**: Add `SENDGRID_API_KEY` to Vercel

#### Option B: Resend (Alternative)
1. **Create Account**: [Resend.com](https://resend.com)
2. **Verify Domain**: Add `oriyali.com` as verified domain
3. **Get API Key**: Create API key
4. **Set Environment Variables**: Add `RESEND_API_KEY` to Vercel

## 🚀 Deployment Steps

### 1. Deploy to Vercel
\`\`\`bash
# Connect your GitHub repo to Vercel
# Or deploy directly:
vercel --prod
\`\`\`

### 2. Verify Deployment
- [ ] **Health Check**: Visit `https://your-domain.com/api/health`
- [ ] **Database Status**: Should show "✅ Connected"
- [ ] **Email Status**: Should show "✅ Configured"
- [ ] **Environment**: All variables should show "✅ Configured"

### 3. Test Functionality
- [ ] **Waitlist Form**: Submit test entry
- [ ] **Database Insert**: Check Supabase for new record
- [ ] **Welcome Email**: Verify email delivery
- [ ] **Error Handling**: Test with invalid data

## 🔍 Troubleshooting

### Common Issues:

#### 500 Error on Form Submit
1. Check `/api/health` endpoint
2. Verify all environment variables are set
3. Ensure database table exists
4. Check Vercel function logs

#### Email Not Sending
1. Verify email provider API key
2. Check domain verification status
3. Review email provider logs
4. Test with different email address

#### Database Connection Failed
1. Verify Supabase URL and keys
2. Check RLS policies are correct
3. Ensure table exists with proper schema
4. Test connection in Supabase dashboard

## 📊 Post-Deployment Monitoring

### Analytics Setup
- [ ] **Google Analytics**: Add GA4 tracking
- [ ] **Hotjar**: Set up user behavior tracking
- [ ] **Supabase Analytics**: Monitor database usage
- [ ] **Email Analytics**: Track open/click rates

### Performance Monitoring
- [ ] **Vercel Analytics**: Monitor Core Web Vitals
- [ ] **Error Tracking**: Set up Sentry or similar
- [ ] **Uptime Monitoring**: Use UptimeRobot or similar

## 🎯 Success Criteria

- ✅ Website loads without errors
- ✅ Waitlist form accepts submissions
- ✅ Database stores entries correctly
- ✅ Welcome emails are delivered
- ✅ Health check shows all green
- ✅ Mobile responsive design works
- ✅ Performance score > 90

## 🔐 Security Checklist

- [ ] **HTTPS**: Ensure SSL certificate is active
- [ ] **Environment Variables**: Never commit secrets to git
- [ ] **RLS Policies**: Database access is properly restricted
- [ ] **CORS**: API endpoints have proper CORS settings
- [ ] **Rate Limiting**: Consider adding rate limiting for form submissions

## 📞 Support Contacts

- **Vercel Support**: [vercel.com/help](https://vercel.com/help)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **SendGrid Support**: [support.sendgrid.com](https://support.sendgrid.com)
- **Domain Issues**: Contact domain registrar

---

**Last Updated**: January 2025
**Version**: 1.0
**Environment**: Production
