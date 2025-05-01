import React from 'react';
import { StyleSheet, View, Text, ViewStyle, TextStyle } from 'react-native';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Styles';

interface BadgeProps {
  label: string;
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Badge({
  label,
  type = 'primary',
  size = 'small',
  style,
  textStyle,
}: BadgeProps) {
  return (
    <View style={[styles.badge, styles[`${type}Badge`], styles[`${size}Badge`], style]}>
      <Text style={[styles.text, styles[`${type}Text`], styles[`${size}Text`], textStyle]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  primaryBadge: {
    backgroundColor: `${Colors.light.tint}20`,
  },
  secondaryBadge: {
    backgroundColor: Colors.light.lightGrey,
  },
  successBadge: {
    backgroundColor: `${Colors.light.success}20`,
  },
  warningBadge: {
    backgroundColor: `${Colors.light.warning}20`,
  },
  errorBadge: {
    backgroundColor: `${Colors.light.error}20`,
  },
  smallBadge: {
    paddingVertical: spacing.xs,
  },
  mediumBadge: {
    paddingVertical: spacing.sm,
  },
  text: {
    fontWeight: '500',
  },
  primaryText: {
    color: Colors.light.tint,
  },
  secondaryText: {
    color: Colors.light.secondaryText,
  },
  successText: {
    color: Colors.light.success,
  },
  warningText: {
    color: Colors.light.warning,
  },
  errorText: {
    color: Colors.light.error,
  },
  smallText: {
    fontSize: fontSizes.xs,
  },
  mediumText: {
    fontSize: fontSizes.sm,
  },
});