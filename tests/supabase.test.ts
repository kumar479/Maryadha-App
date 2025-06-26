import { Platform } from 'react-native';

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: { signOut: jest.fn() },
  })),
}));

process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon';

const SecureStore = require('expo-secure-store');
const { createClient } = require('@supabase/supabase-js');
const { handleLogout, supabase } = require('../lib/supabase');
(global as any).localStorage = {
  clear: jest.fn(),
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

describe('handleLogout', () => {
  const originalOS = Platform.OS;
  const signOutMock = supabase.auth.signOut as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    signOutMock.mockResolvedValue({ error: null } as any);
  });

  afterAll(() => {
    (Platform as any).OS = originalOS;
  });

  it('clears tokens on web', async () => {
    (Platform as any).OS = 'web';
    const clearSpy = jest.spyOn((global as any).localStorage, 'clear');

    const result = await handleLogout();

    expect(signOutMock).toHaveBeenCalled();
    expect(clearSpy).toHaveBeenCalled();
    expect(result).toEqual({ error: null });
  });

  it('clears secure store on native', async () => {
    (Platform as any).OS = 'ios';
    const deleteSpy = jest
      .spyOn(SecureStore, 'deleteItemAsync')
      .mockResolvedValue();
    const clearSpy = jest.spyOn((global as any).localStorage, 'clear');

    const result = await handleLogout();

    expect(signOutMock).toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalledWith('supabase-auth-token');
    expect(clearSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ error: null });
  });
});

