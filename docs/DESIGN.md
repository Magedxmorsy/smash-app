Design.md


# Smash - Design System Specifications

**Version:** 1.0  
**Last Updated:** November 2024  
**Platform:** iOS & Android (React Native)

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Border Radius](#border-radius)
6. [Icons](#icons)
7. [Components](#components)
   - [Buttons](#buttons)
   - [Input Fields](#input-fields)
   - [Cards](#cards)
   - [Status Badges](#status-badges)
   - [List Items](#list-items)
   - [Avatars](#avatars)
   - [Action Buttons](#action-buttons)
8. [Navigation](#navigation)
9. [Modals & Sheets](#modals--sheets)
10. [Empty States](#empty-states)
11. [Mobile Header](#mobile-header)

---

## Brand Identity

### App Name
```
Name: Smash (sentence case, capital S only)
Not: SMASH (all caps)
```

### Brand Personality
- **Fun & casual** among friends
- **Energetic & bold** - competitive spirit
- **Clean & minimal** - easy to use

### Design Principles
- Mobile-first approach
- Clear visual hierarchy
- Minimal friction in user flows
- Trust-based interactions
- Accessible and inclusive

---

## Color System

### Primary Colors (Purple/Navy)
```
Primary-100: #534C68
Primary-200: #3D3555
Primary-300: #281F42  ← Main brand color
Primary-400: #0E0528
```

**Usage:**
- Primary-300: Main brand color, primary buttons, default text, key UI
- Primary-200: Hover/pressed states, active elements
- Primary-400: Darkest accents
- Primary-100: Subtle backgrounds

---

### Secondary Colors (Coral/Orange)
```
Secondary-100: #F6947B
Secondary-200: #E27B61
Secondary-300: #CB664D  ← Main secondary color
Secondary-400: #B4492F
```

**Usage:**
- Secondary-300: Main secondary color for accents
- Secondary-200: Hover/pressed states
- Complementary to primary purple
- Secondary buttons, badges, highlights

---

### Accent Colors (Green/Teal)
```
Accent-100: #41F5A1
Accent-200: #29F395
Accent-300: #11F289  ← Main accent color
Accent-400: #00D970
```

**Usage:**
- Accent-300: Main accent, success states, positive feedback
- Accent-200: Hover/pressed states
- Active indicators, "Ready" status, completed actions
- **Only on dark backgrounds for accessibility**

---

### Neutral Colors (Grays & Black)
```
Neutral-100: #F9F9F9  (Lightest gray)
Neutral-200: #E8E8E8  (Light gray)
Neutral-300: #C8C8C8  (Medium gray)
Neutral-400: #6D6D6D  (Dark gray)
Neutral-500: #272727  (Almost black)
```

**Usage:**
- Neutral-100: Subtle backgrounds, disabled states
- Neutral-200: Borders, dividers
- Neutral-300: Disabled text, placeholders
- Neutral-400: Secondary text, icons
- Neutral-500: Primary text on light backgrounds (alternative)

---

### Surface Colors
```
Background: #F2F2F2  (App background, modals)
Surface: #FFFFFF     (Cards, elevated elements)
Border: #E8E8E8      (Borders, dividers)
```

**Usage:**
- Background: Main app background, full-screen modals
- Surface: White cards, list items, elevated surfaces
- Border: Separators, input borders, card outlines

---

### Semantic Colors

**Error States:**
```
Error: #F21D30
Error-light: #FFE9E9
```

**Info States:**
```
Info: #167DE3
Info-light: #E8F5FF
```

**Success States:**
```
Success: #53A46E
Success-light: #DBFFE7
```

**Warning States:**
```
Warning: #CBBD25
Warning-light: #FFFCDD
```

---

## Typography

### Font Family
```
Primary Font: General Sans
Available Weights: Regular (400), Medium (500), Semibold (600)
```

**Note:** All "bold" in token names = Semibold (600)

---

### Headlines

```
Headline-700: 76px / 4.750rem
Headline-700-bold: 76px / 4.750rem (Semibold 600)

Headline-600: 61px / 3.812rem
Headline-600-bold: 61px / 3.812rem (Semibold 600)

Headline-500: 49px / 3.062rem
Headline-500-bold: 49px / 3.062rem (Semibold 600)

Headline-400: 39px / 2.437rem
Headline-400-bold: 39px / 2.437rem (Semibold 600)

Headline-300: 31px / 1.937rem
Headline-300-bold: 31px / 1.937rem (Semibold 600)

Headline-200: 25px / 1.562rem
Headline-200-bold: 25px / 1.562rem (Semibold 600)

Headline-100: 20px / 1.250rem
Headline-100-bold: 20px / 1.250rem (Semibold 600)
```

**Line Height:** 118% for all headlines

---

### Body Text

```
Body-100-regular: 20px / 1.250rem (Regular 400)
Body-100-medium: 20px / 1.250rem (Medium 500)
Body-100-bold: 20px / 1.250rem (Semibold 600)

Body-200-regular: 16px / 1.000rem (Regular 400) ← Primary body text
Body-200-medium: 16px / 1.000rem (Medium 500)
Body-200-bold: 16px / 1.000rem (Semibold 600)

Body-300-regular: 13px / 0.812rem (Regular 400)
Body-300-medium: 13px / 0.812rem (Medium 500)
Body-300-bold: 13px / 0.812rem (Semibold 600)
```

**Line Height:** 150% for all body text

---

### Special Text Styles

```
LABEL: 10px / 0.625rem (Medium 500)
  - Line Height: 120%
  - Usage: Labels, tags, metadata

Button: 16px / 1.000rem (Semibold 600)
  - Line Height: 100%
  - Usage: Button text, CTAs
```

---

### Text Colors

```
Primary Text: Primary-300 (#281F42) - Default for all text
Secondary Text: Neutral-400 (#6D6D6D) - Supporting info
Disabled Text: Neutral-300 (#C8C8C8) - Disabled/placeholder
Text on Dark: Surface (#FFFFFF) - On colored backgrounds
```

---

## Spacing System

### 4-Point Grid
All spacing uses multiples of 4px:

```
Space-1:  4px   (0.25rem)
Space-2:  8px   (0.5rem)
Space-3:  12px  (0.75rem)
Space-4:  16px  (1rem)
Space-5:  20px  (1.25rem)
Space-6:  24px  (1.5rem)
Space-8:  32px  (2rem)
Space-10: 40px  (2.5rem)
Space-12: 48px  (3rem)
Space-16: 64px  (4rem)
Space-20: 80px  (5rem)
Space-24: 96px  (6rem)
```

**Usage:** All padding, margins, gaps must use these values

---

## Border Radius

### Radius Values
```
Radius-1:  4px   (0.25rem)  - Tags, chips, badges
Radius-2:  8px   (0.5rem)   - Reserved
Radius-3:  12px  (0.75rem)  - Input fields
Radius-4:  16px  (1rem)     - Cards, buttons
Radius-6:  24px  (1.5rem)   - Large cards, bottom sheets
Radius-8:  32px  (2rem)     - Extra large containers
Radius-10: 40px  (2.5rem)   - Hero elements
Radius-full: 9999px         - Circular (avatars)
```

### Corner Smoothing
```
Corner Smoothing: 60%
```
**Important:** All corners use 60% corner smoothing (iOS-style smooth corners)

---

## Icons

### Icon Sizes
```
Icon-small:  16px  (1rem)   - Inline, small buttons, labels
Icon-medium: 24px  (1.5rem) - Standard icons, navigation
Icon-large:  32px  (2rem)   - Feature icons, emphasis
```

### Icon Colors
Match text color or component context

---

## Components

### Buttons

#### Full-Width Button

**Layout:**
```
Width: 100% (edge to edge)
Height: 56px
Border Radius: Radius-4 (16px) with 60% smoothing
Padding: 8px (top/bottom) × 16px (left/right)
```

**Typography:**
```
Font: General Sans
Size: Button (16px)
Weight: Semibold (600)
Alignment: Center
```

**Primary Button:**
```
Default:
  Background: Primary-300 (#281F42)
  Text: Surface (#FFFFFF)

Pressed:
  Background: Primary-200 (#3D3555)
  Text: Surface (#FFFFFF)
  Scale: 98%
  Haptic: Light impact
```

**Secondary Button:**
```
Default:
  Background: Secondary-300 (#CB664D)
  Text: Surface (#FFFFFF)

Pressed:
  Background: Secondary-200 (#E27B61)
  Scale: 98%
```

**Accent Button (Dark Backgrounds Only):**
```
Default:
  Background: Accent-300 (#11F289)
  Text: Primary-300 (#281F42)

Pressed:
  Background: Accent-200 (#29F395)
  Scale: 98%
```

**Ghost Button:**
```
Default:
  Background: Surface (#FFFFFF)
  Text: Primary-300 (#281F42)
  Border: 1px solid Border (#E8E8E8)

Pressed:
  Background: Neutral-100 (#F9F9F9)
  Scale: 98%
```

**Disabled Button:**
```
Background: Neutral-200 (#E8E8E8)
Text: Neutral-400 (#6D6D6D)
Not interactive
```

---

#### Small Button (Hugs Content)

**Layout:**
```
Width: Auto (hugs content)
Height: Auto
Padding: 8px (top/bottom) × 24px (left/right)
Border Radius: Radius-4 (16px) with 60% smoothing
```

**Same color variants as full-width button**

---

### Input Fields

**Layout:**
```
Background: Surface (#FFFFFF)
Border: 1px solid Border (#E8E8E8)
Border Radius: Radius-3 (12px) with 60% smoothing
Height: 56px
Padding: 13px (top/bottom) × 16px (left/right)
```

**Typography:**
```
Text: Body-200-regular (16px)
Line Height: 150%
```

**States:**

**Empty (Placeholder):**
```
Placeholder: Neutral-400 (#6D6D6D)
Icons: Neutral-400 (#6D6D6D)
Border: Border (#E8E8E8)
```

**Filled:**
```
Text: Primary-300 (#281F42)
Icons: Primary-300 (#281F42)
Border: Border (#E8E8E8)
```

**Focus:**
```
Text: Primary-300 (#281F42)
Icons: Primary-300 (#281F42)
Border: Primary-200 (#3D3555)
```

**Error:**
```
Text: Primary-300 (#281F42)
Border: Error (#F21D30)
Error message: Error (#F21D30), Body-300-regular
```

**Disabled:**
```
Background: Neutral-100 (#F9F9F9)
Text: Neutral-300 (#C8C8C8)
Border: Border (#E8E8E8)
```

---

### Cards

**Layout:**
```
Background: Surface (#FFFFFF)
Border: 1px solid Border (#E8E8E8)
Border Radius: Radius-4 (16px) with 60% smoothing
Padding: 16px (all sides)
Shadow: None
```

**Interactive Cards:**
```
Pressed:
  Scale: 98%
  Haptic: Light impact
  Transition: 150ms ease-out
```

---

### Status Badges

**Layout:**
```
Padding: 2px (top/bottom) × 4px (left/right)
Border Radius: Radius-1 (4px) with 60% smoothing
Height: Auto
Display: Inline
```

**Typography:**
```
Font: General Sans
Size: LABEL (10px)
Weight: Semibold (600)
Line Height: 120%
Transform: UPPERCASE
Letter Spacing: 0.5px
```

**Variants:**

```
Group Stage:
  Background: Primary-300 (#281F42)
  Text: Surface (#FFFFFF)

Registration:
  Background: Neutral-300 (#C8C8C8)
  Text: Primary-300 (#281F42)

Semi-Finals:
  Background: Warning-light (#FFFCDD)
  Text: Primary-300 (#281F42)

Finals:
  Background: Secondary-100 (#F6947B)
  Text: Primary-300 (#281F42)

Finished:
  Background: Success-light (#DBFFE7)
  Text: Primary-300 (#281F42)
```

---

### List Items / Details

**Layout:**
```
Display: Flex row
Alignment: Left, Center (vertical)
Gap: 8px (icon to text)
Padding: 0
Background: Transparent
```

**Icon:**
```
Size: Icon-medium (24px)
Color: Primary-300 (#281F42)
```

**Text:**
```
Font: Body-200-medium (16px)
Weight: Medium (500)
Color: Primary-300 (#281F42)
Line Height: 150%
```

**Spacing between items:** 4px (Space-1)

---

### Avatars

**Sizes:**
```
Small: 40px × 40px
Medium: 72px × 72px
Large: 96px × 96px
```

**Variants:**

**Without Border:**
```
Border Radius: Radius-full (9999px)
Border: None
```

**With Border:**
```
Border Radius: Radius-full (9999px)
Border: 1px solid Border (#E8E8E8)
```

**Initials Avatar (Fallback):**
```
Background: Primary-300 or random color
Text: Surface (#FFFFFF)
Font: General Sans Semibold
Font Size:
  Small: 16px
  Medium: 28px
  Large: 40px
```

---

### Action Buttons

**Layout:**
```
Display: Flex row
Gap: 8px (icon to label)
Padding: 4px (top/bottom) × 0 (left/right)
Min Height: 44px
Background: Transparent
```

**Icon:** Icon-large (32px)
**Label:** Button (16px, Semibold)

**Variants:**

**Primary on Light:**
```
Default: Primary-300 (#281F42)
Pressed: Primary-200 (#3D3555)
```

**Primary on Dark:**
```
Default: Surface (#FFFFFF)
Pressed: Neutral-200 (#E8E8E8)
```

**Accent on Dark:**
```
Default: Accent-300 (#11F289)
Pressed: Accent-200 (#29F395)
```

**Neutral:**
```
Default: Neutral-400 (#6D6D6D)
Pressed: Neutral-300 (#C8C8C8)
```

**Destructive:**
```
Default: Error (#F21D30)
Pressed: Error with Error-light background
Haptic: Medium impact
```

---

## Navigation

### Bottom Navigation Bar

**Container:**
```
Height: 60px + env(safe-area-inset-bottom)
Background: Background (#F2F2F2)
Border Top: 1px solid Border (#E8E8E8)
Padding: 8px (top) × 24px (left/right) × 0 (bottom)
```

**Navigation Item:**
```
Display: Flex column
Height: 52px
Min Width: 65px
Padding: 0
Gap: 0px (icon to label)
```

**Icon:** Icon-large (32px)
**Label:** Body-300-medium (13px)

**States:**

**Unselected:**
```
Icon: Neutral-400 (#6D6D6D) - outline icon
Label: Neutral-400 (#6D6D6D)
```

**Selected:**
```
Icon: Accent-300 (#11F289) - filled icon
Label: Accent-300 (#11F289)
```

**4 Tabs:** Home, Compete, Updates, Profile

---

## Modals & Sheets

### Full-Screen Modal

**Container:**
```
Width: 100%
Height: 90vh
Background: Background (#F2F2F2)
Border Radius: Radius-6 (24px) - top corners
Position: Fixed bottom
```

**Swipe Handle (Always):**
```
Width: 40px
Height: 4px
Background: Neutral-300 (#C8C8C8)
Border Radius: 2px
Margin: 8px (top) × auto × 12px (bottom)
```

**Header (Optional):**
```
Height: 56px
Border Bottom: 1px solid Border (#E8E8E8)
Padding: 0 × 16px
```

**Header Elements:**
```
Close Icon (Left): Icon-small (16px), Primary-300
Title (Center): Headline-200-bold (25px), Primary-300
Action Icon (Right): Icon-small (16px), Primary-300
```

**Body:**
```
Padding: 16px (all sides)
Overflow: Scroll (vertical)
```

**Footer (Optional):**
```
Padding: 16px (left/right/bottom)
Safe Area: env(safe-area-inset-bottom)
Buttons: Full-width, 8px gap
```

---

### Bottom Sheet

**Container:**
```
Width: 100%
Height: Auto (content-based)
Max Height: 90vh
Background: Background (#F2F2F2)
Border Radius: Radius-6 (24px) - top corners
```

**No header - just handle + content**

**Content:**
```
Padding: 16px (all sides)
Overflow: Scroll if needed
```

**Footer:** Optional, same as modal

**Use Cases:**
- Action lists (Share, Edit, Delete)
- Quick forms (2-3 fields)
- Selection pickers
- Confirmations

---

## Empty States

### Page-Level Empty State

**Layout:**
```
Display: Flex column
Alignment: Center (horizontal and vertical)
Padding: 32px (left/right)
Max Width: 400px
Position: Center of screen
```

**Structure:**

**1. Image/Icon:**
```
Size: 214px × 214px
Color: Neutral-300 (#C8C8C8) or context-dependent
```

↓ 32px Space (Space-8)

**2. Headline:**
```
Font: Headline-100-bold (20px)
Weight: Semibold (600)
Color: Primary-300 (#281F42)
Alignment: Center
Line Height: 118%
```

↓ 8px Space (Space-2)

**3. Body:**
```
Font: Body-200-medium (16px)
Weight: Medium (500)
Color: Primary-300 (#281F42)
Alignment: Center
Max Width: 252px
Line Height: 150%
```

↓ 32px Space (Space-8)

**4. CTA (Optional):**
```
Type: Small button (hugs content)
Variants: Primary, Secondary, Accent, or Ghost
Alignment: Center
```

**Examples:**
- "No teams yet" + "Share tournament" button (secondary)
- "No tournaments yet" + "Create tournament" button (primary)
- "No ongoing tournaments" + "Create tournament" button (primary)
- "No completed tournaments" + no button
- "No updates yet" + no button

**Component Usage:**
```jsx
<EmptyState
  imageSource={require('path/to/image.png')}
  headline="Invite friends to join!"
  body="Share the tournament link with your friends."
  button={
    <Button
      title="Share tournament"
      variant="secondary"
      fullWidth={false}
    />
  }
/>
```

---

## Mobile Header

**Container:**
```
Total Height: 112px
  - Status Bar: 44px (system)
  - Header Content: 68px

Background: Background (#F2F2F2)
Border Bottom: Optional 1px solid Border (#E8E8E8)
```

**Content Area:**
```
Height: 68px
Padding: 0 × 16px (left/right) × 16px (bottom)
Elements positioned at bottom
```

**Left: Logo or Title:**
```
Logo: Smash wordmark (~36px height)
Title: Headline-200-bold (25px), Primary-300
Position: 16px from left, 16px from bottom
```

**Right: Action Icon:**
```
Icon: Icon-large (32px)
Color: Primary-300 (#281F42)
Position: 16px from right, 16px from bottom
Tap Area: 44×44px minimum
```

---

## Design Tokens Summary

### Quick Reference

**Colors:**
- Primary brand: Primary-300 (#281F42)
- Secondary: Secondary-300 (#CB664D)
- Accent (dark only): Accent-300 (#11F289)
- Background: #F2F2F2
- Surface: #FFFFFF
- Border: #E8E8E8

**Typography:**
- Font: General Sans
- Body: Body-200-regular (16px, 150% line height)
- Headings: 118% line height
- Button: 16px Semibold

**Spacing:**
- Base: 4px grid
- Common: 4, 8, 12, 16, 24, 32px

**Radius:**
- Buttons/Cards: 16px
- Inputs: 12px
- Tags: 4px
- Corner smoothing: 60%

**Shadows:**
- None (flat design)

---

## Implementation Notes

### React Native / Expo
- Use exact color values (no opacity variations)
- Corner smoothing: iOS native, Android approximation
- Haptic feedback: Use Haptics API
- Safe areas: Use react-native-safe-area-context

### Accessibility
- Minimum touch targets: 44×44px
- Color contrast: WCAG AA minimum
- Text scaling: Support dynamic type
- Screen reader: Proper semantic markup

### Performance
- Optimize images: Use SVG for icons
- Lazy load: Heavy content
- Memoize: Expensive components

---

**End of Design System Specifications**

For questions or updates, refer to the Figma design file or contact the design team.
