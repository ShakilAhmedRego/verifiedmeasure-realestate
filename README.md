# VerifiedMeasure - Real Estate Intelligence Platform

A Next.js 14 application for managing real estate property intelligence with secure entitlement-based access control.

## Features

- 🏠 **Real Estate Intelligence**: Property data with intelligence scoring
- 🔐 **Secure Entitlement Model**: Preview all properties, unlock with credits
- 💳 **Credit System**: Pay-per-unlock model with ledger tracking
- 📊 **Analytics Dashboard**: KPI cards and stage breakdowns
- 🎨 **Bright Modern UI**: Clean, professional interface
- 🔒 **Row-Level Security**: Supabase RLS policies
- 🚀 **Production Ready**: Vercel-deployable on first try

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Authentication**: Supabase Auth

## Quick Start

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy and paste the entire contents of `supabase/DATABASE_SETUP.sql`
4. Click "Run" to execute the schema

### 2. Configure Authentication

1. Go to Authentication → Providers → Email
2. Enable Email provider
3. Configure email settings:
   - **Enable email confirmations**: Optional (recommended for production)
   - **Enable signups**: Yes
4. Save changes

### 3. Get API Credentials

1. Go to Settings → API
2. Copy your **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
3. Copy your **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 4. Deploy to Vercel

1. Push this code to GitHub
2. Import to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
4. Deploy

## First Login

1. Visit your deployed app
2. Click "Sign Up"
3. Enter email and password
4. If email confirmation is enabled, check your email and confirm
5. Sign in with your credentials

## Admin Setup

### Promote User to Admin

Run this in Supabase SQL Editor (replace with your user ID):

```sql
-- Get your user ID first
SELECT id, email FROM auth.users;

-- Promote to admin
INSERT INTO public.user_profiles (id, role)
VALUES ('YOUR_USER_ID', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Grant Initial Credits

```sql
-- Grant 100 credits to a user
INSERT INTO public.credit_ledger (user_id, amount, reason, ref_type)
VALUES ('YOUR_USER_ID', 100, 'initial_grant', 'admin_grant');
```

Or use the RPC function:

```sql
SELECT public.admin_grant_credits('USER_ID', 100, 'initial_grant');
```

## Seeding Sample Data

Add sample real estate properties with images:

```sql
INSERT INTO public.leads (company, email, phone, stage, intelligence_score, meta)
VALUES
  (
    '123 Main Street Property',
    'owner@example.com',
    '+1-555-0101',
    'Qualified',
    85,
    '{
      "property_value": 850000,
      "owner_type": "Individual",
      "city": "San Francisco",
      "last_sale": "2022-03-15",
      "location": "Downtown",
      "signal": "High Interest",
      "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
    }'::jsonb
  ),
  (
    '456 Oak Avenue Estate',
    'contact@realty.com',
    '+1-555-0102',
    'New',
    72,
    '{
      "property_value": 1250000,
      "owner_type": "Corporation",
      "city": "Los Angeles",
      "last_sale": "2023-01-10",
      "location": "Beverly Hills",
      "signal": "Investment Property",
      "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
    }'::jsonb
  ),
  (
    '789 Pine Road Complex',
    'info@holdings.com',
    '+1-555-0103',
    'Engaged',
    91,
    '{
      "property_value": 2100000,
      "owner_type": "LLC",
      "city": "Seattle",
      "last_sale": "2021-11-20",
      "location": "Waterfront",
      "signal": "Expansion Opportunity",
      "image_url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
    }'::jsonb
  );

-- Refresh analytics after adding data
SELECT public.refresh_analytics();
```

**Note**: The `image_url` field is optional. Property cards will display images with a premium gradient overlay when available.

## Key Concepts

### Preview Model

- All authenticated users can SELECT all leads
- Contact info (email, phone, company) is masked unless entitled
- Users see intelligence scores and metadata for all properties

### Entitlement Model

- Users must unlock properties with credits
- Each unlock costs 1 credit
- Unlocking calls `unlock_leads_secure()` RPC function
- Unlocked properties show full contact information

### Credit System

- Credits are tracked in `credit_ledger` table
- Current balance = SUM of all ledger entries
- Negative entries (-1) for unlocks
- Positive entries (+N) for grants

### Security

- **No service-role key usage**
- **No client-side insertions** to `lead_access` or `credit_ledger`
- All mutations go through RPC functions
- Row-level security on all tables

## Environment Variables

Required variables (set in Vercel):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**: Never commit `.env` files to the repository.

## Feature Flags

Control UI features via the `feature_flags` table:

- `ENABLE_ANALYTICS_DASHBOARD`: Show KPI cards
- `ENABLE_DETAIL_PANEL`: Enable right-side drawer
- `ENABLE_SPARKLINES`: Enable chart visuals
- `ENABLE_COMMAND_PALETTE`: Enable Cmd+K palette

Toggle flags in SQL Editor:

```sql
UPDATE public.feature_flags 
SET enabled = true 
WHERE key = 'ENABLE_DETAIL_PANEL';
```

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Auth page (sign in/up)
│   ├── dashboard/page.tsx      # Main dashboard
│   └── admin/page.tsx          # Admin console
├── components/
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── TopNav.tsx              # Top navigation bar
│   ├── KpiCards.tsx            # Analytics KPI cards
│   ├── PropertyGrid.tsx        # Property list/grid
│   ├── PropertyCard.tsx        # Individual property card
│   ├── DetailDrawer.tsx        # Property detail panel
│   ├── CommandPalette.tsx      # Cmd+K command palette
│   ├── Toasts.tsx              # Toast notifications
│   ├── Skeletons.tsx           # Loading skeletons
│   └── DarkModeToggle.tsx      # Dark mode toggle
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── entitlement.ts          # Entitlement logic
│   ├── flags.ts                # Feature flags
│   └── format.ts               # Data formatting
├── types/
│   └── index.ts                # TypeScript types
├── public/
│   ├── house-outline.svg       # House icon
│   ├── house-modern.svg        # Modern house icon
│   └── skyline.svg             # Skyline illustration
└── supabase/
    └── DATABASE_SETUP.sql      # Complete database schema
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

### "Missing Supabase environment variables"

Make sure you've set both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.

### "Email not confirmed"

If you enabled email confirmations, users must click the link in their confirmation email before signing in.

### "Insufficient credits"

Grant credits to users via SQL:

```sql
INSERT INTO public.credit_ledger (user_id, amount, reason, ref_type)
VALUES ('USER_ID', 50, 'grant', 'admin_grant');
```

### No properties showing

Seed sample data using the SQL commands in the "Seeding Sample Data" section above.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
