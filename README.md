# 💒 Modern Wedding Website Platform

A beautiful, elegant wedding website platform inspired by Joy's aesthetic. Built with Next.js 15, TypeScript, Tailwind CSS, and Prisma.

## ✨ Features

### Phase 0 - Foundation (Complete)

- ✅ **Modern Tech Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- ✅ **Joy-Style Design System**: 
  - Soft serif headings (Playfair Display) + clean sans body (Inter)
  - Warm neutrals + soft green color palette
  - Card-based layouts with rounded corners and subtle shadows
  - Micro-interactions and hover effects
- ✅ **Authentication**: Email magic links + Google OAuth via NextAuth.js
- ✅ **Role-Based Access**: Owner, Collaborator, Vendor, Guest roles
- ✅ **Database Schema**: Comprehensive Prisma schema with all wedding features

### Public Wedding Site

- 🏠 **Home Page**: Hero section with countdown timer
- 📖 **Our Story**: Customizable story page with sections
- 📅 **Schedule**: Event timeline with details
- ✈️ **Travel**: Hotel room blocks, directions, venue info
- 🎁 **Registry**: Gift registry links
- ❓ **FAQ**: Categorized frequently asked questions
- 📸 **Gallery**: Photo gallery with categories

### Guest Experience

- 💌 **RSVP System**: Unique invite codes for guests
- ➕ **Plus Ones**: Optional plus-one management
- 🍽️ **Meal Choices**: Dietary restrictions and preferences
- 🎵 **Song Requests**: Let guests request songs

### Admin Console

- 📊 **Dashboard**: Overview with stats and countdown
- 👥 **Guest Management**: Import, track RSVPs, seating
- 📆 **Event Management**: Create and manage wedding events
- 📝 **CMS**: Custom page builder with sections
- ⚙️ **Settings**: Wedding details and theme customization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- (Optional) Google OAuth credentials
- (Optional) Resend API key for emails

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jerhunse/Jeff_and_sasha.git
   cd wedding-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory (see `ENV_SETUP.md` for details):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/wedding_platform"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-here"
   ```

4. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
wedding-platform/
├── app/
│   ├── (public)/          # Public wedding site routes
│   │   ├── [slug]/        # Dynamic wedding routes
│   │   │   ├── page.tsx   # Home page
│   │   │   ├── story/     # Our Story page
│   │   │   ├── schedule/  # Schedule page
│   │   │   ├── travel/    # Travel page
│   │   │   ├── registry/  # Registry page
│   │   │   ├── faq/       # FAQ page
│   │   │   └── gallery/   # Gallery page
│   │   └── rsvp/          # RSVP routes
│   ├── (admin)/           # Admin console routes
│   │   └── admin/         # Dashboard and management
│   ├── api/               # API routes
│   │   └── auth/          # Authentication endpoints
│   ├── globals.css        # Global styles with Joy theme
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── wedding/           # Wedding-specific components
│   └── admin/             # Admin components
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
├── prisma/
│   └── schema.prisma      # Database schema
└── types/                 # TypeScript type definitions
```

## 🎨 Design System

### Typography
- **Headings**: Playfair Display (serif) - elegant and romantic
- **Body**: Inter (sans-serif) - clean and readable
- **Line Height**: 1.7 for body text (generous spacing)

### Color Palette
- **Primary**: Soft sage green `oklch(0.55 0.08 145)`
- **Secondary**: Warm neutral `oklch(0.95 0.01 75)`
- **Accent**: Soft green accent `oklch(0.92 0.03 135)`
- **Background**: Warm off-white `oklch(0.98 0.005 85)`

### Components
- Card-based layouts with `rounded-xl` corners
- Subtle drop shadows with hover elevation
- Floral/organic background patterns
- Generous whitespace and padding

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 📝 Database Schema

The platform includes a comprehensive schema for:

- **Users & Auth**: Email/social login, roles, sessions
- **Weddings**: Multi-tenant ready, theme customization
- **Guests**: RSVP tracking, plus-ones, dietary preferences
- **Events**: Wedding schedule with venues and attire
- **CMS**: Pages, sections, gallery images
- **Hotels**: Room blocks and travel info
- **Registry**: Gift registry links
- **FAQs**: Categorized questions and answers
- **Seating**: Table assignments and charts
- **Messages**: Guest messages and guestbook

## 🚧 Roadmap

### Phase 1 - Enhancement (Next)
- [ ] RSVP form with validation
- [ ] Email invitation system
- [ ] Guest import (CSV)
- [ ] Rich text editor for pages
- [ ] Image upload and management

### Phase 2 - Advanced Features
- [ ] SMS reminders
- [ ] Seating chart drag-and-drop
- [ ] RSVP analytics and exports
- [ ] Timeline builder
- [ ] Vendor portal

### Phase 3 - Polish
- [ ] Print-friendly views
- [ ] QR code check-in
- [ ] Live guestbook
- [ ] Photo sharing
- [ ] Thank you card manager

## 🤝 Contributing

This is a personal project for Jeff & Sasha's wedding, but feel free to fork and adapt for your own use!

## 📄 License

MIT License - feel free to use this for your own wedding!

## 💕 Built With Love

Created with love for Jeff & Sasha's special day.

---

**Wedding Date**: [Coming Soon]  
**Location**: [Coming Soon]
