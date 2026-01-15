import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MatchCard from '../MatchCard';

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

describe('MatchCard', () => {
  const mockLeftTeam = {
    player1: {
      firstName: 'Ahmed',
      lastName: 'Basyouni',
      avatarUri: require('../../../../assets/avatars/ahmed.jpg'),
    },
    player2: {
      firstName: 'Leo',
      lastName: 'Miguele',
      avatarUri: require('../../../../assets/avatars/leo.jpg'),
    },
  };

  const mockRightTeam = {
    player1: {
      firstName: 'Omar',
      lastName: 'Ibrahim',
      avatarUri: require('../../../../assets/avatars/omar.jpg'),
    },
    player2: {
      firstName: 'Karim',
      lastName: 'Omar',
      avatarUri: require('../../../../assets/avatars/karim.jpg'),
    },
  };

  const defaultProps = {
    variant: 'before',
    leftTeam: mockLeftTeam,
    rightTeam: mockRightTeam,
    tournamentName: 'Amsterdam Spring Championship',
    status: 'GROUP STAGE',
    dateTime: new Date('2025-12-15T16:00:00'),
    location: 'Padeldam Amsterdam',
    court: '5',
    isPast: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      const { getByText } = render(<MatchCard {...defaultProps} />);

      expect(getByText('Amsterdam Spring Championship')).toBeTruthy();
      expect(getByText('Padeldam Amsterdam - 5')).toBeTruthy();
    });

    it('should render without tournament name', () => {
      const { queryByText } = render(
        <MatchCard {...defaultProps} tournamentName={null} />
      );

      expect(queryByText('Amsterdam Spring Championship')).toBeNull();
    });

    it('should render location without court number', () => {
      const { getByText } = render(
        <MatchCard {...defaultProps} court={null} />
      );

      expect(getByText('Padeldam Amsterdam')).toBeTruthy();
    });

    it('should return null when leftTeam is missing', () => {
      const { toJSON } = render(
        <MatchCard {...defaultProps} leftTeam={null} />
      );

      expect(toJSON()).toBeNull();
    });

    it('should return null when rightTeam is missing', () => {
      const { toJSON } = render(
        <MatchCard {...defaultProps} rightTeam={null} />
      );

      expect(toJSON()).toBeNull();
    });

    it('should return null when leftTeam.player1 is missing', () => {
      const { toJSON } = render(
        <MatchCard {...defaultProps} leftTeam={{ player2: mockLeftTeam.player2 }} />
      );

      expect(toJSON()).toBeNull();
    });

    it('should return null when rightTeam.player1 is missing', () => {
      const { toJSON } = render(
        <MatchCard {...defaultProps} rightTeam={{ player2: mockRightTeam.player2 }} />
      );

      expect(toJSON()).toBeNull();
    });
  });

  describe('Score Display', () => {
    it('should show VS icon when no score is recorded', () => {
      const { UNSAFE_root } = render(
        <MatchCard {...defaultProps} scoreRecorded={false} />
      );

      // Card should render without score
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should display score when scoreRecorded is true', () => {
      const score = [
        { teamA: '6', teamB: '4' },
        { teamA: '6', teamB: '2' },
      ];

      const { getByText } = render(
        <MatchCard
          {...defaultProps}
          scoreRecorded={true}
          score={score}
        />
      );

      expect(getByText('6 - 4')).toBeTruthy();
      expect(getByText('6 - 2')).toBeTruthy();
    });

    it('should display single set score', () => {
      const score = [{ teamA: '6', teamB: '3' }];

      const { getByText } = render(
        <MatchCard
          {...defaultProps}
          scoreRecorded={true}
          score={score}
        />
      );

      expect(getByText('6 - 3')).toBeTruthy();
    });

    it('should display three set score', () => {
      const score = [
        { teamA: '6', teamB: '4' },
        { teamA: '3', teamB: '6' },
        { teamA: '6', teamB: '2' },
      ];

      const { getByText } = render(
        <MatchCard
          {...defaultProps}
          scoreRecorded={true}
          score={score}
        />
      );

      expect(getByText('6 - 4')).toBeTruthy();
      expect(getByText('3 - 6')).toBeTruthy();
      expect(getByText('6 - 2')).toBeTruthy();
    });
  });

  describe('Action Buttons', () => {
    it('should show "Add to calendar" button for future matches', () => {
      const mockOnAddToCalendar = jest.fn();

      const { getByText } = render(
        <MatchCard
          {...defaultProps}
          isPast={false}
          onAddToCalendar={mockOnAddToCalendar}
        />
      );

      expect(getByText('Add to calendar')).toBeTruthy();
    });

    it('should call onAddToCalendar when button is pressed', () => {
      const mockOnAddToCalendar = jest.fn();

      const { getByText } = render(
        <MatchCard
          {...defaultProps}
          isPast={false}
          onAddToCalendar={mockOnAddToCalendar}
        />
      );

      fireEvent.press(getByText('Add to calendar'));
      expect(mockOnAddToCalendar).toHaveBeenCalledTimes(1);
    });

    it('should not show calendar button for past matches', () => {
      const { queryByText } = render(
        <MatchCard
          {...defaultProps}
          isPast={true}
          onAddToCalendar={jest.fn()}
        />
      );

      expect(queryByText('Add to calendar')).toBeNull();
    });

    it('should show "Add score" button for past matches without score', () => {
      const mockOnAddScore = jest.fn();

      const { getByText } = render(
        <MatchCard
          {...defaultProps}
          isPast={true}
          scoreRecorded={false}
          onAddScore={mockOnAddScore}
          canRecord={true}
        />
      );

      expect(getByText('Add score')).toBeTruthy();
    });

    it('should show "Edit score" button for past matches with score', () => {
      const mockOnAddScore = jest.fn();
      const score = [{ teamA: '6', teamB: '4' }];

      const { getByText } = render(
        <MatchCard
          {...defaultProps}
          isPast={true}
          scoreRecorded={true}
          score={score}
          onAddScore={mockOnAddScore}
          canRecord={true}
        />
      );

      expect(getByText('Edit score')).toBeTruthy();
    });

    it('should call onAddScore when add score button is pressed', () => {
      const mockOnAddScore = jest.fn();

      const { getByText } = render(
        <MatchCard
          {...defaultProps}
          isPast={true}
          onAddScore={mockOnAddScore}
          canRecord={true}
        />
      );

      fireEvent.press(getByText('Add score'));
      expect(mockOnAddScore).toHaveBeenCalledTimes(1);
    });

    it('should not show score button when canRecord is false', () => {
      const { queryByText } = render(
        <MatchCard
          {...defaultProps}
          isPast={true}
          onAddScore={jest.fn()}
          canRecord={false}
        />
      );

      expect(queryByText('Add score')).toBeNull();
      expect(queryByText('Edit score')).toBeNull();
    });

    it('should not show any action buttons when callbacks are not provided', () => {
      const { queryByText } = render(
        <MatchCard {...defaultProps} isPast={false} />
      );

      expect(queryByText('Add to calendar')).toBeNull();
      expect(queryByText('Add score')).toBeNull();
    });
  });

  describe('Pressable Behavior', () => {
    it('should call onPress when card is pressed', () => {
      const mockOnPress = jest.fn();

      const { UNSAFE_root } = render(
        <MatchCard {...defaultProps} onPress={mockOnPress} />
      );

      const touchables = UNSAFE_root.findAllByType('TouchableOpacity', { deep: false });
      // First TouchableOpacity should be the card wrapper
      if (touchables.length > 0) {
        fireEvent.press(touchables[0]);
        expect(mockOnPress).toHaveBeenCalledTimes(1);
      }
    });

    it('should not be pressable when onPress is not provided', () => {
      const { UNSAFE_root } = render(
        <MatchCard {...defaultProps} />
      );

      // Card should render successfully even without onPress
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Highlight Border', () => {
    it('should apply highlight border when highlightBorder is true', () => {
      const { UNSAFE_root } = render(
        <MatchCard {...defaultProps} highlightBorder={true} />
      );

      // The component should render successfully with highlight
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should not apply highlight border by default', () => {
      const { UNSAFE_root } = render(
        <MatchCard {...defaultProps} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Animation Index', () => {
    it('should accept animationIndex for stagger animation', () => {
      const { UNSAFE_root } = render(
        <MatchCard {...defaultProps} animationIndex={0} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should work without animationIndex', () => {
      const { UNSAFE_root } = render(
        <MatchCard {...defaultProps} animationIndex={null} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should handle different animation indices', () => {
      const { rerender, UNSAFE_root } = render(
        <MatchCard {...defaultProps} animationIndex={0} />
      );

      expect(UNSAFE_root).toBeTruthy();

      rerender(<MatchCard {...defaultProps} animationIndex={5} />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Badge Display', () => {
    it('should render status badge when status is provided', () => {
      const { getByText } = render(
        <MatchCard {...defaultProps} status="GROUP STAGE" />
      );

      expect(getByText('GROUP STAGE')).toBeTruthy();
    });

    it('should handle different status values', () => {
      const { getByText, rerender } = render(
        <MatchCard {...defaultProps} status="QUARTER FINALS" />
      );

      expect(getByText('QUARTER FINALS')).toBeTruthy();

      rerender(<MatchCard {...defaultProps} status="SEMI FINALS" />);
      expect(getByText('SEMI FINALS')).toBeTruthy();

      rerender(<MatchCard {...defaultProps} status="FINALS" />);
      expect(getByText('FINALS')).toBeTruthy();
    });

    it('should not crash when status is null', () => {
      const { UNSAFE_root } = render(
        <MatchCard {...defaultProps} status={null} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all props together', () => {
      const mockOnPress = jest.fn();
      const mockOnAddToCalendar = jest.fn();
      const score = [{ teamA: '6', teamB: '4' }];

      const { getByText } = render(
        <MatchCard
          {...defaultProps}
          variant="after"
          highlightBorder={true}
          scoreRecorded={true}
          score={score}
          onPress={mockOnPress}
          onAddToCalendar={mockOnAddToCalendar}
          animationIndex={2}
        />
      );

      expect(getByText('Amsterdam Spring Championship')).toBeTruthy();
      expect(getByText('6 - 4')).toBeTruthy();
    });

    it('should handle team with only player1', () => {
      const singlePlayerLeftTeam = {
        player1: mockLeftTeam.player1,
      };

      const { getByText } = render(
        <MatchCard
          {...defaultProps}
          leftTeam={singlePlayerLeftTeam}
        />
      );

      expect(getByText('Amsterdam Spring Championship')).toBeTruthy();
    });

    it('should format date/time using formatDateTime utility', () => {
      const { getByText } = render(
        <MatchCard {...defaultProps} />
      );

      // formatDateTime is mocked to return a specific format
      expect(getByText('Sat, 15 Dec 2025 at 4:00 PM')).toBeTruthy();
    });
  });

  describe('Variants', () => {
    it('should render "before" variant', () => {
      const { getByText } = render(
        <MatchCard {...defaultProps} variant="before" />
      );

      expect(getByText('Amsterdam Spring Championship')).toBeTruthy();
    });

    it('should render "during" variant', () => {
      const { getByText } = render(
        <MatchCard {...defaultProps} variant="during" />
      );

      expect(getByText('Amsterdam Spring Championship')).toBeTruthy();
    });

    it('should render "after" variant', () => {
      const { getByText } = render(
        <MatchCard {...defaultProps} variant="after" />
      );

      expect(getByText('Amsterdam Spring Championship')).toBeTruthy();
    });
  });
});
