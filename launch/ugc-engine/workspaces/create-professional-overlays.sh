#!/bin/bash

# Create professional overlay elements for Instagram/TikTok

# Shop domain branding (top overlay)
convert -size 576x60 xc:rgba\(0,0,0,0.7\) \
  -font "/System/Library/Fonts/Helvetica.ttc" \
  -pointsize 20 \
  -fill white \
  -gravity center \
  -annotate 0 "shopwithin.com" \
  shop-brand.png

# Caption 1 (0-8 seconds) - Professional styling
convert -size 576x120 xc:rgba\(0,0,0,0.6\) \
  -font "/System/Library/Fonts/Helvetica.ttc" \
  -pointsize 18 \
  -fill white \
  -stroke black \
  -strokewidth 1 \
  -gravity center \
  -annotate 0 "If your car looks like this because of pet hair, you need this tool. It seriously works wonders in seconds." \
  caption1-pro.png

# Caption 2 (8-12.82 seconds) - Professional styling
convert -size 576x120 xc:rgba\(0,0,0,0.6\) \
  -font "/System/Library/Fonts/Helvetica.ttc" \
  -pointsize 18 \
  -fill white \
  -stroke black \
  -strokewidth 1 \
  -gravity center \
  -annotate 0 "Oh, my gosh. I cannot believe this actually works. Look at all that hair." \
  caption2-pro.png

# Professional CTA overlay with motion-ready design
convert -size 576x100 xc:rgba\(255,215,0,0.9\) \
  -font "/System/Library/Fonts/Helvetica.ttc" \
  -pointsize 32 \
  -fill black \
  -gravity center \
  -annotate 0 "Get FurLift Now" \
  -draw "rectangle 10,10 566,90" \
  cta-pro.png

# Instagram safe zone overlay (9:16)
convert -size 576x1024 xc:none \
  -fill "rgba(0,0,0,0.3)" \
  -draw "rectangle 0,0 576,100" \
  -draw "rectangle 0,924 576,1024" \
  safe-zone.png

echo "Professional overlays created"
