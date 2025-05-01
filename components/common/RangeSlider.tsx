import React, { useState } from 'react';
import { StyleSheet, View, Text, PanResponder, Animated } from 'react-native';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Styles';

interface RangeSliderProps {
  min: number;
  max: number;
  value: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  valueLabel?: string;
  width?: number;
}

export default function RangeSlider({
  min,
  max,
  value,
  step = 1,
  onChange,
  label,
  valueLabel = '',
  width = 300,
}: RangeSliderProps) {
  const [animatedValue] = useState(new Animated.Value(0));
  
  React.useEffect(() => {
    const inputRange = [min, max];
    const outputRange = [0, width - 30]; // Account for knob width
    
    const position = ((value - min) / (max - min)) * (width - 30);
    animatedValue.setValue(position);
  }, [value, min, max, width, animatedValue]);

  const panResponder = React.useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        let newPosition = gestureState.moveX - 15;
        
        // Constrain to bounds
        if (newPosition < 0) newPosition = 0;
        if (newPosition > width - 30) newPosition = width - 30;
        
        animatedValue.setValue(newPosition);
        
        // Calculate new value
        const ratio = newPosition / (width - 30);
        const newValue = min + ratio * (max - min);
        
        // Apply step
        const steppedValue = Math.round(newValue / step) * step;
        
        onChange(steppedValue);
      },
    });
  }, [min, max, width, step, onChange, animatedValue]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.sliderContainer}>
        <View style={[styles.track, { width }]} />
        <Animated.View
          style={[
            styles.fill,
            {
              width: animatedValue,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX: animatedValue }],
            },
          ]}
          {...panResponder.panHandlers}
        />
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.min}>{min}</Text>
        <Text style={styles.value}>
          {value} {valueLabel}
        </Text>
        <Text style={styles.max}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  label: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
    color: Colors.light.secondaryText,
  },
  sliderContainer: {
    height: 30,
    position: 'relative',
    justifyContent: 'center',
  },
  track: {
    height: 4,
    backgroundColor: Colors.light.lightGrey,
    borderRadius: 2,
  },
  fill: {
    height: 4,
    backgroundColor: Colors.light.tint,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.tint,
    position: 'absolute',
    left: 0,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  min: {
    fontSize: fontSizes.xs,
    color: Colors.light.secondaryText,
  },
  max: {
    fontSize: fontSizes.xs,
    color: Colors.light.secondaryText,
  },
  value: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: Colors.light.tint,
  },
});