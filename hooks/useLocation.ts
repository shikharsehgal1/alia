import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

const LOCATION_SETTINGS = {
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 10000, // 10 seconds
  distanceInterval: 10, // 10 meters
};

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startLocationUpdates = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        // Get initial location
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: LOCATION_SETTINGS.accuracy,
        });
        
        if (isMounted) {
          setLocation(initialLocation);
        }

        // Start watching position
        if (Platform.OS !== 'web') {
          locationSubscription.current = await Location.watchPositionAsync(
            LOCATION_SETTINGS,
            (newLocation) => {
              if (isMounted) {
                setLocation(newLocation);
              }
            }
          );
        } else {
          // For web, use the Geolocation API with high accuracy
          navigator.geolocation.watchPosition(
            (position) => {
              if (isMounted) {
                setLocation({
                  coords: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    altitude: position.coords.altitude,
                    accuracy: position.coords.accuracy,
                    altitudeAccuracy: position.coords.altitudeAccuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                  },
                  timestamp: position.timestamp,
                });
              }
            },
            (error) => {
              setErrorMsg('Error getting location: ' + error.message);
            },
            {
              enableHighAccuracy: true,
              timeout: 20000,
              maximumAge: 1000,
            }
          );
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg('Error getting location');
          console.error(err);
        }
      }
    };

    startLocationUpdates();

    return () => {
      isMounted = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  const updateLocation = async () => {
    try {
      const newLocation = await Location.getCurrentPositionAsync({
        accuracy: LOCATION_SETTINGS.accuracy,
      });
      setLocation(newLocation);
      return newLocation;
    } catch (err) {
      setErrorMsg('Error updating location');
      console.error(err);
      return null;
    }
  };

  return {
    location,
    errorMsg,
    updateLocation,
  };
}