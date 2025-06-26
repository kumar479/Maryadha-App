import React from 'react';
import { render, screen } from '@testing-library/react-native';
import SampleTimeline from '../components/samples/SampleTimeline';
import { SampleStatusUpdate } from '../types';

// Mock the constants
jest.mock('../constants/Colors', () => ({
  status: {
    success: '#10B981',
  },
  neutral: {
    400: '#9CA3AF',
    600: '#4B5563',
    700: '#374151',
  },
}));

jest.mock('../constants/Typography', () => ({
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
}));

describe('SampleTimeline', () => {
  const mockUpdates: SampleStatusUpdate[] = [
    {
      id: '1',
      sampleId: 'sample-1',
      status: 'requested',
      notes: 'Sample requested',
      eta: null,
      trackingNumber: null,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      sampleId: 'sample-1',
      status: 'shipped',
      notes: 'Sample shipped',
      eta: '2024-01-15',
      trackingNumber: 'TRK123456789',
      createdAt: '2024-01-10T00:00:00Z',
    },
  ];

  it('displays all timeline stages', () => {
    render(<SampleTimeline updates={mockUpdates} />);
    
    expect(screen.getByText('requested')).toBeTruthy();
    expect(screen.getByText('invoice sent')).toBeTruthy();
    expect(screen.getByText('sample paid')).toBeTruthy();
    expect(screen.getByText('in production')).toBeTruthy();
    expect(screen.getByText('shipped')).toBeTruthy();
    expect(screen.getByText('delivered')).toBeTruthy();
  });

  it('displays ETA when provided', () => {
    render(<SampleTimeline updates={mockUpdates} />);
    // Use regex to match multiline ETA text
    expect(screen.getByText(/ETA:\s*15\/1\/2024/)).toBeTruthy();
  });

  it('displays tracking number when provided', () => {
    render(<SampleTimeline updates={mockUpdates} />);
    
    expect(screen.getByText('Tracking: TRK123456789')).toBeTruthy();
  });

  it('displays notes when provided', () => {
    render(<SampleTimeline updates={mockUpdates} />);
    
    expect(screen.getByText('Sample requested')).toBeTruthy();
    expect(screen.getByText('Sample shipped')).toBeTruthy();
  });

  it('displays creation date for each update', () => {
    render(<SampleTimeline updates={mockUpdates} />);
    
    expect(screen.getByText('1/1/2024')).toBeTruthy();
    expect(screen.getByText('10/1/2024')).toBeTruthy();
  });

  it('handles empty updates array', () => {
    render(<SampleTimeline updates={[]} />);
    
    // Should still display all stages but without completion indicators
    expect(screen.getByText('requested')).toBeTruthy();
    expect(screen.getByText('shipped')).toBeTruthy();
  });

  it('handles updates without ETA or tracking number', () => {
    const updatesWithoutTracking: SampleStatusUpdate[] = [
      {
        id: '1',
        sampleId: 'sample-1',
        status: 'shipped',
        notes: 'Sample shipped without tracking',
        eta: null,
        trackingNumber: null,
        createdAt: '2024-01-10T00:00:00Z',
      },
    ];

    render(<SampleTimeline updates={updatesWithoutTracking} />);
    
    expect(screen.getByText('Sample shipped without tracking')).toBeTruthy();
    expect(screen.queryByText(/ETA:/)).toBeNull();
    expect(screen.queryByText(/Tracking:/)).toBeNull();
  });
}); 