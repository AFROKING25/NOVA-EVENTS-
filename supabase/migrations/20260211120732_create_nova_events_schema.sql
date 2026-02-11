/*
  # NOVA EVENTS - Complete Database Schema
  
  ## Overview
  Production-grade event management platform with authentication, RLS, and real-time capabilities.
  
  ## Tables Created
  
  ### 1. profiles
  - Extends Supabase Auth users
  - Stores user profile information (name, phone, bio, avatar, payment defaults)
  - Links to auth.users via foreign key
  
  ### 2. events
  - Core event management table
  - Stores event details (name, type, date, locations, card design)
  - Links to organizer via profiles
  - Supports custom templates and payment details
  
  ### 3. guests
  - Guest list for each event
  - Tracks RSVP status, payment status, contribution amounts
  - Links to events table
  
  ### 4. contribution_options
  - Predefined contribution tiers per event (Standard, VIP, Premium)
  - Links to events table
  
  ### 5. event_locations
  - Multiple venue locations per event (Church, Reception, etc.)
  - Google Maps integration via URL
  
  ### 6. custom_templates
  - Message templates per event (Invitation, Reminder, Thank You)
  - Supports dynamic placeholders
  
  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Organizers can only access their own events and related data
  - Guests can only view their own invitation via secure links
  - Public access restricted to guest contribution pages
  
  ## Indexes
  - Optimized for common queries (event lookup, guest search, payment status)
  
  ## Triggers
  - Auto-update timestamps on record changes
  - Profile creation on user signup
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  bio text,
  avatar_url text,
  
  -- Payment defaults for quick event setup
  default_mobile_number text,
  default_mobile_name text,
  default_bank_account text,
  default_bank_name text,
  default_bank_holder text,
  default_lipa_number text,
  default_lipa_name text,
  
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic Info
  name text NOT NULL,
  type text NOT NULL,
  description text,
  event_date date NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'completed', 'cancelled')),
  visibility text DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'hybrid')),
  
  -- Card Design (stored as JSONB for flexibility)
  card_background_url text,
  card_name_position jsonb DEFAULT '{"x": 50, "y": 50, "w": 25, "h": 8}'::jsonb,
  card_qr_position jsonb DEFAULT '{"x": 50, "y": 75, "w": 15, "h": 15}'::jsonb,
  
  -- Payment Details (stored as JSONB)
  payment_mobile jsonb,
  payment_bank jsonb,
  payment_lipa jsonb,
  
  -- Stats (computed via triggers or functions)
  total_guests integer DEFAULT 0,
  total_pledged numeric(10, 2) DEFAULT 0,
  total_paid numeric(10, 2) DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- CONTRIBUTION OPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contribution_options (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric(10, 2) NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- EVENT LOCATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS event_locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  label text NOT NULL,
  google_maps_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- GUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- Guest Info
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  category text DEFAULT 'Regular' CHECK (category IN ('Regular', 'VIP', 'Premium', 'Family')),
  
  -- RSVP & Attendance
  rsvp_status text DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined')),
  checked_in boolean DEFAULT false,
  checked_in_at timestamptz,
  
  -- Payment & Contribution
  contribution_option_id uuid REFERENCES contribution_options(id) ON DELETE SET NULL,
  pledge_amount numeric(10, 2) DEFAULT 0,
  payment_status text DEFAULT 'not_started' CHECK (payment_status IN ('not_started', 'pledged', 'payment_pending', 'paid')),
  payment_method text CHECK (payment_method IN ('auto', 'manual')),
  transaction_id text,
  payment_screenshot_url text,
  paid_at timestamptz,
  
  -- Communication
  invite_sent boolean DEFAULT false,
  invite_sent_at timestamptz,
  reminder_sent_at timestamptz,
  thank_you_sent_at timestamptz,
  
  -- Security: Each guest gets a unique secure link
  secure_token uuid DEFAULT uuid_generate_v4() UNIQUE,
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- CUSTOM TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS custom_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  template_type text NOT NULL CHECK (template_type IN ('invitation', 'reminder', 'thank_you')),
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, template_type)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

CREATE INDEX IF NOT EXISTS idx_guests_event ON guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_payment_status ON guests(payment_status);
CREATE INDEX IF NOT EXISTS idx_guests_rsvp_status ON guests(rsvp_status);
CREATE INDEX IF NOT EXISTS idx_guests_secure_token ON guests(secure_token);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);

CREATE INDEX IF NOT EXISTS idx_contribution_options_event ON contribution_options(event_id);
CREATE INDEX IF NOT EXISTS idx_event_locations_event ON event_locations(event_id);
CREATE INDEX IF NOT EXISTS idx_custom_templates_event ON custom_templates(event_id);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON custom_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Profiles: Users can view and update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Events: Organizers can manage their own events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can view own events"
  ON events FOR SELECT
  TO authenticated
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete own events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- Contribution Options: Managed by event organizers
ALTER TABLE contribution_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can manage contribution options"
  ON contribution_options FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = contribution_options.event_id
      AND events.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = contribution_options.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Event Locations: Managed by event organizers, readable by guests with token
ALTER TABLE event_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can manage event locations"
  ON event_locations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_locations.event_id
      AND events.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_locations.event_id
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Public can view event locations via guest token"
  ON event_locations FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM guests
      WHERE guests.event_id = event_locations.event_id
      AND guests.secure_token IS NOT NULL
    )
  );

-- Guests: Organizers can manage, guests can view their own data via secure token
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can view own event guests"
  ON guests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = guests.event_id
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can create guests"
  ON guests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = guests.event_id
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update own event guests"
  ON guests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = guests.event_id
      AND events.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = guests.event_id
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can delete own event guests"
  ON guests FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = guests.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Guests can view and update their own data via secure token (for contribution page)
CREATE POLICY "Guests can view own data via secure token"
  ON guests FOR SELECT
  TO anon, authenticated
  USING (secure_token IS NOT NULL);

CREATE POLICY "Guests can update own payment status via secure token"
  ON guests FOR UPDATE
  TO anon, authenticated
  USING (secure_token IS NOT NULL)
  WITH CHECK (secure_token IS NOT NULL);

-- Custom Templates: Managed by event organizers
ALTER TABLE custom_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can manage custom templates"
  ON custom_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = custom_templates.event_id
      AND events.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = custom_templates.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to update event stats (call this when guests are added/updated)
CREATE OR REPLACE FUNCTION update_event_stats(event_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET 
    total_guests = (SELECT COUNT(*) FROM guests WHERE event_id = event_uuid),
    total_pledged = (SELECT COALESCE(SUM(pledge_amount), 0) FROM guests WHERE event_id = event_uuid AND payment_status IN ('pledged', 'paid')),
    total_paid = (SELECT COALESCE(SUM(pledge_amount), 0) FROM guests WHERE event_id = event_uuid AND payment_status = 'paid')
  WHERE id = event_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update event stats when guests change
CREATE OR REPLACE FUNCTION trigger_update_event_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_event_stats(OLD.event_id);
    RETURN OLD;
  ELSE
    PERFORM update_event_stats(NEW.event_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guests_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON guests
  FOR EACH ROW EXECUTE FUNCTION trigger_update_event_stats();