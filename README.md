# 🌟 Oriyali - Your Biorhythm Story

A revolutionary AI-powered platform for women's wellness that decodes unique neuro-hormonal patterns with personalized, proactive insights to harmonize mood, energy, and focus every day.

## 🚀 Features

- **Interactive Hormone Chart**: Visualize and understand your unique hormonal patterns
- **Life Stages Timeline**: Comprehensive support from puberty through menopause
- **Fractal Animation**: Beautiful, performance-optimized 3D visualization
- **Waitlist Integration**: Full email automation with SendGrid/Resend
- **Responsive Design**: Mobile-first, accessible design
- **Dark/Light Mode**: Seamless theme switching
- **Production Ready**: Optimized for deployment

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **3D Graphics**: Three.js
- **Charts**: Recharts
- **Database**: Supabase
- **Email**: SendGrid / Resend
- **Deployment**: Vercel / Netlify

## 📦 Installation

\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd oriyali-website

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
\`\`\`

## 🔧 Environment Variables

\`\`\`env
# Email Configuration
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=people@oriyali.com
FROM_NAME=Oriyali

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

## 🗄️ Database Setup

1. Create a Supabase project
2. Run the SQL script from `scripts/create-waitlist-table-fixed.sql`
3. Configure RLS policies for security
4. Update environment variables

## 📧 Email Setup

### SendGrid (Recommended)
1. Create SendGrid account
2. Verify sender identity (people@oriyali.com)
3. Generate API key
4. Add to environment variables

### Resend (Alternative)
1. Create Resend account
2. Verify domain or use resend.dev for testing
3. Generate API key
4. Set EMAIL_PROVIDER=resend

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Netlify
1. Connect repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables

## 📊 Features Overview

### Waitlist System
- ✅ Form validation
- ✅ Duplicate email prevention
- ✅ Database storage (Supabase)
- ✅ Welcome email automation
- ✅ Analytics tracking

### Interactive Components
- ✅ Hormone cycle visualization
- ✅ Life stages timeline
- ✅ Fractal animation with performance optimization
- ✅ Responsive design
- ✅ Accessibility features

### Production Features
- ✅ SEO optimization
- ✅ Performance optimization
- ✅ Error handling
- ✅ Security headers
- ✅ PWA manifest

## 🎯 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized
- **Mobile Performance**: 90+
- **Accessibility**: WCAG 2.1 AA compliant

## 🔒 Security

- ✅ Row Level Security (RLS) on database
- ✅ Input validation and sanitization
- ✅ CSRF protection
- ✅ Environment variable security
- ✅ HTTPS enforcement

## 📈 Analytics

Track key metrics:
- Waitlist signups
- Email delivery rates
- User engagement
- Conversion rates

## 🆘 Support

For issues or questions:
- Email: people@oriyali.com
- Documentation: Check README and code comments
- Deployment: Follow deployment guides

## 📄 License

© 2025 Oriyali by Terramedici Lifesciences LLP. All Rights Reserved.

---

**🌟 Ready to revolutionize women's wellness with Oriyali!**
