# 🚀 Production Deployment Guide for oriyali.com

## Quick Deploy Steps

### 1. **Vercel Deployment (Recommended)**

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the main branch

2. **Environment Variables**:
   Add these in Vercel dashboard → Settings → Environment Variables:
   \`\`\`
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=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
   FROM_EMAIL=people@oriyali.com
   FROM_NAME=Oriyali
   \`\`\`

3. **Custom Domain Setup**:
   - Go to Vercel → Project → Settings → Domains
   - Add domain: \`oriyali.com\`
   - Add redirect: \`www.oriyali.com\` → \`oriyali.com\`
   - Vercel will provide DNS records

4. **DNS Configuration**:
   Update your domain registrar with these records:
   \`\`\`
   Type: A
   Name: @
   Value: 76.76.19.61

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   \`\`\`

### 2. **Alternative: Netlify Deployment**

1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com)
   - New site from Git → Choose repository

2. **Build Settings**:
   \`\`\`
   Build command: npm run build
   Publish directory: .next
   \`\`\`

3. **Environment Variables**:
   Add the same environment variables as above

4. **Custom Domain**:
   - Site settings → Domain management
   - Add custom domain: \`oriyali.com\`

## 🔧 Post-Deployment Setup

### 1. **SendGrid Configuration**
- Go to SendGrid Dashboard
- Settings → Sender Authentication
- Verify \`people@oriyali.com\`
- (Optional) Set up domain authentication for \`oriyali.com\`

### 2. **Google Search Console**
- Add property: \`https://oriyali.com\`
- Submit sitemap: \`https://oriyali.com/sitemap.xml\`
- Verify ownership

### 3. **Analytics Setup** (Optional)
- Google Analytics 4
- Add tracking ID to environment variables
- Monitor traffic and conversions

## 🧪 Testing Checklist

After deployment, test these features:

- [ ] Website loads at \`https://oriyali.com\`
- [ ] WWW redirect works: \`www.oriyali.com\` → \`oriyali.com\`
- [ ] SSL certificate is active (green lock)
- [ ] All sections scroll smoothly
- [ ] Hormone chart is interactive
- [ ] Life stages timeline works
- [ ] Fractal animation loads
- [ ] Waitlist form accepts submissions
- [ ] Welcome emails are sent
- [ ] Dark/light mode toggle works
- [ ] Mobile responsiveness
- [ ] Page load speed < 3 seconds

## 📊 Monitoring

### Performance
- **Core Web Vitals**: Monitor in Google Search Console
- **Page Speed**: Use Google PageSpeed Insights
- **Uptime**: Set up monitoring (UptimeRobot, Pingdom)

### Email Delivery
- **SendGrid Dashboard**: Monitor delivery rates
- **Bounce Rate**: Keep < 5%
- **Spam Rate**: Keep < 0.1%

### Analytics
- **Traffic Sources**: Organic, direct, referral
- **Conversion Rate**: Waitlist signups
- **User Behavior**: Time on site, bounce rate

## 🔄 Updates & Maintenance

### Code Updates
\`\`\`bash
git add .
git commit -m "Update description"
git push origin main
\`\`\`
Auto-deploys on push to main branch.

### Content Updates
- Update research links
- Add new features
- Optimize performance
- Security updates

## 🆘 Troubleshooting

### Common Issues
1. **Email not sending**: Check SendGrid API key and sender verification
2. **Domain not working**: Verify DNS records propagation (24-48 hours)
3. **SSL issues**: Usually resolves automatically within 24 hours
4. **Performance issues**: Check image optimization and code splitting

### Support Contacts
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **SendGrid Support**: [support.sendgrid.com](https://support.sendgrid.com)
- **Domain Registrar**: Contact your domain provider

---

## 🎉 Launch Checklist

- [ ] Code deployed successfully
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Email system tested
- [ ] All features working
- [ ] Mobile optimization verified
- [ ] SEO setup complete
- [ ] Analytics configured
- [ ] Monitoring in place

**🚀 Ready to launch oriyali.com!**
