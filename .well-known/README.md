# Deep Linking Verification Files

These files need to be uploaded to your web server at `https://getsmash.net/.well-known/`

## Required Credentials

Before uploading these files, you need to fill in the placeholders:

### For iOS (apple-app-site-association)

**TEAM_ID_HERE** - Your Apple Developer Team ID
- Log in to [Apple Developer](https://developer.apple.com/account)
- Go to "Membership" section
- Find your Team ID (10-character alphanumeric string)

### For Android (assetlinks.json)

**SHA256_FINGERPRINT_HERE** - Your Android app's SHA256 certificate fingerprint

#### Option 1: If using EAS Build
```bash
npx eas credentials -p android
```
Look for "SHA256 Fingerprint"

#### Option 2: If you have a keystore file
```bash
keytool -list -v -keystore your-keystore.jks -alias your-alias
```
Look for "SHA256" under "Certificate fingerprints"

#### Option 3: If using Google Play Console
- Go to Play Console → Your App → Release → Setup → App Integrity
- Copy the SHA-256 certificate fingerprint

## Upload Instructions

1. Fill in the placeholders in both files
2. Upload to your web server at:
   - `https://getsmash.net/.well-known/apple-app-site-association` (no file extension!)
   - `https://getsmash.net/.well-known/assetlinks.json`

3. **CRITICAL Server Requirements:**
   - Files MUST be served over HTTPS
   - `apple-app-site-association` has NO file extension
   - Content-Type: `application/json`
   - Files must be publicly accessible (no authentication required)
   - No redirects allowed

## Verify Setup

### Test iOS Universal Links
```bash
curl -I https://getsmash.net/.well-known/apple-app-site-association
```
Should return `200 OK` with `Content-Type: application/json`

### Test Android App Links
```bash
curl -I https://getsmash.net/.well-known/assetlinks.json
```
Should return `200 OK` with `Content-Type: application/json`

### Online Validators
- iOS: https://search.developer.apple.com/appsearch-validation-tool/
- Android: https://developers.google.com/digital-asset-links/tools/generator

## After Upload

1. Rebuild your app with `eas build` or `expo build`
2. Wait 24-48 hours for Apple/Google to cache the files
3. Test deep links by tapping URLs like:
   - `https://getsmash.net/tournament/abc123`
   - Should open your app instead of browser

## Troubleshooting

- **iOS not working?** Check Team ID is correct and file has no extension
- **Android not working?** Verify SHA256 fingerprint matches your release build
- **Both not working?** Ensure files are served over HTTPS with correct Content-Type
