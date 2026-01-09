import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { jest } from '@jest/globals';
import RemovePlayerConfirmationBottomSheet from '../RemovePlayerConfirmationBottomSheet';
import Button from '../../ui/Button';

describe('RemovePlayerConfirmationBottomSheet', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    playerName: 'John Doe',
    isSelf: false,
    isOnlyPlayer: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible is true', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} />
      );

      expect(getByText('Remove player?')).toBeTruthy();
    });
  });

  describe('Remove Player Mode (isSelf=false)', () => {
    it('should show "Remove player?" title', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} />
      );

      expect(getByText('Remove player?')).toBeTruthy();
    });

    it('should show player name in message', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} playerName="John Doe" />
      );

      expect(getByText('Remove John Doe from this team?')).toBeTruthy();
    });

    it('should show "Remove player" button text', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} />
      );

      expect(getByText('Remove player')).toBeTruthy();
    });

    it('should show "Cancel" button text', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} />
      );

      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should call onConfirm when confirm button is pressed', () => {
      const onConfirm = jest.fn();
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} onConfirm={onConfirm} />
      );

      fireEvent.press(getByText('Remove player'));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when cancel button is pressed', () => {
      const onClose = jest.fn();
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} onClose={onClose} />
      );

      fireEvent.press(getByText('Cancel'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters in player name', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} playerName="O'Brien" />
      );

      expect(getByText("Remove O'Brien from this team?")).toBeTruthy();
    });

    it('should handle very long player names', () => {
      const longName = 'VeryLongFirstName VeryLongLastName';
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} playerName={longName} />
      );

      expect(getByText(`Remove ${longName} from this team?`)).toBeTruthy();
    });
  });

  describe('Leave Team Mode (isSelf=true, isOnlyPlayer=false)', () => {
    it('should show "Leave team?" title', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} isSelf={true} isOnlyPlayer={false} />
      );

      expect(getByText('Leave team?')).toBeTruthy();
    });

    it('should show leave team message', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} isSelf={true} isOnlyPlayer={false} />
      );

      expect(getByText('Are you sure you want to leave this team?')).toBeTruthy();
    });

    it('should show "Leave team" button text', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} isSelf={true} isOnlyPlayer={false} />
      );

      expect(getByText('Leave team')).toBeTruthy();
    });

    it('should show "Stay in team" button text', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} isSelf={true} isOnlyPlayer={false} />
      );

      expect(getByText('Stay in team')).toBeTruthy();
    });

    it('should call onConfirm when leave button is pressed', () => {
      const onConfirm = jest.fn();
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet
          {...defaultProps}
          isSelf={true}
          isOnlyPlayer={false}
          onConfirm={onConfirm}
        />
      );

      fireEvent.press(getByText('Leave team'));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when stay button is pressed', () => {
      const onClose = jest.fn();
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet
          {...defaultProps}
          isSelf={true}
          isOnlyPlayer={false}
          onClose={onClose}
        />
      );

      fireEvent.press(getByText('Stay in team'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not show player name when leaving own team', () => {
      const { queryByText } = render(
        <RemovePlayerConfirmationBottomSheet
          {...defaultProps}
          isSelf={true}
          isOnlyPlayer={false}
          playerName="John Doe"
        />
      );

      // Player name should not appear in the message
      expect(queryByText(/John Doe/)).toBeNull();
    });
  });

  describe('Delete Team Mode (isSelf=true, isOnlyPlayer=true)', () => {
    it('should show "Delete team?" title', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} isSelf={true} isOnlyPlayer={true} />
      );

      expect(getByText('Delete team?')).toBeTruthy();
    });

    it('should show delete team message with warning', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} isSelf={true} isOnlyPlayer={true} />
      );

      expect(getByText('Are you sure you want to delete this team? This action cannot be undone.')).toBeTruthy();
    });

    it('should show "Delete team" button text', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} isSelf={true} isOnlyPlayer={true} />
      );

      expect(getByText('Delete team')).toBeTruthy();
    });

    it('should show "Stay in team" button text', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} isSelf={true} isOnlyPlayer={true} />
      );

      expect(getByText('Stay in team')).toBeTruthy();
    });

    it('should call onConfirm when delete button is pressed', () => {
      const onConfirm = jest.fn();
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet
          {...defaultProps}
          isSelf={true}
          isOnlyPlayer={true}
          onConfirm={onConfirm}
        />
      );

      fireEvent.press(getByText('Delete team'));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when stay button is pressed', () => {
      const onClose = jest.fn();
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet
          {...defaultProps}
          isSelf={true}
          isOnlyPlayer={true}
          onClose={onClose}
        />
      );

      fireEvent.press(getByText('Stay in team'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not show player name when deleting own team', () => {
      const { queryByText } = render(
        <RemovePlayerConfirmationBottomSheet
          {...defaultProps}
          isSelf={true}
          isOnlyPlayer={true}
          playerName="John Doe"
        />
      );

      // Player name should not appear in the message
      expect(queryByText(/John Doe/)).toBeNull();
    });
  });

  describe('Button Variants', () => {
    it('should use secondary variant for confirm button', () => {
      const { UNSAFE_root } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} />
      );

      const buttons = UNSAFE_root.findAllByType(Button);
      // First button is confirm button
      expect(buttons[0].props.variant).toBe('secondary');
    });

    it('should use ghost variant for cancel button', () => {
      const { UNSAFE_root } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} />
      );

      const buttons = UNSAFE_root.findAllByType(Button);
      // Second button is cancel button
      expect(buttons[1].props.variant).toBe('ghost');
    });

    it('should make both buttons full width', () => {
      const { UNSAFE_root } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} />
      );

      const buttons = UNSAFE_root.findAllByType(Button);
      expect(buttons[0].props.fullWidth).toBe(true);
      expect(buttons[1].props.fullWidth).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty player name', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} playerName="" />
      );

      expect(getByText('Remove  from this team?')).toBeTruthy();
    });

    it('should handle null player name gracefully', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} playerName={null} />
      );

      // Should render with null in the string
      expect(getByText('Remove null from this team?')).toBeTruthy();
    });

    it('should handle undefined player name gracefully', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} playerName={undefined} />
      );

      // Should render with undefined in the string
      expect(getByText('Remove undefined from this team?')).toBeTruthy();
    });

    it('should handle rapid button presses', () => {
      const onConfirm = jest.fn();
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} onConfirm={onConfirm} />
      );

      const confirmButton = getByText('Remove player');
      fireEvent.press(confirmButton);
      fireEvent.press(confirmButton);
      fireEvent.press(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(3);
    });

    it('should default isSelf to false when not provided', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet
          visible={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          playerName="John Doe"
        />
      );

      // Should show remove player mode
      expect(getByText('Remove player?')).toBeTruthy();
    });

    it('should default isOnlyPlayer to false when not provided', () => {
      const { getByText } = render(
        <RemovePlayerConfirmationBottomSheet
          visible={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          playerName="John Doe"
          isSelf={true}
        />
      );

      // Should show leave team mode (not delete team)
      expect(getByText('Leave team?')).toBeTruthy();
    });
  });

  describe('Integration Scenarios', () => {
    it('should switch between modes when props change', () => {
      const { rerender, getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} isSelf={false} />
      );

      // Initially in remove player mode
      expect(getByText('Remove player?')).toBeTruthy();

      // Switch to leave team mode
      rerender(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} isSelf={true} isOnlyPlayer={false} />
      );

      expect(getByText('Leave team?')).toBeTruthy();

      // Switch to delete team mode
      rerender(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} isSelf={true} isOnlyPlayer={true} />
      );

      expect(getByText('Delete team?')).toBeTruthy();
    });

    it('should update player name when prop changes', () => {
      const { rerender, getByText } = render(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} playerName="Alice" />
      );

      expect(getByText('Remove Alice from this team?')).toBeTruthy();

      rerender(
        <RemovePlayerConfirmationBottomSheet {...defaultProps} playerName="Bob" />
      );

      expect(getByText('Remove Bob from this team?')).toBeTruthy();
    });

    it('should maintain callbacks when switching visibility', () => {
      const onConfirm = jest.fn();
      const onClose = jest.fn();
      const { rerender, getByText } = render(
        <RemovePlayerConfirmationBottomSheet
          {...defaultProps}
          visible={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />
      );

      // Hide
      rerender(
        <RemovePlayerConfirmationBottomSheet
          {...defaultProps}
          visible={false}
          onConfirm={onConfirm}
          onClose={onClose}
        />
      );

      // Show again
      rerender(
        <RemovePlayerConfirmationBottomSheet
          {...defaultProps}
          visible={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />
      );

      // Callbacks should still work
      fireEvent.press(getByText('Remove player'));
      expect(onConfirm).toHaveBeenCalledTimes(1);

      fireEvent.press(getByText('Cancel'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
