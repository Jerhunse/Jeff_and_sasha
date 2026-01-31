# RSVP QR Code Feature

## Overview

The wedding platform now includes QR code functionality that allows guests to quickly access the RSVP form by scanning a code with their phone's camera.

## Features Implemented

### 1. **QR Code on RSVP Landing Page**
- **Location**: `/rsvp/{slug}`
- Displays a scannable QR code at the bottom of the RSVP lookup page
- Guests can scan the code to share the RSVP page with others
- Automatically generates the full URL based on the wedding slug

### 2. **RSVP Section on Main Wedding Page**
- **Location**: Wedding homepage (after Travel section)
- New dedicated RSVP section with:
  - Beautiful section header matching the site's design
  - Call-to-action button to RSVP
  - RSVP deadline display (if set)
  - Embedded QR code for easy mobile access
  - Consistent styling with other sections

### 3. **Admin QR Code Management**
- **Location**: `/admin/qr-code`
- Accessible from the Admin Dashboard Quick Actions
- Features:
  - **Live Preview**: See the QR code with couple names
  - **Adjustable Size**: Slider control (200-600px)
  - **Multiple Download Formats**:
    - SVG (best for print quality)
    - PNG (good for digital use)
  - **URL Copy**: One-click copy of the RSVP URL
  - **Usage Tips**: Built-in guidance for printing and using the QR code

### 4. **Reusable Components**

#### `RsvpQrCode`
Basic QR code component for embedding in pages.

```tsx
<RsvpQrCode
  rsvpUrl="https://yoursite.com/rsvp/slug"
  title="Scan to RSVP"
  description="Point your camera here"
  size={200}
/>
```

#### `PrintableRsvpQrCode`
Full-featured admin component with download capabilities.

```tsx
<PrintableRsvpQrCode
  weddingSlug="your-slug"
  partner1Name="John"
  partner2Name="Jane"
/>
```

## Technical Details

### Dependencies Added
- `qrcode.react` - React QR code generation library
- `@types/qrcode.react` - TypeScript type definitions

### QR Code Specifications
- **Error Correction Level**: High (H) - Can recover from up to 30% damage
- **Format**: SVG (scalable) or PNG (raster)
- **Colors**: Black on white for maximum contrast and scan reliability
- **Margin**: Included automatically (quiet zone)

### Files Created/Modified

**New Components:**
- `/components/wedding/rsvp-qr-code.tsx` - Basic QR code component
- `/components/wedding/rsvp-section.tsx` - Full RSVP section with QR code
- `/components/wedding/printable-rsvp-qr.tsx` - Admin printable QR component
- `/components/wedding/dresscode-section.tsx` - Bonus dresscode section

**New Pages:**
- `/app/(admin)/admin/qr-code/page.tsx` - Admin QR code management page

**Modified Files:**
- `/app/(public)/rsvp/[code]/rsvp-lookup-form.tsx` - Added QR code display
- `/components/wedding/wedding-page-client.tsx` - Added RSVP section
- `/components/wedding/index.ts` - Exported new components
- `/app/(admin)/admin/overview/page.tsx` - Added QR code quick action
- `/package.json` - Added QR code dependencies

## Usage Guide

### For Guests (Front-End)

1. **On RSVP Page**: Guests visiting `/rsvp/{slug}` will see a QR code at the bottom
2. **On Wedding Homepage**: A dedicated RSVP section includes a QR code
3. **Scanning**: Point phone camera at the code → Automatically opens RSVP page

### For Couple (Admin)

1. **Access**: Go to Admin Dashboard → "Download QR Code" (Quick Actions)
2. **Customize**: 
   - Adjust size using the slider
   - Preview with your names
3. **Download**:
   - Click "Download SVG" for printing invitations
   - Click "Download PNG" for digital sharing
4. **Use**:
   - Include on physical invitations
   - Display on save-the-date cards
   - Show on screens at the venue
   - Share on social media
   - Include in email invitations

### Best Practices

1. **Print Quality**: Always use SVG format for printed materials
2. **Size**: Minimum 2cm × 2cm for reliable scanning
3. **Contrast**: Ensure good contrast - black QR on white background
4. **Testing**: Test with multiple phones before mass printing
5. **White Space**: Include adequate margin around the QR code
6. **Context**: Add text like "Scan to RSVP" near the code

## Styling

The QR code components use your existing design system:
- Gold accent colors (`--color-gold`)
- Consistent typography (serif headings, sans-serif body)
- Card-based layouts matching other sections
- Responsive design for all screen sizes

## Security & Privacy

- QR codes link to the public RSVP page (not individual guest tokens)
- No sensitive guest information is embedded in the code
- Guests still need to look up their invitation or enter details

## Future Enhancements (Optional)

Potential additions you could make:
- [ ] Generate individual guest QR codes with pre-filled data
- [ ] Analytics tracking for QR code scans
- [ ] Batch generation of QR codes for physical invitations
- [ ] Custom QR code colors/branding
- [ ] QR code with embedded logo
- [ ] Print templates with QR codes

## Support

If you need to customize the QR code feature:
- Adjust sizes in the component props
- Change colors by modifying the `fgColor` and `bgColor` props
- Update text and descriptions in the component files
- Modify the error correction level if needed (L, M, Q, H)
