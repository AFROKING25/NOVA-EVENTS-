# NOVA EVENTS - Getting Started (5 Minutes)

## Prerequisites
- Node.js installed
- Supabase account (free tier works)
- 5 minutes of your time

## Step 1: Get Supabase Credentials (2 minutes)

1. Go to https://app.supabase.com/
2. Click "New Project"
3. Fill in:
   - Name: `nova-events`
   - Database Password: (generate a strong one)
   - Region: Select closest to you
4. Click "Create Project" and wait ~2 minutes
5. Once ready, go to Settings > API
6. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

## Step 2: Configure Environment (30 seconds)

1. In your project root, create a file named `.env`:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-actual-key
```

Replace with your actual values from Step 1.

## Step 3: Install and Run (2 minutes)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 4: Test Authentication (1 minute)

1. Click "Register" on the homepage
2. Enter:
   - Full Name: Your Name
   - Email: your@email.com
   - Password: (minimum 6 characters)
3. Click "Reserve Identity"
4. You're in! You should see the Dashboard

## Step 5: Create Your First Event

1. Click "Create" in the bottom navigation
2. Fill in:
   - Event Name: e.g., "Test Wedding"
   - Choose Type: Select "Wedding"
   - Event Date: Pick any future date
3. Scroll down to "Manual Entry"
4. Add a guest:
   - Guest Name: "John Doe"
   - Phone: "0712345678"
5. Click "Save & Design Card"
6. Success! Your event is created.

## What Just Happened?

Behind the scenes:
1. Your user account was created in Supabase Auth
2. A profile was automatically created in the `profiles` table
3. An event was created in the `events` table
4. A guest was created in the `guests` table with a unique secure token
5. All data is protected by Row Level Security (RLS)

## Verify in Supabase

1. Go to your Supabase project dashboard
2. Click "Table Editor" in the sidebar
3. Click on "profiles" - you'll see your profile
4. Click on "events" - you'll see your test event
5. Click on "guests" - you'll see John Doe

## Next Steps

### Learn the Features
- **Dashboard**: View all guests across events
- **Create**: Add new events and bulk import guests via CSV
- **Design Card**: Customize invitation card layout (not yet migrated)
- **Profile**: Manage your account and payment defaults

### Import Bulk Guests

1. Create a CSV file with this format:
   ```
   Name,Phone,Amount
   John Doe,0712345678,20000
   Jane Smith,0723456789,50000
   ```

2. In Create Event page, click "CSV Spreadsheet"
3. Upload your CSV
4. Map columns (Name → Name, Phone → Phone)
5. Click "Import Guests Now"

### Deploy to Production

When ready to deploy:
1. Push your code to GitHub
2. Go to https://vercel.com/dashboard
3. Import your repository
4. Add environment variables
5. Deploy!

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Troubleshooting

### "Missing Supabase environment variables"
- Check that your `.env` file exists in the project root
- Verify variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after creating/editing `.env`

### "Invalid login credentials"
- Ensure you're using the correct email/password
- Check Supabase Dashboard > Authentication > Users to verify your account exists

### "Failed to fetch"
- Verify your Supabase project is active (not paused)
- Check your internet connection
- Verify the SUPABASE_URL and ANON_KEY are correct

### Database tables not created
- The migration should run automatically
- If not, check Supabase Dashboard > Database > Migrations
- Tables should be: profiles, events, guests, contribution_options, event_locations, custom_templates

## Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Dashboard shows empty state
- [ ] Can create an event
- [ ] Can add a guest manually
- [ ] Guest appears in dashboard
- [ ] Logout works
- [ ] Login again shows your data

## Need Help?

- Check [SETUP.md](SETUP.md) for detailed configuration
- Check [DATABASE_REFERENCE.md](DATABASE_REFERENCE.md) for database queries
- Check [PROJECT_STATUS.md](PROJECT_STATUS.md) for what's completed
- Review browser console for error messages
- Review Supabase logs in Dashboard > Logs

## Default Credentials (Development Only)

For testing, you can create multiple accounts:
- User 1: test1@novaevents.com / password123
- User 2: test2@novaevents.com / password123
- User 3: test3@novaevents.com / password123

Each user will have their own isolated data due to RLS policies.

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Deployment
vercel                  # Deploy to Vercel
vercel --prod           # Deploy to production

# Database
# Use Supabase Dashboard for database operations
```

## Architecture Overview

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   React     │ ← Auth Context
│   App       │ ← Service Layer (Auth, Event, Guest, Profile)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Supabase   │
│   Client    │ ← RLS Policies
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │ ← Tables, Triggers, Functions
│  Database   │ ← Auto-backups, Point-in-time recovery
└─────────────┘
```

## Key Files

- `App.tsx` - Main app with AuthProvider
- `src/lib/supabase.ts` - Supabase client
- `src/lib/services/*.ts` - Business logic
- `src/contexts/AuthContext.tsx` - Auth state management
- `pages/*.tsx` - Page components
- `.env` - Environment variables (not committed)
- `vercel.json` - Deployment configuration

## What's Different from Before?

Before: Data stored in `localStorage` (lost on browser clear, not secure)
Now: Data stored in Supabase PostgreSQL (persistent, secure, backed up)

Before: No real authentication
Now: Full authentication with Supabase Auth

Before: No user separation
Now: Each user only sees their own data (RLS)

Before: No data persistence
Now: Data persists across devices and browsers

## Production Checklist

Before launching:
- [ ] Change default passwords
- [ ] Enable email confirmations in Supabase
- [ ] Add custom domain
- [ ] Configure email templates in Supabase
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Test on mobile devices
- [ ] Review RLS policies
- [ ] Set up database backups (auto-configured)
- [ ] Add terms of service and privacy policy
- [ ] Configure rate limiting in Supabase

## Success!

You now have a production-grade event management platform with:
- Secure authentication
- Persistent database
- Row-level security
- Auto-calculated stats
- Bulk guest import
- Payment tracking
- Ready for Vercel deployment

Enjoy building with NOVA EVENTS!
