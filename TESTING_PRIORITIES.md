# Testing Priorities & Coverage Analysis

## Current Coverage Summary

### Tournament Components Coverage:

| Component | Coverage | Priority | Status |
|-----------|----------|----------|--------|
| **WinnersBanner.jsx** | **100%** | ✅ | **COMPLETE** |
| **TournamentCard.jsx** | **68.65%** | 🟡 Medium | PARTIAL |
| AddRulesModal.jsx | 0% | 🔴 High | NOT STARTED |
| CreateTeamBottomSheet.jsx | 0% | 🔴 High | NOT STARTED |
| CreateTournamentModal.jsx | 0% | 🔴 High | NOT STARTED |
| GroupsPreviewModal.jsx | 0% | 🟡 Medium | NOT STARTED |
| JoinTeamBottomSheet.jsx | 0% | 🔴 High | NOT STARTED |
| RemovePlayerButton.jsx | 0% | 🔴 High | NOT STARTED |
| RemovePlayerConfirmationBottomSheet.jsx | 0% | 🔴 High | NOT STARTED |
| RulesBottomSheet.jsx | 0% | 🟡 Medium | NOT STARTED |
| StartTournamentBottomSheet.jsx | 0% | 🔴 High | NOT STARTED |
| TeamsList.jsx | 0% | 🔴 High | NOT STARTED |
| TournamentOptionsBottomSheet.jsx | 0% | 🟡 Medium | NOT STARTED |

---

## Priority 1: Critical User Flows (HIGH) 🔴

### 1. TeamsList Component
**File:** `src/components/tournament/TeamsList.jsx`
**Coverage:** 0%
**Why Critical:** Core tournament registration functionality

**Test Cases Needed:**
- [ ] Renders empty state when no teams
- [ ] Displays teams with player names
- [ ] Shows "Join" button for incomplete teams
- [ ] Shows "Create new team" button for non-hosts
- [ ] Hides create button when tournament full
- [ ] Only shows remove buttons during REGISTRATION
- [ ] Host can see remove button on all players
- [ ] Players can only see remove on themselves
- [ ] Remove button triggers confirmation modal
- [ ] Successful player removal updates UI
- [ ] Team count updates correctly
- [ ] Filled teams counter accurate

**Edge Cases:**
- Empty teams filtered correctly
- User has team vs doesn't have team
- Admin team handling
- Full tournament state

---

### 2. RemovePlayerButton Component
**File:** `src/components/tournament/RemovePlayerButton.jsx`
**Coverage:** 0%
**Why Critical:** New feature for player management

**Test Cases Needed:**
- [ ] Renders when visible=true
- [ ] Doesn't render when visible=false
- [ ] Calls onPress when tapped
- [ ] Shows correct positioning (top-right)
- [ ] Haptic feedback on iOS
- [ ] Hit slop for easy tapping
- [ ] Proper z-index layering

**Edge Cases:**
- Different container sizes
- Multiple buttons on same team
- Rapid tapping

---

### 3. RemovePlayerConfirmationBottomSheet Component
**File:** `src/components/tournament/RemovePlayerConfirmationBottomSheet.jsx`
**Coverage:** 0%
**Why Critical:** Prevents accidental player removal

**Test Cases Needed:**
- [ ] Shows "Leave team?" when isSelf=true
- [ ] Shows "Delete team?" when isSelf=true AND isOnlyPlayer=true
- [ ] Shows "Remove player?" when isSelf=false
- [ ] Displays correct player name
- [ ] Cancel button closes modal
- [ ] Confirm button calls onConfirm
- [ ] Correct button labels (Stay/Leave/Remove)
- [ ] Modal dismisses on close

**Edge Cases:**
- Long player names
- Special characters in names
- Rapid open/close

---

### 4. CreateTeamBottomSheet Component
**File:** `src/components/tournament/CreateTeamBottomSheet.jsx`
**Coverage:** 0%
**Why Critical:** Core team creation flow

**Test Cases Needed:**
- [ ] Renders with user's name pre-filled
- [ ] Shows avatar if user has one
- [ ] Join button creates team
- [ ] Handles loading state
- [ ] Handles error state
- [ ] Closes on success
- [ ] Calls onTeamCreated callback

**Edge Cases:**
- Network errors
- Duplicate team creation
- User without avatar

---

### 5. JoinTeamBottomSheet Component
**File:** `src/components/tournament/JoinTeamBottomSheet.jsx`
**Coverage:** 0%
**Why Critical:** Core team joining flow

**Test Cases Needed:**
- [ ] Displays existing player info
- [ ] Shows current user as player2
- [ ] Join button calls onJoin
- [ ] Invite button calls onInvite
- [ ] Loading states work
- [ ] Error handling
- [ ] Closes on success

**Edge Cases:**
- Team already full
- User already on another team
- Network failures

---

### 6. StartTournamentBottomSheet Component
**File:** `src/components/tournament/StartTournamentBottomSheet.jsx`
**Coverage:** 0%
**Why Critical:** Tournament lifecycle management

**Test Cases Needed:**
- [ ] Shows court scheduling UI
- [ ] Validates required fields
- [ ] Generates match schedule
- [ ] Displays preview correctly
- [ ] Start button works
- [ ] Error handling for invalid courts
- [ ] Closes on cancel

**Edge Cases:**
- Invalid court count
- Invalid time formats
- Scheduling conflicts

---

## Priority 2: UI Components (MEDIUM) 🟡

### 7. TournamentCard Component (Improve Coverage)
**File:** `src/components/tournament/TournamentCard.jsx`
**Current Coverage:** 68.65%
**Missing Lines:** 92-93, 126-139, 166-167, 176, 185-192

**Additional Test Cases Needed:**
- [ ] Animation timing for index > 8
- [ ] Different tournament statuses
- [ ] Action button states
- [ ] Host vs participant views
- [ ] Full tournament state
- [ ] Empty avatars array

---

### 8. GroupsPreviewModal Component
**File:** `src/components/tournament/GroupsPreviewModal.jsx`
**Coverage:** 0%
**Why Medium:** Used before tournament start

**Test Cases Needed:**
- [ ] Renders groups correctly
- [ ] Shows team assignments
- [ ] Close button works
- [ ] Scrolling for many groups

---

### 9. TournamentOptionsBottomSheet Component
**File:** `src/components/tournament/TournamentOptionsBottomSheet.jsx`
**Coverage:** 0%
**Why Medium:** Admin options

**Test Cases Needed:**
- [ ] Edit option visible for host
- [ ] Delete option visible for host
- [ ] Confirmation for delete
- [ ] Share option works
- [ ] Cancel closes sheet

---

### 10. RulesBottomSheet Component
**File:** `src/components/tournament/RulesBottomSheet.jsx`
**Coverage:** 0%
**Why Medium:** Info display

**Test Cases Needed:**
- [ ] Displays rules text
- [ ] Closes on dismiss
- [ ] Scrolls for long rules

---

### 11. AddRulesModal Component
**File:** `src/components/tournament/AddRulesModal.jsx`
**Coverage:** 0%
**Why Medium:** Tournament creation

**Test Cases Needed:**
- [ ] Text input works
- [ ] Save button enabled/disabled
- [ ] Saves rules correctly
- [ ] Closes on cancel

---

## Priority 3: Integration & Flow Tests (HIGH) 🔴

### Critical Flows to Test:

#### Flow 1: Complete Tournament Registration
```
Create Tournament → Join Team → Start Tournament → View Winners
```
**Components Involved:**
- CreateTournamentModal
- TeamsList
- CreateTeamBottomSheet
- JoinTeamBottomSheet
- StartTournamentBottomSheet
- WinnersBanner ✅

**Test:**
- [ ] Full registration flow
- [ ] Multiple users joining
- [ ] Tournament fills up
- [ ] Start button enabled
- [ ] Tournament starts successfully

---

#### Flow 2: Player Management
```
Join Team → Remove Self → Rejoin → Remove by Host
```
**Components Involved:**
- TeamsList ✅
- RemovePlayerButton
- RemovePlayerConfirmationBottomSheet

**Test:**
- [ ] Player can leave team
- [ ] Team slot reopens
- [ ] Player can rejoin
- [ ] Host can remove any player
- [ ] Correct confirmation messages

---

#### Flow 3: Tournament Lifecycle
```
Create → Fill Teams → Start → Play Matches → Finish → View Winners
```
**Components Involved:**
- All tournament components

**Test:**
- [ ] Status transitions
- [ ] UI updates at each stage
- [ ] Winners calculated correctly
- [ ] WinnersBanner displays

---

## Testing Strategy

### Phase 1: Individual Components (Week 1)
**Order of Implementation:**
1. ✅ WinnersBanner (DONE - 100%)
2. RemovePlayerButton
3. RemovePlayerConfirmationBottomSheet
4. TeamsList
5. CreateTeamBottomSheet
6. JoinTeamBottomSheet

### Phase 2: Complex Components (Week 2)
7. StartTournamentBottomSheet
8. TournamentCard (complete coverage)
9. TournamentOptionsBottomSheet
10. GroupsPreviewModal
11. RulesBottomSheet
12. AddRulesModal

### Phase 3: Integration Tests (Week 3)
13. Registration flow integration
14. Player management flow
15. Tournament lifecycle flow
16. Error scenarios

---

## Testing Tools & Patterns

### Testing Library Setup:
```javascript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { jest } from '@jest/globals';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));
```

### Common Test Patterns:

#### 1. Component Rendering:
```javascript
it('should render component', () => {
  const { getByText } = render(<Component {...props} />);
  expect(getByText('Expected Text')).toBeTruthy();
});
```

#### 2. User Interactions:
```javascript
it('should handle button press', () => {
  const onPress = jest.fn();
  const { getByText } = render(<Component onPress={onPress} />);
  fireEvent.press(getByText('Button'));
  expect(onPress).toHaveBeenCalled();
});
```

#### 3. Conditional Rendering:
```javascript
it('should not render when condition is false', () => {
  const { queryByText } = render(<Component visible={false} />);
  expect(queryByText('Content')).toBeNull();
});
```

#### 4. Async Operations:
```javascript
it('should handle async operations', async () => {
  const { getByText } = render(<Component />);
  fireEvent.press(getByText('Submit'));
  await waitFor(() => {
    expect(getByText('Success')).toBeTruthy();
  });
});
```

---

## Coverage Goals

### Short Term (2 weeks):
- ✅ WinnersBanner: 100%
- 🎯 TeamsList: 80%+
- 🎯 RemovePlayerButton: 100%
- 🎯 RemovePlayerConfirmationBottomSheet: 100%
- 🎯 CreateTeamBottomSheet: 80%+
- 🎯 JoinTeamBottomSheet: 80%+

### Medium Term (1 month):
- 🎯 All tournament components: 80%+
- 🎯 Integration tests: Core flows covered
- 🎯 Overall tournament coverage: 70%+

### Long Term (2 months):
- 🎯 All components: 85%+
- 🎯 All user flows: Covered
- 🎯 Edge cases: Documented and tested

---

## Test File Structure

```
src/components/tournament/__tests__/
├── WinnersBanner.test.jsx ✅ (100% coverage)
├── TournamentCard.test.jsx ✅ (68% coverage)
├── TeamsList.test.jsx (NEEDED)
├── RemovePlayerButton.test.jsx (NEEDED)
├── RemovePlayerConfirmationBottomSheet.test.jsx (NEEDED)
├── CreateTeamBottomSheet.test.jsx (NEEDED)
├── JoinTeamBottomSheet.test.jsx (NEEDED)
├── StartTournamentBottomSheet.test.jsx (NEEDED)
├── TournamentOptionsBottomSheet.test.jsx (NEEDED)
├── GroupsPreviewModal.test.jsx (NEEDED)
├── RulesBottomSheet.test.jsx (NEEDED)
└── AddRulesModal.test.jsx (NEEDED)
```

---

## Next Steps

### Immediate Actions:
1. ✅ Complete WinnersBanner tests (DONE)
2. 🎯 Create RemovePlayerButton tests (NEW feature)
3. 🎯 Create RemovePlayerConfirmationBottomSheet tests (NEW feature)
4. 🎯 Create TeamsList tests (Core functionality)

### This Week:
- Achieve 50%+ coverage on tournament components
- Complete all "remove player" functionality tests
- Start CreateTeamBottomSheet tests

### Next Week:
- Complete JoinTeamBottomSheet tests
- Start StartTournamentBottomSheet tests
- Improve TournamentCard coverage to 85%+

---

## Notes

- WinnersBanner achieved 100% coverage as a reference implementation
- Use similar testing patterns for other components
- Focus on user-facing functionality first
- Integration tests are critical for tournament flows
- Mock external dependencies (Firestore, navigation, context)
- Test both success and failure paths
