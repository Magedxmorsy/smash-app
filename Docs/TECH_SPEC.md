# SMASH App - Technical Specification

## Technology Stack

### Frontend
- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation v6
- **State Management:** React Context API + useState/useReducer
- **UI Components:** React Native Paper (Material Design)
- **Image Handling:** Expo Image Picker
- **Date/Time:** date-fns

### Backend
- **Platform:** Firebase
- **Authentication:** Firebase Auth (Email/Password)
- **Database:** Cloud Firestore
- **Storage:** Firebase Storage (for images)
- **Hosting:** Firebase Hosting (web version if needed)
- **Push Notifications:** Firebase Cloud Messaging (FCM)

### Development Tools
- **Version Control:** Git + GitHub
- **Code Editor:** VS Code
- **Package Manager:** npm or yarn
- **Linting:** ESLint + Prettier
- **Testing:** Jest + React Native Testing Library (post-MVP)

---

## Project Structure

```
smash/
â"œâ"€â"€ src/
â"‚   â"œâ"€â"€ components/          # Reusable UI components
â"‚   â"‚   â"œâ"€â"€ common/          # Buttons, inputs, cards
â"‚   â"‚   â"œâ"€â"€ tournament/      # Tournament-specific components
â"‚   â"‚   â"œâ"€â"€ match/           # Match-related components
â"‚   â"‚   â""â"€â"€ profile/         # Profile components
â"‚   â"œâ"€â"€ screens/             # Screen components
â"‚   â"‚   â"œâ"€â"€ auth/            # Login, signup
â"‚   â"‚   â"œâ"€â"€ home/            # Home feed
â"‚   â"‚   â"œâ"€â"€ compete/         # Tournaments list
â"‚   â"‚   â"œâ"€â"€ tournament/      # Tournament details, creation
â"‚   â"‚   â"œâ"€â"€ match/           # Match details, scoring
â"‚   â"‚   â"œâ"€â"€ notifications/   # Notifications screen
â"‚   â"‚   â""â"€â"€ profile/         # User profile
â"‚   â"œâ"€â"€ navigation/          # Navigation configuration
â"‚   â"œâ"€â"€ services/            # Firebase services
â"‚   â"‚   â"œâ"€â"€ auth.ts          # Authentication
â"‚   â"‚   â"œâ"€â"€ firestore.ts     # Database operations
â"‚   â"‚   â"œâ"€â"€ storage.ts       # File uploads
â"‚   â"‚   â""â"€â"€ notifications.ts # Push notifications
â"‚   â"œâ"€â"€ contexts/            # React contexts
â"‚   â"‚   â"œâ"€â"€ AuthContext.tsx  # User authentication state
â"‚   â"‚   â""â"€â"€ ThemeContext.tsx # App theme
â"‚   â"œâ"€â"€ utils/               # Helper functions
â"‚   â"‚   â"œâ"€â"€ tournament.ts    # Tournament logic
â"‚   â"‚   â"œâ"€â"€ match.ts         # Match calculations
â"‚   â"‚   â""â"€â"€ date.ts          # Date formatting
â"‚   â"œâ"€â"€ types/               # TypeScript types
â"‚   â"‚   â"œâ"€â"€ tournament.ts
â"‚   â"‚   â"œâ"€â"€ match.ts
â"‚   â"‚   â"œâ"€â"€ user.ts
â"‚   â"‚   â""â"€â"€ team.ts
â"‚   â"œâ"€â"€ constants/           # App constants
â"‚   â"‚   â"œâ"€â"€ theme.ts         # Colors, typography
â"‚   â"‚   â""â"€â"€ config.ts        # App configuration
â"‚   â""â"€â"€ assets/              # Images, fonts, icons
â"œâ"€â"€ app.json                 # Expo configuration
â"œâ"€â"€ firebase.json            # Firebase configuration
â"œâ"€â"€ package.json
â"œâ"€â"€ tsconfig.json
â""â"€â"€ App.tsx                  # Entry point
```

---

## Architecture Overview

### Tournament-Match Hierarchy

SMASH follows a hierarchical data architecture where tournaments contain teams and matches:

```
Tournament
â"œâ"€â"€ Teams (configured by number: 4, 8, 12, 16, 20, 24, 28, 32)
â"‚   â"œâ"€â"€ Team 1 (Player 1 + Player 2)
â"‚   â"œâ"€â"€ Team 2 (Player 1 + Player 2)
â"‚   â""â"€â"€ Team N...
â"‚
â""â"€â"€ Matches (generated when tournament starts)
    â"œâ"€â"€ Group Stage Matches
    â"‚   â"œâ"€â"€ Group A Matches (round-robin)
    â"‚   â"œâ"€â"€ Group B Matches (round-robin)
    â"‚   â""â"€â"€ Group C/D Matches... (if applicable)
    â"‚
    â""â"€â"€ Knockout Stage Matches
        â"œâ"€â"€ Round of 16 (if 16+ teams)
        â"œâ"€â"€ Quarter Finals
        â"œâ"€â"€ Semi Finals
        â"œâ"€â"€ Third Place Match
        â""â"€â"€ Final
```

### Tournament Lifecycle

1. **Registration Phase:**
   - Host creates tournament with specified number of teams
   - Players join and form teams (2 players per team)
   - Tournament status: `registration`
   - Teams can join until tournament reaches capacity

2. **Group Stage Phase (Started by Host):**
   - Host clicks "Start Tournament" when ready
   - System automatically:
     - Shuffles teams randomly
     - Forms groups (2 groups for ≤8 teams, 4 groups for >8 teams)
     - Generates round-robin matches within each group
     - Auto-staggers match times throughout the tournament duration
   - Tournament status: `group_stage`
   - Teams play all matches within their group
   - Points awarded: 3 for win, 1 for draw, 0 for loss

3. **Knockout Phase (Auto-triggered):**
   - Triggered when all group stage matches are completed
   - Top 2 teams from each group qualify
   - System generates knockout bracket matches
   - Tournament status: `knockout`
   - Single elimination format

4. **Completion:**
   - Final match determines 1st and 2nd place
   - Third place match determines 3rd place
   - Tournament status: `completed`
   - Winners are recorded and user stats updated

### Match Details

Each match contains:
- **Teams:** Reference to 2 teams (teamA and teamB)
- **Match Type:** group, r16, quarter, semi, final, third_place
- **Round:** Descriptive string (e.g., "Group A", "Quarterfinal 1")
- **Scheduled Time:** Auto-calculated staggered time slot
- **Status:** scheduled, in_progress, completed
- **Result:** (when completed)
  - Set scores (best of 3 or 5 sets)
  - Game scores within each set
  - Winner team ID
  - Submission metadata (who recorded it, when)

### Data Relationships

```
User ──┬── participatesIn ──> Team
       │
       â""── records ──> Match.result

Team ──┬── belongsTo ──> Tournament
       │
       â""── playsIn ──> Match (as teamA or teamB)

Tournament ──┬── contains ──> Team[]
             │
             â"œâ"€â"€ contains ──> Match[]
             │
             â"œâ"€â"€ organizedInto ──> Group[] (group stage)
             │
             â""â"€â"€ organizedInto ──> KnockoutBracket (knockout stage)

Match ──┬── references ──> Team (teamA)
        │
        â"œâ"€â"€ references ──> Team (teamB)
        │
        â"œâ"€â"€ belongsTo ──> Tournament
        │
        â""â"€â"€ partOf ──> Group OR KnockoutBracket
```

---

## Data Models

### User
```typescript
interface User {
  id: string;                    // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL: string | null;       // Firebase Storage URL
  createdAt: Timestamp;
  
  // Auto-calculated stats
  stats: {
    tournamentsPlayed: number;
    tournamentsWon: number;      // 1st place trophies
    matchesPlayed: number;
    matchesWon: number;
  };
  
  // Notification settings
  notificationToken: string | null; // FCM token
  notificationsEnabled: boolean;
}
```

### Tournament
```typescript
type TournamentStatus = 
  | 'registration'   // ðŸŸ¡ Registration Open
  | 'group_stage'    // ðŸ"µ Group Stage
  | 'knockout'       // ðŸŸ£ Knockout
  | 'completed';     // âš« Completed

interface Tournament {
  id: string;
  name: string;
  photoURL: string;              // Cover image
  location: string;
  dateTime: Timestamp;           // Tournament start date/time
  format: 'world_cup';           // Only format for MVP
  numberOfTeams: number;         // Must be multiple of 4
  rules: string;                 // Custom text rules
  
  status: TournamentStatus;
  createdBy: string;             // User ID (admin)
  createdAt: Timestamp;
  
  // Team tracking
  teams: string[];               // Array of team IDs
  maxTeams: number;              // Same as numberOfTeams
  
  // Group/knockout structure (populated when started)
  groups?: Group[];
  knockoutBracket?: KnockoutBracket;
  
  // Winners (populated when completed)
  winners?: {
    first: string;               // Team ID
    second: string;              // Team ID
    third: string;               // Team ID
  };
  
  // Share link
  shareToken: string;            // Unique token for public link
}
```

### Team
```typescript
interface Team {
  id: string;
  tournamentId: string;
  players: string[];             // Array of 2 user IDs
  teamNumber: number;            // 1, 2, 3, etc.
  createdAt: Timestamp;
  
  // Stats (calculated during tournament)
  stats?: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    points: number;              // 3 for win, 1 for draw, 0 for loss
    goalsFor: number;            // Sets won
    goalsAgainst: number;        // Sets lost
    goalDifference: number;
  };
}
```

### Match
```typescript
type MatchStatus = 'scheduled' | 'in_progress' | 'completed';
type MatchType = 'group' | 'r16' | 'quarter' | 'semi' | 'final' | 'third_place';

interface Match {
  id: string;
  tournamentId: string;
  
  // Teams and players
  teamA: string;                 // Team ID
  teamB: string;                 // Team ID
  
  // Match details
  type: MatchType;
  round: string;                 // "Group A", "Quarterfinal 1", etc.
  scheduledTime: Timestamp;      // Auto-calculated staggered time
  
  status: MatchStatus;
  
  // Results (null until completed)
  result?: {
    teamAScore: number;          // Sets won
    teamBScore: number;          // Sets won
    sets: Array<{
      teamA: number;             // Games won in set
      teamB: number;
    }>;
    winner: string;              // Team ID
    submittedBy: string;         // User ID who recorded result
    submittedAt: Timestamp;
  };
  
  createdAt: Timestamp;
}
```

### Group
```typescript
interface Group {
  id: string;
  name: string;                  // "Group A", "Group B", etc.
  tournamentId: string;
  teams: string[];               // Team IDs in this group
  
  // Matches within this group
  matches: string[];             // Match IDs
}
```

### KnockoutBracket
```typescript
interface KnockoutBracket {
  tournamentId: string;
  rounds: {
    round16?: string[];          // Match IDs (only for 16+ teams)
    quarters?: string[];         // Match IDs
    semis: string[];             // Match IDs
    thirdPlace?: string;         // Match ID
    final: string;               // Match ID
  };
}
```

### Notification
```typescript
type NotificationType = 
  | 'tournament_invite'
  | 'tournament_starting'
  | 'match_reminder'
  | 'match_result'
  | 'tournament_status'
  | 'team_joined';

interface Notification {
  id: string;
  userId: string;                // Recipient
  type: NotificationType;
  title: string;
  message: string;
  
  // Related entities
  tournamentId?: string;
  matchId?: string;
  
  read: boolean;
  createdAt: Timestamp;
}
```

---

## Firestore Collections Structure

```
users/
  {userId}/
    - User document
    
tournaments/
  {tournamentId}/
    - Tournament document
    
teams/
  {teamId}/
    - Team document
    
matches/
  {matchId}/
    - Match document
    
notifications/
  {notificationId}/
    - Notification document
```

### Firestore Indexes Required

```javascript
// Composite indexes
tournaments:
  - createdBy + status + createdAt (desc)
  - status + dateTime (asc)

teams:
  - tournamentId + teamNumber (asc)
  - players (array-contains)

matches:
  - tournamentId + type + scheduledTime (asc)
  - tournamentId + status + scheduledTime (asc)

notifications:
  - userId + read + createdAt (desc)
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read their own data and public profiles
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
    
    // Tournaments are publicly readable, writable by creator
    match /tournaments/{tournamentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.createdBy;
      allow delete: if request.auth.uid == resource.data.createdBy;
    }
    
    // Teams readable by all, writable by tournament participants
    match /teams/{teamId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth.uid in resource.data.players;
      allow delete: if request.auth.uid in get(/databases/$(database)/documents/tournaments/$(resource.data.tournamentId)).data.createdBy;
    }
    
    // Matches readable by all, results writable by participants
    match /matches/{matchId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null; // Any tournament participant can update
      allow delete: if false; // Never delete matches
    }
    
    // Notifications only readable by recipient
    match /notifications/{notificationId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow write: if false; // Only backend can create
    }
  }
}
```

---

## Core Algorithms

### 1. World Cup Group Generation

```typescript
function generateWorldCupGroups(teams: Team[], numberOfTeams: number): Group[] {
  // Shuffle teams randomly
  const shuffledTeams = shuffleArray([...teams]);
  
  // Calculate groups
  const groupCount = numberOfTeams <= 8 ? 2 : 4;
  const teamsPerGroup = numberOfTeams / groupCount;
  
  const groups: Group[] = [];
  
  for (let i = 0; i < groupCount; i++) {
    const groupTeams = shuffledTeams.slice(
      i * teamsPerGroup, 
      (i + 1) * teamsPerGroup
    );
    
    groups.push({
      id: generateId(),
      name: `Group ${String.fromCharCode(65 + i)}`, // A, B, C, D
      tournamentId: teams[0].tournamentId,
      teams: groupTeams.map(t => t.id),
      matches: []
    });
  }
  
  return groups;
}
```

### 2. Group Stage Match Generation

```typescript
function generateGroupMatches(group: Group, startTime: Date): Match[] {
  const matches: Match[] = [];
  const teams = group.teams;
  
  // Round-robin: every team plays every other team
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: generateId(),
        tournamentId: group.tournamentId,
        teamA: teams[i],
        teamB: teams[j],
        type: 'group',
        round: group.name,
        scheduledTime: startTime, // Will be updated with staggering
        status: 'scheduled',
        createdAt: Timestamp.now()
      });
    }
  }
  
  return matches;
}
```

### 3. Auto-Staggered Match Scheduling

```typescript
function staggerMatchSchedule(
  matches: Match[], 
  tournamentStartTime: Date,
  tournamentDuration: number = 8 // hours
): Match[] {
  const totalMatches = matches.length;
  const intervalMinutes = (tournamentDuration * 60) / totalMatches;
  
  return matches.map((match, index) => ({
    ...match,
    scheduledTime: addMinutes(tournamentStartTime, intervalMinutes * index)
  }));
}
```

### 4. Group Standings Calculation

```typescript
function calculateGroupStandings(teams: Team[], matches: Match[]): Team[] {
  // Update team stats based on completed matches
  const updatedTeams = teams.map(team => {
    const teamMatches = matches.filter(m => 
      (m.teamA === team.id || m.teamB === team.id) && 
      m.status === 'completed'
    );
    
    const stats = {
      played: teamMatches.length,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0
    };
    
    teamMatches.forEach(match => {
      const isTeamA = match.teamA === team.id;
      const teamScore = isTeamA ? match.result!.teamAScore : match.result!.teamBScore;
      const opponentScore = isTeamA ? match.result!.teamBScore : match.result!.teamAScore;
      
      stats.goalsFor += teamScore;
      stats.goalsAgainst += opponentScore;
      
      if (teamScore > opponentScore) {
        stats.won++;
        stats.points += 3;
      } else if (teamScore === opponentScore) {
        stats.drawn++;
        stats.points += 1;
      } else {
        stats.lost++;
      }
    });
    
    stats.goalDifference = stats.goalsFor - stats.goalsAgainst;
    
    return { ...team, stats };
  });
  
  // Sort by: points desc, goal difference desc, goals for desc
  return updatedTeams.sort((a, b) => {
    if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
    if (b.stats.goalDifference !== a.stats.goalDifference) 
      return b.stats.goalDifference - a.stats.goalDifference;
    return b.stats.goalsFor - a.stats.goalsFor;
  });
}
```

### 5. Knockout Bracket Generation

```typescript
function generateKnockoutBracket(
  groups: Group[], 
  teams: Team[],
  matches: Match[]
): KnockoutBracket {
  // Get top 2 teams from each group
  const qualifiedTeams: string[] = [];
  
  groups.forEach(group => {
    const groupTeams = teams.filter(t => group.teams.includes(t.id));
    const standings = calculateGroupStandings(groupTeams, matches);
    qualifiedTeams.push(standings[0].id, standings[1].id);
  });
  
  // Generate knockout matches based on number of teams
  const knockoutMatches = generateKnockoutMatches(qualifiedTeams);
  
  return {
    tournamentId: groups[0].tournamentId,
    rounds: knockoutMatches
  };
}

function generateKnockoutMatches(teams: string[]): any {
  // Logic depends on number of teams
  // 4 teams (2 groups): SF + Final
  // 8 teams (2 groups): SF + Final  
  // 12 teams (4 groups): QF + SF + Final
  // 16 teams (4 groups): R16 + QF + SF + Final
  
  // Implementation varies by tournament size
  // Returns match IDs organized by round
}
```

### 6. User Stats Calculation

```typescript
async function updateUserStats(userId: string): Promise<void> {
  // Get all teams user is part of
  const userTeams = await getTeamsForUser(userId);
  
  // Get all matches for those teams
  const allMatches = await getMatchesForTeams(userTeams.map(t => t.id));
  
  // Calculate stats
  const stats = {
    tournamentsPlayed: new Set(userTeams.map(t => t.tournamentId)).size,
    tournamentsWon: 0,
    matchesPlayed: allMatches.filter(m => m.status === 'completed').length,
    matchesWon: 0
  };
  
  // Count wins
  allMatches.forEach(match => {
    if (match.status === 'completed') {
      const userTeam = userTeams.find(t => 
        t.id === match.teamA || t.id === match.teamB
      );
      if (userTeam && match.result?.winner === userTeam.id) {
        stats.matchesWon++;
      }
    }
  });
  
  // Count tournament wins (1st place)
  const completedTournaments = await getTournamentsForUser(userId, 'completed');
  completedTournaments.forEach(tournament => {
    const userTeam = userTeams.find(t => t.tournamentId === tournament.id);
    if (userTeam && tournament.winners?.first === userTeam.id) {
      stats.tournamentsWon++;
    }
  });
  
  // Update user document
  await updateDoc(doc(db, 'users', userId), { stats });
}
```

---

## API Functions (Firebase Cloud Functions - Optional for MVP)

### Tournament Management

```typescript
// Scheduled function to send tournament reminders
export const sendTournamentReminders = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    // Find tournaments starting tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tournaments = await getTournamentsStartingOn(tomorrow);
    
    for (const tournament of tournaments) {
      const teams = await getTeamsForTournament(tournament.id);
      const playerIds = teams.flatMap(t => t.players);
      
      await sendNotificationToUsers(playerIds, {
        type: 'tournament_starting',
        title: `${tournament.name} starts tomorrow!`,
        message: `Get ready for ${tournament.name} at ${tournament.location}`,
        tournamentId: tournament.id
      });
    }
  });

// Triggered when match result is submitted
export const onMatchResultSubmitted = functions.firestore
  .document('matches/{matchId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    // Check if result was just added
    if (!beforeData.result && afterData.result) {
      const match = afterData as Match;
      
      // Update team stats
      await updateTeamStats(match.teamA, match);
      await updateTeamStats(match.teamB, match);
      
      // Check if this was the last group match
      const tournament = await getTournament(match.tournamentId);
      if (await isGroupStageComplete(tournament)) {
        // Generate knockout bracket
        await generateAndSaveKnockoutBracket(tournament);
        
        // Update tournament status
        await updateTournamentStatus(tournament.id, 'knockout');
      }
      
      // Check if this was the final
      if (match.type === 'final') {
        await finalizeTournament(tournament);
      }
      
      // Notify all tournament participants
      await notifyMatchResult(match);
    }
  });
```

---

## Push Notifications

### FCM Setup

```typescript
// Request notification permissions
async function requestNotificationPermission(): Promise<string | null> {
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status === 'granted') {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  }
  
  return null;
}

// Save FCM token to user document
async function saveNotificationToken(userId: string, token: string) {
  await updateDoc(doc(db, 'users', userId), {
    notificationToken: token,
    notificationsEnabled: true
  });
}
```

### Send Notification

```typescript
async function sendPushNotification(
  userIds: string[], 
  notification: {
    title: string;
    body: string;
    data?: any;
  }
) {
  const users = await getUsers(userIds);
  const tokens = users
    .filter(u => u.notificationsEnabled && u.notificationToken)
    .map(u => u.notificationToken!);
  
  // Send via Expo Push Notification service
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: tokens,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: 'default',
      badge: 1
    })
  });
  
  // Also save in-app notification
  await Promise.all(
    userIds.map(userId => 
      addDoc(collection(db, 'notifications'), {
        userId,
        type: notification.data?.type || 'general',
        title: notification.title,
        message: notification.body,
        read: false,
        createdAt: Timestamp.now(),
        ...notification.data
      })
    )
  );
}
```

---

## Performance Optimizations

### 1. Data Fetching Strategies

**Use Pagination:**
```typescript
// Load tournaments in batches
async function getTournamentsPaginated(
  status: TournamentStatus,
  limit: number = 20,
  lastDoc?: DocumentSnapshot
) {
  let query = collection(db, 'tournaments')
    .where('status', '==', status)
    .orderBy('createdAt', 'desc')
    .limit(limit);
    
  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }
  
  return getDocs(query);
}
```

**Use Firestore Listeners Sparingly:**
```typescript
// Only listen to active tournament
useEffect(() => {
  if (!activeTournamentId) return;
  
  const unsubscribe = onSnapshot(
    doc(db, 'tournaments', activeTournamentId),
    (doc) => {
      setTournament(doc.data());
    }
  );
  
  return unsubscribe;
}, [activeTournamentId]);
```

### 2. Image Optimization

```typescript
// Resize images before upload
async function uploadTournamentPhoto(uri: string): Promise<string> {
  // Resize using expo-image-manipulator
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  
  // Upload to Firebase Storage
  const filename = `tournaments/${Date.now()}.jpg`;
  const response = await fetch(manipResult.uri);
  const blob = await response.blob();
  
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, blob);
  
  return getDownloadURL(storageRef);
}
```

### 3. Caching Strategy

```typescript
// Cache user profiles in memory
const userCache = new Map<string, User>();

async function getUser(userId: string): Promise<User> {
  if (userCache.has(userId)) {
    return userCache.get(userId)!;
  }
  
  const userDoc = await getDoc(doc(db, 'users', userId));
  const user = userDoc.data() as User;
  
  userCache.set(userId, user);
  return user;
}
```

---

## Error Handling

### Network Errors
```typescript
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    if (retries > 0 && isNetworkError(error)) {
      await delay(1000);
      return fetchWithRetry(fetchFn, retries - 1);
    }
    throw error;
  }
}
```

### User-Facing Error Messages
```typescript
function getErrorMessage(error: any): string {
  if (error.code === 'auth/user-not-found') {
    return 'No account found with this email';
  }
  if (error.code === 'auth/wrong-password') {
    return 'Incorrect password';
  }
  if (error.code === 'permission-denied') {
    return 'You don\'t have permission to perform this action';
  }
  return 'Something went wrong. Please try again.';
}
```

---

## Testing Strategy (Post-MVP)

### Unit Tests
- Utility functions (tournament logic, date formatting)
- Group generation algorithms
- Stats calculations

### Integration Tests
- Authentication flow
- Tournament creation flow
- Match result submission

### E2E Tests
- Complete tournament lifecycle
- Multi-user scenarios

---

## Deployment

### Expo EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Firebase Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init

# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Cloud Functions (if using)
firebase deploy --only functions
```

---

## Environment Variables

```env
# Firebase Configuration
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

# Expo Configuration
EXPO_PROJECT_ID=

# Push Notifications
EXPO_PUSH_NOTIFICATION_KEY=
```

---

## Security Considerations

1. **Authentication:**
   - Email verification required before tournament participation
   - Password reset via email
   - Secure token storage using Expo SecureStore

2. **Data Privacy:**
   - Users can only see public tournament data
   - Personal notifications only visible to recipient
   - Profile photos stored with proper access controls

3. **Input Validation:**
   - Validate all user inputs on client and server
   - Sanitize tournament names and rules text
   - Limit file upload sizes (max 5MB for images)

4. **Rate Limiting:**
   - Limit tournament creation (max 10 per user per day)
   - Throttle match result submissions
   - Prevent spam notifications

---

## Monitoring & Analytics (Post-MVP)

### Metrics to Track
- Daily/Monthly Active Users (DAU/MAU)
- Tournament creation rate
- Tournament completion rate
- Average time to fill tournament
- Match result submission rate
- User retention (D1, D7, D30)
- Crash rate and error frequency

### Tools
- Firebase Analytics
- Crashlytics for crash reporting
- Performance Monitoring

---

## Future Technical Enhancements

1. **Offline Support:**
   - Cache tournament data locally
   - Queue match results when offline
   - Sync when connection restored

2. **Real-time Features:**
   - Live match scores
   - Real-time bracket updates
   - Live tournament chat

3. **Performance:**
   - Implement proper pagination everywhere
   - Add infinite scroll to lists
   - Lazy load images
   - Optimize bundle size

4. **Backend:**
   - Move complex calculations to Cloud Functions
   - Implement proper indexing strategies
   - Add data backup and recovery

5. **Security:**
   - Add rate limiting
   - Implement abuse prevention
   - Add content moderation for user-generated content

---

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- Project setup (Expo + Firebase)
- Authentication system
- Basic navigation structure
- User profile CRUD

### Phase 2: Tournament Core (Weeks 3-4)
- Tournament creation flow
- Team formation logic
- Tournament detail page
- Share functionality

### Phase 3: Match System (Weeks 5-6)
- Match scheduling algorithm
- Group generation
- Match result submission
- Standings calculation

### Phase 4: Home & Notifications (Week 7)
- Home feed implementation
- Push notifications setup
- In-app notifications

### Phase 5: Polish & Testing (Week 8)
- UI/UX refinements
- Bug fixes
- Performance optimization
- App store preparation

---

## Support & Maintenance

### Post-Launch Monitoring
- Monitor crash reports daily
- Track user feedback via in-app support
- Regular Firebase cost monitoring
- Weekly performance reviews

### Update Cadence
- Bug fixes: As needed (hot fixes via Expo OTA)
- Feature updates: Monthly
- Major versions: Quarterly

---

## Costs Estimation (Monthly)

### Firebase
- **Firestore:** ~$5-10 (under 50k reads, 20k writes/day)
- **Storage:** ~$1-3 (image hosting)
- **Authentication:** Free (under 50k users)
- **Cloud Functions:** ~$0-5 (minimal usage for MVP)
- **Hosting:** Free
- **Total:** ~$6-18/month

### Expo
- **EAS Build:** Free tier for MVP
- **EAS Submit:** Free tier
- **Push Notifications:** Free (via Expo)

### Total Estimated Cost: $6-20/month for MVP

---

## Questions & Decisions Needed

### Before Development:
1. Confirm Firebase project setup
2. Decide on exact color scheme/theme values
3. Choose icon library (Expo Vector Icons vs custom)
4. Determine minimum supported OS versions (iOS 13+, Android 8+?)

### During Development:
1. Handle timezone differences for match scheduling?
2. Allow tournament time edits after creation?
3. Max tournament name length?
4. Image size/format restrictions?
5. Match result edit window (if any)?

---

## Next Steps

1. **Set up development environment**
   - Install Node.js, Expo CLI, Firebase CLI
   - Create Firebase project
   - Initialize Expo project

2. **Create base project structure**
   - Set up folder structure
   - Configure TypeScript
   - Set up ESLint + Prettier
   - Configure Firebase SDK

3. **Start with Authentication**
   - Build login/signup screens
   - Implement Firebase Auth
   - Create AuthContext
   - Add password reset

4. **Begin Tournament Creation**
   - Build tournament creation modal
   - Implement Firestore operations
   - Add image upload functionality
   - Test end-to-end flow

---

*Last Updated: [Date]*
*Version: 1.0 - MVP Specification*