#!/bin/bash

# E2E Test: Navigate to Compete tab and find a match
# This demonstrates automated tournament/match interaction

DEVICE_ID="CCA275F1-F246-4115-AC50-C62F01E48BDC"
SCREENSHOT_DIR="/tmp/e2e-compete-test"

# Create screenshot directory
mkdir -p "$SCREENSHOT_DIR"

echo "🏆 E2E TEST: Compete Tab - Find Match"
echo "======================================"
echo ""

# Function to take screenshot
take_screenshot() {
  step=$1
  description=$2
  filename="${SCREENSHOT_DIR}/step${step}_${description}.png"

  echo "📸 Step $step: $description"
  xcrun simctl io "$DEVICE_ID" screenshot --type=png "$filename"
  echo "   ✅ Saved: $filename"
  echo ""
  sleep 1
}

# Function to tap at coordinates
tap_screen() {
  x=$1
  y=$2
  description=$3
  echo "👆 Tapping: $description at ($x, $y)"
  xcrun simctl io "$DEVICE_ID" tap "$x" "$y"
  sleep 2
}

echo "Starting Compete tab test..."
echo ""

# Step 1: Current screen
take_screenshot 1 "initial_screen"

# Step 2: Tap Compete tab (second icon from left in bottom navigation)
echo "🏆 Opening Compete tab"
tap_screen 115 612 "Compete tab"
take_screenshot 2 "compete_tab_opened"

# Step 3: Look for tournament card
echo "🔍 Looking for tournaments..."
sleep 1
take_screenshot 3 "tournaments_list"

# Step 4: Tap on first tournament (approximate center of first card)
echo "🎯 Tapping on first tournament"
tap_screen 151 350 "First tournament card"
take_screenshot 4 "tournament_details_loading"

# Step 5: Wait for tournament details to load
echo "⏳ Waiting for tournament details..."
sleep 2
take_screenshot 5 "tournament_details_loaded"

# Step 6: Look for matches section (scroll down a bit)
echo "📜 Scrolling to find matches..."
# Swipe up to scroll (from y=500 to y=300)
xcrun simctl io "$DEVICE_ID" swipe 151 500 151 300
sleep 1
take_screenshot 6 "scrolled_to_matches"

# Step 7: Tap on a match (approximate position)
echo "🎾 Tapping on a match"
tap_screen 151 400 "Match card"
take_screenshot 7 "match_selected"

echo ""
echo "======================================"
echo "✅ E2E TEST COMPLETED!"
echo ""
echo "Test Journey:"
echo "  1. Started on initial screen"
echo "  2. Navigated to Compete tab"
echo "  3. Viewed tournaments list"
echo "  4. Opened tournament details"
echo "  5. Scrolled to matches section"
echo "  6. Selected a match"
echo ""
echo "Screenshots saved to:"
echo "  $SCREENSHOT_DIR"
echo ""
ls -lh "$SCREENSHOT_DIR"/*.png | awk '{print "  - " $9}' | sed 's|.*/||'
echo ""
echo "🎬 Opening screenshots..."
open "$SCREENSHOT_DIR"
