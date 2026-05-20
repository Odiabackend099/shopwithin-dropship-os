#!/bin/bash

# Create caption overlays using ImageMagick

# Caption 1 (0-8 seconds)
convert -size 576x100 xc:transparent \
  -font "/System/Library/Fonts/Helvetica.ttc" \
  -pointsize 24 \
  -fill white \
  -stroke black \
  -strokewidth 2 \
  -gravity center \
  -annotate 0 "If your car looks like this because of pet hair, you need this tool. It seriously works wonders in seconds." \
  caption1.png

# Caption 2 (8-12.82 seconds)
convert -size 576x100 xc:transparent \
  -font "/System/Library/Fonts/Helvetica.ttc" \
  -pointsize 24 \
  -fill white \
  -stroke black \
  -strokewidth 2 \
  -gravity center \
  -annotate 0 "Oh, my gosh. I cannot believe this actually works. Look at all that hair." \
  caption2.png

# CTA overlay (throughout)
convert -size 576x80 xc:rgba\(0,0,0,0.5\) \
  -font "/System/Library/Fonts/Helvetica.ttc" \
  -pointsize 36 \
  -fill yellow \
  -gravity center \
  -annotate 0 "Get FurLift Now" \
  cta.png

echo "Overlays created successfully"
