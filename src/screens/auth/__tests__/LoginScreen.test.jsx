import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import { checkEmailExists } from '../../../services/authService';
import { useAuth } from '../../../contexts/AuthContext';

// Mock the dependencies
jest.mock('../../../services/authService');
jest.mock('../../../contexts/AuthContext');

describe('LoginScreen', () => {
  const mockOnNavigateToSignUp = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnEmailSubmit = jest.fn();
  const mockSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      signIn: mockSignIn,
    });
  });

  it('should render email input field', () => {
    const { getByPlaceholderText } = render(
      <LoginScreen
        onNavigateToSignUp={mockOnNavigateToSignUp}
        onClose={mockOnClose}
        onEmailSubmit={mockOnEmailSubmit}
      />
    );

    expect(getByPlaceholderText('e.g. name@proton.me')).toBeTruthy();
  });

  it('should render continue button', () => {
    const { getByText } = render(
      <LoginScreen
        onNavigateToSignUp={mockOnNavigateToSignUp}
        onClose={mockOnClose}
        onEmailSubmit={mockOnEmailSubmit}
      />
    );

    expect(getByText('Continue')).toBeTruthy();
  });

  it('should show error when email is empty', async () => {
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen
        onNavigateToSignUp={mockOnNavigateToSignUp}
        onClose={mockOnClose}
        onEmailSubmit={mockOnEmailSubmit}
      />
    );

    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(getByText('Please enter your email')).toBeTruthy();
    });
  });

  it('should show error when email format is invalid', async () => {
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen
        onNavigateToSignUp={mockOnNavigateToSignUp}
        onClose={mockOnClose}
        onEmailSubmit={mockOnEmailSubmit}
      />
    );

    const emailInput = getByPlaceholderText('e.g. name@proton.me');
    const continueButton = getByText('Continue');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(getByText('Please enter a valid email address')).toBeTruthy();
    });
  });

  it('should show password field for existing user', async () => {
    checkEmailExists.mockResolvedValue({ exists: true, error: null });

    const { getByText, getByPlaceholderText } = render(
      <LoginScreen
        onNavigateToSignUp={mockOnNavigateToSignUp}
        onClose={mockOnClose}
        onEmailSubmit={mockOnEmailSubmit}
      />
    );

    const emailInput = getByPlaceholderText('e.g. name@proton.me');
    const continueButton = getByText('Continue');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(getByText('Password')).toBeTruthy();
      expect(getByText('Login')).toBeTruthy();
    });
  });

  it('should call onEmailSubmit for new user', async () => {
    checkEmailExists.mockResolvedValue({ exists: false, error: null });

    const { getByText, getByPlaceholderText } = render(
      <LoginScreen
        onNavigateToSignUp={mockOnNavigateToSignUp}
        onClose={mockOnClose}
        onEmailSubmit={mockOnEmailSubmit}
      />
    );

    const emailInput = getByPlaceholderText('e.g. name@proton.me');
    const continueButton = getByText('Continue');

    fireEvent.changeText(emailInput, 'newuser@example.com');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockOnEmailSubmit).toHaveBeenCalledWith('newuser@example.com', true);
    });
  });

  it('should show error when password is empty', async () => {
    checkEmailExists.mockResolvedValue({ exists: true, error: null });

    const { getByText, getByPlaceholderText } = render(
      <LoginScreen
        onNavigateToSignUp={mockOnNavigateToSignUp}
        onClose={mockOnClose}
        onEmailSubmit={mockOnEmailSubmit}
      />
    );

    // First, trigger password field to show
    const emailInput = getByPlaceholderText('e.g. name@proton.me');
    const continueButton = getByText('Continue');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(getByText('Login')).toBeTruthy();
    });

    // Now try to login without password
    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Please enter your password')).toBeTruthy();
    });
  });

  it('should call signIn with correct credentials', async () => {
    checkEmailExists.mockResolvedValue({ exists: true, error: null });
    mockSignIn.mockResolvedValue({ success: true });

    const { getByText, getByPlaceholderText } = render(
      <LoginScreen
        onNavigateToSignUp={mockOnNavigateToSignUp}
        onClose={mockOnClose}
        onEmailSubmit={mockOnEmailSubmit}
      />
    );

    const emailInput = getByPlaceholderText('e.g. name@proton.me');
    const continueButton = getByText('Continue');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(getByText('Login')).toBeTruthy();
    });

    const passwordInput = getByPlaceholderText('Choose password');
    const loginButton = getByText('Login');

    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should show error on failed login', async () => {
    checkEmailExists.mockResolvedValue({ exists: true, error: null });
    mockSignIn.mockResolvedValue({
      success: false,
      error: 'Invalid email or password'
    });

    const { getByText, getByPlaceholderText } = render(
      <LoginScreen
        onNavigateToSignUp={mockOnNavigateToSignUp}
        onClose={mockOnClose}
        onEmailSubmit={mockOnEmailSubmit}
      />
    );

    const emailInput = getByPlaceholderText('e.g. name@proton.me');
    const continueButton = getByText('Continue');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(getByText('Login')).toBeTruthy();
    });

    const passwordInput = getByPlaceholderText('Choose password');
    const loginButton = getByText('Login');

    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Invalid email or password')).toBeTruthy();
    });
  });
});
