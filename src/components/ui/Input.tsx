import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants';
import { CommonProps } from '../../types';

interface InputProps extends TextInputProps, CommonProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  required?: boolean;
}

const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'outlined',
  size = 'md',
  fullWidth = true,
  required = false,
  style,
  testID,
  accessibilityLabel,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle: ViewStyle = [
    styles.container,
    fullWidth && styles.fullWidth,
  ];

  const inputContainerStyle: ViewStyle = [
    styles.inputContainer,
    styles[variant],
    styles[size],
    isFocused && styles.focused,
    error && styles.error,
  ];

  const inputStyle: TextStyle = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    style,
  ];

  const labelStyle: TextStyle = [
    styles.label,
    required && styles.labelRequired,
    error && styles.labelError,
  ];

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={labelStyle}>
          {label}
          {required && <Text style={styles.asterisk}> *</Text>}
        </Text>
      )}
      
      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={inputStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={COLORS.gray400}
          testID={testID}
          accessibilityLabel={accessibilityLabel || label}
          {...props}
        />
        
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  labelRequired: {
    color: COLORS.gray800,
  },
  labelError: {
    color: COLORS.error,
  },
  asterisk: {
    color: COLORS.error,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  
  // Variants
  default: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.gray300,
  },
  filled: {
    backgroundColor: COLORS.gray100,
    borderColor: COLORS.gray200,
  },
  outlined: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.gray300,
  },
  
  // Sizes
  sm: {
    minHeight: 36,
    paddingHorizontal: SPACING.sm,
  },
  md: {
    minHeight: 44,
    paddingHorizontal: SPACING.md,
  },
  lg: {
    minHeight: 52,
    paddingHorizontal: SPACING.lg,
  },
  
  // States
  focused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  error: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray900,
    paddingVertical: 0, // Remove default padding on Android
  },
  inputWithLeftIcon: {
    marginLeft: SPACING.sm,
  },
  inputWithRightIcon: {
    marginRight: SPACING.sm,
  },
  
  leftIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  helperText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
  },
});

Input.displayName = 'Input';

export default Input;