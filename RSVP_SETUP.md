# RSVP System Setup Guide

This RSVP system uses Supabase (the same database as your waitlist) to store RSVP responses. When users open the envelope for the first time, they'll see an RSVP form.

## Setup Steps

### 1. Create the RSVP Table in Supabase

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-rsvp-schema.sql` into the SQL Editor
4. Run the SQL script

This will create:
- The `rsvp` table with all required columns
- Indexes for performance
- Row Level Security (RLS) policies
- An automatic `updated_at` trigger

### 2. Environment Variables (Optional)

If you want to use different Supabase credentials, add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cwrirmowykxajumjokjj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Note:** The code currently uses the same Supabase credentials as your waitlist by default, so this step is optional.

### 3. How It Works

1. **First Visit**: When a user visits the homepage and clicks the envelope:
   - The envelope opens with an animation
   - After the animation, the RSVP form appears
   - User fills out the form with:
     - Email (required)
     - First Name (required)
     - Last Name (required)
     - Attending: Yes/No
     - Number of guests (1 or 2)
     - If 2 guests: Guest's first and last name (required)

2. **Form Submission**:
   - Data is saved to Supabase `rsvp` table
   - If email already exists, the record is updated (allows users to change their RSVP)
   - Success message is shown
   - User is redirected to the wedding website

3. **Subsequent Visits**:
   - localStorage tracks if the user has already RSVP'd
   - If they have, the envelope opens and redirects directly to the wedding site
   - If they haven't, the form appears again

### 4. Database Schema

The `rsvp` table stores:
- `id` (UUID, primary key)
- `email` (TEXT, unique, required)
- `first_name` (TEXT, required)
- `last_name` (TEXT, required)
- `is_attending` (BOOLEAN, required)
- `number_of_guests` (INTEGER, required, default: 1)
- `plus_one_first_name` (TEXT, nullable)
- `plus_one_last_name` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 5. Viewing RSVPs

You can view RSVPs in Supabase:
1. Go to your Supabase dashboard
2. Navigate to Table Editor
3. Select the `rsvp` table
4. View all submissions

Or query via SQL:
```sql
-- Get all attending guests
SELECT * FROM rsvp WHERE is_attending = true;

-- Get total attending count
SELECT 
  COUNT(*) FILTER (WHERE is_attending = true) as attending_count,
  COUNT(*) FILTER (WHERE is_attending = false) as declined_count,
  SUM(number_of_guests) FILTER (WHERE is_attending = true) as total_guests
FROM rsvp;
```

## Features

✅ **Simple Form**: Clean, user-friendly RSVP form  
✅ **Email Validation**: Prevents duplicate submissions (updates existing)  
✅ **Plus One Support**: Captures guest information when bringing someone  
✅ **LocalStorage Tracking**: Remembers if user has already RSVP'd  
✅ **Automatic Redirect**: Seamless flow from envelope → RSVP → wedding site  
✅ **Supabase Integration**: Uses the same database as your waitlist  

## Troubleshooting

**Form doesn't appear after opening envelope:**
- Check browser console for errors
- Verify Supabase table exists and RLS policies are set correctly
- Check that Supabase credentials are correct

**Duplicate email error:**
- The form should automatically update existing records, but if you see errors, check the RLS policies allow updates

**Data not saving:**
- Verify RLS policies allow INSERT operations
- Check Supabase logs for errors
- Ensure the `rsvp` table exists with correct column names (snake_case)
