# Claude Code - Smash App

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

## Notes

- Currently on branch: main
- Active development on modal improvements and UI fixes
