import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import CustomButton from '@/components/shared/CustomButton';
import Colors from '@/constants/Colors';

describe('CustomButton', () => {
  it('renders primary variant with medium size styles', () => {
    const { getByTestId, getByText } = render(
      <CustomButton title="Press" variant="primary" size="medium" testID="btn" />
    );

    const button = getByTestId('btn');
    const buttonStyle = StyleSheet.flatten(button.props.style);
    const textStyle = StyleSheet.flatten(getByText('Press').props.style);
    expect(buttonStyle).toMatchObject({ backgroundColor: Colors.primary[500] });
    expect(textStyle).toMatchObject({ fontSize: 16, color: 'white' });
  });

  it('renders secondary variant with small size styles', () => {
    const { getByTestId, getByText } = render(
      <CustomButton title="Save" variant="secondary" size="small" testID="btn" />
    );

    const button = getByTestId('btn');
    const buttonStyle = StyleSheet.flatten(button.props.style);
    const textStyle = StyleSheet.flatten(getByText('Save').props.style);
    expect(buttonStyle).toMatchObject({ backgroundColor: Colors.neutral[800] });
    expect(textStyle).toMatchObject({ fontSize: 14, color: 'white' });
  });

  it('renders outline variant with large size styles', () => {
    const { getByTestId, getByText } = render(
      <CustomButton title="Cancel" variant="outline" size="large" testID="btn" />
    );

    const button = getByTestId('btn');
    const buttonStyle = StyleSheet.flatten(button.props.style);
    const textStyle = StyleSheet.flatten(getByText('Cancel').props.style);
    expect(buttonStyle).toMatchObject({
      backgroundColor: 'transparent',
      borderColor: Colors.primary[500],
      borderWidth: 1,
    });
    expect(textStyle).toMatchObject({ fontSize: 18, color: Colors.primary[500] });
  });

  it('shows loader and disables button when loading', () => {
    const onPress = jest.fn();
    const { getByTestId, queryByText } = render(
      <CustomButton title="Submit" loading onPress={onPress} testID="btn" />
    );

    const button = getByTestId('btn');
    expect(queryByText('Submit')).toBeNull();

    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not trigger onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <CustomButton title="Disabled" disabled onPress={onPress} testID="btn" />
    );

    const button = getByTestId('btn');
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
