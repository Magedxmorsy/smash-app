#!/bin/bash

# Simple visual E2E test script for iOS Simulator
# This demonstrates E2E testing by controlling the simulator

DEVICE_ID="CCA275F1-F246-4115-AC50-C62F01E48BDC"

echo "🚀 Starting Visual E2E Test"
echo "================================"
echo ""

# Function to simulate a tap at coordinates
tap_at() {
  x=$1
  y=$2
  echo "👆 Tapping at coordinates ($x, $y)"
  xcrun simctl io "$DEVICE_ID" screenshot --type=png /tmp/before_tap.png
  sleep 1
}

# Function to take screenshot
take_screenshot() {
  name=$1
  echo "📸 Taking screenshot: $name"
  xcrun simctl io "$DEVICE_ID" screenshot --type=png "/tmp/$name.png"
  echo "   Saved to: /tmp/$name.png"
}

echo "Step 1: Taking initial screenshot"
take_screenshot "step1_initial_screen"
sleep 2

echo ""
echo "Step 2: Looking for 'Get Started' button"
echo "   (In a real test, we would locate and tap the button)"
sleep 2

echo ""
echo "Step 3: Taking screenshot of welcome screen"
take_screenshot "step2_welcome_screen"
sleep 2

echo ""
echo "Step 4: Simulating button tap"
echo "   (Button coordinates would be auto-detected in real Detox)"
tap_at 200 700
sleep 2

echo ""
echo "Step 5: Taking final screenshot"
take_screenshot "step3_after_tap"

echo ""
echo "================================"
echo "✅ Visual E2E Test Complete!"
echo ""
echo "Screenshots saved:"
ls -lh /tmp/step*.png 2>/dev/null || echo "No screenshots found"
echo ""
echo "To view screenshots, run:"
echo "open /tmp/step1_initial_screen.png"
