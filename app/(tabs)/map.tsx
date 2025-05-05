import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { Settings, User, MapPin } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';
import RadiusMap from '@/components/map/RadiusMap';
import { useUserStore } from '@/store/useUserStore';
import { usePlacesStore } from '@/store/usePlacesStore';
import { useLocation } from '@/hooks/useLocation';
import Button from '@/components/common/Button';

const DEFAULT_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen() {
  const { updateLocation } = useLocation();
  const searchRadius = useUserStore(state => state.searchRadius);
  const { nearbyUsers, fetchNearbyUsers } = useUserStore();
  const { places, fetchNearbyPlaces } = usePlacesStore();

  const [region, setRegion] = useState(DEFAULT_LOCATION);

  // fetch users & places whenever center or radius changes
  useEffect(() => {
    fetchNearbyUsers(region.latitude, region.longitude);
    fetchNearbyPlaces(region.latitude, region.longitude, searchRadius);
  }, [region.latitude, region.longitude, searchRadius]);

  const onRegionChangeComplete = (newRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  }) => {
    setRegion({
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
      latitudeDelta: newRegion.latitudeDelta ?? region.latitudeDelta,
      longitudeDelta: newRegion.longitudeDelta ?? region.longitudeDelta,
    });
  };

  const handleLocateMe = async () => {
    try {
      const loc = await updateLocation();
      if (loc?.coords) {
        setRegion(r => ({
          ...r,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }));
      }
    } catch (err) {
      console.warn('Location permission denied or unavailable');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with "Locate Me" */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Button title="Locate Me" onPress={handleLocateMe} />
      </View>

      {/* Map */}
      <RadiusMap
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
        radius={searchRadius}
        users={nearbyUsers}
        places={places}
      />

      {/* Stats Footer */}
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
          <Text style={styles.statNumber}>{searchRadius} km</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
    backgroundColor: Colors.light.background,
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
});