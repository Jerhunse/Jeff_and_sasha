# Quick Start Guide - View Your Website

## Option 1: Simple Local Development (Recommended First)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Database (Choose One)

#### Option A: Use Existing Database
If you already have a PostgreSQL database, update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/wedding_platform"
```

#### Option B: Quick SQLite (Development Only)
Edit `prisma/schema.prisma` temporarily:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

#### Option C: Use Free Cloud Database (Easiest)
1. Sign up at https://neon.tech (free tier)
2. Create a database
3. Copy connection string to `.env`

### Step 3: Run Migrations
```bash
# If using the OLD schema (Phase 3)
npx prisma generate
npx prisma db push

# OR if using the NEW schema (refactored)
cp prisma/schema-refactored.prisma prisma/schema.prisma
npx prisma generate
npx prisma db push
```

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Access the Website

**Public Site**: http://localhost:3000  
**Admin Dashboard**: http://localhost:3000/admin  

---

## Option 2: View Without Database

If you just want to see the UI without setting up a database:

### Quick Preview Mode
```bash
# Start the server (it will error on data fetching, but UI will load)
npm run dev
```

Then visit these static pages:
- Design system: http://localhost:3000
- Components work but won't have data

---

## Option 3: Use Vercel Quick Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to set up
# Add environment variables in Vercel dashboard
```

---

## 🗄️ Database Setup Details

### Using Neon (Free Cloud PostgreSQL)

1. **Sign up**: https://neon.tech
2. **Create project**: "Wedding Platform"
3. **Copy connection string**
4. **Add to `.env`**:
```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb"
```

5. **Push schema**:
```bash
npx prisma db push
```

6. **Create test data** (optional):
```bash
npx prisma studio
# Opens GUI at http://localhost:5555
# Add test Couple, Guest, etc.
```

---

## 🧪 Create Test Data

### Option 1: Use Prisma Studio
```bash
npx prisma studio
```

Visit http://localhost:5555 and manually create:
1. **User** (for admin login)
2. **Couple** (wedding info)
3. **Guest** (test guest with inviteToken)
4. **Event** (ceremony, reception)

### Option 2: Seed Script (I can create this)

Would you like me to create a seed script that populates test data automatically?

---

## 📋 Current Status

Since you haven't run migrations yet, here's what to do:

### Check Current Schema
```bash
# See what schema you have
cat prisma/schema.prisma | head -20
```

### If You Have the OLD Schema (from earlier phases)
```bash
# Just run:
npx prisma generate
npx prisma db push  # or migrate dev
npm run dev
```

### If You Want the NEW Schema (refactored)
```bash
# Copy it over
cp prisma/schema-refactored.prisma prisma/schema.prisma

# Then:
npx prisma generate
npx prisma db push
npm run dev
```

---

## 🎯 What You'll See

### Without Data:
- ✅ Pages load
- ✅ UI components render
- ⚠️ Empty states (no guests, no events)
- ⚠️ Some errors in console (expected)

### With Data:
- ✅ Full admin dashboard
- ✅ Guest list
- ✅ Campaign manager
- ✅ Analytics with charts
- ✅ Public wedding site
- ✅ RSVP forms

---

## 🆘 Troubleshooting

### "Cannot find module @prisma/client"
```bash
npx prisma generate
```

### "Database connection error"
- Check DATABASE_URL in `.env`
- Verify database is running
- Test connection: `npx prisma db pull`

### "Module not found" errors
```bash
npm install
```

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
```

---

## 🎨 Preview the Design

Even without a database, you can view the component library and design:

1. Create a simple preview page
2. Import components
3. See styling and layout

Would you like me to create a preview/demo page?

---

## ✅ Recommended Steps Right Now

1. **Check if you have a database**:
```bash
# Check .env file
cat .env | grep DATABASE_URL
```

2. **If yes**, run:
```bash
npx prisma generate
npx prisma db push
npm run dev
```

3. **If no**, use Neon.tech (5 min setup):
- Sign up at https://neon.tech
- Create database
- Copy connection string
- Add to `.env`
- Run migrations

4. **Then visit**:
- http://localhost:3000 (public site)
- http://localhost:3000/admin (admin dashboard)

---

Would you like me to:
1. Create a seed script with sample data?
2. Create a demo/preview page that works without database?
3. Help you set up Neon.tech database?
4. Something else?

Let me know and I'll help you get the site up and running!

