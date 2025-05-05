import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

const LOCATION_SETTINGS = {
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 30000, // 30 seconds
  distanceInterval: 50, // 50 meters
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const retryCount = useRef(0);

  const getLocation = async (): Promise<Location.LocationObject | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return null;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: LOCATION_SETTINGS.accuracy,
      });

      // Reset retry count on successful location fetch
      retryCount.current = 0;
      return currentLocation;
    } catch (err) {
      console.error('Error getting location:', err);
      return null;
    }
  };

  const startLocationUpdates = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const initialLocation = await getLocation();
      
      if (initialLocation) {
        setLocation(initialLocation);
      } else if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        setTimeout(startLocationUpdates, RETRY_DELAY);
        return;
      } else {
        setErrorMsg('Unable to get location after multiple attempts');
      }

      if (Platform.OS !== 'web') {
        locationSubscription.current = await Location.watchPositionAsync(
          LOCATION_SETTINGS,
          (newLocation) => {
            setLocation(newLocation);
            setErrorMsg(null);
          },
          (error) => {
            console.error('Location watch error:', error);
            setErrorMsg('Error watching location: ' + error.message);
          }
        );
      } else {
        // For web, use the Geolocation API
        navigator.geolocation.watchPosition(
          (position) => {
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
            setErrorMsg(null);
          },
          (error) => {
            console.error('Web location error:', error);
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
      console.error('Error in startLocationUpdates:', err);
      setErrorMsg('Error starting location updates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      startLocationUpdates();
    }

    return () => {
      isMounted = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  const updateLocation = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      const newLocation = await getLocation();
      if (newLocation) {
        setLocation(newLocation);
        return newLocation;
      }
      return null;
    } catch (err) {
      console.error('Error updating location:', err);
      setErrorMsg('Error updating location');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    location,
    errorMsg,
    isLoading,
    updateLocation,
  };
}