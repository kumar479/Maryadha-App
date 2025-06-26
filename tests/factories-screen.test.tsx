import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FactoriesScreen from '@/app/brand/tabs/factories/index';
import { supabase } from '@/lib/supabase';
import { Factory } from '@/types';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

const fromMock = supabase.from as jest.Mock;

const factories: Factory[] = [
  {
    id: '1',
    name: 'Factory A',
    location: 'City',
    description: '',
    verified: true,
    minimum_order_quantity: 25,
    leather_types: ['CowHide'],
    tanning_types: ['Vegetable'],
    finishes: ['Matte'],
    product_categories: ['Bags'],
  },
  {
    id: '2',
    name: 'Factory B',
    location: 'City',
    description: '',
    verified: true,
    minimum_order_quantity: 75,
    leather_types: ['LambSkin'],
    tanning_types: ['Chrome'],
    finishes: ['Polished'],
    product_categories: ['Wallets'],
  },
  {
    id: '3',
    name: 'Factory C',
    location: 'City',
    description: '',
    verified: false,
    minimum_order_quantity: 150,
    leather_types: ['GoatSkin'],
    tanning_types: ['Chrome'],
    finishes: ['Suede'],
    product_categories: ['Belts'],
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  fromMock.mockReturnValue({
    select: jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: factories, error: null }),
    }),
  });
});

describe('FactoriesScreen filters', () => {
  it('filters by MOQ', async () => {
    const { getByText, queryByText } = render(<FactoriesScreen />);

    await waitFor(() => getByText('Factory A'));

    fireEvent.press(getByText('50-100'));

    await waitFor(() => {
      expect(queryByText('Factory A')).toBeNull();
      expect(queryByText('Factory C')).toBeNull();
      expect(getByText('Factory B')).toBeTruthy();
    });
  });

  it('filters by Leather Types', async () => {
    const { getByText, getAllByText, queryByText } = render(
      <FactoriesScreen />,
    );

    await waitFor(() => getByText('Factory A'));

    fireEvent.press(getAllByText('LambSkin')[0]);

    await waitFor(() => {
      expect(queryByText('Factory A')).toBeNull();
      expect(queryByText('Factory C')).toBeNull();
      expect(getByText('Factory B')).toBeTruthy();
    });
  });

  it('filters by Finishes', async () => {
    const { getByText, queryByText } = render(<FactoriesScreen />);

    await waitFor(() => getByText('Factory A'));

    fireEvent.press(getByText('Suede'));

    await waitFor(() => {
      expect(queryByText('Factory A')).toBeNull();
      expect(queryByText('Factory B')).toBeNull();
      expect(getByText('Factory C')).toBeTruthy();
    });
  });

  it('filters by Product Categories', async () => {
    const { getByText, queryByText } = render(<FactoriesScreen />);

    await waitFor(() => getByText('Factory A'));

    fireEvent.press(getByText('Belts'));

    await waitFor(() => {
      expect(queryByText('Factory A')).toBeNull();
      expect(queryByText('Factory B')).toBeNull();
      expect(getByText('Factory C')).toBeTruthy();
    });
  });

  it('filters by Tanning Process and clears selection', async () => {
    const { getByText, queryByText } = render(<FactoriesScreen />);

    await waitFor(() => getByText('Factory A'));

    fireEvent.press(getByText('Chrome'));

    await waitFor(() => {
      expect(queryByText('Factory A')).toBeNull();
      expect(queryByText('Factory B')).toBeTruthy();
      expect(queryByText('Factory C')).toBeTruthy();
    });

    fireEvent.press(getByText('Chrome'));

    await waitFor(() => {
      expect(getByText('Factory A')).toBeTruthy();
      expect(getByText('Factory B')).toBeTruthy();
      expect(getByText('Factory C')).toBeTruthy();
    });
  });
});
