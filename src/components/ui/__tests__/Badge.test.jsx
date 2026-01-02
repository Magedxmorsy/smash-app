import React from 'react';
import { render } from '@testing-library/react-native';
import Badge from '../Badge';

describe('Badge', () => {
  it('should render with label text in uppercase', () => {
    const { getByText } = render(
      <Badge variant="registration" label="Registration" />
    );

    expect(getByText('REGISTRATION')).toBeTruthy();
  });

  it('should render with group_stage variant', () => {
    const { getByText } = render(
      <Badge variant="group_stage" label="Group Stage" />
    );

    expect(getByText('GROUP STAGE')).toBeTruthy();
  });

  it('should render with quarter_finals variant', () => {
    const { getByText } = render(
      <Badge variant="quarter_finals" label="Quarter Finals" />
    );

    expect(getByText('QUARTER FINALS')).toBeTruthy();
  });

  it('should render with semi_finals variant', () => {
    const { getByText } = render(
      <Badge variant="semi_finals" label="Semi Finals" />
    );

    expect(getByText('SEMI FINALS')).toBeTruthy();
  });

  it('should render with finals variant', () => {
    const { getByText } = render(
      <Badge variant="finals" label="Finals" />
    );

    expect(getByText('FINALS')).toBeTruthy();
  });

  it('should render with finished variant', () => {
    const { getByText } = render(
      <Badge variant="finished" label="Finished" />
    );

    expect(getByText('FINISHED')).toBeTruthy();
  });

  it('should render with knockout variant', () => {
    const { getByText } = render(
      <Badge variant="knockout" label="Knockout" />
    );

    expect(getByText('KNOCKOUT')).toBeTruthy();
  });

  it('should default to registration variant for unknown variant', () => {
    const { getByText } = render(
      <Badge variant="unknown" label="Unknown" />
    );

    expect(getByText('UNKNOWN')).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const { getByText } = render(
      <Badge variant="registration" label="Test" style={{ marginTop: 10 }} />
    );

    expect(getByText('TEST')).toBeTruthy();
  });
});
