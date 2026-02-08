# Smash App - Pre-Submission Manual Test Plan

## 1. Deep Linking (Crucial for Sharing)
*   **Goal:** Verify users can open specific matches from a link.
*   **Action:** 
    1.  Install the latest build on your physical device.
    2.  Send yourself a link: `https://getsmash.net/match/555` (You can type this in Notes or Messages).
    3.  **Tap it.** 
*   **Success:** It should open the Smash app *directly* to a match screen (it might be empty/loading if ID 555 doesn't exist, but it MUST open the app, not Safari).

## 2. Share Functionality
*   **Goal:** Verify the new share button works on a real device.
*   **Action:**
    1.  Go to any **Match Details** screen.
    2.  Tap the **Share icon** (top right).
*   **Success:** The native iOS/Android share sheet appears. 
    *   Check that the text says: "Check out this match..."
    *   Check that the link `https://getsmash.net...` is attached.

## 3. Permissions & Privacy
*   **Goal:** Ensure we don't crash when asking for permission.
*   **Action:**
    1.  Go to a match details screen.
    2.  Tap **"Add to Calendar"**.
    3.  **Success:** It should show a system popup asking for Calendar access. (If you already granted it, it should just work).
    
## 4. Camera (If applicable)
*   **Goal:** Verify camera permission.
*   **Action:** If you have a feature to scan QR codes or upload profile pictures:
    1.  Try to change your profile picture.
    2.  **Success:** Camera/Gallery opens without crashing.

## 5. Network Resilience
*   **Goal:** Verify app doesn't freeze offline.
*   **Action:**
    1.  Turn on **Airplane Mode**.
    2.  Navigate to a new screen (e.g., Tournament list).
    3.  **Success:** The app should show a loading spinner or an error message/toast, but NOT crash or freeze indefinitely.

---

## 🔧 Technical Verification (Completed)
*   ✅ **Android Asset Links:** `/.well-known/assetlinks.json` - **VERIFIED** matching package `com.magedamorsy.smash`.
*   ✅ **iOS Universal Links:** `app.json` has `associatedDomains: ["applinks:getsmash.net"]`.
*   ✅ **Unit Tests:** `MatchDetailsScreen` share logic passed automated testing.
