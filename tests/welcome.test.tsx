import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import WelcomeScreen from '@/app/auth/welcome';
import EmailConfirmScreen from '@/app/auth/emailConfirm/confirm';
import * as userUtils from '@/utils/user';
import { supabase } from '@/lib/supabase';

// Mock expo-router
const pushMock = jest.fn();
(global as any).pushMock = pushMock;
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: (global as any).pushMock }),
    Link: ({ href, children }) =>
      React.cloneElement(children, {
        onPress: () => (global as any).pushMock(href),
      }),
  };
});

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      setSession: jest.fn(),
      getSession: jest.fn(),
    },
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/auth/emailConfirm/confirm',
}));

jest.mock('@/utils/user');

describe('WelcomeScreen', () => {
  it('renders correctly', () => {
    const { getByText, getByTestId } = render(<WelcomeScreen />);
    
    // Check if main elements are rendered
    expect(getByText('Welcome to Maryadha')).toBeTruthy();
    expect(getByText('Connect with premium leather manufacturers and bring your designs to life')).toBeTruthy();
    expect(getByText('Create Account')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('navigates to auth screens when buttons are pressed', () => {
    const { getByText } = render(<WelcomeScreen />);

    fireEvent.press(getByText('Create Account'));
    expect(pushMock).toHaveBeenCalledWith('/auth/signup');

    fireEvent.press(getByText('Sign In'));
    expect(pushMock).toHaveBeenCalledWith('/auth/login');
  });

  it('displays the hero image', () => {
    const { getByTestId } = render(<WelcomeScreen />);
    const image = getByTestId('hero-image');
    
    expect(image.props.source.uri).toBe('https://images.pexels.com/photos/6822893/pexels-photo-6822893.jpeg');
  });
});

describe('EmailConfirmScreen (Google Sign-In)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows error if user already exists (brand)', async () => {
    (userUtils.checkExistingUser as jest.Mock).mockResolvedValue({ exists: true, type: 'brand' });
    (supabase.auth.setSession as jest.Mock).mockResolvedValue({ data: { session: { user: { email: 'test@brand.com' } } }, error: null });
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: { user: { email: 'test@brand.com' } } }, error: null });

    const { getByText, findByText } = render(<EmailConfirmScreen />);
    await waitFor(() => findByText(/An account already exists for this email address/i));
    expect(getByText(/brand/i)).toBeTruthy();
    expect(getByText(/sign in to your account/i)).toBeTruthy();
  });

  it('shows error if user already exists (rep)', async () => {
    (userUtils.checkExistingUser as jest.Mock).mockResolvedValue({ exists: true, type: 'rep' });
    (supabase.auth.setSession as jest.Mock).mockResolvedValue({ data: { session: { user: { email: 'rep@maryadha.com' } } }, error: null });
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: { user: { email: 'rep@maryadha.com' } } }, error: null });

    const { getByText, findByText } = render(<EmailConfirmScreen />);
    await waitFor(() => findByText(/An account already exists for this email address/i));
    expect(getByText(/Maryadha representative/i)).toBeTruthy();
    expect(getByText(/sign in to your account/i)).toBeTruthy();
  });

  it('proceeds to success for new user', async () => {
    (userUtils.checkExistingUser as jest.Mock).mockResolvedValue({ exists: false });
    (supabase.auth.setSession as jest.Mock).mockResolvedValue({ data: { session: { user: { email: 'new@brand.com' } } }, error: null });
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: { user: { email: 'new@brand.com' } } }, error: null });

    const { getByText, findByText } = render(<EmailConfirmScreen />);
    await waitFor(() => findByText(/Email Verified Successfully/i));
    expect(getByText(/Thank you for verifying your email address/i)).toBeTruthy();
  });

  it('shows generic error if session is missing', async () => {
    (userUtils.checkExistingUser as jest.Mock).mockResolvedValue({ exists: false });
    (supabase.auth.setSession as jest.Mock).mockResolvedValue({ data: { session: null }, error: null });
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null }, error: null });

    const { getByText, findByText } = render(<EmailConfirmScreen />);
    await waitFor(() => findByText(/An unexpected error occurred/i));
    expect(getByText(/Verification Failed/i)).toBeTruthy();
  });
});