import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SampleRequestForm from '@/components/samples/SampleRequestForm';
import { getDocumentAsync } from 'expo-document-picker';
import { supabase } from '@/lib/supabase';

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: { from: jest.fn() },
  },
}));

const getDocumentAsyncMock = getDocumentAsync as jest.Mock;
const fromMock = supabase.storage.from as jest.Mock;
const uploadMock = jest.fn();
const getPublicUrlMock = jest.fn();

fromMock.mockImplementation(() => ({
  upload: uploadMock,
  getPublicUrl: getPublicUrlMock,
}));

describe('SampleRequestForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).fetch = jest.fn().mockResolvedValue({
      blob: jest.fn().mockResolvedValue('blob'),
    });
    getPublicUrlMock.mockReturnValue({
      data: { publicUrl: 'https://files.test/dummy.pdf' },
    });
    uploadMock.mockResolvedValue({ error: null });
  });

  // Removed test: tech pack is now optional, so form can submit without it
  // it('does not submit when tech pack is missing', () => {
  //   const onSubmit = jest.fn();
  //   const onClose = jest.fn();
  //   const { getByText, getByPlaceholderText } = render(
  //     <SampleRequestForm factoryId="1" onSubmit={onSubmit} onClose={onClose} />,
  //   );

  //   fireEvent.changeText(getByPlaceholderText('Minimum Order Quantity'), '50');
  //   fireEvent.changeText(getByPlaceholderText('Number of units'), '10');
  //   fireEvent.press(getByText('Submit Request'));

  //   expect(onSubmit).not.toHaveBeenCalled();
  // });

  it('shows an error for invalid quantity', async () => {
    const onSubmit = jest.fn();
    const onClose = jest.fn();
    getDocumentAsyncMock.mockResolvedValue({
      canceled: false,
      assets: [
        {
          name: 'dummy.pdf',
          uri: 'file:///dummy.pdf',
          mimeType: 'application/pdf',
        },
      ],
    });
    const { getByText, getByPlaceholderText } = render(
      <SampleRequestForm factoryId="1" onSubmit={onSubmit} onClose={onClose} />,
    );

    fireEvent.press(getByText('Upload Tech Pack'));
    await waitFor(() => expect(fromMock).toHaveBeenCalled());

    fireEvent.changeText(getByPlaceholderText('Number of units'), 'abc');
    fireEvent.press(getByText('Submit Request'));

    await waitFor(() => {
      expect(
        getByText('Please enter a valid quantity (must be greater than 0)'),
      ).toBeTruthy();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits form data when tech pack is missing (now optional)', async () => {
    const onSubmit = jest.fn();
    const onClose = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <SampleRequestForm factoryId="1" onSubmit={onSubmit} onClose={onClose} />,
    );

    fireEvent.changeText(getByPlaceholderText('Minimum Order Quantity'), '50');
    fireEvent.changeText(getByPlaceholderText('Number of units'), '10');
    fireEvent.press(getByText('Submit Request'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        techPack: null,
        sketch: undefined,
        productName: '',
        referenceImages: [],
        preferredMoq: 50,
        quantity: 10,
        finishNotes: '',
        deliveryAddress: '',
        notes: '',
      });
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('submits form data when valid', async () => {
    const onSubmit = jest.fn();
    const onClose = jest.fn();
    getDocumentAsyncMock.mockResolvedValue({
      canceled: false,
      assets: [
        {
          name: 'dummy.pdf',
          uri: 'file:///dummy.pdf',
          mimeType: 'application/pdf',
        },
      ],
    });
    const { getByText, getByPlaceholderText } = render(
      <SampleRequestForm factoryId="1" onSubmit={onSubmit} onClose={onClose} />,
    );

    fireEvent.press(getByText('Upload Tech Pack'));
    await waitFor(() => expect(fromMock).toHaveBeenCalled());

    fireEvent.changeText(getByPlaceholderText('Minimum Order Quantity'), '200');
    fireEvent.changeText(getByPlaceholderText('Number of units'), '5');
    fireEvent.changeText(
      getByPlaceholderText('Any specific requirements or details'),
      'note',
    );
    fireEvent.press(getByText('Submit Request'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        techPack: 'https://files.test/dummy.pdf',
        sketch: undefined,
        productName: '',
        referenceImages: [],
        preferredMoq: 200,
        quantity: 5,
        finishNotes: '',
        deliveryAddress: '',
        notes: 'note',
      });
    });
    expect(onClose).toHaveBeenCalled();
  });
});
