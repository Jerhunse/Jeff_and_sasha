# Wedding Platform - Pages Reference

Quick reference for all implemented pages and their features.

## Public Pages Structure

All pages follow the pattern: `/{wedding-slug}/{page}`

Example: `https://yourwedding.com/john-and-jane/story`

---

## 📄 Page Routes

### 1. Home Page
**Route:** `/{slug}`  
**File:** `app/(public)/[slug]/page.tsx`

**Sections:**
- Hero with couple names, date, venue
- Countdown timer
- Quick links (4 cards)
- Upcoming events (3 events)
- Featured registry items (3 items)
- RSVP call-to-action

**Data Required:**
- Wedding details (partner names, date, venue)
- Events (optional)
- Registry items (optional)

**Schema.org:** Event markup included

---

### 2. Our Story
**Route:** `/{slug}/story`  
**File:** `app/(public)/[slug]/story/page.tsx`

**Features:**
- CMS-driven content sections
- Default template provided
- Image support per section
- Rich text content

**Data Required:**
- Page record with `slug: "our-story"`
- Section records (optional)

**Default Sections:**
- How We Met
- The Proposal
- Looking Forward

---

### 3. Wedding Party
**Route:** `/{slug}/party`  
**File:** `app/(public)/[slug]/party/page.tsx`

**Features:**
- Organized by role categories
- Photo gallery with avatars
- Bio and relationship info
- Responsive grid layout

**Supported Roles:**
- Bride/Groom
- Maid of Honor/Best Man
- Bridesmaids/Groomsmen
- Officiant
- Flower Girl/Ring Bearer
- Usher/Reader
- Custom roles

**Data Required:**
- WeddingPartyMember records

---

### 4. Schedule
**Route:** `/{slug}/schedule`  
**File:** `app/(public)/[slug]/schedule/page.tsx`

**Features:**
- Multi-day event support
- Time, location, attire
- Visual timeline
- Event badges

**Event Fields:**
- Title, description
- Start/end time
- Location & address
- Attire code
- Public/private flag

**Data Required:**
- Event records

---

### 5. Travel & Lodging
**Route:** `/{slug}/travel`  
**File:** `app/(public)/[slug]/travel/page.tsx`

**Features:**
- Venue information
- **Google Maps embed**
- Hotel room blocks
- Discount codes
- Amenities list
- Distance from venue

**Data Required:**
- Wedding venue details
- Hotel records

**API Keys Needed:**
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

---

### 6. Registry
**Route:** `/{slug}/registry`  
**File:** `app/(public)/[slug]/registry/page.tsx`

**Features:**
- External registry links
- Cash fund display
- Progress tracking
- Image galleries

**Sections:**
1. **Cash Funds** (if any)
   - Goal tracking
   - Progress bars
   - Contribute button
   
2. **Gift Registries**
   - External store links
   - Store logos
   - Descriptions

**Data Required:**
- RegistryItem records
- CashFund records (optional)

---

### 7. Registry Contribution
**Route:** `/{slug}/registry/contribute/{fundId}`  
**File:** `app/(public)/[slug]/registry/contribute/[fundId]/page.tsx`

**Features:**
- Contribution form
- Preset amount buttons
- Custom amount input
- Personal message
- Fund progress display

**Fields:**
- Amount (required)
- Name (required)
- Email (required)
- Message (optional)

**Status:** UI ready, Stripe integration pending

---

### 8. Gallery
**Route:** `/{slug}/gallery`  
**File:** `app/(public)/[slug]/gallery/page.tsx`

**Features:**
- **Masonry layout** (CSS columns)
- Category filtering
- Image captions
- Hover effects
- Responsive design

**Data Required:**
- GalleryImage records

**Image Fields:**
- URL (required)
- Caption (optional)
- Alt text (optional)
- Category (optional)

---

### 9. FAQ
**Route:** `/{slug}/faq`  
**File:** `app/(public)/[slug]/faq/page.tsx`

**Features:**
- Q&A format
- Category grouping
- Searchable layout
- Expandable cards

**Data Required:**
- Faq records

**FAQ Fields:**
- Question
- Answer
- Category (optional)

---

### 10. Contact
**Route:** `/{slug}/contact`  
**File:** `app/(public)/[slug]/contact/page.tsx`

**Features:**
- Contact form
- Success/error messages
- Venue quick info
- FAQ link

**Form Fields:**
- Name (required)
- Email (required)
- Phone (optional)
- Subject (optional)
- Message (required)

**API Endpoint:** `POST /api/contact/{slug}`

**Data Storage:** ContactMessage table

---

## 🔧 API Endpoints

### Contact Form Submission
**POST** `/api/contact/[slug]/route.ts`

**Body (FormData):**
```
name: string
email: string
phone?: string
subject?: string
message: string
```

**Responses:**
- Success: Redirect to `/{slug}/contact?success=true`
- Error: Redirect to `/{slug}/contact?error=...`

---

## 🎨 Shared Components

### Navigation Header
**Component:** `components/wedding/site-header.tsx`

**Menu Items:**
1. Home
2. Our Story
3. Wedding Party
4. Schedule
5. Travel
6. Registry
7. Gallery
8. FAQ
9. Contact

**Features:**
- Sticky header
- Responsive design
- RSVP button
- Couple names

---

### Hero Section
**Component:** `components/wedding/hero-section.tsx`

**Props:**
- partner1Name
- partner2Name
- weddingDate
- venueName
- venueCity, venueState
- heroImageUrl
- weddingSlug

---

### Countdown Timer
**Component:** `components/wedding/countdown-timer.tsx`

**Features:**
- Days, hours, minutes, seconds
- Real-time updates
- Responsive design

---

## 🔍 SEO Features

### Metadata (Per Wedding)
- Dynamic title
- Description
- OpenGraph tags
- Twitter Card tags
- Canonical URL
- Robots directives

### Sitemap
**Route:** `/sitemap.xml`  
**File:** `app/sitemap.ts`

**Includes:**
- All wedding pages
- Dynamic per wedding
- Last modified dates
- Priority scores

### Robots.txt
**Route:** `/robots.txt`  
**File:** `app/robots.ts`

**Configuration:**
- Allow public pages
- Disallow admin, API, auth
- Sitemap reference

### Structured Data
**Type:** Schema.org Event

**Included on:** Home page

**Fields:**
- Event name
- Date
- Location
- Organizer

---

## 📊 Database Models

### Core Models

**Wedding** - Main wedding record
- Basic info (names, date, venue)
- Theme settings (colors, images)
- Settings (published, RSVP deadline)

**Event** - Schedule events
- Title, description
- Time (start/end)
- Location details
- Attire

**Hotel** - Accommodations
- Name, address
- Room block details
- Amenities

**RegistryItem** - External registries
- Name, URL
- Store name
- Images

**CashFund** - Monetary gifts
- Title, description
- Goal tracking
- Stripe integration

**WeddingPartyMember** - Wedding party
- Name, role
- Bio, relationship
- Photos

**GalleryImage** - Photo gallery
- URL, caption
- Category
- Order

**Faq** - Questions & answers
- Question, answer
- Category

**ContactMessage** - Contact form submissions
- Name, email, phone
- Subject, message
- Read status

---

## 🎯 Content Management

### Via Prisma Studio

```bash
npx prisma studio
```

Access at: `http://localhost:5555`

### Via SQL

See `SETUP_GUIDE.md` for SQL examples

### Future: Admin Dashboard

Phase 2 will include a full admin interface for:
- Content editing
- Image uploads
- Guest management
- RSVP tracking
- Analytics

---

## 🚀 Quick Start Checklist

- [ ] Database setup complete
- [ ] Wedding record created
- [ ] `isPublished` set to `true`
- [ ] Basic info filled (names, date, venue)
- [ ] Hero image uploaded
- [ ] At least one event added
- [ ] Navigation tested
- [ ] All pages accessible
- [ ] Contact form tested
- [ ] Google Maps configured (optional)
- [ ] Registry items added (optional)

---

## 📱 Responsive Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

All pages are fully responsive and tested across devices.

---

## 🎨 Design System

### Colors
- Primary: Wedding theme color
- Secondary: Accent color
- Muted: Background/text variants

### Typography
- Headings: Playfair Display (serif)
- Body: Inter (sans-serif)

### Components
- Cards: Rounded corners, shadows
- Buttons: Primary, outline, ghost variants
- Forms: Consistent styling, validation
- Icons: Lucide React

---

## 📖 Additional Documentation

- **Implementation Details:** `PHASE1_IMPLEMENTATION.md`
- **Setup Instructions:** `SETUP_GUIDE.md`
- **Database Schema:** `prisma/schema.prisma`
- **Environment Setup:** `ENV_SETUP.md`

---

**Last Updated:** October 11, 2025  
**Version:** Phase 1 Complete

