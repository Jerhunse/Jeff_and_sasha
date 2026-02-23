# Seat Finder QR Code Feature Design

**Date:** February 22, 2026  
**Author:** AI Assistant  
**Status:** Approved

## Overview

Add QR code generation for the seat-finder page to the existing admin QR code management interface. This allows couples to download and print a QR code that links directly to their seat-finder page, enabling guests to quickly access the seat search functionality by scanning with their phone camera.

## Requirements

### Functional Requirements
- Generate QR code containing the seat-finder URL (`/{slug}/seat-finder`)
- Display QR code preview in admin interface
- Downloadable in SVG and PNG formats
- Adjustable size (200-600px)
- Copy URL to clipboard functionality
- Include usage tips and best practices

### Non-Functional Requirements
- Reuse existing QR code generation patterns
- No database schema changes needed
- No modifications to seat-finder page required
- Works with existing `qrcode.react` library
- High error correction (H level - 30% damage recovery)

## Architecture

### Technology Stack
- **QR Generation:** `qrcode.react` (already installed)
- **UI Components:** Existing card/button components
- **Pattern:** Clone existing `PrintableRsvpQrCode` component

### File Structure
```
app/(admin)/admin/qr-code/
└── page.tsx                              # Modified (add new section)

components/wedding/
└── printable-seat-finder-qr.tsx         # New component
```

## Design Specification

### Admin Interface

**Location:** `/admin/qr-code` (existing page)

**Layout:**
```
┌─────────────────────────────────────┐
│ QR Code Management                  │
├─────────────────────────────────────┤
│                                     │
│ RSVP QR Code                        │
│ [Existing functionality]            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│ Seat Finder QR Code       [NEW]    │
│ ┌───────────────────────────────┐  │
│ │ Preview Card                  │  │
│ │   Find Your Seat              │  │
│ │   ┌─────────────┐             │  │
│ │   │             │             │  │
│ │   │  QR CODE    │             │  │
│ │   │             │             │  │
│ │   └─────────────┘             │  │
│ │   Scan to find your table     │  │
│ └───────────────────────────────┘  │
│                                     │
│ Size: [========○====] 400px        │
│                                     │
│ [Download SVG]  [Download PNG]      │
│ [Copy URL]                          │
│                                     │
│ Usage Tips:                         │
│ • Print on venue signage            │
│ • Include in wedding programs       │
│ • Display at reception entrance     │
└─────────────────────────────────────┘
```

### QR Code Content

**URL Format:**
```
https://yoursite.com/{wedding-slug}/seat-finder
```

**Example:**
```
https://weddingplatform.com/thompson-wedding/seat-finder
```

### QR Code Specifications

**Technical Settings:**
- **Error Correction:** High (H) - Recovers from up to 30% damage
- **Format:** SVG (vector, scalable) or PNG (raster, fixed size)
- **Colors:** 
  - Foreground: Black (#000000)
  - Background: White (#FFFFFF)
- **Margin:** Included (quiet zone for scan reliability)
- **Size Range:** 200px - 600px (adjustable via slider)

**Visual Presentation:**
- Title: "Find Your Seat"
- Subtitle: "{Partner1} & {Partner2}'s Wedding"
- Instruction: "Scan to find your table assignment"
- URL display for manual entry

### Component Design

**New Component:** `PrintableSeatFinderQrCode`

**Props:**
```typescript
interface PrintableSeatFinderQrCodeProps {
  weddingSlug: string
  partner1Name: string
  partner2Name: string
  baseUrl?: string // Defaults to process.env.NEXT_PUBLIC_BASE_URL
}
```

**Features:**
1. QR code preview with wedding names
2. Size adjustment slider (200-600px)
3. Download SVG button
4. Download PNG button
5. Copy URL button
6. Usage tips section

**Pattern:** Clone from existing `PrintableRsvpQrCode` component with updated:
- URL path (to `/seat-finder`)
- Text labels (seat-finding context)
- Instructions (table assignment vs RSVP)

## Use Cases

### Primary Use Cases

**1. Venue Signage**
- Welcome sign at venue entrance
- Directional signs to reception area
- Displays near coat check or restrooms
- Signs at bar/cocktail area

**2. Printed Materials**
- Wedding ceremony programs
- Reception programs
- Place cards (individual or grouped)
- Table number cards
- Menu cards

**3. Digital Distribution**
- Wedding website footer
- Email reminders to guests
- Social media posts
- Digital save-the-dates
- Confirmation emails

**4. Day-of Setup**
- TV/monitor displays at venue
- Check-in table signage
- Cocktail hour display boards
- Photo booth area

### User Flows

**Admin Flow:**
1. Navigate to Admin Dashboard
2. Click "QR Codes" in navigation (or quick action)
3. Scroll to "Seat Finder QR Code" section
4. Adjust size slider if needed (default 400px)
5. Click "Download SVG" for print materials
   - OR Click "Download PNG" for digital use
6. Optional: Click "Copy URL" to share link directly
7. Print/embed QR code in desired materials

**Guest Flow:**
1. Guest arrives at venue and sees QR code
2. Opens phone camera app
3. Points camera at QR code
4. Phone displays notification "Open [URL]"
5. Taps notification
6. Browser opens seat-finder page
7. Sees "Find Your Seat" search interface
8. Enters name or phone number
9. Views table assignment and tablemates

## Implementation Details

### Files to Create

**`components/wedding/printable-seat-finder-qr.tsx`**
- React Client Component
- Props: weddingSlug, partner1Name, partner2Name, baseUrl
- State: size (200-600px)
- Functions: downloadSVG(), downloadPNG(), copyURL()
- UI: Card with QR preview, controls, and tips

### Files to Modify

**`app/(admin)/admin/qr-code/page.tsx`**
- Add import for `PrintableSeatFinderQrCode`
- Add new section after RSVP QR section
- Pass wedding data as props
- Maintain existing RSVP QR functionality

**`components/wedding/index.ts`** (optional)
- Export new `PrintableSeatFinderQrCode` component

### Dependencies

**No new dependencies needed:**
- Uses existing `qrcode.react` library
- Uses existing UI components (Card, Button, Slider, etc.)
- Uses existing Lucide icons

### Code Reuse Strategy

**Clone Pattern:**
1. Copy `PrintableRsvpQrCode` → `PrintableSeatFinderQrCode`
2. Update URL construction:
   - From: `/rsvp/${weddingSlug}`
   - To: `/${weddingSlug}/seat-finder`
3. Update text labels:
   - Title: "Scan to Find Your Seat"
   - Description: "Point your camera at this code to view your table assignment"
4. Update usage tips (venue signage vs invitation context)

## Error Handling

### Edge Cases

**Invalid Wedding Slug:**
- QR code still generates
- If scanned, leads to 404 page (handled by Next.js)
- Admin sees warning if slug is empty

**Unpublished Wedding:**
- QR code generates successfully
- Seat-finder page returns 404 (existing behavior)
- No special handling needed

**No Seating Chart:**
- QR code works (URL is valid)
- Guests can search but see "no results"
- Existing seat-finder handles this gracefully

**Damaged QR Code:**
- High (H) error correction handles up to 30% damage
- Codes remain scannable even if partially obscured/damaged

### Browser/Device Compatibility

**QR Scanning:**
- iOS 11+ (built into Camera app)
- Android 8+ (built into Camera app or Google Lens)
- Works on all modern smartphones
- No special app installation required

**Admin Interface:**
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for tablet/desktop
- Download functionality works cross-browser

## Security & Privacy

**No Privacy Concerns:**
- QR code contains only public URL
- No guest-specific information embedded
- No authentication tokens in URL
- Safe to print publicly

**URL Security:**
- Uses standard HTTPS
- No query parameters with sensitive data
- Public route (no login required)

## Testing Strategy

### Manual Testing

**Admin Interface:**
- [ ] QR code preview displays correctly
- [ ] Size slider adjusts preview (200-600px)
- [ ] SVG download works (file opens in viewer)
- [ ] PNG download works (image displays correctly)
- [ ] Copy URL button copies correct link
- [ ] URL includes correct wedding slug
- [ ] Wedding names display properly
- [ ] Responsive on tablet/desktop

**QR Code Scanning:**
- [ ] iOS camera recognizes QR code
- [ ] Android camera recognizes QR code
- [ ] Tapping notification opens browser
- [ ] Correct URL loads (seat-finder page)
- [ ] Page displays search interface
- [ ] Search functionality works after scanning

**Print Quality:**
- [ ] SVG prints clearly at various sizes
- [ ] PNG prints clearly at 300+ DPI
- [ ] QR code scannable from printed material
- [ ] Adequate white space around code

### Print Testing

**Test Procedure:**
1. Download SVG at 400px
2. Import into design software (e.g., Canva, Photoshop)
3. Scale to 2" × 2" minimum
4. Print on standard paper
5. Scan with multiple phones (iOS & Android)
6. Verify URL opens correctly

## Best Practices

### For Couples

**Size Guidelines:**
- Minimum 2cm × 2cm (0.8" × 0.8") for reliable scanning
- Recommended: 5cm × 5cm (2" × 2") or larger
- Test printed code before mass printing

**Placement Tips:**
- High-traffic areas (entrance, bar, restrooms)
- Eye-level positioning
- Good lighting (avoid dark corners)
- Multiple locations for large venues

**Format Selection:**
- Use SVG for printed materials (scalable, crisp)
- Use PNG for digital displays (universal support)

**Context Text:**
- Include "Find Your Seat" or similar text
- Add couple names for branding
- Consider adding table numbers nearby for context

### For Printing

**Quality Settings:**
- SVG: Vector format, scales infinitely
- PNG: Export at 300 DPI minimum for print
- Ensure good contrast (black on white)
- Include quiet zone (margin) around code

**Testing:**
- Print test copy first
- Scan with multiple devices
- Check from various distances (1-2 feet ideal)
- Verify under venue lighting conditions

## Performance Considerations

**QR Code Generation:**
- Happens client-side (instant)
- No server requests needed
- Lightweight SVG/PNG files
- No database queries

**Scanning Performance:**
- Native camera app (OS-level)
- Instant recognition on modern phones
- No app download required
- Works offline once page loads

## Future Enhancements

**Potential Additions:**

1. **Branded QR Codes**
   - Custom colors (matching wedding theme)
   - Embedded couple photo/logo in center
   - Decorative borders/frames

2. **Analytics Tracking**
   - Track number of scans
   - Peak scanning times
   - Device types used

3. **Batch Generation**
   - Generate individual guest QR codes
   - Pre-fill search with guest name
   - Useful for place cards

4. **Design Templates**
   - Pre-designed QR card templates
   - Integration with invitation design
   - Multiple style options

5. **Short URLs**
   - Custom short links (e.g., wdng.co/thompson)
   - Easier to type manually if needed
   - Cleaner QR codes (less dense)

## Success Metrics

**Feature Complete When:**
- [ ] QR code generates correctly with seat-finder URL
- [ ] Admin can adjust size and download SVG/PNG
- [ ] Copy URL button works
- [ ] QR code scans on iOS and Android devices
- [ ] Scanned URL opens seat-finder page
- [ ] Usage tips display clearly
- [ ] No TypeScript/linter errors
- [ ] Production build succeeds

**User Experience Success:**
- Guests can scan and access seat finder in < 10 seconds
- QR code works from printed materials
- No confusion about what the code does
- Seamless integration with existing admin interface

## Documentation

**Update Required:**
- Add to `app/(public)/[slug]/seat-finder/README.md`
- Update `QR_CODE_FEATURE.md` with seat-finder section
- Add usage examples in admin interface
- Include in user documentation/help guides

---

**Next Steps:** Create implementation plan with step-by-step tasks.
