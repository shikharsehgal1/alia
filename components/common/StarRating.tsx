import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Styles';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  onRate?: (rating: number) => void;
  label?: string;
  showRating?: boolean;
  disabled?: boolean;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 24,
  onRate,
  label,
  showRating = false,
  disabled = false,
}: StarRatingProps) {
  const handleRating = (index: number) => {
    if (onRate && !disabled) {
      onRate(index + 1);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.starsContainer}>
        {Array.from({ length: maxRating }).map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleRating(index)}
            disabled={disabled || !onRate}
            activeOpacity={disabled ? 1 : 0.7}
            style={styles.starButton}
          >
            <Star
              size={size}
              color={Colors.light.tint}
              fill={index < rating ? Colors.light.tint : 'none'}
              strokeWidth={1.5}
            />
          </TouchableOpacity>
        ))}
        {showRating && (
          <Text style={styles.ratingText}>
            {rating.toFixed(1)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
    color: Colors.light.secondaryText,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    marginRight: spacing.xs,
  },
  ratingText: {
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
});