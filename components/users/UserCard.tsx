import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { MapPin, Briefcase } from 'lucide-react-native';
import { UserProfile } from '@/types';
import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';
import Badge from '@/components/common/Badge';
import StarRating from '@/components/common/StarRating';
import { calculateDistance, getDistanceString, calculateSimilarityScore } from '@/utils/locationUtils';

interface UserCardProps {
  user: UserProfile;
  currentUser: UserProfile;
  onPress: (user: UserProfile) => void;
  onCheckIn?: (user: UserProfile) => void;
}

export default function UserCard({ 
  user, 
  currentUser,
  onPress,
  onCheckIn
}: UserCardProps) {
  const similarityScore = calculateSimilarityScore(currentUser, user);
  
  // Use default location if either user's location is undefined
  const currentLocation = currentUser.location || { latitude: 0, longitude: 0 };
  const userLocation = user.location || { latitude: 0, longitude: 0 };
  
  const distance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    userLocation.latitude,
    userLocation.longitude
  );

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(user)}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <Image source={{ uri: user.image }} style={styles.image} />
        <View style={styles.details}>
          <View style={styles.header}>
            <Text style={styles.name}>{user.name}, {user.age}</Text>
            <Badge 
              label={`${Math.round(similarityScore * 100)}% Match`}
              type={similarityScore > 0.7 ? 'success' : similarityScore > 0.4 ? 'primary' : 'secondary'}
            />
          </View>

          {user.occupation && (
            <View style={styles.infoRow}>
              <Briefcase size={16} color={Colors.light.secondaryText} />
              <Text style={styles.infoText}>{user.occupation}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <MapPin size={16} color={Colors.light.secondaryText} />
            <Text style={styles.infoText}>
              {distance > 0 ? getDistanceString(distance) : 'Location not available'}
            </Text>
          </View>
          
          <View style={styles.interestContainer}>
            {user.interests.slice(0, 3).map((interest, index) => (
              <Badge
                key={index}
                label={interest}
                type={currentUser.interests.includes(interest) ? 'primary' : 'secondary'}
                style={styles.interest}
              />
            ))}
          </View>
          
          <View style={styles.footer}>
            <StarRating rating={user.rating.average} size={16} showRating />
            <Text style={styles.lastSeen}>
              Active {getTimeAgo(user.lastActive)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  image: {
    width: 100,
    height: 120,
    borderRadius: 12,
  },
  details: {
    flex: 1,
    marginLeft: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: fontSizes.sm,
    color: Colors.light.secondaryText,
    marginLeft: spacing.xs,
  },
  interestContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: spacing.xs,
  },
  interest: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  lastSeen: {
    fontSize: fontSizes.xs,
    color: Colors.light.secondaryText,
  },
});