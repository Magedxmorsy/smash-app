---
name: qc-audit
description: "Perform comprehensive quality control audits on code including React Native/Expo best practices, TypeScript type safety, Firebase security, bug detection, performance issues, and code quality standards. Use when reviewing code, before commits, or when investigating quality concerns."
allowed-tools:
  - Read
  - Grep
  - Glob
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

## Audit Process

When performing a QC audit:

1. **Identify scope**: Determine which files/components to audit based on context
2. **Systematic review**: Go through each category systematically
3. **Document findings**: Create clear, actionable items with:
   - Severity (Critical, High, Medium, Low)
   - Location (file:line)
   - Issue description
   - Recommended fix
   - Code example if applicable
4. **Prioritize**: Order by severity and impact
5. **Provide summary**: Count of issues by category and severity

## Output Format

```
# QC Audit Report

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

## When to Use This Skill

- Before creating pull requests
- When reviewing code changes
- After implementing new features
- When investigating bugs or performance issues
- During refactoring sessions
- As part of pre-release checklist
- When onboarding new team members (show quality standards)
