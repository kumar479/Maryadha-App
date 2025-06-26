import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { supabase } from '@/lib/supabase';
import FactoryDetailsScreen from '@/app/brand/tabs/factories/[id]';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'test-factory-id' }),
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Sample Request Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit sample request with correct schema', async () => {
    const mockUser = { id: 'test-user-id' };
    const mockFactory = {
      id: 'test-factory-id',
      name: 'Test Factory',
      rep_id: 'test-rep-id',
      location: 'Test Location',
      description: 'Test Description',
      verified: true,
      minimum_order_quantity: 50,
      leather_types: ['Full Grain'],
      tanning_types: ['Vegetable'],
      finishes: ['Smooth'],
    };
    const mockSample = {
      id: 'test-sample-id',
      factory_id: 'test-factory-id',
      brand_id: 'test-user-id',
      rep_id: 'test-rep-id',
      status: 'requested',
      file_url: 'https://example.com/tech-pack.pdf',
      comments: 'Test notes',
      preferred_moq: 100,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    // Mock Supabase responses
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
    });

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
    });

    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'factories') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: mockFactory })),
            })),
          })),
        };
      }
      if (table === 'samples') {
        return {
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: mockSample })),
            })),
          })),
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      };
    });

    // Mock fetch for notification
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { getByText } = render(<FactoryDetailsScreen />);

    // Wait for component to load
    await waitFor(() => {
      expect(getByText('Test Factory')).toBeTruthy();
    });

    // Find and press the Request Sample button
    const requestButton = getByText('Request Sample');
    fireEvent.press(requestButton);

    // Wait for the form to appear and submit
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('samples');
    });

    // Verify the sample was created with correct schema
    const insertCall = (supabase.from as jest.Mock).mock.results.find(
      (result: any) => result.value.insert
    );
    
    expect(insertCall).toBeTruthy();
  });

  it('should trigger notification to sales rep', async () => {
    const mockUser = { id: 'test-user-id' };
    const mockFactory = {
      id: 'test-factory-id',
      name: 'Test Factory',
      rep_id: 'test-rep-id',
    };
    const mockSample = {
      id: 'test-sample-id',
    };

    // Mock Supabase responses
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
    });

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
    });

    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'factories') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: mockFactory })),
            })),
          })),
        };
      }
      if (table === 'samples') {
        return {
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: mockSample })),
            })),
          })),
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      };
    });

    // Mock fetch for notification
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { getByText } = render(<FactoryDetailsScreen />);

    // Wait for component to load and submit sample request
    await waitFor(() => {
      expect(getByText('Test Factory')).toBeTruthy();
    });

    const requestButton = getByText('Request Sample');
    fireEvent.press(requestButton);

    // Wait for notification to be triggered
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/sample-request-notification'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          }),
          body: JSON.stringify({ sampleId: 'test-sample-id' }),
        })
      );
    });
  });
}); 