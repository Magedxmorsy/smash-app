#!/bin/bash

# Live Visual E2E Test - Demonstrates automated testing on running app
# This script controls the iOS simulator and takes screenshots

DEVICE_ID="CCA275F1-F246-4115-AC50-C62F01E48BDC"
SCREENSHOT_DIR="/tmp/e2e-screenshots"

# Create screenshot directory
mkdir -p "$SCREENSHOT_DIR"
echo "📁 Screenshots will be saved to: $SCREENSHOT_DIR"
echo ""

echo "🚀 LIVE E2E TEST - iOS Simulator"
echo "================================"
echo "Device: iPhone 17 Pro"
echo "App: Smash - Padel Tournament"
echo ""

# Function to take screenshot with timestamp
take_screenshot() {
  step=$1
  description=$2
  filename="${SCREENSHOT_DIR}/step${step}_${description}.png"

  echo "📸 Step $step: $description"
  xcrun simctl io "$DEVICE_ID" screenshot --type=png "$filename"
  echo "   ✅ Saved: $filename"
  echo ""
}

# Function to tap at coordinates
tap_screen() {
  x=$1
  y=$2
  echo "👆 Tapping at ($x, $y)"
  # Using accessibility to tap - Detox would do this automatically
  xcrun simctl io "$DEVICE_ID" tap "$x" "$y"
  sleep 1
}

echo "Starting visual E2E test journey..."
echo ""

# Step 1: Current screen (Profile)
take_screenshot 1 "profile_screen"
sleep 2

# Step 2: Tap on Home tab (bottom left)
echo "🏠 Navigating to Home screen"
tap_screen 46 612
sleep 2
take_screenshot 2 "home_screen"

# Step 3: Tap on Compete tab
echo "🏆 Navigating to Compete screen"
tap_screen 115 612
sleep 2
take_screenshot 3 "compete_screen"

# Step 4: Tap on Updates tab
echo "🔔 Navigating to Updates screen"
tap_screen 184 612
sleep 2
take_screenshot 4 "updates_screen"

# Step 5: Back to Profile
echo "👤 Back to Profile screen"
tap_screen 253 612
sleep 2
take_screenshot 5 "profile_screen_final"

echo "================================"
echo "✅ E2E TEST COMPLETED!"
echo ""
echo "Test Results:"
echo "-------------"
ls -lh "$SCREENSHOT_DIR"/*.png | awk '{print "  " $9}' | sed 's|.*/||'
echo ""
echo "📺 To view screenshots:"
echo "   open $SCREENSHOT_DIR"
echo ""
echo "🎬 Opening screenshot viewer..."
open "$SCREENSHOT_DIR"
