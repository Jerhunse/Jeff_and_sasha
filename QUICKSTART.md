# 🚀 Quick Start Guide

Get your wedding website running in 5 minutes!

## Prerequisites

Make sure you have installed:
- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL ([Download](https://www.postgresql.org/download/))
- Git

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database:

```bash
# Using psql
createdb wedding_platform

# Or using PostgreSQL GUI (pgAdmin, TablePlus, etc.)
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:password@localhost:5432/wedding_platform?schema=public"

# NextAuth - Generate a secret
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Optional: Google OAuth (leave blank to skip)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Optional: Email (Resend) - leave blank to skip
RESEND_API_KEY=""
EMAIL_FROM="noreply@yourwedding.com"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 5. Create Your First Wedding

You'll need to manually add a wedding record for now. Open Prisma Studio:

```bash
npx prisma studio
```

Then create a record in the `Wedding` table with:
- `slug`: "jeff-and-sasha" (or your preferred URL slug)
- `partner1Name`: "Jeff"
- `partner2Name`: "Sasha"
- `weddingDate`: Your wedding date
- `isPublished`: true
- `primaryColor`: "#6b9c7f" (or your preferred color)

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000/jeff-and-sasha](http://localhost:3000/jeff-and-sasha) to see your site!

## 🎨 Customization

### Change Colors

Edit `app/globals.css` to customize the color palette:

```css
:root {
  --primary: oklch(0.55 0.08 145); /* Soft green */
  --secondary: oklch(0.95 0.01 75); /* Warm neutral */
  /* ... more colors ... */
}
```

### Change Fonts

Edit `app/layout.tsx` to use different Google Fonts:

```typescript
import { Your_Font, Another_Font } from "next/font/google";
```

### Add Content

1. **Events**: Add records to the `Event` table in Prisma Studio
2. **Hotels**: Add records to the `Hotel` table
3. **FAQs**: Add records to the `Faq` table
4. **Registry**: Add records to the `RegistryItem` table
5. **Gallery**: Add records to the `GalleryImage` table

## 🔐 Admin Access

To access the admin console at `/admin`, you need to:

1. Create a `User` record in Prisma Studio
2. Set `role` to "OWNER" or "COLLABORATOR"
3. Link it to your wedding via `weddingId`

Then sign in at [http://localhost:3000/admin](http://localhost:3000/admin)

## 📝 Common Issues

### Database Connection Error

Make sure PostgreSQL is running:
```bash
# macOS with Homebrew
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Migration Errors

Reset the database if needed:
```bash
npx prisma migrate reset
```

### Port Already in Use

Change the port:
```bash
PORT=3001 npm run dev
```

## 📚 Next Steps

1. ✅ Set up your wedding details in the database
2. ✅ Add events to the schedule
3. ✅ Upload photos to the gallery
4. ✅ Create hotel recommendations
5. ✅ Add FAQs for your guests
6. ✅ Customize the theme colors
7. ✅ Set up authentication providers
8. ✅ Deploy to production (Vercel recommended)

## 🚀 Deploy to Production

### Recommended: Vercel

1. Push your code to GitHub (already done!)
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

For the database, consider:
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Supabase](https://supabase.com/)
- [PlanetScale](https://planetscale.com/)
- [Railway](https://railway.app/)

## 💡 Tips

- Use Prisma Studio to easily manage your data during development
- Test your RSVP flow by creating guest records with unique invite codes
- Backup your database regularly
- Keep your `.env` file secure and never commit it

## 🆘 Need Help?

Check out:
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://authjs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Happy wedding planning! 💕

