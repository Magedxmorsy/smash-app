# SMASH App

A tournament management app for padel tournaments.

## Features

- Create and manage padel tournaments
- Join tournaments with friends
- World Cup format with group stage and knockout rounds
- Live match tracking and results
- Real-time standings and brackets
- Push notifications for tournament updates

## Tech Stack

- React Native with Expo
- TypeScript
- Firebase (Auth, Firestore, Storage, Cloud Messaging)
- React Navigation
- React Native Paper

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase:
   - Create a Firebase project
   - Add your Firebase configuration to `.env`
   - Enable Authentication, Firestore, Storage, and Cloud Messaging

3. Start the development server:
```bash
npm start
```

## Project Structure

```
smash-app/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # App screens
│   ├── navigation/      # Navigation configuration
│   ├── services/        # Firebase and API services
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── constants/       # App constants
├── assets/              # Images, fonts, etc.
└── App.tsx             # Root component
```

## MVP Features

1. **Tournament Creation**: Create tournaments with name, photo, location, date/time, format, team count, and rules
2. **Team Formation**: Players join via shared links and form teams of 2
3. **Match Scheduling**: Auto-generated match schedules with staggered times
4. **Live Standings**: Real-time group standings and knockout brackets
5. **Match Results**: Record and view match results
6. **User Profiles**: Stats tracking and tournament history
7. **Notifications**: Push notifications for tournament events

## License

MIT
