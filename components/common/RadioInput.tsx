import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Styles';

interface Option {
  label: string;
  value: string | number;
}

interface RadioInputProps {
  options: Option[];
  selectedValue: string | number;
  onSelect: (value: string | number) => void;
  horizontal?: boolean;
  label?: string;
}

export default function RadioInput({
  options,
  selectedValue,
  onSelect,
  horizontal = false,
  label,
}: RadioInputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.optionsContainer, horizontal && styles.horizontal]}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value.toString()}
            style={[
              styles.option,
              selectedValue === option.value && styles.selectedOption,
              horizontal && styles.horizontalOption,
            ]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
          >
            <View style={styles.radioContainer}>
              <View style={styles.radioOuter}>
                {selectedValue === option.value && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.optionLabel}>{option.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
    color: Colors.light.secondaryText,
  },
  optionsContainer: {
    flexDirection: 'column',
  },
  horizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.light.lightGrey,
    marginBottom: spacing.sm,
  },
  selectedOption: {
    backgroundColor: `${Colors.light.tint}20`, // 20% opacity
    borderColor: Colors.light.tint,
    borderWidth: 1,
  },
  horizontalOption: {
    marginRight: spacing.sm,
    flex: 0,
    paddingHorizontal: spacing.md,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.tint,
  },
  optionLabel: {
    fontSize: fontSizes.md,
  },
});