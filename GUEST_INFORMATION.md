# Guest Information Guide

This document outlines all wedding information that is relevant and visible to guests. This is the public-facing information that guests can access through the wedding website.

---

## 🎉 Basic Wedding Information

### The Couple
- **Partner 1 Name** - First partner's name
- **Partner 2 Name** - Second partner's name
- **Wedding Date** - Main wedding date and time
- **Wedding Website URL** - `/{slug}` (e.g., `/jeff-and-sasha`)

### Venue Details
- **Venue Name** - Name of the wedding venue
- **Venue Address** - Full street address
- **Venue City** - City
- **Venue State** - State/Province
- **Venue Zip Code** - Postal/ZIP code
- **Venue Country** - Country
- **Google Maps Link** - Direct link to venue location
- **Apple Maps Link** - Direct link for Apple Maps users
- **Map Embed** - Interactive map (if Google Maps API key is configured)

---

## 📅 Schedule & Events

Guests can view all public events on the Schedule page (`/{slug}/schedule`).

### Event Information (for each event)
- **Event Name** - e.g., "Ceremony", "Reception", "Rehearsal Dinner", "Welcome Party"
- **Date** - Event date
- **Start Time** - When the event begins
- **End Time** - When the event ends (if applicable)
- **Location** - Location name
- **Address** - Full address for the event
- **Venue** - Venue name
- **Description** - Event description/details
- **Attire** - Dress code (e.g., "Black Tie", "Cocktail Attire", "Casual")
- **Event Order** - Display order on the schedule

**Note:** Only events with `visibility: PUBLIC` are shown to guests. Private or invite-only events are not visible.

---

## 🚗 Travel & Accommodations

Guests can find all travel information on the Travel page (`/{slug}/travel`).

### Venue Directions
- **Venue Address** - Full address
- **Google Maps Link** - "Open in Google Maps" button
- **Apple Maps Link** - "Open in Apple Maps" button
- **Interactive Map** - Embedded map (if configured)

### Hotel Accommodations

For each hotel block, guests can see:

- **Hotel Name**
- **Hotel Address** - Full address (street, city, state, zip)
- **Distance from Venue** - Text description (e.g., "5 miles from venue")
- **Phone Number** - Contact phone number
- **Website** - Hotel website link
- **Room Block Code** - Booking code for special rates
- **Booking Deadline** - Date by which to book
- **Special Rate** - Description of the special rate
- **Block Dates** - Start and end dates for the room block
- **Amenities** - List of hotel amenities
- **Directions Button** - Link to get directions via Google Maps

---

## 🎁 Registry

Guests can view registry information on the Registry page (`/{slug}/registry`).

### Gift Registries

For each registry link:
- **Store Name** - e.g., "Amazon", "Crate & Barrel", "Target"
- **Registry URL** - Direct link to the registry
- **Description** - Optional description
- **Image** - Optional store/registry image
- **Order** - Display order

### Cash Funds

For each cash fund:
- **Fund Title** - Name of the fund (e.g., "Honeymoon Fund", "Home Renovation")
- **Description** - What the fund is for
- **Image** - Optional image
- **Goal Amount** - Target amount (if set)
- **Amount Raised** - Current amount received
- **Progress Bar** - Visual progress indicator
- **Contribute Button** - Link to contribute to the fund

---

## 💌 RSVP Information

### RSVP Access
- **Invite Code/Token** - Unique code for each guest (sent via invitation)
- **RSVP URL** - `/rsvp/{code}` or `/rsvp/{slug}`
- **RSVP Deadline** - Optional deadline date (if set by couple)

### RSVP Questions

Guests may be asked to answer various questions:

#### Meal Selection
- **Question:** "What is your meal choice?"
- **Options:** Typically includes:
  - Chicken
  - Beef
  - Fish
  - Vegetarian
  - Vegan (if available)
- **Required:** Usually required

#### Dietary Restrictions
- **Question:** "Do you have any dietary restrictions?"
- **Type:** Free text or checkbox options
- **Examples:** Allergies, gluten-free, kosher, halal, etc.

#### Song Requests
- **Question:** "Request a song for the dance floor!"
- **Type:** Free text input
- **Optional:** Usually optional

#### Plus-One Information
- **Plus-One Allowed** - Whether guest can bring a plus-one
- **Plus-One Name** - If plus-one is allowed and named
- **Plus-One Email** - Optional email for plus-one
- **Plus-One Answers** - Plus-one's responses to RSVP questions

#### Custom Questions
- Various custom questions can be added by the couple
- May include:
  - Transportation needs
  - Special accommodations
  - Song requests
  - Messages to the couple
  - Other preferences

### RSVP Status
Guests can see their current RSVP status:
- **PENDING** - Not yet responded
- **YES** / **ATTENDING** - Will attend
- **NO** / **DECLINED** - Will not attend
- **MAYBE** - Unsure/Maybe attending

### RSVP Response Details
- **Response Date** - When they submitted their RSVP
- **Event-Specific RSVPs** - Can RSVP separately for different events
- **Message** - Optional message to the couple
- **Answers** - All their responses to questions

---

## 👥 Wedding Party

Guests can view the wedding party on the Party page (`/{slug}/party`).

### Wedding Party Members

For each member, guests can see:

- **Name** - Member's full name
- **Role** - Their role in the wedding:
  - Bride
  - Groom
  - Maid of Honor
  - Best Man
  - Bridesmaid
  - Groomsman
  - Officiant
  - Flower Girl
  - Ring Bearer
  - Usher
  - Reader
  - Custom role
- **Photo** - Member's photo (or avatar with initials)
- **Relationship** - e.g., "Sister of the bride", "College roommate"
- **Bio** - Short biography about the member

**Organization:** Members are grouped by role categories:
- The Happy Couple (Bride & Groom)
- Honor Attendants (Maid of Honor & Best Man)
- The Wedding Party (Bridesmaids & Groomsmen)
- Special Roles (Officiant, Flower Girl, Ring Bearer, etc.)

---

## ❓ Frequently Asked Questions (FAQs)

Guests can view FAQs on the FAQ page (`/{slug}/faq`).

### FAQ Categories
FAQs may be organized by category:
- **General** - General wedding questions
- **Travel** - Travel and accommodation questions
- **RSVP** - RSVP-related questions
- **Registry** - Gift registry questions
- **Venue** - Venue-specific questions
- **Other** - Custom categories

### FAQ Content
Each FAQ includes:
- **Question** - The question text
- **Answer** - The answer text
- **Category** - Optional category grouping

---

## 📖 Our Story

Guests can read the couple's story on the Story page (`/{slug}/story`).

### Story Sections
The story page may include:
- **How We Met** - The couple's origin story
- **The Proposal** - Proposal story
- **Looking Forward** - Future plans
- **Custom Sections** - Additional story sections
- **Images** - Photos throughout the story

---

## 📸 Gallery

Guests can view photos on the Gallery page (`/{slug}/gallery`).

### Gallery Content
- **Images** - Wedding and engagement photos
- **Captions** - Photo captions
- **Organization** - Photos may be organized by tags or events

---

## 📧 Contact Information

Guests can contact the couple on the Contact page (`/{slug}/contact`).

### Contact Methods
- **Contact Form** - Form to send messages to the couple
  - Name (required)
  - Email (required)
  - Phone (optional)
  - Subject (optional)
  - Message (required)
- **Venue Information** - Quick reference to venue details
- **FAQ Link** - Quick link to FAQ page

### Contact Form Features
- Success/error messages
- Email notifications to couple
- Response time expectations (typically 24 hours)

---

## 🎨 Website Features

### Visual Design
- **Color Scheme** - Custom colors for the wedding
  - Primary color
  - Secondary color
  - Accent color
- **Fonts** - Custom typography
  - Heading font (typically elegant/serif)
  - Body font (typically readable/sans-serif)
- **Hero Image** - Main banner image
- **Logo** - Wedding logo/branding
- **Floral Patterns** - Optional decorative elements

### Navigation
- **Site Header** - Navigation menu with links to:
  - Home
  - Our Story
  - Wedding Party
  - Schedule
  - Travel & Lodging
  - Registry
  - FAQ
  - Contact
- **Quick Links** - Featured links on home page
- **RSVP Button** - Prominent RSVP call-to-action

### Interactive Features
- **Countdown Timer** - Days until the wedding (on home page)
- **Event Timeline** - Visual timeline of events
- **Map Integration** - Interactive maps for venue and hotels
- **Progress Bars** - For cash funds showing progress toward goals

---

## 📱 Invitation & Access

### Invitation Methods
- **Email Invitation** - Sent via email with unique invite code
- **SMS Invitation** - Sent via text message
- **Envelope Landing Page** - Special landing page with invitation details
- **Shared Code** - Some weddings may have a shared RSVP code

### Invitation Details Shown
- **Couple Names**
- **Wedding Date**
- **Venue Name**
- **Venue Address**
- **Event List** - All public events with times
- **RSVP Link** - Direct link to RSVP form

### Access Levels
- **Public** - Anyone can view the website
- **Password Protected** - Requires password to view
- **Invite Only** - Only guests with invite tokens can view

---

## 🔔 Important Dates & Deadlines

### Key Dates Guests Should Know
- **Wedding Date** - Main wedding date
- **RSVP Deadline** - Date by which to respond (if set)
- **Hotel Booking Deadline** - Last date to book hotel rooms at special rate
- **Event Dates** - Dates for all wedding events (ceremony, reception, etc.)

---

## 📋 What Guests Can Do

### Actions Available to Guests
1. **View Wedding Information**
   - See couple details, date, venue
   - View schedule of events
   - Read the couple's story
   - Meet the wedding party
   - Check FAQs

2. **RSVP**
   - Respond to invitation
   - Answer RSVP questions
   - Add plus-one information
   - Update RSVP if needed
   - Leave message for couple

3. **Plan Travel**
   - View venue location
   - Get directions
   - See hotel options
   - Book accommodations
   - Check travel information

4. **Shop Registry**
   - View registry links
   - Contribute to cash funds
   - See gift options

5. **Contact the Couple**
   - Send messages via contact form
   - Ask questions
   - Get in touch

6. **Share & Celebrate**
   - View photos
   - Read the story
   - Learn about the couple

---

## 🚫 What Guests Cannot See

### Private/Admin-Only Information
- Guest list (other guests' information)
- RSVP statistics
- Internal notes about guests
- Campaign analytics
- Activity logs
- Admin settings
- Seating arrangements (unless made public)
- Private events
- Internal tags and groupings

---

## 📍 Example Guest Journey

1. **Receive Invitation**
   - Email or SMS with invite code
   - Click link to envelope landing page

2. **View Invitation Details**
   - See couple names, date, venue
   - View event schedule
   - Click to RSVP

3. **RSVP**
   - Enter invite code or use link
   - Answer questions (meal choice, dietary restrictions, etc.)
   - Submit RSVP

4. **Explore Website**
   - Read the couple's story
   - Meet the wedding party
   - Check schedule details
   - View travel information
   - Browse registry

5. **Plan Attendance**
   - Book hotel if needed
   - Get directions to venue
   - Check FAQs for questions
   - Contact couple if needed

6. **Celebrate**
   - View photos
   - Contribute to registry/cash funds
   - Get excited for the big day!

---

## 💡 Tips for Guests

- **Save the Date:** Add the wedding date to your calendar
- **RSVP Early:** Respond by the deadline to help with planning
- **Check FAQs:** Common questions are answered there
- **Book Hotels Early:** Room blocks may have limited availability
- **Contact Form:** Use it for questions - the couple will respond
- **Update RSVP:** If your plans change, you can update your RSVP

---

## 📞 Need Help?

If guests have questions or need assistance:
1. **Check the FAQ page** - Most common questions are answered there
2. **Use the Contact Form** - Send a message to the couple
3. **Contact Wedding Party** - For urgent matters, reach out to a wedding party member

---

*This information is based on the public-facing features of the wedding platform. The actual information available may vary depending on what the couple has configured for their specific wedding.*
