# Wedding Platform Setup Guide

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database
- npm or yarn package manager

## Initial Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd wedding-platform
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wedding_platform"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Google Maps (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# Stripe (Optional - for cash fund payments)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 3. Database Setup

```bash
# Push schema to database
npx prisma db push

# Or create a migration
npx prisma migrate dev --name init

# Open Prisma Studio to manage data
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Creating Your First Wedding

### Option 1: Using Prisma Studio

1. Run `npx prisma studio`
2. Navigate to the `Wedding` model
3. Click "Add record"
4. Fill in the required fields:
   - `slug`: URL-friendly identifier (e.g., "john-and-jane")
   - `partner1Name`: First partner's name
   - `partner2Name`: Second partner's name
   - `weddingDate`: Wedding date
   - `isPublished`: Set to `true` to make it visible
5. Save the record

### Option 2: Using Database Client

```sql
INSERT INTO "Wedding" (
  id,
  slug,
  "partner1Name",
  "partner2Name",
  "weddingDate",
  "isPublished",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'john-and-jane',
  'John',
  'Jane',
  '2026-06-15 15:00:00',
  true,
  NOW(),
  NOW()
);
```

## Populating Content

### Add Wedding Party Members

```sql
INSERT INTO "WeddingPartyMember" (
  id,
  "weddingId",
  name,
  role,
  bio,
  relationship,
  "order",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  '<wedding-id>',
  'Sarah Smith',
  'MAID_OF_HONOR',
  'Best friend since college',
  'Best friend of the bride',
  0,
  NOW(),
  NOW()
);
```

### Add Events

```sql
INSERT INTO "Event" (
  id,
  "weddingId",
  title,
  description,
  "startTime",
  "endTime",
  location,
  address,
  attire,
  "isPublic",
  "order",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  '<wedding-id>',
  'Wedding Ceremony',
  'Join us as we exchange vows',
  '2026-06-15 15:00:00',
  '2026-06-15 16:00:00',
  'Grand Hall',
  '123 Main St, City, ST 12345',
  'Formal',
  true,
  0,
  NOW(),
  NOW()
);
```

### Add Hotels

```sql
INSERT INTO "Hotel" (
  id,
  "weddingId",
  name,
  address,
  city,
  state,
  zip,
  phone,
  website,
  "blockCode",
  "blockDeadline",
  "specialRate",
  "distanceFromVenue",
  amenities,
  "order",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  '<wedding-id>',
  'Grand Hotel',
  '456 Hotel Ave',
  'City',
  'ST',
  '12345',
  '(555) 123-4567',
  'https://grandhotel.com',
  'WEDDING2026',
  '2026-05-15 00:00:00',
  '$149/night',
  '2 miles',
  'Free parking, Pool, Gym, Free WiFi',
  0,
  NOW(),
  NOW()
);
```

### Add Registry Items

```sql
INSERT INTO "RegistryItem" (
  id,
  "weddingId",
  name,
  description,
  url,
  "storeName",
  "imageUrl",
  "order",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  '<wedding-id>',
  'Amazon Registry',
  'Kitchen essentials and home goods',
  'https://amazon.com/wedding/registry',
  'Amazon',
  'https://images.example.com/amazon.jpg',
  0,
  NOW(),
  NOW()
);
```

### Add Cash Fund

```sql
INSERT INTO "CashFund" (
  id,
  "weddingId",
  title,
  description,
  category,
  "goalAmount",
  "currentAmount",
  "imageUrl",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  '<wedding-id>',
  'Honeymoon Fund',
  'Help us create unforgettable memories on our honeymoon to Italy',
  'HONEYMOON',
  5000.00,
  0.00,
  'https://images.example.com/honeymoon.jpg',
  true,
  NOW(),
  NOW()
);
```

### Add FAQs

```sql
INSERT INTO "Faq" (
  id,
  "weddingId",
  question,
  answer,
  category,
  "order",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  '<wedding-id>',
  'What is the dress code?',
  'Formal attire. We suggest cocktail dresses and suits.',
  'Attire',
  0,
  NOW(),
  NOW()
);
```

### Add Gallery Images

```sql
INSERT INTO "GalleryImage" (
  id,
  "weddingId",
  url,
  caption,
  "altText",
  category,
  "order",
  "createdAt"
) VALUES (
  gen_random_uuid(),
  '<wedding-id>',
  'https://images.example.com/engagement1.jpg',
  'Our engagement photoshoot',
  'Couple at beach during engagement',
  'engagement',
  0,
  NOW()
);
```

## Google Maps Setup

### Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Maps Embed API"
4. Go to Credentials → Create Credentials → API Key
5. (Recommended) Restrict the API key:
   - Application restrictions: HTTP referrers
   - Add your domain(s)
6. Copy the API key to `.env` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Stripe Setup (Optional)

### For Cash Fund Payments

1. Create a [Stripe account](https://stripe.com)
2. Get your API keys from the Dashboard
3. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```

**Note:** Full Stripe integration requires additional webhook configuration and is not included in Phase 1. The UI is ready but payment processing needs to be completed.

## Accessing Your Wedding Site

Once you have a wedding created with `isPublished: true`:

- Home: `http://localhost:3000/[slug]`
- Example: `http://localhost:3000/john-and-jane`

Replace `[slug]` with your wedding's slug.

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Railway
- Render
- AWS
- DigitalOcean
- Heroku

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_ctl status

# Test connection
psql -h localhost -U username -d wedding_platform
```

### Prisma Issues

```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Support

For issues or questions:
1. Check the documentation in `PHASE1_IMPLEMENTATION.md`
2. Review error messages in terminal
3. Check Next.js logs
4. Verify database connections

## Next Steps

After setup:
1. Review `PHASE1_IMPLEMENTATION.md` for all features
2. Customize your wedding content
3. Upload images
4. Test all pages
5. Configure SEO settings
6. Set up Google Maps
7. (Optional) Configure Stripe for payments

Happy wedding planning! 💍✨

