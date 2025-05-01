import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { Users, Star } from 'lucide-react-native';
import { Place } from '@/types';
import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';
import Badge from '@/components/common/Badge';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface PlaceCardProps {
  place: Place;
  onPress: (place: Place) => void;
}

export default function PlaceCard({ place, onPress }: PlaceCardProps) {
  const scale = useSharedValue(1);
  
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'restaurant':
        return 'warning';
      case 'bar':
        return 'primary';
      case 'cafe':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  return (
    <AnimatedTouchableOpacity 
      style={[styles.card, animatedStyle]}
      onPress={() => onPress(place)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Image 
        source={{ uri: place.image }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Badge 
            label={place.category.charAt(0).toUpperCase() + place.category.slice(1)}
            type={getCategoryColor(place.category)}
            size="medium"
          />
          <View style={styles.userCount}>
            <Users size={16} color="white" />
            <Text style={styles.userCountText}>{place.userCount}</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
          
          <View style={styles.details}>
            <View style={styles.rating}>
              <Star size={16} color={Colors.light.warning} fill={Colors.light.warning} />
              <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.distance}>{place.distance} km away</Text>
          </View>
        </View>
      </View>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: Colors.light.lightGrey,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    padding: spacing.md,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 100,
  },
  userCountText: {
    color: 'white',
    marginLeft: spacing.xs,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium as '500',
  },
  content: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: spacing.md,
  },
  name: {
    color: 'white',
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as '700',
    marginBottom: spacing.xs,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: 'white',
    marginLeft: spacing.xs,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium as '500',
  },
  distance: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: fontSizes.sm,
  },
});