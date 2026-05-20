#!/bin/bash

# Theme Packaging Script
# Packages the Shopify theme for upload to the new store

set -e

THEME_DIR="infra/shopify-theme"
OUTPUT_DIR="dist/theme"
THEME_NAME="dropship-os-theme"

echo "📦 Packaging Shopify theme..."

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Create a temporary directory for the theme package
TEMP_DIR=$(mktemp -d)

# Copy theme files to temp directory
cp -r "$THEME_DIR"/* "$TEMP_DIR/"

# Remove any development files
rm -f "$TEMP_DIR"/.DS_Store
find "$TEMP_DIR" -name "*.swp" -delete
find "$TEMP_DIR" -name "*.swo" -delete

# Create the ZIP file
cd "$TEMP_DIR"
zip -r "$OUTPUT_DIR/$THEME_NAME.zip" . -x "*.DS_Store" "*.swp" "*.swo"
cd - > /dev/null

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo "✅ Theme packaged: $OUTPUT_DIR/$THEME_NAME.zip"
echo "📏 Size: $(du -h "$OUTPUT_DIR/$THEME_NAME.zip" | cut -f1)"
