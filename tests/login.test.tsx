import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '@/app/auth/login';
import { supabase } from '@/lib/supabase';

// Mock expo-router
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
    Link: ({ href, children }) =>
      React.cloneElement(children, { onPress: jest.fn() }),
  };
});

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn(),
      verifyOtp: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  },
}));

const signInWithOtpMock =
  (supabase.auth.signInWithOtp as unknown as jest.Mock);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LoginScreen', () => {
  it('disables the Continue button when input is empty', () => {
    const { getByA11yState } = render(<LoginScreen />);

    expect(getByA11yState({ disabled: true })).toBeTruthy();
  });

  it('shows validation message for invalid input', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    fireEvent.changeText(
      getByPlaceholderText('Enter your email or phone number'),
      'invalid'
    );
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(getByText('Please enter a valid email or phone number')).toBeTruthy();
    });
  });

  it('calls signInWithOtp with email', async () => {
    signInWithOtpMock.mockResolvedValueOnce({ data: {}, error: null });
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    fireEvent.changeText(
      getByPlaceholderText('Enter your email or phone number'),
      'test@example.com'
    );
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(signInWithOtpMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          shouldCreateUser: false,
          emailRedirectTo: 'https://pfrlxclmdiccaopmpnhy.supabase.co/auth/v1/callback',
        },
      });
    });
  });

  it('calls signInWithOtp with phone number', async () => {
    signInWithOtpMock.mockResolvedValueOnce({ data: {}, error: null });
    const { getByText, getByPlaceholderText, findByText } = render(<LoginScreen />);

    fireEvent.changeText(
      getByPlaceholderText('Enter your email or phone number'),
      '1234567890'
    );
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(signInWithOtpMock).toHaveBeenCalledWith({
        phone: '+1234567890',
      });
    });

    expect(await findByText('Verify Your Phone')).toBeTruthy();
  });
});
