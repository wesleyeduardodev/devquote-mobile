import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants';
import { CommonProps } from '../../types';

interface LoadingSpinnerProps extends CommonProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
  style?: ViewStyle;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.primary,
  text,
  overlay = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const containerStyle: ViewStyle = [
    styles.container,
    overlay && styles.overlay,
    style,
  ];

  return (
    <View
      style={containerStyle}
      testID={testID}
      accessibilityLabel={accessibilityLabel || 'Carregando'}
    >
      <ActivityIndicator
        size={size}
        color={color}
        style={styles.spinner}
      />
      {text && (
        <Text style={styles.text}>{text}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  spinner: {
    marginBottom: SPACING.sm,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

export default LoadingSpinner;