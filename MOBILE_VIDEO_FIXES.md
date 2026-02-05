# Mobile Video Playback Fixes

## Problem
Videos were not playing on mobile devices due to mobile browser restrictions and autoplay policies.

## Changes Made

### 1. YouTube Embed Improvements (`hero-with-video.tsx`)
Enhanced the YouTube iframe embed with additional mobile-friendly parameters:

- **Added `iv_load_policy=3`**: Disables video annotations that can interfere on mobile
- **Added `frameBorder="0"`**: Ensures clean rendering
- **Added `loading="eager"`**: Prioritizes video loading
- **Extended `allow` attribute**: Added `accelerometer`, `gyroscope`, and `picture-in-picture` permissions for better mobile compatibility

### 2. HTML5 Video Enhancements
Applied to all native video components:
- `video-splash.tsx`
- `hero-section.tsx`
- `hero-code-gate.tsx`

#### Added Attributes:
- **`webkit-playsinline="true"`**: Forces inline playback on older iOS devices
- **`x5-playsinline="true"`**: Forces inline playback on WeChat/QQ browsers (Chinese mobile browsers)
- **`preload="auto"`**: Preloads video data for faster playback
- **`disablePictureInPicture`**: Prevents PiP mode which can cause playback issues

#### Added JavaScript Handler:
```typescript
onLoadedData={(e) => {
  // Force play on mobile devices
  const video = e.currentTarget
  video.play().catch(() => {
    // If autoplay fails, try again with user interaction
    console.log('Autoplay blocked - waiting for user interaction')
  })
}}
```
This handler attempts to force video playback once the video data is loaded, with graceful fallback.

## Why Videos Don't Play on Mobile

### Common Mobile Browser Restrictions:
1. **Autoplay Policies**: Most mobile browsers block autoplay to save data and battery
2. **Muted Requirement**: Videos must be muted to autoplay on mobile
3. **User Interaction**: Some browsers require user interaction before playing video
4. **Power Saving Mode**: Can disable autoplay entirely
5. **Data Saver Mode**: May prevent video loading

### iOS Safari Specific Issues:
- Requires `playsinline` attribute or video opens in fullscreen
- Strict autoplay policies that require muted video
- Low Power Mode completely disables autoplay

### Android Chrome Issues:
- Data Saver mode blocks autoplay
- Some versions require user gesture for video playback
- WeChat/QQ browsers have custom video handling

## Testing Recommendations

### Device Testing:
1. **iOS Safari** (iPhone/iPad)
   - Test with Low Power Mode ON and OFF
   - Test on different iOS versions (15+, 16+, 17+)

2. **Android Chrome**
   - Test with Data Saver ON and OFF
   - Test on different Android versions

3. **Other Browsers**
   - Firefox Mobile
   - Samsung Internet
   - WeChat/QQ browsers (if targeting Chinese users)

### Testing Scenarios:
- [ ] Fresh page load
- [ ] Page reload
- [ ] After device sleep/wake
- [ ] With different network speeds (3G, 4G, 5G, WiFi)
- [ ] With low battery/power saving mode

## Additional Mobile Video Best Practices

### Video File Optimization:
1. **Keep file size small** (< 10MB for splash videos)
2. **Use modern codecs** (H.264 for MP4, VP9 for WebM)
3. **Provide multiple formats** (MP4 and WebM)
4. **Compress appropriately** (use tools like HandBrake or FFmpeg)

### Fallback Strategy:
All components now have proper fallback images via the `poster` attribute, ensuring users see something even if video fails to load.

### Performance Considerations:
- Videos use `object-fit: cover` to fill container
- Poster images load immediately
- Videos are set to `preload="auto"` for faster playback

## YouTube Embed vs HTML5 Video

### YouTube Pros:
- Reliable CDN delivery
- Automatic quality adjustment
- No hosting/bandwidth costs

### YouTube Cons:
- Requires internet connection
- May show YouTube branding
- Less control over playback
- Can be blocked by ad blockers

### HTML5 Video Pros:
- Full control over playback
- No external dependencies
- No branding
- Works offline (with caching)

### HTML5 Video Cons:
- Requires hosting
- Uses your bandwidth
- Need to manage multiple formats
- Larger file size considerations

## Troubleshooting

If videos still don't play on mobile:

1. **Check video file exists**: Ensure video files are in `/public/videos/`
2. **Check file format**: Use MP4 with H.264 codec for best compatibility
3. **Check file size**: Large files may timeout on slow connections
4. **Check browser console**: Look for autoplay policy violations
5. **Test with sound off**: Ensure video is truly muted
6. **Check network**: Some mobile networks block video

## Future Improvements

Consider implementing:
1. **Adaptive streaming** (HLS/DASH) for better mobile performance
2. **Lazy loading** for videos below the fold
3. **Network detection** to skip videos on slow connections
4. **User preference** to disable autoplay videos
5. **Progressive enhancement** with static images for very slow connections

## Resources

- [MDN: Video Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [Chrome Autoplay Policy](https://developer.chrome.com/blog/autoplay/)
- [iOS Safari Video Policies](https://webkit.org/blog/6784/new-video-policies-for-ios/)
