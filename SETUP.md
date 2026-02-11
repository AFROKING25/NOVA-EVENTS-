# NOVA EVENTS - Setup Guide

## Overview
NOVA EVENTS is a premium event management platform built with React, TypeScript, Tailwind CSS, and Supabase (PostgreSQL). This guide will help you set up the application locally and deploy it to Vercel.

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

To get your Supabase credentials:
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or select an existing one
3. Go to Settings > API
4. Copy the `Project URL` and `anon/public` key

### 3. Database Setup

The database schema has already been created via migrations. To verify:

1. Go to your Supabase project dashboard
2. Navigate to the Table Editor
3. You should see the following tables:
   - profiles
   - events
   - guests
   - contribution_options
   - event_locations
   - custom_templates

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Option 2: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your Git repository
4. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY` (optional)
5. Click "Deploy"

## Authentication Setup

### Email/Password Authentication
Email/password authentication is enabled by default in Supabase.

### Google OAuth (Optional)

To enable Google sign-in:

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

## Database Schema

### Tables

#### profiles
Stores user profile information, linked to Supabase Auth users.
- Auto-created when a user signs up
- Stores payment defaults for quick event setup

#### events
Core event management table.
- Links to organizer via `organizer_id`
- Stores card design, payment details, and stats

#### guests
Guest list for each event.
- Links to `events` table
- Tracks RSVP, payment status, and contributions
- Has a unique `secure_token` for guest-specific contribution pages

#### contribution_options
Predefined contribution tiers per event (Standard, VIP, Premium).

#### event_locations
Multiple venue locations per event with Google Maps integration.

#### custom_templates
Message templates for invitations, reminders, and thank-you notes.

### Security (RLS)

Row Level Security is enabled on all tables:

- **Profiles**: Users can only view/edit their own profile
- **Events**: Organizers can only manage their own events
- **Guests**: Organizers can manage their event guests; guests can view/update their own data via secure token
- **Contribution Options, Event Locations, Custom Templates**: Managed by event organizers

## Features

### Implemented
- User authentication (email/password, Google OAuth)
- Event creation and management
- Bulk guest import via CSV
- Card design customization
- Payment method setup (Mobile Money, Bank, Lipa Number)
- Real-time guest stats and tracking
- Secure guest contribution pages
- Profile management with payment vault

### API Endpoints (via Supabase)
All database operations are handled through Supabase's auto-generated REST API with RLS policies.

## Troubleshooting

### Build Errors
```bash
npm run build
```
If you encounter TypeScript errors, check that all imports are correct and types are properly defined.

### Database Connection Issues
1. Verify environment variables are correctly set
2. Check Supabase project status in dashboard
3. Ensure your IP is allowed (if IP restrictions are enabled)

### Authentication Issues
1. Check that email confirmation is disabled in Supabase Auth settings (for development)
2. Verify OAuth redirect URIs match your deployment URL
3. Check browser console for detailed error messages

## Architecture

### Service Layer
Business logic is organized in service classes:
- `AuthService` - Authentication operations
- `ProfileService` - User profile management
- `EventService` - Event CRUD operations
- `GuestService` - Guest management and bulk operations

### Context Providers
- `AuthContext` - Global authentication state

### Database Operations
All database operations use the official `@supabase/supabase-js` client library with TypeScript types generated from the database schema.

## Performance Optimization

- Database queries use indexes on frequently queried columns
- RLS policies are optimized for common access patterns
- Real-time subscriptions are used sparingly to reduce bandwidth
- Proper pagination should be implemented for large guest lists

## Security Best Practices

1. Never commit `.env` files
2. Use environment variables for all sensitive data
3. Always use RLS policies - never disable them
4. Validate all user input on both client and server
5. Use secure tokens for guest-specific pages
6. Implement rate limiting for bulk operations (via Supabase settings)

## Support

For issues or questions:
1. Check the Supabase documentation: https://supabase.com/docs
2. Review the codebase comments and type definitions
3. Check the database migration file for schema details

## License

Proprietary - NOVA EVENTS by AFROKING™
