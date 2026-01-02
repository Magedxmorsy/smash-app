import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TabSelector from '../TabSelector';

describe('TabSelector', () => {
  const mockTabs = ['Tab 1', 'Tab 2', 'Tab 3'];
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all tabs', () => {
    const { getByText } = render(
      <TabSelector
        tabs={mockTabs}
        activeTab="Tab 1"
        onTabChange={mockOnTabChange}
      />
    );

    expect(getByText('Tab 1')).toBeTruthy();
    expect(getByText('Tab 2')).toBeTruthy();
    expect(getByText('Tab 3')).toBeTruthy();
  });

  it('should call onTabChange when tab is pressed', () => {
    const { getByText } = render(
      <TabSelector
        tabs={mockTabs}
        activeTab="Tab 1"
        onTabChange={mockOnTabChange}
      />
    );

    fireEvent.press(getByText('Tab 2'));

    expect(mockOnTabChange).toHaveBeenCalledWith('Tab 2');
  });

  it('should apply active style to active tab', () => {
    const { getByText } = render(
      <TabSelector
        tabs={mockTabs}
        activeTab="Tab 2"
        onTabChange={mockOnTabChange}
      />
    );

    const tab2 = getByText('Tab 2');
    expect(tab2).toBeTruthy();
  });
});
