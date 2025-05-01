import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import GoogleMapReact from 'google-map-react';
import { UserProfile, Place } from '@/types';
import Colors from '@/constants/Colors';

interface MarkerProps {
  lat: number;
  lng: number;
  color: string;
  label: string;
  onClick?: () => void;
}

const Marker = ({ color, label, onClick }: MarkerProps) => (
  <View style={[styles.marker, { backgroundColor: color }]} onClick={onClick}>
    <View style={styles.markerInner} />
    <View style={styles.markerLabel}>
      <View style={styles.labelBg}>
        <Text style={styles.labelText}>{label}</Text>
      </View>
    </View>
  </View>
);

interface RadiusMapProps {
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

export default function RadiusMap({ 
  userLocation, 
  radius, 
  users = [], 
  places = [], 
  onUserPress, 
  onPlacePress 
}: RadiusMapProps) {
  const defaultProps = {
    center: {
      lat: userLocation.latitude,
      lng: userLocation.longitude
    },
    zoom: 13
  };

  return (
    <View style={styles.container}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: 'AIzaSyBafJwGgZ9B10l6cH5x9wfJLv5ye6lTDMw' }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        options={{
          fullscreenControl: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false
        }}
      >
        {/* User location marker */}
        <Marker
          lat={userLocation.latitude}
          lng={userLocation.longitude}
          color={Colors.light.tint}
          label="You"
        />

        {/* User markers */}
        {users.map((user) => (
          <Marker
            key={user.id}
            lat={user.location.latitude}
            lng={user.location.longitude}
            color={Colors.light.success}
            label={user.name}
            onClick={() => onUserPress?.(user)}
          />
        ))}

        {/* Place markers */}
        {places.map((place) => (
          <Marker
            key={place.id}
            lat={place.location.latitude}
            lng={place.location.longitude}
            color={Colors.light.warning}
            label={place.name}
            onClick={() => onPlacePress?.(place)}
          />
        ))}
      </GoogleMapReact>
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
  marker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    transform: [{ translate: [-10, -10] }],
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  markerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  markerLabel: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: 4 }],
    whiteSpace: 'nowrap',
  },
  labelBg: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  labelText: {
    color: 'white',
    fontSize: 12,
  },
});