import React, { forwardRef } from 'react';
import { StyleSheet, View, Text, TextInput, TextInputProps, StyleProp, TextStyle, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Styles';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<TextInput, InputProps>((props, ref) => {
  const { 
    label, 
    error, 
    containerStyle,
    inputStyle,
    style,
    leftIcon,
    ...rest 
  } = props;

  const inputStyles = [
    styles.input,
    error ? styles.inputError : null,
    inputStyle || style,
    leftIcon ? styles.inputWithIcon : null,
  ].filter(Boolean) as StyleProp<TextStyle>;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          ref={ref}
          style={inputStyles}
          placeholderTextColor={Colors.light.darkGrey}
          {...rest}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

Input.displayName = 'Input';

export default Input;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
    color: Colors.light.secondaryText,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  input: {
    backgroundColor: Colors.light.lightGrey,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: spacing.md,
    fontSize: fontSizes.md,
    flex: 1,
  },
  inputWithIcon: {
    paddingLeft: spacing.xl + spacing.md,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
  },
});