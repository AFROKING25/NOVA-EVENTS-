# NOVA EVENTS - Deployment Guide

## Quick Start - Vercel Deployment

### 1. Prepare Supabase

Before deploying, ensure your Supabase project is properly configured:

1. **Create a Supabase Project**
   - Go to https://app.supabase.com/
   - Click "New Project"
   - Choose an organization
   - Set project name: "nova-events" (or your preferred name)
   - Generate a strong database password
   - Select region closest to your target users (e.g., Africa for Tanzania)
   - Wait for project initialization (2-3 minutes)

2. **Database Migration Status**
   - The database schema has already been applied via migrations
   - Tables created: profiles, events, guests, contribution_options, event_locations, custom_templates
   - RLS policies: Fully configured and active
   - Triggers: Auto-update timestamps and profile creation on user signup

3. **Get Your Credentials**
   - Navigate to: Settings > API
   - Copy `Project URL` (looks like: https://xxxxx.supabase.co)
   - Copy `anon public` key (long string starting with "eyJ...")

4. **Configure Authentication (IMPORTANT)**
   - Go to: Authentication > Providers
   - **Email Provider**: Enabled by default
   - **Email Confirmations**: For production, keep enabled. For testing, you can disable via:
     - Authentication > Settings
     - Uncheck "Enable email confirmations"

5. **Optional: Enable Google OAuth**
   - Authentication > Providers > Google
   - Create OAuth credentials at: https://console.cloud.google.com/
   - Add authorized redirect URI: `https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback`
   - Enter Client ID and Client Secret in Supabase

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push Code to Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - NOVA Events"
   git branch -M main
   git remote add origin https://github.com/yourusername/nova-events.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." > "Project"
   - Import your Git repository
   - Framework Preset: Vite
   - Root Directory: `./`

3. **Configure Environment Variables**
   In the deployment configuration, add:

   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key
   VITE_GEMINI_API_KEY=your_gemini_key (optional)
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at: `https://your-app-name.vercel.app`

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

   Follow prompts:
   - Link to existing project? No
   - Project name: nova-events
   - Directory: `./`

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   # Paste your Supabase URL

   vercel env add VITE_SUPABASE_ANON_KEY
   # Paste your anon key
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### 3. Post-Deployment Configuration

#### Update Supabase Redirect URLs

1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add your Vercel URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**:
     ```
     https://your-app.vercel.app
     https://your-app.vercel.app/**
     ```

#### Test Authentication

1. Visit your deployed app
2. Click "Register" and create a test account
3. Check Supabase Dashboard > Authentication > Users
4. Verify user was created and profile exists in profiles table

### 4. Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Settings > Domains
3. Add your custom domain (e.g., novaevents.co.tz)
4. Follow DNS configuration instructions
5. Update Supabase redirect URLs with your custom domain

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI...` |
| `VITE_GEMINI_API_KEY` | No | Google Gemini API for location search | `AIzaSyC...` |

## Monitoring and Analytics

### Supabase Dashboard
- Real-time database activity: Database > Overview
- Auth metrics: Authentication > Users
- API logs: API > Logs
- Database performance: Database > Query Performance

### Vercel Analytics
- Visit your project dashboard
- Enable Vercel Analytics (free tier available)
- Monitor page views, performance, and errors

## Security Checklist

Before going live, verify:

- [ ] RLS is enabled on ALL tables (check Table Editor)
- [ ] Test that users can only see their own events
- [ ] Test guest contribution page with secure token
- [ ] Environment variables are NOT committed to Git
- [ ] Email confirmations are enabled (production)
- [ ] Strong password policy is enforced (Supabase Auth settings)
- [ ] Database backups are configured (Supabase > Settings > Backups)
- [ ] API rate limiting is reviewed (Supabase > Settings > API)

## Troubleshooting

### Build Fails on Vercel
**Error**: "Module not found" or TypeScript errors
**Solution**:
```bash
# Test locally first
npm run build

# Check all imports are correct
# Ensure @supabase/supabase-js is in dependencies
npm install @supabase/supabase-js
```

### Authentication Not Working
**Error**: "Invalid login credentials"
**Solution**:
1. Check environment variables are set correctly in Vercel
2. Verify Supabase project is active (not paused)
3. Check redirect URLs match your deployment URL
4. Test with a fresh incognito window

### Database Connection Errors
**Error**: "Failed to fetch" or "Network error"
**Solution**:
1. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
2. Check Supabase project status
3. Ensure RLS policies allow necessary operations
4. Check browser console for detailed errors

### Users Can't See Their Data
**Error**: Empty dashboard after login
**Solution**:
1. Check RLS policies in Supabase Table Editor
2. Verify profile was created (profiles table)
3. Check that organizer_id matches user ID in events table
4. Test queries directly in Supabase SQL Editor

## Performance Optimization

### Enable Vercel Edge Caching
Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Database Indexing
All necessary indexes have been created in the migration. Monitor slow queries in Supabase Dashboard and add indexes as needed.

### Image Optimization
For card backgrounds, consider:
1. Using Supabase Storage for image hosting
2. Implementing image compression before upload
3. Using CDN (Vercel automatically provides this)

## Scaling Considerations

### Database
- Supabase Free Tier: 500MB database, 2GB bandwidth
- Pro Tier ($25/month): 8GB database, 50GB bandwidth
- Monitor usage in Supabase Dashboard

### Vercel
- Hobby (Free): 100GB bandwidth
- Pro ($20/month): 1TB bandwidth
- Monitor in Vercel Dashboard

### When to Upgrade
- Database size > 400MB
- Monthly bandwidth > 80% of limit
- Need advanced features (point-in-time recovery, etc.)

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Review browser console errors
4. Check this documentation

For Supabase-specific issues:
- Documentation: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions

For Vercel-specific issues:
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support
