# Deployment Checklist for Oriyali

## 🔧 Environment Variables Required

### Supabase (Database)
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### Email Service (Choose one)
\`\`\`bash
# For SendGrid (Recommended)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=people@oriyali.com
FROM_NAME=Oriyali

# OR for Resend
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=people@oriyali.com
FROM_NAME=Oriyali
\`\`\`

## 📋 Pre-Deployment Steps

### 1. Database Setup
1. Go to your Supabase project
2. Open SQL Editor
3. Run the script: `scripts/create-waitlist-table-production.sql`
4. Verify table creation and permissions

### 2. Email Service Setup

#### Option A: SendGrid (Recommended)
1. Create SendGrid account
2. Verify sender identity for `people@oriyali.com`
3. Generate API key with Mail Send permissions
4. Add API key to environment variables

#### Option B: Resend
1. Create Resend account
2. Add and verify domain `oriyali.com`
3. Generate API key
4. Add API key to environment variables

### 3. Test Configuration
1. Deploy to staging first
2. Visit `/api/health` to check all services
3. Test waitlist form submission
4. Verify email delivery

## 🚀 Deployment Steps

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy to production
4. Configure custom domain `oriyali.com`

### Post-Deployment Verification
1. Visit `https://oriyali.com/api/health`
2. Check all services are green
3. Test waitlist form end-to-end
4. Verify email delivery and database storage

## 🔍 Troubleshooting

### Common Issues

#### 500 Error on Form Submission
- Check `/api/health` endpoint
- Verify all environment variables are set
- Check Vercel function logs
- Ensure database table exists

#### Email Not Sending
- Verify email provider API key
- Check sender email is verified
- Review email service logs
- Test with `/api/health` endpoint

#### Database Connection Issues
- Verify Supabase URL and keys
- Check RLS policies are correct
- Ensure table exists with proper schema
- Test connection with `/api/health`

## 📊 Monitoring

### Key Metrics to Track
- Waitlist signup conversion rate
- Email delivery success rate
- Form submission errors
- Page load performance

### Recommended Tools
- Vercel Analytics for performance
- Supabase Dashboard for database metrics
- SendGrid/Resend dashboard for email metrics
- Google Analytics for user behavior

## 🔒 Security Checklist

- ✅ Environment variables secured
- ✅ Database RLS policies enabled
- ✅ API keys have minimal required permissions
- ✅ HTTPS enforced
- ✅ Input validation implemented
- ✅ Error messages don't expose sensitive data

## 📈 Performance Optimization

- ✅ Images optimized and compressed
- ✅ Fonts preloaded
- ✅ Critical CSS inlined
- ✅ JavaScript code splitting
- ✅ Database queries optimized
- ✅ Email templates optimized

## 🎯 Launch Readiness

Before going live, ensure:
- [ ] All environment variables configured
- [ ] Database table created and tested
- [ ] Email service verified and working
- [ ] Form submission tested end-to-end
- [ ] Health check endpoint returns all green
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Analytics tracking implemented
- [ ] Error monitoring setup
