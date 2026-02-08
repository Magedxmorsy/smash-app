# Smash App Deployment & Deep Linking Checklist

This checklist outlines the final steps required to ensure deep links (Universal Links/App Links) work correctly for sharing tournaments between friends.

## 1. Android App Links Configuration
- [x] **Get SHA256 Fingerprint**: 
  - **Option A: Using EAS (Recommended)**
    1. Run this command in your terminal:  
       ```bash
       npx eas-cli credentials
       ```
    2. Select **Android**.
    3. Select your profile (e.g., **production**).
    4. Look for the line **SHA256 Fingerprint**. It looks like `AB:CD:12:34...`.
  - **Option B: Using Local Keystore**
    1. Locate your `.jks` or `.keystore` file.
    2. Run: `keytool -list -v -keystore <path-to-keystore> -alias <your-alias>`
    3. Look for `SHA256` under "Certificate fingerprints".
- [x] **Update assetlinks.json**:
  - Open `.well-known/assetlinks.json`.
  - Replace `"SHA256_FINGERPRINT_HERE"` with your actual fingerprint.
  - *Note: You can add multiple fingerprints if you want to support both Debug and Release builds.*

## 2. iOS Universal Links Configuration
- [x] **Verify Team ID**:
  - Open `.well-known/apple-app-site-association`.
  - Confirm that `TNTCU2K4HC` is your actual Apple Developer Team ID.
  - If identical, no change needed.

## 3. Web Hosting Deployment
- [ ] **Deploy .well-known folder**:
  - Upload the `.well-known` folder to the root of your website `https://getsmash.net/`.
  - **Hostinger Users**: A `.htaccess` file has been created in this folder to ensure correct headers. Make sure to upload verification files AND the .htaccess file.
  - Verify access by visiting `https://getsmash.net/.well-known/apple-app-site-association` in a browser.

## 4. Final Verification
- [ ] **Test iOS**:
  - Send the link `https://getsmash.net/tournament/123` to an iOS device via iMessage or Notes.
  - Tap the link. It should open the Smash app directly to the Tournament Details screen.
- [ ] **Test Android**:
  - Send the same link to an Android device.
  - Tap the link. It should open the Smash app (or ask to Open with Smash).
