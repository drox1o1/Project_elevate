# Oriyali Deployment Guide

## 🚀 Quick Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   \`\`\`bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   \`\`\`

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     \`\`\`
     EMAIL_PROVIDER=sendgrid
     SENDGRID_API_KEY=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
     FROM_EMAIL=people@oriyali.com
     FROM_NAME=Oriyali
     \`\`\`
   - Click "Deploy"

## 🔧 Environment Variables Required

\`\`\`env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=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
FROM_EMAIL=people@oriyali.com
FROM_NAME=Oriyali
\`\`\`

## ⚠️ Important Notes

1. **Sender Verification**: Before going live, verify `people@oriyali.com` in your SendGrid dashboard
2. **Domain Authentication**: For production, set up domain authentication for better deliverability
3. **Rate Limits**: SendGrid free tier allows 100 emails/day

## 🧪 Testing After Deployment

1. Visit your deployed site
2. Fill out the waitlist form
3. Check that emails are being sent
4. Monitor SendGrid dashboard for delivery stats

## 📊 Monitoring

- **SendGrid Dashboard**: Monitor email delivery, opens, clicks
- **Vercel Analytics**: Track website performance
- **Console Logs**: Check deployment logs for any issues

## 🔄 Updates

To update your deployment:
\`\`\`bash
git add .
git commit -m "Update description"
git push origin main
\`\`\`

Vercel will automatically redeploy.
