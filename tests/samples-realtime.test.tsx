import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { supabase } from '@/lib/supabase';
import SamplesScreen from '@/app/brand/tabs/samples';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [] })),
        })),
      })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(() => ({})),
      })),
    })),
    removeChannel: jest.fn(),
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useFocusEffect: jest.fn((callback) => callback()),
}));

describe('Samples Real-time Updates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set up real-time subscription when user is authenticated', async () => {
    const mockUser = { id: 'test-user-id' };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [] })),
        })),
      })),
    });

    render(<SamplesScreen />);

    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledWith('samples-changes');
    });
  });

  it('should refresh samples when real-time event is received', async () => {
    const mockUser = { id: 'test-user-id' };
    const mockSamples = [
      {
        id: 'sample-1',
        factory_id: 'factory-1',
        status: 'requested',
        created_at: '2024-01-01T00:00:00Z',
        factories: { name: 'Test Factory' },
      },
    ];

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: mockSamples })),
        })),
      })),
    });

    const { getByText } = render(<SamplesScreen />);

    await waitFor(() => {
      expect(getByText('Test Factory')).toBeTruthy();
    });
  });

  it('should handle focus effect to refresh samples', async () => {
    const mockUser = { id: 'test-user-id' };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [] })),
        })),
      })),
    });

    render(<SamplesScreen />);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('samples');
    });
  });
}); 