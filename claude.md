# Claude Code - Smash App

⚠️ **CRITICAL INSTRUCTIONS FOR CLAUDE - READ FIRST**

Before starting ANY work in this codebase, you MUST:
1. **Read this entire CLAUDE.md file** at the beginning of each session
2. **Check the "Lessons Learned" section** for relevant patterns before making changes
3. **Follow ALL "Working Guidelines"** below without exception
4. **Reference these guidelines** when making architectural or implementation decisions

Failure to follow these instructions means you're not adhering to project standards and may introduce bugs or inconsistencies.

---

This file contains context and guidelines for working with the Smash App codebase.

## Project Overview

Smash App is a React Native application for managing tournaments and player profiles.

## Tech Stack

- React Native with Expo
- Firebase (Authentication, Firestore, Storage)
- React Navigation
- Formik for forms
- Expo Image Picker

## Key Components

### Profile
- `EditProfileModal.jsx` - Modal for editing user profiles

### Tournament
- `CreateTournamentModal.jsx` - Modal for creating tournaments

## Recent Changes

- Fixed Android modal backdrop and padding issues
- Improved modal consistency across platforms
- Standardized avatar field naming (avatarSource → avatarUri)
- Fixed tournament creation navigation

## Conventions

- Avatar images use `avatarUri` field name
- Modals follow consistent styling patterns for Android and iOS

## Working Guidelines

1. **Never claim a fix is complete** - Don't say "it is fixed" for any issue until the user confirms it
2. **Explain before acting** - Always explain the root problem of any issue/bug before making changes
3. **Avoid dynamic keys in component keys** - When implementing features, be cautious about existing code patterns that may conflict with new changes
4. **Always confirm before major changes** - Never implement significant features, animations, or architectural changes without confirming the exact requirements with the user first. Ask clarifying questions to understand the desired behavior before writing code.

## Lessons Learned: React Component Keys and Modal Management

### Issue: Modal Reopening After State Update

**What happened**: When implementing a confirmation dialog for tournament rescheduling, the edit modal would unexpectedly reopen after being dismissed, causing a flickering behavior.

**Root cause**: The modal component had a dynamic `key` prop using `Date.now()`:
```javascript
key={`edit-modal-${tournament?.id}-${Date.now()}`}
```

**Why it caused problems**:
- When tournament data updated after confirmation, it triggered a re-render
- `Date.now()` generated a new timestamp on each render
- React treated the modal as a completely new component and remounted it
- This happened even though `showEditModal={false}` should have closed it

**The fix**: Remove the dynamic timestamp from the key:
```javascript
key={`edit-modal-${tournament?.id}`}
```

**Key principles**:
1. **Component keys should be stable** - Keys should identify components uniquely but consistently across renders
2. **Conditional rendering is sufficient** - Use `{showModal && <Modal />}` to control mounting/unmounting
3. **Avoid Date.now() in keys** - Dynamic timestamps in keys cause unnecessary remounts
4. **State updates can trigger re-renders** - Be aware that updating parent state after a modal action will cause re-renders of the parent component
5. **Test state-dependent flows** - When implementing features that update data and close modals, verify the modal doesn't reopen

**Best practices for modals**:
```javascript
// ✅ Good - Stable key, controlled by conditional rendering
{showEditModal && (
  <Modal
    key={`modal-${id}`}
    visible={showEditModal}
    onClose={() => setShowEditModal(false)}
  />
)}

// ❌ Bad - Dynamic key causes remounts
{showEditModal && (
  <Modal
    key={`modal-${id}-${Date.now()}`}
    visible={showEditModal}
    onClose={() => setShowEditModal(false)}
  />
)}
```

**When to use dynamic keys**: Only when you genuinely need to force a complete remount to reset internal state (rare cases, and should be intentional, not accidental)

## Notes

- Currently on branch: main
- Active development on modal improvements and UI fixes
