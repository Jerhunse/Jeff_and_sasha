# Quick Start: Manual Video Download

If you prefer to download the video manually (without installing command-line tools), follow these steps:

## Option 1: Use an Online YouTube Downloader

1. **Visit a YouTube downloader website** (any of these work):
   - https://ytmp3.nu
   - https://savefrom.net
   - https://y2mate.com
   - https://en.savefrom.net

2. **Paste the video URL:**
   ```
   https://www.youtube.com/watch?v=s-G9OQ3bJaQ
   ```

3. **Download the video:**
   - Choose MP4 format
   - Select 1080p quality if available (or highest available)
   - Click Download

4. **Save the video file as:**
   ```
   wedding-splash.mp4
   ```

5. **Move the file to:**
   ```
   /Users/jefferyerhunse/GitRepos/wedding-platform/public/videos/wedding-splash.mp4
   ```

6. **Start your dev server:**
   ```bash
   npm run dev
   ```

7. **Visit:** `http://localhost:3000`

## Option 2: Use Browser Extensions

Many browsers have YouTube downloader extensions:
- **Chrome/Edge:** "Video Downloader Plus"
- **Firefox:** "Video DownloadHelper"

## That's It!

Once the file is in place, the homepage will automatically:
- ✅ Play the video on page load
- ✅ Loop continuously
- ✅ Cover the entire screen
- ✅ Be muted (browser requirement for autoplay)
- ✅ Maintain clickable hotspots over the video

## File Location
Make sure your video is saved at exactly this path:
```
public/videos/wedding-splash.mp4
```

The homepage is already configured to use this video file!
