// Jest setup for Expo/React Native
// NOTE: jest.mock must be at the top level for Jest to hoist them properly

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: false, assets: [] }),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({ canceled: false, assets: [] }),
}));

jest.mock('@/lib/supabase', () => {
  const actual = jest.requireActual('@/lib/supabase');
  return {
    ...actual,
    supabase: {
      ...actual.supabase,
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
        signOut: jest.fn(),
      },
    },
  };
}); 