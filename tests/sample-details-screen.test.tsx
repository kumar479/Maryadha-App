import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import SampleDetailsScreen from '@/app/brand/tabs/samples/[id]/index';
import { supabase } from '@/lib/supabase';

jest.mock('@stripe/stripe-react-native', () => ({
  useStripe: () => ({
    initPaymentSheet: jest.fn(),
    presentPaymentSheet: jest.fn(),
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: 'sample1' }),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    functions: { invoke: jest.fn() },
    storage: { from: jest.fn() },
    channel: jest.fn(() => ({ on: jest.fn().mockReturnThis(), subscribe: jest.fn() })),
    removeChannel: jest.fn(),
  },
}));

const fromMock = supabase.from as jest.Mock;
const invokeMock = supabase.functions.invoke as jest.Mock;
const storageFromMock = supabase.storage.from as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();

  const sampleData = {
    id: 'sample1',
    status: 'invoice_sent',
    factories: { name: 'Test Factory' },
    reps: { name: 'Rep', email: 'rep@test.com' },
  };

  fromMock.mockImplementation((table: string) => {
    if (table === 'samples') {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: sampleData, error: null }),
          }),
        }),
      } as any;
    }
    if (table === 'sample_payments') {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'inv1', amount: 100, currency: 'USD' },
                error: null,
              }),
            }),
          }),
        }),
      } as any;
    }
    return {} as any;
  });

  storageFromMock.mockReturnValue({
    upload: jest.fn(),
  });
});

describe('SampleDetailsScreen invoice payment', () => {
  it('renders Pay Deposit button when invoice_sent', async () => {
    const { getByText } = render(<SampleDetailsScreen />);
    await waitFor(() => {
      expect(getByText('Pay Deposit')).toBeTruthy();
    });
  });

  it('requests client secret using edge function on Pay press', async () => {
    invokeMock.mockResolvedValue({ data: { clientSecret: 'secret' }, error: null });
    const { getByText } = render(<SampleDetailsScreen />);
    await waitFor(() => getByText('Pay Deposit'));
    fireEvent.press(getByText('Pay Deposit'));
    await waitFor(() => {
      expect(invokeMock).toHaveBeenCalledWith('create-sample-payment', {
        body: { sampleId: 'sample1', paymentType: 'deposit' },
      });
    });
  });

  it.skip('uploads invoice file to storage', async () => {
    const uploadMock = jest.fn().mockResolvedValue({ error: null });
    storageFromMock.mockReturnValueOnce({ upload: uploadMock });

    const { getByText } = render(<SampleDetailsScreen />);
    await waitFor(() => getByText('Pay Deposit'));

    fireEvent.press(getByText('Upload Invoice'));

    await waitFor(() => {
      expect(storageFromMock).toHaveBeenCalledWith('invoices');
      expect(uploadMock).toHaveBeenCalled();
    });
  });
});
