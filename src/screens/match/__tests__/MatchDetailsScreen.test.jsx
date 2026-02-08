import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Share } from 'react-native';
import MatchDetailsScreen from '../MatchDetailsScreen';

// Mock the custom hooks and components
jest.mock('../../../contexts/TournamentContext', () => ({
    useTournaments: () => ({
        updateTournament: jest.fn(),
        tournaments: [],
        checkAndProgressTournament: jest.fn(),
    }),
}));

jest.mock('../../../contexts/ToastContext', () => ({
    useToast: () => ({
        showToast: jest.fn(),
    }),
}));

jest.mock('../../../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: { uid: 'test-user-id' },
    }),
}));

jest.mock('../../../services/notificationService', () => ({
    createNotificationsForUsers: jest.fn(),
}));

jest.mock('../../../../assets/icons/chevronleft.svg', () => 'ChevronLeft');
jest.mock('../../../../assets/icons/share.svg', () => 'ShareIcon');
jest.mock('../../../../assets/icons/compete.svg', () => 'TrophyIcon');
jest.mock('../../../../assets/icons/calendar.svg', () => 'CalendarIcon');
jest.mock('../../../../assets/icons/location.svg', () => 'LocationIcon');
jest.mock('../../../../assets/icons/chevrondown.svg', () => 'ChevronDownIcon');
jest.mock('../../../../assets/icons/rules.svg', () => 'RulesIcon');
jest.mock('../../../../assets/icons/versus.svg', () => 'VersusIcon');

jest.mock('../../../utils/dateFormatter', () => ({
    formatDateTime: jest.fn(date => 'Jul 20, 10:00 AM'),
}));

jest.mock('../../../components/ui/Button', () => ({ title, onPress }) => <mock-Button title={title} onPress={onPress}>{title}</mock-Button>);
jest.mock('../../../components/ui/Badge', () => ({ label }) => <mock-Badge label={label}>{label}</mock-Badge>);
jest.mock('../../../components/ui/Card', () => ({ children }) => <mock-Card>{children}</mock-Card>);
jest.mock('../../../components/ui/DetailsListItem', () => ({ text }) => <mock-DetailsListItem text={text}>{text}</mock-DetailsListItem>);
jest.mock('../../../components/ui/Team', () => 'Team');
jest.mock('../../../components/match/RecordScoreModal', () => 'RecordScoreModal');

// Mock Safe Area
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock Expo Calendar
jest.mock('expo-calendar', () => ({
    requestCalendarPermissionsAsync: jest.fn(),
    createEventAsync: jest.fn(),
}));


describe('MatchDetailsScreen', () => {
    const mockNavigation = {
        goBack: jest.fn(),
    };

    const mockMatch = {
        id: 'match-123',
        tournamentName: 'Summer Championship',
        tournamentId: 'tournament-1',
        status: 'SCHEDULED',
        date: '2026-07-20',
        time: '10:00',
        location: 'Central Court',
        address: '123 Tennis Way',
        leftTeam: {
            player1: { id: 'p1', firstName: 'John' },
            player2: { id: 'p2', firstName: 'Doe' },
        },
        rightTeam: {
            player1: { id: 'p3', firstName: 'Jane' },
            player2: { id: 'p4', firstName: 'Smith' },
        },
    };

    const mockRoute = {
        params: {
            match: mockMatch,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        // Manually mock the Share method
        Share.share = jest.fn(() => Promise.resolve());
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders correctly', () => {
        const { getByText } = render(
            <MatchDetailsScreen navigation={mockNavigation} route={mockRoute} />
        );

        expect(getByText('Match details')).toBeTruthy();
        // expect(getByText('Summer Championship')).toBeTruthy();
        // expect(getByText('Central Court | Court: 7')).toBeTruthy();
    });

    it('handles share button correctly with dynamic link', async () => {
        const { getByTestId } = render(
            <MatchDetailsScreen navigation={mockNavigation} route={mockRoute} />
        );

        const shareButton = getByTestId('share-button');
        fireEvent.press(shareButton);

        await waitFor(() => {
            expect(Share.share).toHaveBeenCalledWith({
                message: 'Check out this match from Summer Championship: https://getsmash.net/match/match-123',
                url: 'https://getsmash.net/match/match-123',
                title: 'Match: Summer Championship',
            });
        });
    });
});
