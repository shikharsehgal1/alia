import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Circle, Marker } from 'react-native-maps';
import { UserProfile, Place } from '@/types';
import Colors from '@/constants/Colors';

interface RadiusMapNativeProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  users?: UserProfile[];
  places?: Place[];
  onUserPress?: (user: UserProfile) => void;
  onPlacePress?: (place: Place) => void;
}

export default function RadiusMapNative({ 
  userLocation, 
  radius, 
  users = [], 
  places = [], 
  onUserPress, 
  onPlacePress 
}: RadiusMapNativeProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: radius * 0.022,
        longitudeDelta: radius * 0.022,
      });
    }
  }, [userLocation, radius]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={userLocation}
          pinColor={Colors.light.tint}
          title="Your Location"
        />
        
        <Circle
          center={userLocation}
          radius={radius * 1000}
          strokeWidth={1}
          strokeColor={Colors.light.tint}
          fillColor={`${Colors.light.tint}20`}
        />
        
        {users.map((user) => (
          <Marker
            key={user.id}
            coordinate={user.location}
            pinColor={Colors.light.success}
            title={user.name}
            description={`${user.age} years old`}
            onPress={() => onUserPress?.(user)}
          />
        ))}
        
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={place.location}
            pinColor={Colors.light.warning}
            title={place.name}
            description={`${place.userCount} people here`}
            onPress={() => onPlacePress?.(place)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});