# PWA Icons Setup Guide

## Overview
This app is configured as a Progressive Web App (PWA). When users add it to their home screen on mobile, it displays a professional icon.

## Current Configuration
- **App Name**: بەدواداچوونی خەرجی (Expense Tracker)
- **Short Name**: خەرجی
- **Theme Color**: #10b981 (Green)
- **Display**: Standalone (appears as native app)

## Icon Requirements
The app needs PNG icons in these sizes:
- 72x72 (Android)
- 96x96 (Android)
- 128x128
- 144x144
- 152x152
- 192x192 (Android default)
- 384x384
- 512x512 (PWA standard)

Plus maskable versions (192x192 and 512x512) for adaptive icons on newer Android.

## How to Generate Icons

### Option 1: Using ImageMagick (Recommended)
```bash
# Install ImageMagick if needed
# On Windows: choco install imagemagick
# On Mac: brew install imagemagick
# On Linux: sudo apt-get install imagemagick

# Generate all sizes
convert public/icon.svg -resize 72x72 public/icon-72x72.png
convert public/icon.svg -resize 96x96 public/icon-96x96.png
convert public/icon.svg -resize 128x128 public/icon-128x128.png
convert public/icon.svg -resize 144x144 public/icon-144x144.png
convert public/icon.svg -resize 152x152 public/icon-152x152.png
convert public/icon.svg -resize 192x192 public/icon-192x192.png
convert public/icon.svg -resize 384x384 public/icon-384x384.png
convert public/icon.svg -resize 512x512 public/icon-512x512.png
```

### Option 2: Online Tools
1. Visit https://svgtopng.com/ or similar
2. Upload `public/icon.svg`
3. Generate and download each size

### Option 3: Use a PWA Generator
- https://www.pwabuilder.com/ - Full PWA generation tool
- Upload icon and it generates all sizes automatically

### Option 4: Design Tools
- **Figma**: Import SVG, export as PNG multiple times
- **Adobe XD**: Import SVG, export as PNG
- **Sketch**: Import SVG, export as PNG

## File Locations
Once generated, place PNG files in:
```
public/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
├── icon-512x512.png
├── icon-192x192-maskable.png  (optional, for adaptive icons)
├── icon-512x512-maskable.png  (optional, for adaptive icons)
└── manifest.webmanifest
```

## Testing
1. Deploy the app
2. Visit on mobile browser
3. Look for "Add to Home Screen" option
4. App should show with the configured icon

## Current Status
✅ Manifest configured  
✅ Service worker ready  
✅ SVG icon template created  
⏳ PNG icons need to be generated and added

## Next Steps
1. Generate PNG files from the SVG using one of the methods above
2. Place them in `public/` folder
3. Commit and push
4. Test on mobile device

