import { UserProfile } from '@/types';

/**
 * Calculate distance between two coordinates in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Get a user-friendly distance string
 */
export function getDistanceString(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m away`;
  }
  return `${distanceKm.toFixed(1)}km away`;
}

/**
 * Check if a location is within a radius of another location
 */
export function isWithinRadius(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radiusKm;
}

/**
 * Calculate a similarity score between two users based on multiple factors
 * Returns a number between 0 and 1
 */
export function calculateSimilarityScore(
  user1: {
    interests?: string[];
    activities?: string[];
    age: number;
    location: { latitude: number; longitude: number };
  },
  user2: {
    interests?: string[];
    activities?: string[];
    age: number;
    location: { latitude: number; longitude: number };
  }
): number {
  // Calculate interest similarity (30% weight)
  const user1Interests = user1.interests || [];
  const user2Interests = user2.interests || [];
  const commonInterests = user1Interests.filter((interest: string) => 
    user2Interests.includes(interest)
  );
  const totalUniqueInterests = new Set([...user1Interests, ...user2Interests]).size;
  const interestScore = totalUniqueInterests > 0 
    ? (commonInterests.length / totalUniqueInterests) * 0.3 
    : 0;

  // Calculate activity similarity (30% weight)
  const user1Activities = user1.activities || [];
  const user2Activities = user2.activities || [];
  const commonActivities = user1Activities.filter((activity: string) => 
    user2Activities.includes(activity)
  );
  const totalUniqueActivities = new Set([...user1Activities, ...user2Activities]).size;
  const activityScore = totalUniqueActivities > 0 
    ? (commonActivities.length / totalUniqueActivities) * 0.3 
    : 0;

  // Calculate age similarity (20% weight)
  const ageDiff = Math.abs(user1.age - user2.age);
  const ageScore = Math.max(0, 1 - (ageDiff / 10)) * 0.2; // Full score if age difference is 0, 0 if difference is 10 or more

  // Calculate location similarity (20% weight)
  const distance = calculateDistance(
    user1.location.latitude,
    user1.location.longitude,
    user2.location.latitude,
    user2.location.longitude
  );
  const locationScore = Math.max(0, 1 - (distance / 5)) * 0.2; // Full score if distance is 0, 0 if distance is 5km or more

  // Return combined score (0-1)
  return interestScore + activityScore + ageScore + locationScore;
}

/**
 * Get the bearing between two points
 */
export function getBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = deg2rad(lat1);
  const φ2 = deg2rad(lat2);
  const λ1 = deg2rad(lon1);
  const λ2 = deg2rad(lon2);

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const θ = Math.atan2(y, x);
  const bearing = (θ * 180 / Math.PI + 360) % 360;

  return bearing;
}

/**
 * Get a cardinal direction from a bearing
 */
export function getCardinalDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}