# QC Audit Reference Guide

## React Native/Expo Common Issues

### Image Handling
```typescript
// Avoid: Default React Native Image
import { Image } from 'react-native';

// Prefer: Expo Image (better performance, caching)
import { Image } from 'expo-image';
```

### List Performance
```typescript
// Bad: Missing optimization
<FlatList
  data={items}
  renderItem={({ item }) => <Item data={item} />}
/>

// Good: Optimized with key extraction and memoization
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <Item data={item} />}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

## TypeScript Strict Mode Issues

### Nullable Types
```typescript
// Bad: Assumes tournament exists
function getTournamentName(id: string) {
  return tournaments.find(t => t.id === id).name; // Potential undefined
}

// Good: Handle nullable case
function getTournamentName(id: string): string | undefined {
  return tournaments.find(t => t.id === id)?.name;
}

// Better: Provide fallback
function getTournamentName(id: string): string {
  return tournaments.find(t => t.id === id)?.name ?? 'Unknown Tournament';
}
```

### Type Narrowing
```typescript
// Bad: Type assertion
const tournament = data as Tournament;

// Good: Type guard
function isTournament(data: unknown): data is Tournament {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'teamCount' in data
  );
}

if (isTournament(data)) {
  // TypeScript knows data is Tournament here
  console.log(data.name);
}
```

## Firebase Best Practices

### Query Optimization
```typescript
// Bad: Reading entire collection
const querySnapshot = await getDocs(collection(db, 'tournaments'));

// Good: Limited query
const q = query(
  collection(db, 'tournaments'),
  where('status', '==', 'active'),
  orderBy('createdAt', 'desc'),
  limit(20)
);
const querySnapshot = await getDocs(q);
```

### Batch Operations
```typescript
// Bad: Multiple individual writes
tournaments.forEach(async (tournament) => {
  await setDoc(doc(db, 'tournaments', tournament.id), tournament);
});

// Good: Batch write
const batch = writeBatch(db);
tournaments.forEach((tournament) => {
  const ref = doc(db, 'tournaments', tournament.id);
  batch.set(ref, tournament);
});
await batch.commit();
```

## React Hooks Best Practices

### Dependency Arrays
```typescript
// Bad: Missing dependencies
useEffect(() => {
  fetchTournament(tournamentId);
}, []); // tournamentId should be in deps

// Good: Complete dependencies
useEffect(() => {
  fetchTournament(tournamentId);
}, [tournamentId, fetchTournament]);

// Better: Stable function reference
const fetchTournament = useCallback(async (id: string) => {
  // fetch logic
}, []);

useEffect(() => {
  fetchTournament(tournamentId);
}, [tournamentId, fetchTournament]);
```

### State Updates
```typescript
// Bad: Direct mutation
const addTeam = (team: Team) => {
  tournament.teams.push(team); // Mutating state
  setTournament(tournament);
};

// Good: Immutable update
const addTeam = (team: Team) => {
  setTournament(prev => ({
    ...prev,
    teams: [...prev.teams, team]
  }));
};
```

## Security Checklist

- [ ] No API keys hardcoded in source code
- [ ] Firebase security rules configured for all collections
- [ ] User input validated before processing
- [ ] Authentication state checked before sensitive operations
- [ ] No sensitive data in error messages or logs
- [ ] HTTPS enforced for all network requests
- [ ] Deep links properly validated
- [ ] File uploads size-limited and type-validated
- [ ] Rate limiting for API calls
- [ ] Proper permission requests (camera, photos, etc.)

## Performance Checklist

- [ ] Images optimized (compressed, correct format)
- [ ] Large lists use FlatList with proper optimization
- [ ] Expensive computations memoized (useMemo)
- [ ] Event handlers memoized (useCallback)
- [ ] Components memoized where appropriate (React.memo)
- [ ] Bundle size analyzed (no unnecessary dependencies)
- [ ] Network requests batched where possible
- [ ] Infinite scroll/pagination for large datasets
- [ ] Proper loading states to avoid UI jank
- [ ] Animations use native driver where possible

## Accessibility Checklist

- [ ] All touchable elements have accessibilityLabel
- [ ] Proper accessibilityRole set (button, header, etc.)
- [ ] Color contrast meets WCAG AA standards
- [ ] Touch targets at least 44x44 points
- [ ] Form inputs have accessibilityHint
- [ ] Error messages announced to screen readers
- [ ] Focus order logical for keyboard navigation
- [ ] Images have meaningful alt text
- [ ] Dynamic content changes announced
- [ ] Reduced motion respected (AccessibilityInfo.isReduceMotionEnabled)

## Code Smells to Flag

1. **God Components**: Components > 300 lines
2. **Prop Drilling**: Props passed through 3+ levels
3. **Duplicate Logic**: Same code in multiple places
4. **Magic Numbers**: Unexplained constants
5. **Long Functions**: Functions > 50 lines
6. **Deep Nesting**: Indentation > 4 levels
7. **Commented Code**: Should be removed
8. **Console Logs**: Should use proper logging
9. **Unclear Names**: Single letter or ambiguous names
10. **Mixed Concerns**: Business logic in components

## Tournament-Specific Validations

### Team Count Validation
```typescript
const VALID_TEAM_COUNTS = [4, 8, 16, 32];

function validateTeamCount(count: number): boolean {
  return VALID_TEAM_COUNTS.includes(count);
}
```

### Bracket Integrity
- All matches have valid team references
- No orphaned matches
- Proper progression from round to round
- Seeds properly distributed
- No duplicate team assignments

### Date/Time Validation
- Tournament end date after start date
- Match times within tournament timeframe
- No overlapping match times for same team
- Timezone handling consistent

## Common Bug Patterns in Tournament Logic

1. **Off-by-One in Seeding**: Verify array indices for bracket positions
2. **Race Conditions**: Multiple users updating same tournament
3. **Score Validation**: Ensure scores are non-negative, match format
4. **Elimination Logic**: Verify losing team properly eliminated
5. **Tie Handling**: Proper tiebreaker implementation
6. **Forfeit Scenarios**: Handle team withdrawals mid-tournament
