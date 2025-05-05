import React from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { UserProfile, Place } from '@/types';
import Colors from '@/constants/Colors';

interface RadiusMapProps {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onRegionChangeComplete: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  }) => void;
  radius: number;
  users?: UserProfile[];
  places?: Place[];
  onUserPress?: (user: UserProfile) => void;
  onPlacePress?: (place: Place) => void;
}

// Import platform-specific components
const RadiusMapNative = Platform.select({
  native: require('./RadiusMap.native').default,
  default: null,
});

export default function RadiusMap(props: RadiusMapProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.mapFallback}>
          Map showing {props.radius}km radius from your location
          {props.users?.length ? ` with ${props.users.length} people` : ''}
          {props.places?.length ? ` and ${props.places.length} places` : ''} nearby
        </Text>
      </View>
    );
  }

  if (!RadiusMapNative) {
    return <View style={styles.container} />;
  }

  return <RadiusMapNative {...props} />;
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mapFallback: {
    backgroundColor: Colors.light.lightGrey,
    padding: 16,
    borderRadius: 8,
    textAlign: 'center',
    height: '100%',
    textAlignVertical: 'center',
  },
});