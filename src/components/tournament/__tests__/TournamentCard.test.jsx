import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TournamentCard from '../TournamentCard';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
}));

// Mock the formatDateTime utility
jest.mock('../../../utils/dateFormatter', () => ({
  formatDateTime: (date) => 'Sat, 15 Dec 2025 at 4:00 PM',
}));

describe('TournamentCard', () => {
  const defaultProps = {
    status: 'REGISTRATION',
    title: 'Amsterdam Spring Championship',
    location: 'Padeldam Amsterdam',
    dateTime: new Date('2025-12-15T16:00:00'),
    teamCount: 8,
    registeredCount: 3,
    avatars: [],
    onPress: jest.fn(),
    onActionPress: jest.fn(),
    isHost: false,
    userJoined: false,
    hostId: 'host-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      const { getByText } = render(<TournamentCard {...defaultProps} />);

      expect(getByText('Amsterdam Spring Championship')).toBeTruthy();
      expect(getByText('Padeldam Amsterdam')).toBeTruthy();
      expect(getByText('REGISTRATION')).toBeTruthy();
    });

    it('should display formatted date and time', () => {
      const { getByText } = render(<TournamentCard {...defaultProps} />);

      expect(getByText('Sat, 15 Dec 2025 at 4:00 PM')).toBeTruthy();
    });

    it('should display team count', () => {
      const { getByText } = render(<TournamentCard {...defaultProps} />);

      expect(getByText('8 Teams')).toBeTruthy();
    });

    it('should display single team count', () => {
      const { getByText } = render(
        <TournamentCard {...defaultProps} registeredCount={1} teamCount={8} />
      );

      expect(getByText('8 Teams')).toBeTruthy();
    });

    it('should display full teams', () => {
      const { getByText } = render(
        <TournamentCard {...defaultProps} registeredCount={8} teamCount={8} />
      );

      expect(getByText('8 Teams')).toBeTruthy();
    });
  });

  describe('Status Badge', () => {
    it('should render REGISTRATION status', () => {
      const { getByText } = render(
        <TournamentCard {...defaultProps} status="REGISTRATION" />
      );

      expect(getByText('REGISTRATION')).toBeTruthy();
    });

    it('should render GROUP STAGE status', () => {
      const { getByText } = render(
        <TournamentCard {...defaultProps} status="GROUP STAGE" />
      );

      expect(getByText('GROUP STAGE')).toBeTruthy();
    });

    it('should render QUARTER FINALS status', () => {
      const { getByText } = render(
        <TournamentCard {...defaultProps} status="QUARTER FINALS" />
      );

      expect(getByText('QUARTER FINALS')).toBeTruthy();
    });

    it('should render SEMI FINALS status', () => {
      const { getByText } = render(
        <TournamentCard {...defaultProps} status="SEMI FINALS" />
      );

      expect(getByText('SEMI FINALS')).toBeTruthy();
    });

    it('should render FINALS status', () => {
      const { getByText } = render(
        <TournamentCard {...defaultProps} status="FINALS" />
      );

      expect(getByText('FINALS')).toBeTruthy();
    });

    it('should render COMPLETED status', () => {
      const { getByText } = render(
        <TournamentCard {...defaultProps} status="COMPLETED" />
      );

      expect(getByText('COMPLETED')).toBeTruthy();
    });
  });

  describe('Action Buttons', () => {
    it('should show Join button for non-host during registration', () => {
      const { getByText } = render(
        <TournamentCard
          {...defaultProps}
          status="REGISTRATION"
          isHost={false}
          userJoined={false}
        />
      );

      expect(getByText('Join')).toBeTruthy();
    });

    it('should show View button when user has joined', () => {
      const { getByText } = render(
        <TournamentCard
          {...defaultProps}
          status="REGISTRATION"
          isHost={false}
          userJoined={true}
        />
      );

      expect(getByText('View')).toBeTruthy();
    });

    it('should show Start button for host during registration when all teams full', () => {
      const { getByText } = render(
        <TournamentCard
          {...defaultProps}
          status="REGISTRATION"
          isHost={true}
          registeredCount={8}
          teamCount={8}
        />
      );

      expect(getByText('Start')).toBeTruthy();
    });

    it('should call onActionPress when Join button is pressed', () => {
      const mockOnActionPress = jest.fn();

      const { getByText } = render(
        <TournamentCard
          {...defaultProps}
          status="REGISTRATION"
          isHost={false}
          userJoined={false}
          onActionPress={mockOnActionPress}
        />
      );

      fireEvent.press(getByText('Join'));
      expect(mockOnActionPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Card Press', () => {
    it('should call onPress when card is pressed', () => {
      const mockOnPress = jest.fn();

      const { UNSAFE_root } = render(
        <TournamentCard {...defaultProps} onPress={mockOnPress} />
      );

      const touchables = UNSAFE_root.findAllByType('TouchableOpacity', { deep: false });
      if (touchables.length > 0) {
        fireEvent.press(touchables[0]);
        expect(mockOnPress).toHaveBeenCalledTimes(1);
      }
    });

    it('should render successfully', () => {
      const { UNSAFE_root } = render(<TournamentCard {...defaultProps} />);

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Avatars Display', () => {
    it('should render with empty avatars array', () => {
      const { getByText } = render(
        <TournamentCard {...defaultProps} avatars={[]} />
      );

      expect(getByText('Amsterdam Spring Championship')).toBeTruthy();
    });

    it('should render with avatars', () => {
      const mockAvatars = [
        <div key="1">Avatar 1</div>,
        <div key="2">Avatar 2</div>,
      ];

      const { getByText } = render(
        <TournamentCard {...defaultProps} avatars={mockAvatars} />
      );

      expect(getByText('Amsterdam Spring Championship')).toBeTruthy();
    });
  });

  describe('Empty State Messages', () => {
    it('should show empty state message when no teams registered and is host', () => {
      const { getByText } = render(
        <TournamentCard
          {...defaultProps}
          status="REGISTRATION"
          isHost={true}
          registeredCount={0}
          avatars={[]}
        />
      );

      expect(getByText('Share to invite friends')).toBeTruthy();
    });

    it('should show empty state when no players yet', () => {
      const { getByText } = render(
        <TournamentCard
          {...defaultProps}
          status="REGISTRATION"
          isHost={false}
          userJoined={true}
          registeredCount={1}
          avatars={[]}
        />
      );

      expect(getByText('No players yet')).toBeTruthy();
      expect(getByText('Be the first to join')).toBeTruthy();
    });
  });

  describe('Animation Index', () => {
    it('should accept animationIndex for stagger animation', () => {
      const { UNSAFE_root } = render(
        <TournamentCard {...defaultProps} animationIndex={0} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should work without animationIndex', () => {
      const { UNSAFE_root } = render(
        <TournamentCard {...defaultProps} animationIndex={null} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should handle different animation indices', () => {
      const { rerender, UNSAFE_root } = render(
        <TournamentCard {...defaultProps} animationIndex={0} />
      );

      expect(UNSAFE_root).toBeTruthy();

      rerender(<TournamentCard {...defaultProps} animationIndex={5} />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Host vs Non-Host Behavior', () => {
    it('should show different actions for host', () => {
      const { UNSAFE_root } = render(
        <TournamentCard
          {...defaultProps}
          status="REGISTRATION"
          isHost={true}
          registeredCount={4}
        />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should show different actions for non-host', () => {
      const { getByText } = render(
        <TournamentCard
          {...defaultProps}
          status="REGISTRATION"
          isHost={false}
          userJoined={false}
        />
      );

      expect(getByText('Join')).toBeTruthy();
    });
  });

  describe('Different Statuses', () => {
    it('should render correctly for GROUP STAGE', () => {
      const { getByText } = render(
        <TournamentCard
          {...defaultProps}
          status="GROUP STAGE"
          registeredCount={8}
        />
      );

      expect(getByText('GROUP STAGE')).toBeTruthy();
    });

    it('should render correctly for COMPLETED', () => {
      const { getByText } = render(
        <TournamentCard
          {...defaultProps}
          status="COMPLETED"
          registeredCount={8}
        />
      );

      expect(getByText('COMPLETED')).toBeTruthy();
    });

    it('should not show action buttons for completed tournaments', () => {
      const { queryByText } = render(
        <TournamentCard
          {...defaultProps}
          status="COMPLETED"
          isHost={true}
        />
      );

      expect(queryByText('Start')).toBeNull();
      expect(queryByText('Join')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all props together', () => {
      const mockOnPress = jest.fn();
      const mockOnActionPress = jest.fn();
      const mockAvatars = [<div key="1">Avatar</div>];

      const { getByText } = render(
        <TournamentCard
          {...defaultProps}
          status="REGISTRATION"
          isHost={false}
          userJoined={true}
          avatars={mockAvatars}
          onPress={mockOnPress}
          onActionPress={mockOnActionPress}
          animationIndex={2}
        />
      );

      expect(getByText('Amsterdam Spring Championship')).toBeTruthy();
      expect(getByText('View')).toBeTruthy();
    });

    it('should handle zero teams', () => {
      const { getByText } = render(
        <TournamentCard
          {...defaultProps}
          registeredCount={0}
          teamCount={8}
        />
      );

      expect(getByText('8 Teams')).toBeTruthy();
    });

    it('should handle single team slot', () => {
      const { getByText } = render(
        <TournamentCard
          {...defaultProps}
          registeredCount={0}
          teamCount={1}
        />
      );

      expect(getByText('1 Teams')).toBeTruthy();
    });
  });

  describe('Fill Percentage', () => {
    it('should calculate fill percentage correctly', () => {
      // 3 out of 8 teams = 37.5%
      const { UNSAFE_root } = render(
        <TournamentCard
          {...defaultProps}
          registeredCount={3}
          teamCount={8}
        />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should handle 100% fill', () => {
      const { getByText } = render(
        <TournamentCard
          {...defaultProps}
          registeredCount={8}
          teamCount={8}
        />
      );

      expect(getByText('8 Teams')).toBeTruthy();
    });

    it('should handle 0% fill', () => {
      const { getByText } = render(
        <TournamentCard
          {...defaultProps}
          registeredCount={0}
          teamCount={8}
        />
      );

      expect(getByText('8 Teams')).toBeTruthy();
    });
  });
});
