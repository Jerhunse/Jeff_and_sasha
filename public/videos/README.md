# Wedding Videos

This directory is for video assets used in the wedding website.

## Video Splash Background

The main splash page uses a full-screen video background. To add your custom video:

1. **Prepare your video file:**
   - Recommended format: MP4 (H.264 codec) for best browser compatibility
   - Optional: Also provide a WebM version for better compression
   - Recommended resolution: 1920x1080 (1080p) or higher
   - Keep file size under 10MB for better loading performance
   - Duration: 10-30 seconds (it will loop automatically)

2. **Name your video file:**
   - `wedding-splash.mp4` (required)
   - `wedding-splash.webm` (optional, for fallback)

3. **Place the video file(s) in this directory:**
   ```
   public/videos/wedding-splash.mp4
   public/videos/wedding-splash.webm (optional)
   ```

4. The video will automatically:
   - Autoplay when the page loads (muted to comply with browser policies)
   - Loop continuously
   - Cover the entire screen
   - Fall back to the static poster image if the video fails to load

## Tips for Best Results

- **Optimize your video:** Use tools like HandBrake or FFmpeg to compress the video without losing quality
- **Test on mobile:** Mobile devices may handle video differently, so test on various devices
- **Consider bandwidth:** Smaller file sizes load faster and use less data for mobile users
- **Aspect ratio:** Wide aspect ratios (16:9) work best for full-screen backgrounds
- **Content:** Choose a visually appealing video that doesn't distract from the clickable regions

## Example FFmpeg Commands

Convert to optimized MP4:
```bash
ffmpeg -i input.mov -vcodec h264 -acodec aac -strict -2 -preset slow -crf 23 wedding-splash.mp4
```

Convert to WebM:
```bash
ffmpeg -i input.mov -c:v libvpx-vp9 -b:v 2M -c:a libvorbis wedding-splash.webm
```

Resize to 1080p:
```bash
ffmpeg -i input.mov -vf scale=1920:1080 -vcodec h264 -acodec aac wedding-splash.mp4
```
