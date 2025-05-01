import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  Pin
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';

interface MapProps {
  userLocation?: {
    lat: number;
    lng: number;
  };
  nearbyUsers?: Array<{
    lat: number;
    lng: number;
    username: string;
  }>;
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 0,
  lng: 0
};

export function MapComponent({ userLocation, nearbyUsers }: MapProps) {
  const map = useMap();
  const [markers, setMarkers] = useState<{[key: string]: Marker}>({});
  const clusterer = useRef<MarkerClusterer | null>(null);
  const [circleCenter, setCircleCenter] = useState<google.maps.LatLngLiteral | null>(null);

  // Initialize MarkerClusterer
  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({map});
    }
  }, [map]);

  // Update markers
  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(Object.values(markers));
  }, [markers]);

  const setMarkerRef = (marker: Marker | null, key: string) => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;

    setMarkers(prev => {
      if (marker) {
        return {...prev, [key]: marker};
      } else {
        const newMarkers = {...prev};
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };

  const handleClick = useCallback((ev: google.maps.MapMouseEvent) => {
    if (!map || !ev.latLng) return;
    console.log('marker clicked:', ev.latLng.toString());
    map.panTo(ev.latLng);
    setCircleCenter({ lat: ev.latLng.lat(), lng: ev.latLng.lng() });
  }, [map]);

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={userLocation || center}
        defaultZoom={13}
        mapId="DEMO_MAP_ID"
        style={containerStyle}
      >
        {circleCenter && (
          <Circle
            radius={800}
            center={circleCenter}
            strokeColor="#0c4cb3"
            strokeOpacity={1}
            strokeWeight={3}
            fillColor="#3b82f6"
            fillOpacity={0.3}
          />
        )}
        {nearbyUsers?.map((user, index) => (
          <AdvancedMarker
            key={index}
            position={{ lat: user.lat, lng: user.lng }}
            ref={marker => setMarkerRef(marker, `user-${index}`)}
            clickable={true}
            onClick={handleClick}
          >
            <Pin background="#FBBC04" glyphColor="#000" borderColor="#000" />
          </AdvancedMarker>
        ))}
        {userLocation && (
          <AdvancedMarker
            position={userLocation}
            ref={marker => setMarkerRef(marker, 'current-user')}
          >
            <Pin background="#4285F4" glyphColor="#000" borderColor="#000" />
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
}

// Circle component
const Circle = ({ radius, center, strokeColor, strokeOpacity, strokeWeight, fillColor, fillOpacity }: {
  radius: number;
  center: google.maps.LatLngLiteral;
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  fillColor: string;
  fillOpacity: number;
}) => {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle>();

  useEffect(() => {
    if (!map) return;

    circleRef.current = new google.maps.Circle({
      strokeColor,
      strokeOpacity,
      strokeWeight,
      fillColor,
      fillOpacity,
      map,
      center,
      radius
    });

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, [map, center, radius, strokeColor, strokeOpacity, strokeWeight, fillColor, fillOpacity]);

  return null;
}; 