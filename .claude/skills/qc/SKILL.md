---
name: qc-audit
description: "Perform comprehensive quality control audits on code including automated tests, React Native/Expo best practices, TypeScript type safety, Firebase security, bug detection, performance issues, and code quality standards. Use when reviewing code, before commits, or when investigating quality concerns."
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

# QC Audit Skill

Performs comprehensive quality control audits on the SMASH tournament app codebase.

## Audit Scope

### 1. React Native/Expo Best Practices

**Check for:**
- Proper use of SafeAreaView/SafeAreaProvider for safe area handling
- Correct implementation of native modules (expo-image-picker, etc.)
- Platform-specific code handling (Platform.OS checks)
- Proper keyboard handling (KeyboardAvoidingView, dismissKeyboard)
- FlatList optimization (keyExtractor, getItemLayout for performance)
- Image optimization (use expo-image over Image)
- Proper navigation patterns (React Navigation)
- Avoid inline function definitions in render (performance)
- Proper use of React Native StyleSheet.create()

**Anti-patterns to flag:**
- Importing from 'react-native-web' in native code
- Missing keys in list renders
- Nested ScrollViews without proper configuration
- Memory leaks from uncleared timers/listeners
- Direct DOM manipulation
- Synchronous storage operations

### 2. TypeScript Type Safety

**Check for:**
- Proper typing of all function parameters and return values
- Avoid `any` types (flag all occurrences)
- Proper interface/type definitions for props
- Type guards for runtime type checking
- Proper generic usage
- Strict null checks (avoid potential undefined access)
- Enum usage instead of magic strings/numbers
- Proper typing of async functions (Promise<T>)

**Anti-patterns to flag:**
- Type assertions (as) used to bypass type checking
- @ts-ignore or @ts-nocheck comments
- Implicit any types
- Missing return type annotations on functions
- Optional chaining (?.) used to hide type issues

### 3. Firebase Security & Performance

**Check for:**
- Proper Firebase initialization (no duplicate instances)
- Security rules validation
- Proper authentication state management
- Avoid exposing sensitive config in client code
- Efficient query patterns (use where clauses, limits)
- Proper listener cleanup (unsubscribe in useEffect cleanup)
- Batch writes for multiple operations
- Proper error handling for Firebase operations
- Offline persistence configuration
- Index requirements for complex queries

**Anti-patterns to flag:**
- Reading entire collections without limits
- Missing listener cleanup (memory leaks)
- Storing sensitive data in Realtime Database without rules
- Synchronous Firebase calls blocking UI
- Missing error boundaries for Firebase errors
- Hardcoded API keys in code

### 4. Common Bug Patterns

**Check for:**
- Race conditions in async operations
- Missing error handling in try-catch or .catch()
- Off-by-one errors in loops and array access
- Incorrect comparison operators (== vs ===)
- Missing null/undefined checks
- Improper state updates (mutating state directly)
- Missing dependency arrays in useEffect
- Stale closures in hooks
- Memory leaks from event listeners
- Incorrect date/time handling
- Floating point comparison issues
- Missing form validation
- Unhandled promise rejections

### 5. Code Quality Standards

**Check for:**
- Consistent naming conventions (camelCase for variables, PascalCase for components)
- Function/component length (max ~50-100 lines)
- File organization and single responsibility
- Proper component composition vs prop drilling
- Custom hooks for shared logic
- Proper separation of concerns (business logic vs UI)
- DRY principle violations (duplicated code)
- Magic numbers/strings (should be constants)
- Commented-out code (should be removed)
- Console.log statements (should use proper logging)
- Meaningful variable/function names
- Proper file naming conventions

### 6. Performance Issues

**Check for:**
- Unnecessary re-renders (missing React.memo, useMemo, useCallback)
- Large bundle sizes (check imports, use dynamic imports)
- Unoptimized images (size, format)
- Expensive computations in render
- Large lists without virtualization
- Network waterfall issues (sequential vs parallel requests)
- Missing code splitting
- Inefficient algorithms (O(n²) where O(n) possible)
- Deep object nesting causing slow updates

### 7. Security Vulnerabilities

**Check for:**
- XSS vulnerabilities (improper sanitization)
- SQL injection (if using any SQL databases)
- Exposed API keys or secrets
- Insecure data storage
- Missing input validation
- Improper authentication checks
- CSRF vulnerabilities
- Insecure deep linking
- Missing SSL certificate pinning
- Improper permissions handling

### 8. Accessibility

**Check for:**
- Missing accessibility labels (accessibilityLabel)
- Proper heading hierarchy
- Color contrast issues
- Touch target sizes (minimum 44x44)
- Screen reader support (accessibilityRole, accessibilityHint)
- Keyboard navigation support
- Focus management

### 9. Tournament-Specific Logic

**Check for:**
- Proper bracket generation logic
- Team count validation (4-32 teams)
- Match scheduling conflicts
- Score validation
- Tournament state management
- Proper seeding algorithms
- Edge cases in elimination logic
- Data consistency in tournament updates

### 10. Automated Testing

**Test Execution:**
- Run `npm test` to execute all test suites
- Run `npm run test:coverage` to check test coverage
- Verify all tests pass before approving code
- Check that coverage meets minimum thresholds (aim for >80%)

**Test Coverage Requirements:**
- **Components**: All UI components should have tests for:
  - Rendering with different props
  - User interactions (press, input, gestures)
  - Conditional rendering logic
  - Edge cases and error states
- **Business Logic**: All services/utilities should have tests for:
  - Core functionality and algorithms
  - Input validation and error handling
  - Edge cases and boundary conditions
  - Async operations and promises
- **User Flows**: Critical paths should have integration tests:
  - Authentication (login, signup, logout)
  - Tournament creation and management
  - Match updates and scoring
  - Navigation flows

**Test Quality Checks:**
- Tests are meaningful (not just checking if component renders)
- Tests cover edge cases and error scenarios
- Tests are isolated (no dependencies between tests)
- Mocks are properly configured (Firebase, AsyncStorage, Navigation)
- Test descriptions are clear and specific
- No skipped tests (test.skip) without documented reason
- No console.log statements in tests

**Anti-patterns to flag:**
- Tests that always pass (testing implementation details)
- Tests with no assertions
- Overly complex test setup (test the test!)
- Testing library internals instead of behavior
- Brittle tests that break on minor changes
- Missing cleanup in tests (memory leaks)
- Hardcoded test data without clear purpose

**Known Issues:**
- Expo Winter runtime compatibility issue with Expo 54 + Jest
- LoginScreen tests may fail at teardown (known issue)
- TabSelector and simple component tests should work fine
- Check jest-setup.js for all required mocks

**Test Results Interpretation:**
- PASS: All tests passed - code is verified
- FAIL: Review failed tests, fix issues before proceeding
- Coverage < 80%: Write additional tests for uncovered code
- Snapshot failures: Review if changes are intentional

## Audit Process

When performing a QC audit:

1. **Run automated tests**: Execute `npm test` to verify all tests pass
   - If tests fail, document failures in the report
   - Check test coverage with `npm run test:coverage`
   - Flag any missing tests for critical code paths
2. **Identify scope**: Determine which files/components to audit based on context
3. **Systematic review**: Go through each category systematically
4. **Document findings**: Create clear, actionable items with:
   - Severity (Critical, High, Medium, Low)
   - Location (file:line)
   - Issue description
   - Recommended fix
   - Code example if applicable
5. **Prioritize**: Order by severity and impact
6. **Provide summary**: Count of issues by category and severity

## Output Format

```
# QC Audit Report

## Automated Test Results
- Test Status: PASS/FAIL
- Tests Run: X passed, Y failed, Z total
- Coverage: X% statements, Y% branches, Z% functions, W% lines
- Failed Tests: [List any failures with descriptions]

## Summary
- Critical: X issues
- High: X issues
- Medium: X issues
- Low: X issues

## Critical Issues
1. [Category] Issue description (file.ts:123)
   - Problem: Detailed explanation
   - Fix: Recommended solution
   - Example: Code snippet

## High Priority Issues
...

## Recommendations
- General improvements
- Refactoring suggestions
- Architecture considerations
- Test coverage gaps to address
```

## Examples

### Example 1: Type Safety Issue
```typescript
// BAD - Using 'any' type
function handleSubmit(data: any) {
  return data.name.toUpperCase();
}

// GOOD - Proper typing
interface FormData {
  name: string;
  email: string;
}

function handleSubmit(data: FormData): string {
  return data.name.toUpperCase();
}
```

### Example 2: Firebase Listener Leak
```typescript
// BAD - Missing cleanup
useEffect(() => {
  onSnapshot(collection(db, 'tournaments'), (snapshot) => {
    setTournaments(snapshot.docs.map(doc => doc.data()));
  });
}, []);

// GOOD - Proper cleanup
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'tournaments'), (snapshot) => {
    setTournaments(snapshot.docs.map(doc => doc.data()));
  });
  return () => unsubscribe();
}, []);
```

### Example 3: Performance Issue
```typescript
// BAD - Recreating function on every render
<TouchableOpacity onPress={() => handlePress(item.id)}>

// GOOD - Stable reference
const handleItemPress = useCallback((id: string) => {
  handlePress(id);
}, [handlePress]);

<TouchableOpacity onPress={() => handleItemPress(item.id)}>
```

### Example 4: Automated Testing
```typescript
// BAD - Shallow test that doesn't verify behavior
it('should render', () => {
  const { container } = render(<LoginScreen />);
  expect(container).toBeTruthy();
});

// GOOD - Test actual user behavior and edge cases
describe('LoginScreen', () => {
  it('should show error when email is invalid', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('Enter your email');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(getByText('Please enter a valid email address')).toBeTruthy();
    });
  });

  it('should call Firebase auth when valid credentials provided', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({ user: { uid: '123' } });
    useAuth.mockReturnValue({ signIn: mockSignIn });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
```

## When to Use This Skill

- Before creating pull requests
- When reviewing code changes
- After implementing new features
- When investigating bugs or performance issues
- During refactoring sessions
- As part of pre-release checklist
- When onboarding new team members (show quality standards)
