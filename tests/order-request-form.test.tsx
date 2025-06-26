import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OrderRequestForm from '@/components/orders/OrderRequestForm';

describe('OrderRequestForm', () => {
  it('shows an error for invalid quantity', async () => {
    const onSubmit = jest.fn();
    const onClose = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <OrderRequestForm factoryId="1" onSubmit={onSubmit} onClose={onClose} />
    );

    fireEvent.changeText(getByPlaceholderText('Total Units'), 'abc');
    fireEvent.press(getByText('Submit Request'));

    await waitFor(() => {
      expect(getByText('Please enter a valid quantity')).toBeTruthy();
    });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('submits form data when valid', async () => {
    const onSubmit = jest.fn();
    const onClose = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <OrderRequestForm factoryId="1" onSubmit={onSubmit} onClose={onClose} />
    );

    fireEvent.changeText(getByPlaceholderText('Total Units'), '150');
    fireEvent.changeText(
      getByPlaceholderText('Add any details or special requirements...'),
      'hello'
    );
    fireEvent.press(getByText('Submit Request'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ quantity: 150, notes: 'hello' });
    });
    expect(onClose).toHaveBeenCalled();
  });
});
