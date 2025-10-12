# Database Migration Guide - Phase 1

## Overview

Phase 1 adds several new models and enums to the database schema. This guide will help you safely migrate your database.

---

## Schema Changes Summary

### New Enums (2)
1. **WeddingPartyRole** - 12 role types for wedding party members
2. **CashFundCategory** - 4 categories for cash funds

### New Models (4)
1. **WeddingPartyMember** - Store wedding party information
2. **ContactMessage** - Store contact form submissions  
3. **CashFund** - Manage cash gift funds
4. **CashFundContribution** - Track individual contributions

### Updated Models (1)
1. **Wedding** - Added relations for new models

---

## Migration Steps

### Option 1: Push to Development (Recommended for Dev)

Best for development and testing environments:

```bash
# Generate Prisma Client with new models
npx prisma generate

# Push schema changes to database
npx prisma db push

# Verify in Prisma Studio
npx prisma studio
```

**Pros:**
- Quick and easy
- No migration files
- Perfect for development

**Cons:**
- No migration history
- Can't roll back easily

---

### Option 2: Create Migration (Recommended for Production)

Best for production environments:

```bash
# Create a new migration
npx prisma migrate dev --name phase1_wedding_party_and_cash_funds

# This will:
# 1. Generate migration SQL
# 2. Apply to database
# 3. Update Prisma Client
```

**Pros:**
- Tracked migration history
- Can roll back if needed
- Better for production

**Cons:**
- Slightly more complex
- Creates migration files

---

### Option 3: Manual Migration (Advanced)

If you need full control:

```bash
# Generate migration without applying
npx prisma migrate dev --create-only --name phase1_features

# Review the SQL in: prisma/migrations/

# Apply when ready
npx prisma migrate deploy
```

---

## Migration SQL Reference

If you need to manually create the migration, here's the SQL:

```sql
-- CreateEnum
CREATE TYPE "WeddingPartyRole" AS ENUM (
  'BRIDE',
  'GROOM',
  'BRIDESMAID',
  'GROOMSMAN',
  'MAID_OF_HONOR',
  'BEST_MAN',
  'OFFICIANT',
  'FLOWER_GIRL',
  'RING_BEARER',
  'USHER',
  'READER',
  'OTHER'
);

-- CreateEnum
CREATE TYPE "CashFundCategory" AS ENUM (
  'HONEYMOON',
  'HOME',
  'GENERAL',
  'CUSTOM'
);

-- CreateTable: WeddingPartyMember
CREATE TABLE "WeddingPartyMember" (
  "id" TEXT NOT NULL,
  "weddingId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "WeddingPartyRole" NOT NULL,
  "roleLabel" TEXT,
  "bio" TEXT,
  "imageUrl" TEXT,
  "relationship" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "WeddingPartyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ContactMessage
CREATE TABLE "ContactMessage" (
  "id" TEXT NOT NULL,
  "weddingId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "subject" TEXT,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "isResolved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CashFund
CREATE TABLE "CashFund" (
  "id" TEXT NOT NULL,
  "weddingId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" "CashFundCategory" NOT NULL DEFAULT 'GENERAL',
  "goalAmount" DOUBLE PRECISION,
  "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "imageUrl" TEXT,
  "stripeAccountId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "CashFund_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CashFundContribution
CREATE TABLE "CashFundContribution" (
  "id" TEXT NOT NULL,
  "cashFundId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "message" TEXT,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "stripePaymentId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "CashFundContribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeddingPartyMember_weddingId_idx" ON "WeddingPartyMember"("weddingId");
CREATE INDEX "ContactMessage_weddingId_idx" ON "ContactMessage"("weddingId");
CREATE INDEX "ContactMessage_isRead_idx" ON "ContactMessage"("isRead");
CREATE INDEX "CashFund_weddingId_idx" ON "CashFund"("weddingId");
CREATE INDEX "CashFundContribution_cashFundId_idx" ON "CashFundContribution"("cashFundId");
CREATE INDEX "CashFundContribution_stripePaymentId_idx" ON "CashFundContribution"("stripePaymentId");
CREATE UNIQUE INDEX "CashFundContribution_stripePaymentId_key" ON "CashFundContribution"("stripePaymentId");

-- AddForeignKey
ALTER TABLE "WeddingPartyMember"
  ADD CONSTRAINT "WeddingPartyMember_weddingId_fkey"
  FOREIGN KEY ("weddingId")
  REFERENCES "Wedding"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMessage"
  ADD CONSTRAINT "ContactMessage_weddingId_fkey"
  FOREIGN KEY ("weddingId")
  REFERENCES "Wedding"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashFund"
  ADD CONSTRAINT "CashFund_weddingId_fkey"
  FOREIGN KEY ("weddingId")
  REFERENCES "Wedding"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashFundContribution"
  ADD CONSTRAINT "CashFundContribution_cashFundId_fkey"
  FOREIGN KEY ("cashFundId")
  REFERENCES "CashFund"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
```

---

## Post-Migration Verification

After running the migration, verify everything:

### 1. Check Prisma Client

```bash
npx prisma generate
```

Should complete without errors.

### 2. Open Prisma Studio

```bash
npx prisma studio
```

You should see the new tables:
- WeddingPartyMember
- ContactMessage
- CashFund
- CashFundContribution

### 3. Test the Application

```bash
npm run dev
```

Visit your wedding pages and verify:
- ✅ Wedding Party page loads (`/[slug]/party`)
- ✅ Contact page loads (`/[slug]/contact`)
- ✅ Registry page shows cash funds (`/[slug]/registry`)
- ✅ No console errors

---

## Troubleshooting

### Error: "Enum already exists"

If you get enum conflicts:

```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Then apply migrations
npx prisma migrate deploy
```

### Error: "Relation does not exist"

Missing foreign keys usually means:

```bash
# Regenerate Prisma Client
npx prisma generate

# Push schema again
npx prisma db push
```

### Error: "Type mismatch"

If you have existing data that conflicts:

1. Backup your database
2. Drop conflicting tables/enums
3. Run migration again

```sql
-- Remove conflicting types
DROP TABLE IF EXISTS "WeddingPartyMember" CASCADE;
DROP TABLE IF EXISTS "ContactMessage" CASCADE;
DROP TABLE IF EXISTS "CashFund" CASCADE;
DROP TABLE IF EXISTS "CashFundContribution" CASCADE;
DROP TYPE IF EXISTS "WeddingPartyRole" CASCADE;
DROP TYPE IF EXISTS "CashFundCategory" CASCADE;
```

Then run: `npx prisma db push`

---

## Rollback (If Needed)

### For `db push`:

Unfortunately, `db push` doesn't support rollback. You would need to:

1. Restore from backup
2. Or manually drop the new tables

### For Migrations:

```bash
# View migration history
npx prisma migrate status

# Rollback last migration
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## Production Deployment

When deploying to production:

### Step 1: Backup Database

```bash
# PostgreSQL backup
pg_dump -U username -d database_name > backup_before_migration.sql
```

### Step 2: Apply Migration

```bash
# Production migration (no prompts)
npx prisma migrate deploy
```

### Step 3: Verify

```bash
# Check migration status
npx prisma migrate status
```

### Step 4: Test

- Visit all pages
- Test new features
- Check error logs

---

## Data Population

After migration, you may want to add sample data:

### Sample Wedding Party Member

```sql
INSERT INTO "WeddingPartyMember" (
  id, "weddingId", name, role, relationship, bio, "order", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  '<your-wedding-id>',
  'Sarah Johnson',
  'MAID_OF_HONOR',
  'Sister of the bride',
  'My best friend and confidant through all of life''s adventures.',
  0,
  NOW(),
  NOW()
);
```

### Sample Cash Fund

```sql
INSERT INTO "CashFund" (
  id, "weddingId", title, description, category, "goalAmount", "isActive", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  '<your-wedding-id>',
  'Honeymoon Fund',
  'Help us create unforgettable memories in Italy!',
  'HONEYMOON',
  5000.00,
  true,
  NOW(),
  NOW()
);
```

---

## Migration Checklist

Pre-Migration:
- [ ] Backup database
- [ ] Review schema changes
- [ ] Test in development first
- [ ] Note down environment

During Migration:
- [ ] Run `npx prisma generate`
- [ ] Run migration command
- [ ] Check for errors
- [ ] Verify tables created

Post-Migration:
- [ ] Open Prisma Studio
- [ ] Check new tables exist
- [ ] Test application
- [ ] Verify no console errors
- [ ] Test new features
- [ ] Check production logs

---

## Need Help?

If you encounter issues:

1. Check Prisma documentation: [prisma.io/docs](https://www.prisma.io/docs)
2. Review error messages carefully
3. Check database logs
4. Verify environment variables
5. Try the troubleshooting steps above

---

## Next Steps After Migration

1. **Add Content** - Use Prisma Studio to add:
   - Wedding party members
   - Cash funds (if using)
   - Sample contact messages (for testing)

2. **Test Features**:
   - Visit wedding party page
   - Submit contact form
   - View registry with cash funds
   - Test all navigation

3. **Configure Integrations**:
   - Add Google Maps API key
   - Set up Stripe (if using cash funds)
   - Configure email (for future phases)

4. **Deploy**:
   - Push code to repository
   - Deploy to hosting platform
   - Run migration on production
   - Test production site

---

**Migration prepared for Phase 1**  
**Date:** October 11, 2025  
**Status:** Ready to apply  
**Risk:** Low (additive changes only)

