# Component Registry

This file tracks all reusable components in the SMASH app. Update when adding new components.

## UI Components (src/components/ui/)

### Button
**File:** `src/components/ui/Button.tsx`
**Props:**
- `variant?: 'primary' | 'secondary' | 'outline'`
- `size?: 'sm' | 'md' | 'lg'`
- `disabled?: boolean`
- `onPress: () => void`
- `children: ReactNode`

**Usage:**
```tsx
<Button variant="primary" size="md" onPress={handleSubmit}>
  Create Tournament
</Button>
```

---

### Input
**File:** `src/components/ui/Input.tsx`
**Props:**
- `placeholder?: string`
- `value: string`
- `onChangeText: (text: string) => void`
- `error?: string`
- `label?: string`

**Usage:**
```tsx
<Input
  label="Tournament Name"
  placeholder="Enter name"
  value={name}
  onChangeText={setName}
/>
```

---

### TextArea
**File:** `src/components/ui/TextArea.tsx`
**Props:**
- `placeholder?: string`
- `value: string`
- `onChangeText: (text: string) => void`
- `rows?: number`

**Usage:**
```tsx
<TextArea
  placeholder="Description"
  value={description}
  onChangeText={setDescription}
  rows={4}
/>
```

---

### Card
**File:** `src/components/ui/Card.tsx`
**Props:**
- `variant?: 'elevated' | 'outlined' | 'flat'`
- `padding?: 'sm' | 'md' | 'lg'`
- `children: ReactNode`
- `style?: StyleProp<ViewStyle>`

**Usage:**
```tsx
<Card variant="elevated" padding="md">
  <Text>Card content</Text>
</Card>
```

---

### CardGroup
**File:** `src/components/ui/CardGroup.tsx`
**Props:**
- `children: ReactNode`
- `showDividers?: boolean`

**Usage:**
```tsx
<CardGroup showDividers>
  <ListItem label="Teams" value="16" />
  <ListItem label="Format" value="Single Elimination" />
</CardGroup>
```

---

### ListItem
**File:** `src/components/ui/ListItem.tsx`
**Props:**
- `label: string`
- `value?: string | ReactNode`
- `icon?: ReactNode`
- `onPress?: () => void`
- `showChevron?: boolean`

**Usage:**
```tsx
<ListItem
  label="Number of Teams"
  value="16"
  onPress={handlePress}
  showChevron
/>
```

---

### Avatar
**File:** `src/components/ui/Avatar.tsx`
**Props:**
- `size?: 'sm' | 'md' | 'lg'`
- `source?: ImageSourcePropType`
- `name?: string` (for initials fallback)
- `border?: boolean`

**Usage:**
```tsx
<Avatar
  size="md"
  source={{ uri: user.avatarUrl }}
  border
/>
```

---

### FullScreenModal
**File:** `src/components/ui/FullScreenModal.tsx`
**Props:**
- `visible: boolean`
- `onClose: () => void`
- `title?: string`
- `children: ReactNode`

**Usage:**
```tsx
<FullScreenModal
  visible={isVisible}
  onClose={handleClose}
  title="Create Tournament"
>
  {/* Modal content */}
</FullScreenModal>
```

---

### Divider
**File:** `src/components/ui/Divider.tsx`
**Props:**
- `style?: StyleProp<ViewStyle>`

**Usage:**
```tsx
<Divider />
```

---

## Tournament Components (src/components/tournament/)

### TournamentCard
**File:** `src/components/tournament/TournamentCard.tsx`
**Props:** (To be documented)

---

### MatchCard
**File:** `src/components/tournament/MatchCard.tsx` (if exists)
**Props:** (To be documented)
**Status:** ⚠️ Check for duplicates - may have variants

---

## Navigation Components

### TabBar
**File:** (To be documented)

---

## Component Creation Checklist

Before creating a new component, ask:

- [ ] Does a similar component already exist in this registry?
- [ ] Can I extend an existing component with props instead?
- [ ] Is this a variant or truly a new pattern?
- [ ] Have I checked Card, Button, Input, ListItem for base functionality?
- [ ] Will this component be reused 3+ times?
- [ ] Does it follow the design token system?
- [ ] Is it properly typed with TypeScript?
- [ ] Does it support variant/size props where applicable?
- [ ] Is it documented in this registry after creation?

## Anti-Patterns to Avoid

❌ **Don't create:**
- `MatchCardSmall` and `MatchCardLarge` → Use `<MatchCard size="sm" />` and `<MatchCard size="lg" />`
- `PrimaryButton` and `SecondaryButton` → Use `<Button variant="primary" />` and `<Button variant="secondary" />`
- `TournamentCard` and `MatchCard` if they share 80%+ structure → Create base Card with variants

✅ **Do create:**
- Components with distinct purposes (Button vs Input vs Card)
- Domain-specific compositions (BracketView, TournamentBracket)
- Complex stateful components (DatePicker, MultiSelect)

## Recently Consolidated Components

Track successful consolidations here:

| Date | Old Components | New Component | Status |
|------|---------------|---------------|--------|
| - | - | - | - |

## Planned Components

Components that should be created:

| Component | Purpose | Priority | Status |
|-----------|---------|----------|--------|
| Badge | Status indicators (Live, Completed, etc.) | Medium | Planned |
| Chip | Tags, filters | Low | Planned |
| LoadingSpinner | Loading states | High | Planned |
| EmptyState | No data states | Medium | Planned |
| IconButton | Icon-only buttons | Medium | Planned |

## Design System Files

**Required files:**
- `src/design-system/tokens.ts` - Design tokens (colors, spacing, etc.)
- `src/design-system/theme.ts` - Theme configuration
- `src/components/ui/` - Reusable UI components

**Status:** ⚠️ To be created/verified
