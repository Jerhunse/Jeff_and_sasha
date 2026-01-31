#!/bin/bash

# Script to download and optimize YouTube video for wedding homepage
# Usage: ./scripts/download-youtube-video.sh

VIDEO_URL="https://www.youtube.com/watch?v=s-G9OQ3bJaQ"
OUTPUT_DIR="public/videos"
OUTPUT_FILE="wedding-splash.mp4"

echo "================================================"
echo "Wedding Homepage Video Setup"
echo "================================================"
echo ""
echo "This script will download and optimize the YouTube video"
echo "for use as the homepage background."
echo ""

# Check if yt-dlp is installed
if ! command -v yt-dlp &> /dev/null; then
    echo "❌ yt-dlp is not installed."
    echo ""
    echo "Please install yt-dlp first:"
    echo ""
    echo "  macOS (using Homebrew):"
    echo "    brew install yt-dlp"
    echo ""
    echo "  macOS (using pip):"
    echo "    pip3 install yt-dlp"
    echo ""
    echo "  Linux:"
    echo "    sudo apt install yt-dlp"
    echo "    # or"
    echo "    pip3 install yt-dlp"
    echo ""
    exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed."
    echo ""
    echo "Please install ffmpeg first:"
    echo ""
    echo "  macOS (using Homebrew):"
    echo "    brew install ffmpeg"
    echo ""
    echo "  Linux:"
    echo "    sudo apt install ffmpeg"
    echo ""
    exit 1
fi

echo "✅ Found yt-dlp and ffmpeg"
echo ""

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "📥 Downloading video from YouTube..."
echo "URL: $VIDEO_URL"
echo ""

# Download the video with yt-dlp and optimize it
yt-dlp \
  --format "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best" \
  --output "$OUTPUT_DIR/temp-video.%(ext)s" \
  --merge-output-format mp4 \
  "$VIDEO_URL"

if [ $? -ne 0 ]; then
    echo "❌ Failed to download video"
    exit 1
fi

echo ""
echo "🎬 Optimizing video for web..."
echo ""

# Find the downloaded file (it might have a different name)
TEMP_FILE=$(ls "$OUTPUT_DIR"/temp-video.* 2>/dev/null | head -n 1)

if [ -z "$TEMP_FILE" ]; then
    echo "❌ Could not find downloaded video file"
    exit 1
fi

# Optimize the video: compress, ensure web compatibility, limit to 30 seconds if longer
ffmpeg -i "$TEMP_FILE" \
  -t 30 \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 \
  -preset slow \
  -crf 23 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -an \
  -y \
  "$OUTPUT_DIR/$OUTPUT_FILE"

if [ $? -ne 0 ]; then
    echo "❌ Failed to optimize video"
    rm -f "$TEMP_FILE"
    exit 1
fi

# Clean up temporary file
rm -f "$TEMP_FILE"

# Check file size
FILE_SIZE=$(du -h "$OUTPUT_DIR/$OUTPUT_FILE" | cut -f1)

echo ""
echo "================================================"
echo "✅ Success!"
echo "================================================"
echo ""
echo "Video saved to: $OUTPUT_DIR/$OUTPUT_FILE"
echo "File size: $FILE_SIZE"
echo ""
echo "The video will now be used as your homepage background."
echo "It will autoplay, loop, and be muted (browser requirement)."
echo ""
echo "Next steps:"
echo "1. Test the homepage: npm run dev"
echo "2. Visit http://localhost:3000"
echo "3. The video should play automatically"
echo ""
