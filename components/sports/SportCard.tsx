import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ShoppingBasket as Basketball, FolderRoot as Football, Bike, Timer, PenTool, Dumbbell, Users } from 'lucide-react-native';
import { Sport } from '@/types';
import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';

interface SportCardProps {
  sport: Sport;
  onPress: (sport: Sport) => void;
}

export default function SportCard({ sport, onPress }: SportCardProps) {
  // Match icon based on name
  const renderIcon = () => {
    const size = 32;
    const color = Colors.light.tint;
    
    switch(sport.icon.toLowerCase()) {
      case 'basketball':
        return <Basketball size={size} color={color} />;
      case 'football':
        return <Football size={size} color={color} />;
      case 'bike':
        return <Bike size={size} color={color} />;
      case 'timer':
        return <Timer size={size} color={color} />;
      case 'pen':
        return <PenTool size={size} color={color} />;
      case 'dumbbell':
        return <Dumbbell size={size} color={color} />;
      default:
        return <Basketball size={size} color={color} />;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(sport)}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      <Text style={styles.name}>{sport.name}</Text>
      <View style={styles.interestedContainer}>
        <Users size={16} color={Colors.light.secondaryText} />
        <Text style={styles.interestedText}>{sport.interested}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    width: '48%',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${Colors.light.tint}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium as '500',
    marginBottom: spacing.xs,
  },
  interestedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interestedText: {
    fontSize: fontSizes.sm,
    color: Colors.light.secondaryText,
    marginLeft: spacing.xs,
  },
});