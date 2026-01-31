# Homepage Video Setup Instructions

Your homepage is now configured to use a full-screen looping video background!

## Quick Setup (3 Steps)

### Step 1: Install Required Tools

You need `yt-dlp` (to download YouTube videos) and `ffmpeg` (to optimize them).

**On macOS (using Homebrew):**
```bash
brew install yt-dlp ffmpeg
```

**On macOS (using pip):**
```bash
pip3 install yt-dlp
brew install ffmpeg
```

**On Linux:**
```bash
sudo apt update
sudo apt install yt-dlp ffmpeg
```

### Step 2: Download and Optimize the Video

Run the provided script:
```bash
./scripts/download-youtube-video.sh
```

This will:
- Download the YouTube video (https://www.youtube.com/watch?v=s-G9OQ3bJaQ)
- Optimize it for web use (compress, resize if needed, remove audio)
- Limit it to 30 seconds (will loop automatically)
- Save it as `public/videos/wedding-splash.mp4`

### Step 3: Start Your Dev Server

```bash
npm run dev
```

Visit `http://localhost:3000` and you should see your video playing!

## How It Works

The homepage (`app/page.tsx`) uses the `VideoSplash` component which:
- Automatically plays the video on page load (muted, to comply with browser policies)
- Loops the video continuously
- Covers the entire screen
- Falls back to a static poster image if the video fails to load
- Maintains the clickable hotspots over the video

## Customization Options

### Use a Different Video

Edit the script at `scripts/download-youtube-video.sh` and change the `VIDEO_URL` variable, then re-run the script.

### Manual Video Upload

If you already have a video file, simply copy it to:
```
public/videos/wedding-splash.mp4
```

**Recommended specifications:**
- Format: MP4 (H.264 codec)
- Resolution: 1920x1080 or higher
- File size: Under 10MB
- Duration: 10-30 seconds (it will loop)
- No audio needed (will be muted anyway)

### Optimize a Local Video File

If you have a video file and want to optimize it:

```bash
ffmpeg -i your-video.mov \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  -c:v libx264 \
  -preset slow \
  -crf 23 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -an \
  public/videos/wedding-splash.mp4
```

## Troubleshooting

### Video doesn't play
- Check browser console for errors
- Ensure the file exists at `public/videos/wedding-splash.mp4`
- Try a different browser (Chrome/Firefox/Safari)
- Check file permissions

### Video is too large
- Re-run the optimization with a higher CRF value (e.g., `-crf 28` instead of `-crf 23`)
- Reduce resolution: `-vf scale=1280:720`
- Reduce framerate: `-r 24`

### YouTube download fails
- Check your internet connection
- Try updating yt-dlp: `pip3 install --upgrade yt-dlp`
- Some videos may be region-locked or have download restrictions

## Browser Compatibility

The video background works in all modern browsers:
- ✅ Chrome/Edge (v88+)
- ✅ Firefox (v85+)
- ✅ Safari (v14+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Note:** Videos must be muted to autoplay in browsers (this is a browser security policy, not a bug).

## Performance Tips

- Keep video file size under 10MB for fast loading
- Use MP4 format with H.264 codec for best compatibility
- Consider providing a WebM version for better compression (optional)
- Test on mobile devices - they may have different video handling

## Need Help?

If you run into issues, check:
1. File exists at the correct path
2. File permissions are correct
3. Browser console for error messages
4. Network tab in dev tools to see if video is loading
