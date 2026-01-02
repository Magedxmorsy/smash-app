# Notification System - Manual Testing Guide

## ✅ Prerequisites
1. App running on device/simulator
2. Logged in as a user
3. Firebase Firestore connected

---

## 🧪 Test Scenarios

### Test 1: Tournament Created Notification ✅

**Steps:**
1. Open the app and navigate to the Compete tab
2. Tap the "+" button to create a new tournament
3. Fill in tournament details:
   - Name: "Test Championship"
   - Team Count: 4
   - Location: "Central Court"
   - Date/Time: Select a future date
   - Rules: "Standard rules"
4. Tap "Create Tournament"

**Expected Results:**
- ✅ Tournament is created successfully
- ✅ No toUpperCase error (Badge fix working)
- ✅ Tournament appears with "REGISTRATION" badge
- ✅ Navigate to Updates tab
- ✅ See notification: "Tournament Created - You created 'Test Championship'"
- ✅ Notification has blue unread dot
- ✅ Badge on Updates tab shows "1"

---

### Test 2: Team Created Notification ✅

**Steps:**
1. Open the tournament you just created
2. Tap "Create Team" button
3. Confirm team creation

**Expected Results:**
- ✅ Team appears in the teams list with your name
- ✅ Navigate to Updates tab
- ✅ See notification: "Team Created - You created a team in Test Championship"
- ✅ Badge on Updates tab shows "2"

---

### Test 3: Teammate Joined + You Joined Team Notifications ✅

**Steps:**
1. Login with a **second account** (different user)
2. Navigate to Compete tab
3. Find and open "Test Championship"
4. Tap "Join Team" and select the team with one player
5. Confirm joining

**Expected Results for User 2 (who joined):**
- ✅ You're added to the team
- ✅ Navigate to Updates tab
- ✅ See notification: "Team Joined - You joined [Player1]'s team in Test Championship"

**Expected Results for User 1 (team creator):**
- ✅ Log back in as User 1
- ✅ Navigate to Updates tab
- ✅ See notification: "Teammate Joined - [User2 Name] joined your team!"

---

### Test 4: Team Completed Notification ✅

**Expected Results (continuing from Test 3):**
- ✅ Both User 1 and User 2 should see:
- ✅ "Team Completed - A team is now complete in Test Championship!"

---

### Test 5: New Team Joined Notification ✅

**Steps:**
1. Login as a **third user**
2. Open "Test Championship"
3. Tap "Create Team"
4. Confirm team creation

**Expected Results:**
- ✅ User 1 and User 2 see notification: "New Team Joined - A new team joined Test Championship"
- ✅ User 3 sees: "Team Created - You created a team in Test Championship"

---

### Test 6: Tournament Full Notification ✅

**Steps:**
1. Continue adding teams until all 4 team slots are filled
2. Last team gets a second player

**Expected Results for Tournament Host:**
- ✅ See notification: "Tournament Full - Test Championship is full! Ready to start."

---

### Test 7: Tournament Started Notification ✅

**Steps:**
1. Login as the **tournament host** (creator)
2. Open "Test Championship"
3. Tap "Start Tournament" button
4. Confirm starting

**Expected Results:**
- ✅ All participants (8 players) receive notification
- ✅ "Tournament Started - Test Championship has started! Check your matches."
- ✅ Tournament status badge changes to the appropriate stage

---

### Test 8: Tournament Updated Notification ✅

**Steps:**
1. Login as the **tournament host**
2. Open "Test Championship"
3. Tap the edit button (pencil icon)
4. Change a significant detail (location, date/time, or rules)
5. Save changes

**Expected Results:**
- ✅ All participants receive notification
- ✅ "Tournament Updated - Test Championship details have changed"

---

### Test 9: Tournament Cancelled Notification ✅

**Steps:**
1. Login as the **tournament host**
2. Open "Test Championship"
3. Tap the delete button
4. Confirm deletion

**Expected Results:**
- ✅ All participants receive notification
- ✅ "Tournament Cancelled - Test Championship has been cancelled"
- ✅ Tournament is removed from Compete tab

---

### Test 10: Notification Settings ✅

**Steps:**
1. Navigate to Profile tab
2. Tap "Notification Settings"
3. Toggle OFF "Tournament Notifications"
4. Create a new tournament

**Expected Results:**
- ✅ Tournament is created successfully
- ✅ NO "Tournament Created" notification appears (blocked by settings)

**Continue:**
5. Toggle ON "Tournament Notifications"
6. Toggle OFF "All Notifications"
7. Create another tournament

**Expected Results:**
- ✅ NO notifications appear (master toggle OFF)

**Continue:**
8. Toggle ON "All Notifications"
9. Create another tournament

**Expected Results:**
- ✅ "Tournament Created" notification appears (settings restored)

---

### Test 11: Deep Linking ✅

**Steps:**
1. Navigate to Updates tab with notifications
2. Tap on a tournament notification

**Expected Results:**
- ✅ App navigates to tournament details screen
- ✅ Shows the correct tournament
- ✅ Notification is marked as read (blue dot disappears)
- ✅ Unread badge count decreases by 1

---

### Test 12: Mark All As Read ✅

**Steps:**
1. Navigate to Updates tab with multiple unread notifications
2. Look for a "Mark All Read" button (if implemented) or tap each notification

**Expected Results:**
- ✅ All notifications lose their blue unread dot
- ✅ Badge on Updates tab shows "0"

---

### Test 13: Badge Component - Null Safety ✅

**Steps:**
1. Create a tournament (any details)
2. View the tournament details

**Expected Results:**
- ✅ No toUpperCase error
- ✅ Status badge displays correctly ("REGISTRATION")
- ✅ Badge shows uppercase text
- ✅ Badge has correct color (gray for registration)

---

### Test 14: Real-Time Updates ✅

**Steps:**
1. Login on two devices (or web + mobile)
2. User 1 creates a tournament on Device 1
3. User 2 joins the tournament on Device 2

**Expected Results:**
- ✅ User 1 sees "Teammate Joined" notification appear in real-time (without refresh)
- ✅ User 2 sees "You Joined Team" notification appear
- ✅ Updates tab badge updates automatically

---

### Test 15: Offline Handling ✅

**Steps:**
1. Turn OFF internet connection
2. Open the app
3. Navigate to Updates tab

**Expected Results:**
- ✅ App doesn't crash
- ✅ Shows last cached notifications
- ✅ No permission errors (only warnings in console)

**Continue:**
4. Turn ON internet connection

**Expected Results:**
- ✅ Notifications sync automatically
- ✅ New notifications appear

---

## 📊 Test Results Summary

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Tournament Created | ⬜ | |
| 2 | Team Created | ⬜ | |
| 3 | Teammate Joined + You Joined | ⬜ | |
| 4 | Team Completed | ⬜ | |
| 5 | New Team Joined | ⬜ | |
| 6 | Tournament Full | ⬜ | |
| 7 | Tournament Started | ⬜ | |
| 8 | Tournament Updated | ⬜ | |
| 9 | Tournament Cancelled | ⬜ | |
| 10 | Notification Settings | ⬜ | |
| 11 | Deep Linking | ⬜ | |
| 12 | Mark All As Read | ⬜ | |
| 13 | Badge Null Safety | ⬜ | |
| 14 | Real-Time Updates | ⬜ | |
| 15 | Offline Handling | ⬜ | |

**Legend:**
- ⬜ Not Tested
- ✅ Passed
- ❌ Failed

---

## 🐛 Known Issues

### Warnings (Harmless)
- `Permission denied for settings. This may happen if the user document does not exist yet.`
  - **Impact:** None - app creates default settings automatically
  - **When:** First time users or existing users without settings documents
  - **Action:** No action needed

---

## 🔧 Troubleshooting

### No notifications appearing?
1. Check Firestore rules are deployed: `firebase deploy --only firestore:rules`
2. Check user has notification settings enabled
3. Check console for errors
4. Verify user is logged in (`userData.uid` exists)

### Badge not showing?
1. Verify notifications exist in Firestore console
2. Check `notifications.read` field is `false`
3. Verify NotificationContext is wrapped around app

### Deep linking not working?
1. Check navigation structure matches the deep link targets
2. Verify `tournamentId` or `matchId` is in notification metadata
3. Check navigation logs in console

### toUpperCase error?
1. Verify Badge.jsx line 45 has: `{label?.toUpperCase() || ''}`
2. Check that tournament has a `status` field
3. Verify status field is a valid string

---

## ✅ Success Criteria

All tests should pass with:
- ✅ No crashes or errors
- ✅ All 10 notification types working (15 total, 5 match notifications pending)
- ✅ Real-time updates within 2 seconds
- ✅ Badge shows correct unread count
- ✅ Deep linking works
- ✅ Settings filter notifications correctly
- ✅ Offline mode works without crashes

---

## 📝 Testing Notes

Use this space to record any issues or observations during testing:

```
Date: __________
Tester: __________

Issues found:
1.
2.
3.

Additional observations:
-
-
-
```
