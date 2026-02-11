# NOVA EVENTS - Database Reference

## Quick Reference

### Connection
```typescript
import { supabase } from './src/lib/supabase';
```

### Common Queries

#### Get User Events
```typescript
const { data, error } = await supabase
  .from('events')
  .select('*')
  .eq('organizer_id', userId)
  .order('event_date', { ascending: false });
```

#### Get Event with Relations
```typescript
const { data, error } = await supabase
  .from('events')
  .select(`
    *,
    locations:event_locations(*),
    contribution_options(*),
    custom_templates(*)
  `)
  .eq('id', eventId)
  .single();
```

#### Get Event Guests
```typescript
const { data, error } = await supabase
  .from('guests')
  .select('*')
  .eq('event_id', eventId)
  .order('created_at', { ascending: false });
```

#### Bulk Create Guests
```typescript
const { data, error } = await supabase
  .from('guests')
  .insert([
    { event_id: eventId, name: 'Guest 1', phone: '0712345678', pledge_amount: 20000 },
    { event_id: eventId, name: 'Guest 2', phone: '0723456789', pledge_amount: 50000 }
  ])
  .select();
```

#### Update Payment Status
```typescript
const { data, error } = await supabase
  .from('guests')
  .update({
    payment_status: 'paid',
    paid_at: new Date().toISOString()
  })
  .eq('id', guestId)
  .select()
  .single();
```

## Schema Details

### profiles
Linked to `auth.users` via foreign key.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key, references auth.users(id) |
| full_name | text | User's display name |
| email | text | User's email (unique) |
| phone | text | Optional phone number |
| bio | text | User bio/description |
| avatar_url | text | Profile picture URL |
| default_mobile_number | text | Default M-Pesa number |
| default_mobile_name | text | Default M-Pesa name |
| default_bank_account | text | Default bank account number |
| default_bank_name | text | Default bank name (CRDB, NMB, etc.) |
| default_bank_holder | text | Default bank account holder name |
| default_lipa_number | text | Default Lipa Number |
| default_lipa_name | text | Default Lipa business name |
| is_verified | boolean | Email verification status |
| created_at | timestamptz | Auto-generated |
| updated_at | timestamptz | Auto-updated on changes |

**RLS Policies:**
- Users can view their own profile
- Users can update their own profile

### events
Core event management table.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auto-generated) |
| organizer_id | uuid | Foreign key to profiles(id) |
| name | text | Event name |
| type | text | Event type (Wedding, Concert, etc.) |
| description | text | Optional event description |
| event_date | date | Event date |
| status | text | draft, live, completed, cancelled |
| visibility | text | private, public, hybrid |
| card_background_url | text | URL to card background image |
| card_name_position | jsonb | {x, y, w, h} in percentages |
| card_qr_position | jsonb | {x, y, w, h} in percentages |
| payment_mobile | jsonb | {number, name} |
| payment_bank | jsonb | {accountNo, bankName, name} |
| payment_lipa | jsonb | {number, name} |
| total_guests | integer | Auto-calculated |
| total_pledged | numeric | Auto-calculated (TZS) |
| total_paid | numeric | Auto-calculated (TZS) |
| created_at | timestamptz | Auto-generated |
| updated_at | timestamptz | Auto-updated |

**RLS Policies:**
- Organizers can CRUD their own events

### guests
Guest list with payment tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| event_id | uuid | Foreign key to events(id) |
| name | text | Guest name |
| phone | text | Guest phone number |
| email | text | Optional email |
| category | text | Regular, VIP, Premium, Family |
| rsvp_status | text | pending, confirmed, declined |
| checked_in | boolean | Check-in status |
| checked_in_at | timestamptz | Check-in timestamp |
| contribution_option_id | uuid | Foreign key to contribution_options(id) |
| pledge_amount | numeric | Contribution amount (TZS) |
| payment_status | text | not_started, pledged, payment_pending, paid |
| payment_method | text | auto, manual |
| transaction_id | text | M-Pesa transaction ID |
| payment_screenshot_url | text | Proof of payment image URL |
| paid_at | timestamptz | Payment timestamp |
| invite_sent | boolean | Invitation sent status |
| invite_sent_at | timestamptz | Invitation sent timestamp |
| reminder_sent_at | timestamptz | Reminder sent timestamp |
| thank_you_sent_at | timestamptz | Thank you sent timestamp |
| secure_token | uuid | Unique token for contribution page (auto-generated) |
| notes | text | Additional notes |
| created_at | timestamptz | Auto-generated |
| updated_at | timestamptz | Auto-updated |

**RLS Policies:**
- Organizers can manage guests for their events
- Guests can view/update their own data via secure_token

### contribution_options
Contribution tiers per event.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| event_id | uuid | Foreign key to events(id) |
| name | text | Option name (Standard, VIP, etc.) |
| amount | numeric | Amount in TZS |
| description | text | Optional description |
| display_order | integer | Sort order |
| created_at | timestamptz | Auto-generated |

**Default Options:**
- Standard: 20,000 TZS
- VIP: 50,000 TZS

**RLS Policies:**
- Managed by event organizers

### event_locations
Multiple venues per event.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| event_id | uuid | Foreign key to events(id) |
| label | text | Location label (Church, Reception, etc.) |
| google_maps_url | text | Full Google Maps URL |
| display_order | integer | Sort order |
| created_at | timestamptz | Auto-generated |

**RLS Policies:**
- Managed by event organizers
- Readable by anyone with guest token

### custom_templates
Message templates per event.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| event_id | uuid | Foreign key to events(id) |
| template_type | text | invitation, reminder, thank_you |
| subject | text | Message subject |
| body | text | Message body (supports placeholders) |
| created_at | timestamptz | Auto-generated |
| updated_at | timestamptz | Auto-updated |

**Placeholders:**
- `{guest_name}` - Guest's name
- `{event_name}` - Event name

**RLS Policies:**
- Managed by event organizers

## Functions

### update_event_stats(event_uuid uuid)
Recalculates event statistics.

```sql
SELECT update_event_stats('event-uuid-here');
```

Calculates:
- total_guests: COUNT of guests
- total_pledged: SUM of pledge_amount for pledged/paid
- total_paid: SUM of pledge_amount for paid only

**Trigger:** Automatically called when guests are inserted/updated/deleted.

## Triggers

### Auto-Create Profile
When a user signs up via Supabase Auth, a profile is automatically created.

```sql
-- Triggered on: INSERT on auth.users
-- Creates: profiles entry with user id, name, and email
```

### Auto-Update Timestamps
All tables with `updated_at` column automatically update the timestamp on changes.

```sql
-- Triggered on: UPDATE on profiles, events, guests, custom_templates
```

### Auto-Update Event Stats
When guests are added, updated, or removed, event stats are recalculated.

```sql
-- Triggered on: INSERT, UPDATE, DELETE on guests
-- Updates: events.total_guests, total_pledged, total_paid
```

## Indexes

Performance indexes on frequently queried columns:

- `events(organizer_id)` - Fast user event lookups
- `events(status)` - Filter by event status
- `events(event_date)` - Sort by date
- `guests(event_id)` - Fast guest list retrieval
- `guests(payment_status)` - Filter by payment status
- `guests(rsvp_status)` - Filter by RSVP status
- `guests(secure_token)` - Fast token lookup
- `guests(phone)` - Search by phone
- `contribution_options(event_id)` - Contribution tier lookup
- `event_locations(event_id)` - Location list retrieval
- `custom_templates(event_id)` - Template lookup

## Common Patterns

### Create Event with Relations
```typescript
// 1. Create event
const { data: event } = await supabase
  .from('events')
  .insert({ organizer_id: userId, name: 'My Event', ... })
  .select()
  .single();

// 2. Create locations
await supabase
  .from('event_locations')
  .insert([
    { event_id: event.id, label: 'Church', google_maps_url: '...' },
    { event_id: event.id, label: 'Reception', google_maps_url: '...' }
  ]);

// 3. Create contribution options
await supabase
  .from('contribution_options')
  .insert([
    { event_id: event.id, name: 'Standard', amount: 20000 },
    { event_id: event.id, name: 'VIP', amount: 50000 }
  ]);
```

### Guest Contribution Flow
```typescript
// 1. Guest accesses page via secure token
const { data: guest } = await supabase
  .from('guests')
  .select('*, event:events(*)')
  .eq('secure_token', token)
  .maybeSingle();

// 2. Guest confirms payment
await supabase
  .from('guests')
  .update({
    payment_status: 'pledged',  // or 'paid'
    payment_method: 'auto'
  })
  .eq('secure_token', token);

// 3. Event stats auto-update via trigger
```

### Search Guests
```typescript
const { data } = await supabase
  .from('guests')
  .select('*')
  .eq('event_id', eventId)
  .or(`name.ilike.%${query}%,phone.ilike.%${query}%`);
```

### Filter by Payment Status
```typescript
const { data } = await supabase
  .from('guests')
  .select('*')
  .eq('event_id', eventId)
  .eq('payment_status', 'paid');
```

## Security Notes

1. **Never expose service_role key** - Use anon key in frontend
2. **RLS is mandatory** - All tables have RLS enabled
3. **Secure tokens are unique** - Each guest gets a unique UUID
4. **Auth is required** - Most operations require authenticated user
5. **Organizer ownership** - RLS ensures users only access their own data

## Backup and Recovery

### Automatic Backups
Supabase performs daily backups (check your plan for retention period).

### Manual Backup
```bash
# Using Supabase CLI
supabase db dump > backup.sql
```

### Point-in-Time Recovery
Available on Supabase Pro and above. Check Settings > Backups in dashboard.

## Performance Tips

1. **Use select() judiciously** - Only fetch columns you need
2. **Use single() vs first()** - Use `maybeSingle()` for 0-1 results
3. **Batch operations** - Use bulk insert for multiple guests
4. **Use indexes** - Already configured for common queries
5. **Avoid N+1 queries** - Use joins/select with relations
6. **Monitor slow queries** - Check Supabase dashboard

## Migration History

### Migration 1: create_nova_events_schema
- Created all 6 tables
- Added RLS policies
- Added triggers for auto-updates
- Added indexes for performance
- Added utility functions

**Status**: ✅ Applied successfully
