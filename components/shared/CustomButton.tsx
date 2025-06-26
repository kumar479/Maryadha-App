import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  View,
} from 'react-native';
import Colors from '@/constants/Colors';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
}

const CustomButton = forwardRef<View, CustomButtonProps>(
  (
    {
      title,
      variant = 'primary',
      size = 'medium',
      loading = false,
      style,
      disabled,
      icon,
      ...rest
    }: CustomButtonProps,
    ref
  ) => {
  // Determine the styles based on variant and size
  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];

    return (
      <TouchableOpacity
        ref={ref}
        style={buttonStyles}
        disabled={disabled || loading}
        activeOpacity={0.8}
        {...rest}
      >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? Colors.primary[500] : 'white'} 
        />
      ) : (
        <>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
      </TouchableOpacity>
    );
  }
);

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  // Variants
  primary: {
    backgroundColor: Colors.primary[500],
  },
  secondary: {
    backgroundColor: Colors.neutral[800],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  // Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  // Text styles
  text: {
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  outlineText: {
    color: Colors.primary[500],
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  // Disabled state
  disabled: {
    backgroundColor: Colors.neutral[300],
    borderColor: Colors.neutral[300],
  },
  disabledText: {
    color: Colors.neutral[500],
  },
  icon: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});