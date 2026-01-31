# Background Image Update

## Issue
The website background was not displaying the new ruysch-3.jpg image because the `TextureLayer` component in the layout was using a fixed background with the old Gemini image.

## Solution
Updated the `.texture-layer` CSS class to use the new background image.

## Changes Made

### 1. Copied Background Image
**Source**: `/website images/ruysch-3.jpg`  
**Destination**: `/public/background-ruysch.jpg`

This makes the image accessible to the web application.

### 2. Updated Texture Layer CSS
**File**: `src/styles/components.css`

Changed line 24 from:
```css
background: var(--bg-linen) url("/Gemini_Generated_Image_x4mqmsx4mqmsx4mq-Firefly-Upscaler-2x-scale.png") center center;
```

To:
```css
background: var(--bg-linen) url("/background-ruysch.jpg") center center;
```

The texture layer is a fixed-position element that sits behind all content with:
- Full viewport coverage (`inset: 0`)
- Fixed positioning (`position: fixed`)
- Background size set to cover
- Fixed attachment (doesn't scroll)
- Subtle overlay for text readability

### 3. Cleaned Up Body Styles
**File**: `app/globals.css`

Removed redundant background-image styles from the body element since the TextureLayer component handles the background.

## How It Works

The website uses a layered approach for backgrounds:
1. **TextureLayer Component** - Fixed background layer (z-index: 0)
2. **App Shell** - Content wrapper (z-index: 1, positioned above texture)
3. **Subtle Overlay** - Linear gradient overlay on texture layer for text readability

The new ruysch-3.jpg image now appears as the fixed background across all pages of the website with a subtle overlay to ensure text remains readable.

## Result
The ruysch-3.jpg floral image is now displayed as the website background with proper coverage and positioning. The development server has automatically reloaded with the changes.
