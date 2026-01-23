# Complete Wedding Details Reference

This document lists all wedding details that can be stored and displayed in the wedding platform system.

## Core Wedding Information (Couple Model)

### Basic Information
- **Partner 1 Name** (`partner1Name`) - First partner's name
- **Partner 2 Name** (`partner2Name`) - Second partner's name
- **Wedding Date** (`weddingDate`) - Main wedding date/time
- **Slug** (`slug`) - URL-friendly identifier (e.g., "jeff-and-sasha")
- **Timezone** (`timezone`) - Default: "America/New_York"

### Venue Information
- **Venue Name** (`venueName`) - Name of the wedding venue
- **Venue Address** (`venueAddress`) - Street address
- **Venue City** (`venueCity`) - City
- **Venue State** (`venueState`) - State/Province
- **Venue Zip** (`venueZip`) - Postal/ZIP code
- **Venue Country** (`venueCountry`) - Country

### Theme & Branding
- **Primary Color** (`primaryColor`) - Default: "#6b9c7f"
- **Secondary Color** (`secondaryColor`) - Default: "#f5f5f0"
- **Accent Color** (`accentColor`) - Default: "#d4a574"
- **Heading Font** (`fontHeading`) - Default: "Playfair Display"
- **Body Font** (`fontBody`) - Default: "Inter"
- **Corner Radius** (`cornerRadius`) - "small", "medium", or "large" (Default: "medium")
- **Show Florals** (`showFlorals`) - Boolean, default: true
- **Hero Image URL** (`heroImageUrl`) - Main hero image
- **Logo Image URL** (`logoImageUrl`) - Logo/branding image

### Privacy & Security
- **Privacy Mode** (`privacyMode`) - Options:
  - `PUBLIC` - Anyone can view
  - `PASSWORD` - Requires password
  - `INVITE_ONLY` - Only guests with invite token
- **Site Password** (`sitePassword`) - Hashed password for PASSWORD mode
- **Is Published** (`isPublished`) - Boolean, default: false
- **Custom Domain** (`customDomain`) - e.g., "jeffandsasha.com"

### Settings
- **Allow Plus Ones** (`allowPlusOnes`) - Boolean, default: true
- **RSVP Deadline** (`rsvpDeadline`) - Optional deadline date
- **Max Capacity** (`maxCapacity`) - Total venue capacity (integer)

### Integrations
- **Stripe Account ID** (`stripeAccountId`) - For cash fund payments
- **Google Maps API Key** (`googleMapsApiKey`) - For map embeds

---

## Events & Schedule

Each event (`Event` model) includes:
- **Name** - e.g., "Ceremony", "Reception", "Rehearsal Dinner"
- **Description** - Event description
- **Start Time** (`startTime`) - DateTime
- **End Time** (`endTime`) - Optional DateTime
- **Location** - Location name
- **Address** - Full address string
- **Venue** - Venue name
- **Attire** - Dress code (e.g., "Black Tie", "Cocktail")
- **Visibility** (`visibility`) - Options:
  - `PUBLIC` - Visible to all guests
  - `PRIVATE` - Only specific tags
  - `INVITE_ONLY` - Must be explicitly invited
- **Capacity** - Event-specific capacity
- **Order** - Display order (integer)

---

## Guest Management

### Household Information
- **Household Name** - e.g., "The Smith Family"
- **Address** - Reference to Address model
- **Max Guests** - Maximum allowed from this household
- **Notes** - Household notes

### Guest Details
- **First Name** (`firstName`)
- **Last Name** (`lastName`)
- **Email** (`email`)
- **Phone** (`phone`)
- **Address** - Individual address (optional, can use household address)
- **Household** - Reference to household
- **Is Primary Contact** (`isPrimaryContact`) - Boolean
- **Relationship** - e.g., "spouse", "child", "parent"
- **Age** - Integer
- **Is Child** (`isChild`) - Boolean
- **Is VIP** (`isVIP`) - Boolean
- **Do Not Contact** (`doNotContact`) - Boolean

### Invitation Details
- **Invite Token** (`inviteToken`) - Unique token for RSVP link
- **Invited By** (`invitedBy`) - Guest ID who invited them (for plus-ones)
- **Allow Plus One** (`allowPlusOne`) - Boolean
- **Plus One Policy** (`plusOnePolicy`) - Options:
  - `none` - No plus one allowed
  - `unnamed` - Plus one allowed but name not required
  - `named` - Plus one allowed and name required

### Tags & Groups
- **Tags** - Multiple tags can be assigned (e.g., "Wedding Party", "Family", "Friends")
- **Tag Colors** - Each tag can have a custom color
- **Tag Icons** - Lucide icon names

---

## RSVP System

### RSVP Questions
Each question (`RSVPQuestion`) includes:
- **Text** - Question text
- **Description** - Help text
- **Type** (`type`) - Options:
  - `TEXT` - Free text input
  - `TEXTAREA` - Long text input
  - `SINGLE_SELECT` - Radio buttons
  - `MULTI_SELECT` - Checkboxes
  - `YES_NO` - Boolean
  - `MEAL_CHOICE` - Meal selection
  - `DIETARY` - Dietary restrictions
  - `PLUS_ONE` - Plus-one capture
  - `NUMBER` - Numeric input
  - `DATE` - Date picker
  - `EMAIL` - Email input
  - `PHONE` - Phone input
- **Options** - Array of options (for SELECT types)
- **Placeholder** - Input placeholder text
- **Required** - Boolean
- **Order** - Display order
- **Event ID** - Optional, null = applies to all events
- **Visibility Rule** - JSON rule for conditional visibility

### RSVP Responses
Each response (`RSVPResponse`) includes:
- **Guest** - Reference to guest
- **Event** - Optional event reference (null = general RSVP)
- **Status** (`status`) - Options:
  - `PENDING`
  - `YES`
  - `NO`
  - `MAYBE`
- **Answers JSON** - JSON object of question_id: answer
- **Message** - Guest message/notes
- **Plus One Name** - If applicable
- **Plus One Email** - If applicable
- **Plus One Answers** - JSON for plus-one's answers
- **Responded At** - Timestamp

---

## Travel & Accommodations

### Hotel Blocks (`HotelBlock`)
Each hotel includes:
- **Name** - Hotel name
- **Description** - Hotel description
- **Address** - Street address
- **City** - City
- **State** - State/Province
- **Zip** - Postal code
- **Phone** - Contact phone
- **Website** - Hotel website URL
- **Code** - Booking code for room block
- **Start Date** - Block start date
- **End Date** - Block end date
- **Deadline** - Booking deadline
- **Special Rate** - Rate description
- **Map Pin** - Lat,Lng coordinates
- **Distance From Venue** - Text description
- **Amenities** - Amenities description
- **Order** - Display order

---

## Registry

### Registry Links (`RegistryLink`)
Each registry link includes:
- **Label** - e.g., "Amazon", "Crate & Barrel"
- **URL** - Registry URL
- **Description** - Optional description
- **Image URL** - Optional image
- **Order** - Display order

### Cash Funds (`CashFund`)
Each cash fund includes:
- **Title** - Fund title
- **Description** - Fund description
- **Image URL** - Optional image
- **Goal** - Target amount (float)
- **Received** - Amount received (float, default: 0)
- **Stripe Price ID** - Stripe integration
- **Is Active** - Boolean, default: true

### Cash Fund Contributions (`CashFundContribution`)
Each contribution includes:
- **Name** - Contributor name
- **Email** - Contributor email
- **Message** - Optional message
- **Amount** - Contribution amount
- **Currency** - Default: "usd"
- **Stripe Payment ID** - Payment reference
- **Status** - "pending", "completed", "failed"

---

## Wedding Party

### Wedding Party Members (`WeddingPartyMember`)
Each member includes:
- **Name** - Member name
- **Role** (`role`) - Options:
  - `BRIDE`
  - `GROOM`
  - `BRIDESMAID`
  - `GROOMSMAN`
  - `MAID_OF_HONOR`
  - `BEST_MAN`
  - `OFFICIANT`
  - `FLOWER_GIRL`
  - `RING_BEARER`
  - `USHER`
  - `READER`
  - `OTHER`
- **Role Label** - Custom label if role is OTHER
- **Bio** - Member biography
- **Image URL** - Member photo
- **Relationship** - e.g., "Sister of the bride"
- **Order** - Display order

---

## FAQs

### FAQ Items (`Faq`)
Each FAQ includes:
- **Question** - FAQ question
- **Answer** - FAQ answer
- **Category** - Optional category grouping
- **Order** - Display order

---

## Pages & Content

### Page Types (`PageType`)
- `HOME` - Home page
- `STORY` - Our story page
- `SCHEDULE` - Schedule page
- `TRAVEL` - Travel page
- `REGISTRY` - Registry page
- `FAQ` - FAQ page
- `GALLERY` - Gallery page
- `PARTY` - Wedding party page
- `CONTACT` - Contact page
- `CUSTOM` - Custom page

### Page Content (`Page`)
Each page includes:
- **Type** - Page type enum
- **Slug** - URL slug (e.g., "our-story")
- **Title** - Page title
- **Content JSON** - JSON structure of sections
- **Order** - Display order
- **Is Published** - Boolean
- **SEO** - Optional SEO metadata:
  - Meta Title
  - Meta Description
  - OG Image
  - Keywords

---

## Media Library

### Media Items (`Media`)
Each media item includes:
- **URL** - Media URL
- **Thumbnail URL** - Optional thumbnail
- **Filename** - Original filename
- **MIME Type** - File type
- **Size** - File size in bytes
- **Width** - Image width (if image)
- **Height** - Image height (if image)
- **Alt Text** - Accessibility alt text
- **Caption** - Media caption
- **Tags** - Array of tags for filtering
- **Uploaded By** - User ID who uploaded

---

## Campaigns & Invitations

### Campaign Types (`CampaignType`)
- `SAVE_THE_DATE`
- `INVITATION`
- `REMINDER`
- `UPDATE`
- `THANK_YOU`

### Campaign Status (`CampaignStatus`)
- `DRAFT`
- `SCHEDULED`
- `SENDING`
- `SENT`
- `PAUSED`
- `CANCELLED`

### Campaign Details (`Campaign`)
- **Name** - Internal campaign name
- **Type** - Campaign type
- **Status** - Campaign status
- **Subject** - Email subject
- **Template ID** - Reference to template
- **Custom HTML** - Custom HTML content
- **Custom Text** - Plain text version
- **SMS Message** - SMS content
- **Segment JSON** - JSON rules for targeting
- **Scheduled At** - Optional send time
- **Sent At** - Actual send time
- **Stats**:
  - Total Recipients
  - Sent
  - Delivered
  - Opened
  - Clicked
  - Bounced
  - Failed

### Invitation Status (`InvitationStatus`)
- `PENDING`
- `SCHEDULED`
- `SENT`
- `DELIVERED`
- `OPENED`
- `CLICKED`
- `REPLIED`
- `BOUNCED`
- `FAILED`
- `UNSUBSCRIBED`

### Invitation Details (`Invitation`)
- **Campaign** - Reference to campaign
- **Guest** - Reference to guest
- **Token** - Unique tracking token
- **Status** - Invitation status
- **Sent Via Email** - Boolean
- **Sent Via SMS** - Boolean
- **Email Address** - Recipient email
- **Phone Number** - Recipient phone
- **Tracking**:
  - Sent At
  - Delivered At
  - Opened At
  - Clicked At
  - Bounced At
  - Replied At
  - Unsubscribed At
- **Counts**:
  - Open Count
  - Click Count
- **Error Message** - If failed
- **Metadata** - JSON for additional data

---

## Seating Arrangements

### Seating Chart (`SeatingChart`)
- **Name** - e.g., "Reception", "Ceremony"
- **Description** - Optional description
- **Event** - Optional event reference
- **Tables** - Array of tables

### Table (`Table`)
- **Name** - e.g., "Table 1", "Head Table"
- **Capacity** - Number of seats
- **Shape** - "round", "rectangle", "oval"
- **Position** - X, Y coordinates on canvas
- **Seats** - Array of seat assignments

### Seat (`Seat`)
- **Guest** - Reference to guest
- **Seat Number** - Optional seat number
- **Notes** - e.g., "needs wheelchair access"

---

## Contact Messages

### Contact Message (`ContactMessage`)
- **Name** - Sender name
- **Email** - Sender email
- **Phone** - Optional phone
- **Subject** - Optional subject
- **Message** - Message content
- **Is Read** - Boolean
- **Is Resolved** - Boolean
- **Created At** - Timestamp

---

## Activity Logs

### Activity Actions (`ActivityAction`)
- `CREATED`
- `UPDATED`
- `DELETED`
- `IMPORTED`
- `MERGED`
- `TAG_ADDED`
- `TAG_REMOVED`
- `RSVP_CHANGED`
- `INVITE_SENT`
- `NOTE_ADDED`
- `BULK_UPDATED`
- `MESSAGE_SENT`
- `SEATING_UPDATED`

### Activity Log (`ActivityLog`)
- **Actor** - User who performed action
- **Action** - Activity action type
- **Entity Type** - e.g., "Guest", "Event", "Page"
- **Entity ID** - ID of affected entity
- **Description** - Action description
- **Meta** - JSON metadata
- **Created At** - Timestamp

### Guest Activity (`GuestActivity`)
- **Guest** - Reference to guest
- **Action** - Activity action
- **Description** - Action description
- **Changes** - JSON of what changed
- **User** - Who made the change
- **User Name** - User name
- **Can Undo** - Boolean
- **Undo Data** - JSON for undo
- **Undone At** - Timestamp if undone
- **Undone By** - User who undid

---

## Example Data Structure

Based on the seed file, here's an example wedding:

```json
{
  "slug": "jeff-and-sasha",
  "partner1Name": "Jeff",
  "partner2Name": "Sasha",
  "weddingDate": "2025-09-20T16:00:00Z",
  "venueName": "The Grand Ballroom",
  "venueAddress": "123 Main Street",
  "venueCity": "San Francisco",
  "venueState": "CA",
  "venueZip": "94102",
  "primaryColor": "#6b9c7f",
  "secondaryColor": "#f5f5f0",
  "accentColor": "#d4a574",
  "isPublished": true,
  "maxCapacity": 150,
  "events": [
    {
      "name": "Ceremony",
      "startTime": "2025-09-20T16:00:00Z",
      "endTime": "2025-09-20T17:00:00Z",
      "location": "The Grand Ballroom"
    },
    {
      "name": "Reception",
      "startTime": "2025-09-20T18:00:00Z",
      "endTime": "2025-09-20T23:00:00Z",
      "location": "The Grand Ballroom"
    }
  ],
  "rsvpQuestions": [
    {
      "text": "What is your meal choice?",
      "type": "MEAL_CHOICE",
      "options": ["Chicken", "Beef", "Fish", "Vegetarian"]
    }
  ]
}
```

---

## Notes

- All dates are stored as DateTime in UTC
- JSON fields store structured data (e.g., `contentJSON`, `answersJSON`, `segmentJSON`)
- Most optional fields are nullable in the database
- The system supports multiple weddings (couples) with unique slugs
- All relationships cascade on delete (when couple is deleted, related data is deleted)
- Indexes are created on frequently queried fields for performance
