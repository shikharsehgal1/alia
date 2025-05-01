import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView } from 'react-native';
import { MapPin, Briefcase, GraduationCap } from 'lucide-react-native';
import { UserProfile } from '@/types';
import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';
import Badge from '@/components/common/Badge';
import StarRating from '@/components/common/StarRating';
import Button from '@/components/common/Button';
import { calculateSimilarityScore, getDistanceString } from '@/utils/locationUtils';

interface UserDetailProps {
  user: UserProfile;
  currentUser: UserProfile;
  onCheckIn: (user: UserProfile) => void;
  loading?: boolean;
}

export default function UserDetail({ 
  user, 
  currentUser,
  onCheckIn,
  loading = false 
}: UserDetailProps) {
  // Calculate similarity score
  const similarityScore = calculateSimilarityScore(currentUser, user);

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: user.image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{user.name}, {user.age}</Text>
          <Badge 
            label={`${Math.round(similarityScore * 100)}% Match`}
            type={similarityScore > 0.7 ? 'success' : similarityScore > 0.4 ? 'primary' : 'secondary'}
            size="medium"
          />
        </View>
        
        <View style={styles.infoSection}>
          {user.occupation && (
            <View style={styles.infoRow}>
              <Briefcase size={20} color={Colors.light.secondaryText} />
              <Text style={styles.infoText}>{user.occupation}</Text>
            </View>
          )}
          
          {user.education && (
            <View style={styles.infoRow}>
              <GraduationCap size={20} color={Colors.light.secondaryText} />
              <Text style={styles.infoText}>{user.education}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <MapPin size={20} color={Colors.light.secondaryText} />
            <Text style={styles.infoText}>
              {getDistanceString(calculateDistance(
                currentUser.location.latitude,
                currentUser.location.longitude,
                user.location.latitude,
                user.location.longitude
              ))}
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{user.bio}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.tagsContainer}>
            {user.interests.map((interest, index) => (
              <Badge
                key={index}
                label={interest}
                type={currentUser.interests.includes(interest) ? 'primary' : 'secondary'}
                size="medium"
                style={styles.tag}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activities</Text>
          <View style={styles.tagsContainer}>
            {user.activities.map((activity, index) => (
              <Badge
                key={index}
                label={activity}
                type={currentUser.activities.includes(activity) ? 'primary' : 'secondary'}
                size="medium"
                style={styles.tag}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rating</Text>
          <View style={styles.ratingContainer}>
            <StarRating 
              rating={user.rating.average} 
              size={24} 
              showRating 
            />
            <Text style={styles.ratingCount}>
              ({user.rating.count} {user.rating.count === 1 ? 'rating' : 'ratings'})
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Meet Up"
            onPress={() => onCheckIn(user)}
            type="primary"
            size="large"
            loading={loading}
            style={styles.button}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  name: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold as '700',
  },
  infoSection: {
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fontSizes.md,
    marginLeft: spacing.sm,
    color: Colors.light.secondaryText,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium as '500',
    marginBottom: spacing.sm,
    color: Colors.light.secondaryText,
  },
  bio: {
    fontSize: fontSizes.md,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingCount: {
    marginLeft: spacing.sm,
    fontSize: fontSizes.sm,
    color: Colors.light.secondaryText,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
  button: {
    width: '100%',
  },
});