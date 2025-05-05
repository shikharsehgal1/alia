import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { Settings, User, MapPin } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';
import RadiusMap from '@/components/map/RadiusMap';
import { useUserStore } from '@/store/useUserStore';
import { usePlacesStore } from '@/store/usePlacesStore';
import { useLocation } from '@/hooks/useLocation';
import Button from '@/components/common/Button';

export default function MapScreen() {
  const { location, errorMsg, isLoading } = useLocation();
  const searchRadius = useUserStore(state => state.searchRadius);
  const { nearbyUsers, fetchNearbyUsers } = useUserStore();
  const { places, fetchNearbyPlaces } = usePlacesStore();
  
  useEffect(() => {
    if (location?.coords) {
      fetchNearbyUsers(location.coords.latitude, location.coords.longitude);
      fetchNearbyPlaces(location.coords.latitude, location.coords.longitude, searchRadius);
    }
  }, [location, searchRadius]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Getting your location...</Text>
        </View>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Button 
            title="Request Location Permission"
            onPress={() => {/* Implement permission request */}}
            type="outline"
          />
        </View>
      </View>
    );
  }

  if (!location?.coords) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to get your location</Text>
          <Button 
            title="Try Again"
            onPress={() => {/* Implement retry */}}
            type="outline"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>
      
      <View style={styles.mapContainer}>
        <RadiusMap
          userLocation={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          radius={searchRadius}
          users={nearbyUsers}
          places={places}
        />
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <User size={20} color={Colors.light.tint} />
          <Text style={styles.statNumber}>{nearbyUsers.length}</Text>
          <Text style={styles.statLabel}>People</Text>
        </View>
        
        <View style={styles.statCard}>
          <MapPin size={20} color={Colors.light.warning} />
          <Text style={styles.statNumber}>{places.length}</Text>
          <Text style={styles.statLabel}>Places</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.radiusIcon}>
            <Text style={styles.radiusIconText}>{searchRadius}</Text>
          </View>
          <Text style={styles.statNumber}>km</Text>
          <Text style={styles.statLabel}>Radius</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: Colors.light.background,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as '700',
  },
  mapContainer: {
    paddingHorizontal: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: spacing.md,
    borderRadius: 12,
    width: '30%',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as '700',
    marginVertical: spacing.xs,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: Colors.light.secondaryText,
  },
  radiusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radiusIconText: {
    color: 'white',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold as '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});