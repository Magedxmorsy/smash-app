---
name: design-system-enforcer
description: "Enforce design system consistency and component reuse. Prevents duplicate components (like multiple match card variants), ensures consistent styling, validates design token usage, and promotes component composition. Use when creating new components, reviewing UI code, or auditing design consistency."
allowed-tools:
  - Read
  - Grep
  - Glob
---

# Design System Enforcer

Maintains design system consistency and maximizes component reuse across the SMASH tournament app.

## Core Principles

1. **Single Source of Truth**: One component per UI pattern
2. **Composition Over Duplication**: Extend components via props, not copying
3. **Design Tokens**: Consistent spacing, colors, typography, shadows
4. **Variants, Not Versions**: Use variant props instead of creating new components
5. **Document Components**: All reusable components must be documented

## What This Skill Does

### 1. Component Duplication Detection

**Identifies:**
- Multiple components serving the same purpose (e.g., 4 different match cards)
- Similar styling patterns duplicated across files
- Inline styles that should use shared components
- Copy-pasted component code with minor variations

**Action:**
- Flag duplicate components with similarity score
- Suggest consolidation into single component with variants
- Recommend prop-based customization patterns
- Provide refactoring examples

**Example Violation:**
```typescript
// Found: MatchCard.tsx, MatchCardSmall.tsx, MatchCardLarge.tsx, TournamentMatchCard.tsx
// Problem: 4 components for same concept
// Solution: Single MatchCard with size and variant props
```

### 2. Design Token Enforcement

**Design tokens to validate:**

**Colors:**
- Primary: `#007AFF` (or from theme)
- Secondary: `#5856D6`
- Success: `#34C759`
- Warning: `#FF9500`
- Error: `#FF3B30`
- Background: `#FFFFFF` / `#000000` (light/dark)
- Surface: `#F2F2F7` / `#1C1C1E`
- Text Primary: `#000000` / `#FFFFFF`
- Text Secondary: `#3C3C43` / `#EBEBF5`
- Border: `#C6C6C8` / `#38383A`

**Spacing Scale:**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

**Typography:**
- Heading 1: 32px, bold
- Heading 2: 24px, bold
- Heading 3: 20px, semibold
- Body: 16px, regular
- Caption: 14px, regular
- Small: 12px, regular

**Border Radius:**
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- full: 9999px (pill/circle)

**Shadows:**
- sm: Small elevation
- md: Medium elevation
- lg: Large elevation (modals, cards)

**Flag violations:**
```typescript
// BAD: Magic numbers
<View style={{ padding: 12, borderRadius: 6 }}>

// GOOD: Design tokens
<View style={{ padding: spacing.md, borderRadius: borderRadius.md }}>
```

### 3. Component Registry Tracking

Maintains awareness of existing reusable components:

**Current Component Library:**
```
src/components/
├── ui/
│   ├── Button.tsx (primary, secondary, outline variants)
│   ├── Input.tsx
│   ├── TextArea.tsx
│   ├── Card.tsx
│   ├── CardGroup.tsx
│   ├── ListItem.tsx
│   ├── Avatar.tsx (sm, md, lg sizes)
│   ├── FullScreenModal.tsx
│   └── Divider.tsx
├── tournament/
│   ├── TournamentCard.tsx
│   ├── MatchCard.tsx (if exists)
│   └── BracketView.tsx (if exists)
└── navigation/
    └── TabBar.tsx (if exists)
```

**Before creating new component, check:**
1. Does similar component already exist?
2. Can existing component be extended with props?
3. Should this be a variant of existing component?
4. Is this truly a new pattern or slight variation?

### 4. Component Pattern Enforcement

**Required structure for reusable components:**

```typescript
// 1. Proper TypeScript interface
interface ComponentNameProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  // ... other props
}

// 2. Component with typed props
export function ComponentName({
  variant = 'primary',
  size = 'md',
  disabled = false,
  ...props
}: ComponentNameProps) {
  // 3. Style composition based on props
  const styles = [
    baseStyles.container,
    variantStyles[variant],
    sizeStyles[size],
    disabled && baseStyles.disabled,
  ];

  return <View style={styles}>{/* ... */}</View>;
}

// 4. Styles using design tokens
const baseStyles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    // ...
  },
  disabled: {
    opacity: 0.5,
  },
});
```

### 5. Audit Process

When reviewing code or creating components:

**Step 1: Scan for Duplicates**
- Search for similar component names (Card, Button, Input, etc.)
- Find style patterns (borderRadius, padding combinations)
- Identify repeated JSX structures

**Step 2: Validate Design Tokens**
- Check for magic numbers in styles
- Verify color values match design system
- Ensure spacing follows scale
- Validate typography usage

**Step 3: Check Component Structure**
- Proper TypeScript typing
- Variant/size props where applicable
- Composition-friendly (accepts children, style overrides)
- Documented props and usage

**Step 4: Recommend Consolidation**
- Map duplicate components
- Suggest unified component with variants
- Provide migration path
- Show before/after examples

## Detection Patterns

### Pattern 1: Component Name Similarity
```bash
# Flag these patterns:
MatchCard.tsx, MatchCardLarge.tsx, MatchCardSmall.tsx
Button.tsx, PrimaryButton.tsx, SecondaryButton.tsx
```

**Should be:**
```typescript
<MatchCard size="sm" />
<MatchCard size="lg" />
<Button variant="primary" />
<Button variant="secondary" />
```

### Pattern 2: Inline Style Duplication
```typescript
// BAD: Found in 3+ files
<View style={{
  padding: 16,
  borderRadius: 8,
  backgroundColor: '#FFFFFF',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
}}>

// SHOULD USE: <Card> component
```

### Pattern 3: Copy-Paste with Variations
```typescript
// File 1: MatchCardA.tsx
function MatchCardA() {
  return (
    <View style={{ padding: 16, borderRadius: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{team1}</Text>
      <Text>vs</Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{team2}</Text>
    </View>
  );
}

// File 2: MatchCardB.tsx (95% similar!)
function MatchCardB() {
  return (
    <View style={{ padding: 20, borderRadius: 12 }}> {/* Only difference */}
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{team1}</Text>
      <Text>vs</Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{team2}</Text>
    </View>
  );
}

// SHOULD BE: Single component with size prop
```

## Output Format

```
# Design System Audit Report

## Component Duplication Issues
Found X duplicate/similar components

### 1. Match Card Variants (Critical)
**Files:**
- src/components/MatchCard.tsx
- src/components/MatchCardSmall.tsx
- src/components/tournament/TournamentMatchCard.tsx

**Similarity:** 87%

**Recommendation:**
Consolidate into single MatchCard component:

\`\`\`typescript
interface MatchCardProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'tournament';
  team1: Team;
  team2: Team;
  score?: { team1: number; team2: number };
}

export function MatchCard({ size = 'md', variant = 'default', ... }: MatchCardProps) {
  // Single implementation with prop-based styling
}
\`\`\`

**Migration:**
- Replace MatchCardSmall with <MatchCard size="sm" />
- Replace TournamentMatchCard with <MatchCard variant="tournament" />
- Delete duplicate files

---

## Design Token Violations
Found X magic number/hardcoded value violations

### Example Violations:
1. src/screens/Tournament.tsx:45
   \`\`\`typescript
   // Current: padding: 12
   // Should be: padding: spacing.md
   \`\`\`

2. src/components/CustomButton.tsx:23
   \`\`\`typescript
   // Current: backgroundColor: '#007AFF'
   // Should be: backgroundColor: colors.primary
   \`\`\`

---

## Missing Component Opportunities
Found X places where reusable component should be created

### Example:
Form input pattern repeated in 5 files
**Recommendation:** Create shared FormInput component

---

## Component Structure Issues
Found X components with structure issues

### Example:
1. Button.tsx missing TypeScript prop interface
2. Card.tsx missing variant system
3. Input.tsx not using design tokens

---

## Summary
- Consolidate: X duplicate components → Y unified components
- Fix: X design token violations
- Create: X new reusable components
- Refactor: X component structures
```

## Design Token File Structure

Recommend creating centralized design tokens:

```typescript
// src/design-system/tokens.ts
export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  // ...
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' as const },
  h2: { fontSize: 24, fontWeight: 'bold' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: 'normal' as const },
  caption: { fontSize: 14, fontWeight: 'normal' as const },
  small: { fontSize: 12, fontWeight: 'normal' as const },
};
```

## When to Use This Skill

**Automatic triggers:**
- "Check design consistency"
- "Are there duplicate components?"
- "Review component library"
- "Should I create a new component or use existing?"
- "Audit UI consistency"
- Before creating any new UI component
- During component refactoring
- Before submitting design-heavy PRs

## Success Criteria

A well-maintained design system has:
- ✅ Single component per UI pattern
- ✅ All magic numbers replaced with design tokens
- ✅ Consistent prop APIs across similar components
- ✅ Component variants instead of duplicates
- ✅ Documented component library
- ✅ Easy to find and reuse components
- ✅ Style consistency across app

## Examples of Good Component Design

### Example 1: Button with Variants
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  ...props
}: ButtonProps) {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
  ];

  return (
    <TouchableOpacity style={buttonStyles} disabled={disabled} {...props}>
      <Text style={styles[`text_${variant}`]}>{children}</Text>
    </TouchableOpacity>
  );
}
```

### Example 2: Card with Composition
```typescript
interface CardProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: keyof typeof spacing;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  variant = 'elevated',
  padding = 'md',
  children,
  style,
}: CardProps) {
  return (
    <View style={[
      styles.base,
      styles[variant],
      { padding: spacing[padding] },
      style, // Allow override
    ]}>
      {children}
    </View>
  );
}

// Usage: Composable for any content
<Card variant="elevated">
  <MatchInfo team1={team1} team2={team2} />
</Card>

<Card variant="outlined" padding="lg">
  <TournamentDetails {...tournament} />
</Card>
```

### Example 3: Match Card (Consolidated)
```typescript
interface MatchCardProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'live' | 'completed';
  team1: { name: string; logo?: string; score?: number };
  team2: { name: string; logo?: string; score?: number };
  time?: Date;
  onPress?: () => void;
}

export function MatchCard({
  size = 'md',
  variant = 'default',
  team1,
  team2,
  time,
  onPress,
}: MatchCardProps) {
  // Single implementation handles all cases
  const containerStyle = [
    styles.container,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
  ];

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress}>
      {/* Unified layout with conditional rendering based on props */}
    </TouchableOpacity>
  );
}

// Replaces: MatchCard, MatchCardSmall, MatchCardLarge, LiveMatchCard, etc.
```
