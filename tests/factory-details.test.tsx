import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import FactoryDetailsScreen from '@/app/brand/tabs/factories/[id]';
import { supabase } from '@/lib/supabase';

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    WebView: ({ testID }) => React.createElement(View, { testID }),
  };
});

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({
    id: '123e4567-e89b-12d3-a456-426614174000', // Use a valid UUID format
  }),
}));

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'Test Factory',
              location: 'Test Location',
              description: 'Test Description',
              verified: true,
              minimum_order_quantity: 50,
              leather_types: ['CowHide'],
              tanning_types: ['Chrome'],
              finishes: ['Matte'],
              video_url: 'https://example.com/video.mp4',
            },
            error: null,
          })),
        })),
      })),
    })),
  },
}));

jest.mock('@/lib/storage', () => ({
  fetchGalleryImages: jest.fn(() => Promise.resolve([])),
  fetchFactoryVideo: jest.fn(() => Promise.resolve('https://example.com/video.mp4')),
}));

describe('FactoryDetailsScreen', () => {
  it('renders loading state initially', () => {
    const { getByText } = render(<FactoryDetailsScreen />);
    expect(getByText('Loading factory details...')).toBeTruthy();
  });

  it('renders factory details after loading', async () => {
    const { getByText } = render(<FactoryDetailsScreen />);

    await waitFor(() => {
      expect(getByText('Test Factory')).toBeTruthy();
      expect(getByText('Test Description')).toBeTruthy();
    });
  });

  it('renders a video when video_url is provided', async () => {
    const { getByTestId } = render(<FactoryDetailsScreen />);

    await waitFor(
      () => {
        expect(getByTestId('factory-video')).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it('handles errors correctly', async () => {
    // Mock Supabase error
    jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
      select: () => ({
        eq: () => ({
          single: () => ({
            data: null,
            error: new Error('Factory not found'),
          }),
        }),
      }),
    }));

    const { getByText } = render(<FactoryDetailsScreen />);
    
    await waitFor(() => {
      expect(getByText('Factory not found')).toBeTruthy();
    });
  });
});