# SMASH App Testing Guide

## Overview

This guide covers all the ways to properly test your SMASH tournament app, from unit tests to manual testing.

## Testing Pyramid

```
        /\
       /  \     E2E Testing (Manual)
      /____\
     /      \   Integration Tests
    /________\
   /          \ Unit Tests
  /____________\
```

## 1. Unit Tests (Automated)

**Purpose:** Test individual functions and components in isolation.

**Tools:** Jest + React Native Testing Library

### Running Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### What to Test

#### ✅ Utility Functions
- **Example:** Date formatters, validators, calculators
- **File:** `src/utils/__tests__/dateFormatter.test.js`

```javascript
// Test pure functions with different inputs
it('should return "TBD" for null or undefined', () => {
  expect(formatDateTime(null)).toBe('TBD');
  expect(formatDateTime(undefined)).toBe('TBD');
});
```

#### ✅ UI Components
- **Example:** Buttons, inputs, cards
- **File:** `src/components/ui/__tests__/Button.test.jsx`

```javascript
// Test user interactions
it('should call onPress when pressed', () => {
  const mockOnPress = jest.fn();
  const { getByText } = render(
    <Button title="Click Me" onPress={mockOnPress} />
  );

  fireEvent.press(getByText('Click Me'));
  expect(mockOnPress).toHaveBeenCalledTimes(1);
});
```

#### ✅ Screen Components
- **Example:** Login screen, home screen
- **File:** `src/screens/auth/__tests__/LoginScreen.test.jsx`

```javascript
// Test user flows and validation
it('should show error when email is invalid', async () => {
  const { getByPlaceholderText, getByText } = render(<LoginScreen />);

  fireEvent.changeText(getByPlaceholderText('Enter your email'), 'invalid');
  fireEvent.press(getByText('Continue'));

  await waitFor(() => {
    expect(getByText('Please enter a valid email address')).toBeTruthy();
  });
});
```

### Test Coverage Goals

- **Overall:** Aim for >80% coverage
- **Critical paths:** 100% coverage (auth, tournament creation, scoring)
- **UI components:** >70% coverage
- **Utility functions:** >90% coverage

### Current Coverage

```bash
npm run test:coverage
```

- LoginScreen: 89.83% ✅
- TabSelector: 100% ✅
- Button: 65.38% ⚠️ (add more tests)
- dateFormatter: >90% ✅

---

## 2. Integration Tests (Automated)

**Purpose:** Test how multiple components work together.

### Example: Tournament Creation Flow

```javascript
describe('Tournament Creation Flow', () => {
  it('should create tournament with valid data', async () => {
    const { getByPlaceholderText, getByText } = render(<CreateTournamentModal />);

    // Fill form
    fireEvent.changeText(getByPlaceholderText('Tournament Name'), 'Summer Smash');
    fireEvent.changeText(getByPlaceholderText('Location'), 'Central Park');

    // Submit
    fireEvent.press(getByText('Create Tournament'));

    // Verify tournament was created
    await waitFor(() => {
      expect(mockCreateTournament).toHaveBeenCalledWith({
        name: 'Summer Smash',
        location: 'Central Park',
        // ...
      });
    });
  });
});
```

---

## 3. Manual Testing (E2E)

**Purpose:** Test the entire app as a real user would use it.

### Using Expo Go

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Scan QR code with Expo Go app** (iOS/Android)

3. **Follow test scenarios below**

### Critical Test Scenarios

#### 🔐 Authentication Flow
1. Open app → Should show Welcome screen
2. Tap "Login" → Enter email
3. **New user:** Should navigate to signup flow
4. **Existing user:** Should show password field
5. Enter password → Tap "Login"
6. Should navigate to Home screen
7. **Verify:** User profile appears in Profile tab

#### 🏆 Tournament Creation
1. Navigate to Home tab
2. Tap "Create Tournament" button
3. Fill all required fields:
   - Name: "Test Tournament"
   - Location: "Test Court"
   - Courts: "Court 1, Court 2"
   - Date/Time: Select future date
   - Team Count: 8
4. Tap "Create"
5. **Verify:** Tournament appears in list
6. **Verify:** Status is "REGISTRATION"

#### 👥 Team Registration
1. Open created tournament
2. Tap "Create Team" button
3. **Verify:** Shows current user as Player 1
4. **Verify:** Can't create team if already in a team
5. Log in with different account
6. Join existing team as Player 2
7. **Verify:** Team now shows both players

#### 🎮 Tournament Start & Matches
1. Log in as tournament host
2. Open tournament (with 8 teams registered)
3. Tap options menu → "Start Tournament"
4. **Verify:** Groups are generated correctly
5. **Verify:** Matches are scheduled
6. **Verify:** Status changes to "GROUP STAGE"
7. Navigate to "Matches" tab
8. **Verify:** All rounds display correctly
9. **Verify:** User's matches are highlighted

#### 📊 Score Recording
1. Open a match you're in
2. Tap "Record Score"
3. Enter scores for both teams
4. Tap "Submit"
5. **Verify:** Match status updates
6. **Verify:** Winner is determined correctly
7. **Verify:** Next round matches update

### Testing Checklist

#### Visual Testing
- [ ] All screens render correctly on iOS
- [ ] All screens render correctly on Android
- [ ] Proper safe area handling (notch/island)
- [ ] Images load correctly
- [ ] Fonts load correctly
- [ ] Colors match design system

#### Interaction Testing
- [ ] All buttons are tappable
- [ ] Forms validate input correctly
- [ ] Error messages display properly
- [ ] Loading states show when expected
- [ ] Success messages appear
- [ ] Navigation works (back buttons, tabs)

#### Data Testing
- [ ] Data persists after app reload
- [ ] Firebase sync works
- [ ] Offline mode handles gracefully
- [ ] User profile updates correctly
- [ ] Tournament data updates in real-time

#### Edge Cases
- [ ] What happens with 0 teams?
- [ ] What happens with maximum teams (32)?
- [ ] Invalid email format
- [ ] Empty form submissions
- [ ] Network errors
- [ ] Permission denied scenarios

---

## 4. Performance Testing

### Using Expo Development Tools

1. **Start app with profiling:**
   ```bash
   npm start
   ```

2. **Open developer menu** (shake device or Cmd+D)

3. **Enable Performance Monitor**
   - Check FPS (should be 60)
   - Check memory usage
   - Check bridge traffic

### Performance Benchmarks

- **App startup:** < 3 seconds
- **Screen navigation:** < 300ms
- **List scrolling:** 60 FPS
- **Image loading:** Progressive with placeholder
- **Match creation:** < 2 seconds

### Common Performance Issues to Watch

- [ ] Slow FlatList scrolling (add keyExtractor)
- [ ] Re-renders on every state change (use React.memo)
- [ ] Large images (compress, use expo-image)
- [ ] Too many Firebase listeners (cleanup in useEffect)
- [ ] Inline function definitions (use useCallback)

---

## 5. Testing Best Practices

### Writing Good Tests

✅ **DO:**
- Test behavior, not implementation
- Use descriptive test names
- Test edge cases and error states
- Keep tests independent
- Clean up after tests
- Mock external dependencies

❌ **DON'T:**
- Test library internals
- Write tests that always pass
- Have interdependent tests
- Leave console.logs in tests
- Skip cleanup

### Test Organization

```
src/
  components/
    ui/
      Button.jsx
      __tests__/
        Button.test.jsx       ← Co-located with component
  utils/
    dateFormatter.js
    __tests__/
      dateFormatter.test.js   ← Co-located with utility
  screens/
    auth/
      LoginScreen.jsx
      __tests__/
        LoginScreen.test.jsx  ← Co-located with screen
```

### Mocking Strategy

All mocks are centralized in `jest-setup.js`:

```javascript
// Already mocked:
- Firebase (auth, firestore, storage)
- AsyncStorage
- React Navigation
- Expo modules (font, status-bar, haptics)
- SVG components
```

### When to Write Tests

1. **Before fixing a bug:** Write a failing test, then fix it (TDD)
2. **After adding a feature:** Ensure new code is tested
3. **During refactoring:** Tests ensure nothing breaks
4. **For critical paths:** Authentication, payments, scoring

---

## 6. Continuous Integration (Future)

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test -- --coverage
      - run: npm run lint (if you add linting)
```

---

## 7. Common Testing Scenarios

### Testing Firebase Operations

```javascript
it('should save tournament to Firebase', async () => {
  const mockSetDoc = jest.fn().mockResolvedValue({});
  require('firebase/firestore').setDoc = mockSetDoc;

  await createTournament({ name: 'Test' });

  expect(mockSetDoc).toHaveBeenCalled();
});
```

### Testing Navigation

```javascript
it('should navigate to home after login', async () => {
  const mockNavigate = jest.fn();
  useNavigation.mockReturnValue({ navigate: mockNavigate });

  // Perform login...

  expect(mockNavigate).toHaveBeenCalledWith('Home');
});
```

### Testing Async State Changes

```javascript
it('should show loading state', async () => {
  const { getByText, queryByText } = render(<AsyncComponent />);

  // Initially loading
  expect(getByText('Loading...')).toBeTruthy();

  // After data loads
  await waitFor(() => {
    expect(queryByText('Loading...')).toBeNull();
    expect(getByText('Data loaded!')).toBeTruthy();
  });
});
```

---

## 8. Debugging Failed Tests

### Common Issues

1. **"Unable to find element"**
   - Check if component is rendering
   - Use `debug()` to see rendered output:
     ```javascript
     const { debug } = render(<Component />);
     debug();
     ```

2. **"Timeout" errors**
   - Increase timeout in `waitFor`:
     ```javascript
     await waitFor(() => {
       expect(getByText('Text')).toBeTruthy();
     }, { timeout: 3000 });
     ```

3. **"Cannot read property of undefined"**
   - Mock is missing
   - Check jest-setup.js

4. **Test passes locally but fails in CI**
   - Timing issues
   - Environment differences
   - Missing mocks

---

## 9. Next Steps

### Improve Test Coverage

Priority areas to add tests:

1. **Tournament Logic** (0% coverage)
   - src/utils/courtScheduler.js
   - src/services/tournamentService.js

2. **Firebase Services** (4.82% coverage)
   - src/services/authService.js
   - src/services/firestoreService.js

3. **UI Components** (20.8% coverage)
   - src/components/tournament/*
   - src/components/match/*

4. **Context** (2.25% coverage)
   - src/contexts/AuthContext.jsx
   - src/contexts/TournamentContext.jsx

### Add E2E Testing (Optional)

Consider Detox for automated E2E tests:

```bash
npm install --save-dev detox
```

---

## 10. Quick Reference

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific test file
npm test -- Button.test.jsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Update snapshots (if using)
npm test -- -u
```

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Expo Testing Guide](https://docs.expo.dev/develop/unit-testing/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Remember:** Testing is about confidence, not coverage numbers. Write tests that give you confidence your app works correctly!
