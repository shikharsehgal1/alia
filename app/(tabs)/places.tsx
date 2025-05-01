import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { Search, Filter, X } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';
import { usePlacesStore } from '@/store/usePlacesStore';
import PlaceCard from '@/components/places/PlaceCard';
import Button from '@/components/common/Button';
import RangeSlider from '@/components/common/RangeSlider';
import { Place } from '@/types';
import { useUserStore } from '@/store/useUserStore';
import debounce from 'lodash.debounce';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FILTER_PANEL_HEIGHT = 400;

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function PlacesScreen() {
  const { places, popularPlaces, searchPlaces, fetchNearbyPlaces, fetchPopularPlaces, isLoading, error } = usePlacesStore();
  const searchRadius = useUserStore(state => state.searchRadius);
  const updateSearchRadius = useUserStore(state => state.updateSearchRadius);
  
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [showPopularOnly, setShowPopularOnly] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  
  // Animation values
  const searchBarWidth = useSharedValue(SCREEN_WIDTH - 32);
  const searchBarFocused = useSharedValue(false);
  const filterPanelTranslateY = useSharedValue(FILTER_PANEL_HEIGHT);
  
  // Mock user location
  const userLocation = { latitude: 37.7749, longitude: -122.4194 };
  
  const searchInputRef = useRef<TextInput>(null);
  
  useEffect(() => {
    fetchNearbyPlaces(userLocation.latitude, userLocation.longitude, searchRadius);
    fetchPopularPlaces(userLocation.latitude, userLocation.longitude);
  }, [fetchNearbyPlaces, fetchPopularPlaces]);
  
  const debouncedSearch = debounce(async (query: string) => {
    if (query.trim()) {
      await searchPlaces(query, userLocation.latitude, userLocation.longitude);
    } else {
      setFilteredPlaces(showPopularOnly ? popularPlaces : places);
    }
  }, 300);
  
  useEffect(() => {
    debouncedSearch(searchText);
    return () => debouncedSearch.cancel();
  }, [searchText]);
  
  useEffect(() => {
    setFilteredPlaces(showPopularOnly ? popularPlaces : places);
  }, [showPopularOnly, places, popularPlaces]);
  
  const searchBarStyle = useAnimatedStyle(() => ({
    width: withSpring(searchBarFocused.value ? SCREEN_WIDTH - 80 : SCREEN_WIDTH - 32, {
      damping: 15,
      stiffness: 150,
    }),
  }));
  
  const filterPanelStyle = useAnimatedStyle(() => ({
    transform: [{ 
      translateY: withSpring(filterModalVisible ? 0 : FILTER_PANEL_HEIGHT, {
        damping: 15,
        stiffness: 150,
      })
    }],
  }));
  
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newTranslateY = Math.max(0, event.translationY);
      filterPanelTranslateY.value = newTranslateY;
    })
    .onEnd((event) => {
      if (event.translationY > FILTER_PANEL_HEIGHT / 3) {
        filterPanelTranslateY.value = withSpring(FILTER_PANEL_HEIGHT);
        runOnJS(setFilterModalVisible)(false);
      } else {
        filterPanelTranslateY.value = withSpring(0);
      }
    });
  
  const handleSearchFocus = () => {
    searchBarFocused.value = true;
  };
  
  const handleSearchBlur = () => {
    searchBarFocused.value = false;
  };
  
  const handlePlacePress = (place: Place) => {
    setSelectedPlace(place);
  };
  
  const handleFilterApply = () => {
    setFilterModalVisible(false);
    fetchNearbyPlaces(userLocation.latitude, userLocation.longitude, searchRadius);
  };
  
  const renderPlaceCard = ({ item }: { item: Place }) => (
    <Animated.View
      entering={withTiming({
        duration: 300,
        transform: [{ scale: 1 }],
        opacity: 1,
      })}
      exiting={withTiming({
        duration: 300,
        transform: [{ scale: 0.8 }],
        opacity: 0,
      })}
    >
      <PlaceCard place={item} onPress={handlePlacePress} />
    </Animated.View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Places</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <AnimatedTextInput
            ref={searchInputRef}
            style={[styles.searchInput, searchBarStyle]}
            placeholder="Search restaurants, bars, cafes..."
            value={searchText}
            onChangeText={setSearchText}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          
          {searchBarFocused.value ? (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setSearchText('');
                searchInputRef.current?.blur();
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
            >
              <Filter size={24} color={Colors.light.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            showPopularOnly && styles.activeTab,
          ]}
          onPress={() => setShowPopularOnly(true)}
        >
          <Text
            style={[
              styles.tabText,
              showPopularOnly && styles.activeTabText,
            ]}
          >
            Popular
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            !showPopularOnly && styles.activeTab,
          ]}
          onPress={() => setShowPopularOnly(false)}
        >
          <Text
            style={[
              styles.tabText,
              !showPopularOnly && styles.activeTabText,
            ]}
          >
            All Places
          </Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            title="Retry" 
            onPress={() => {
              fetchNearbyPlaces(userLocation.latitude, userLocation.longitude, searchRadius);
              fetchPopularPlaces(userLocation.latitude, userLocation.longitude);
            }}
            type="outline"
          />
        </View>
      ) : filteredPlaces.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No places found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlaces}
          renderItem={renderPlaceCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Filter Panel */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.filterPanel, filterPanelStyle]}>
          <View style={styles.filterPanelHandle} />
          
          <View style={styles.filterPanelContent}>
            <Text style={styles.filterPanelTitle}>Filters</Text>
            
            <Text style={styles.filterLabel}>Distance</Text>
            <RangeSlider
              min={1}
              max={20}
              value={searchRadius}
              onChange={updateSearchRadius}
              valueLabel="km"
              width={SCREEN_WIDTH - 64}
            />
            
            <Button 
              title="Apply Filters" 
              onPress={handleFilterApply}
              style={styles.applyButton}
            />
            
            <Button 
              title="Reset Filters" 
              type="outline"
              onPress={() => {
                updateSearchRadius(5);
                handleFilterApply();
              }}
              style={styles.resetButton}
            />
          </View>
        </Animated.View>
      </GestureDetector>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
    backgroundColor: Colors.light.background,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as '700',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: Colors.light.background,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    height: 48,
    backgroundColor: Colors.light.lightGrey,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.md,
    color: Colors.light.text,
    paddingRight: 40,
  },
  filterButton: {
    marginLeft: spacing.sm,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  cancelText: {
    color: Colors.light.tint,
    fontSize: fontSizes.md,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.md,
    borderRadius: 20,
    backgroundColor: Colors.light.lightGrey,
  },
  activeTab: {
    backgroundColor: Colors.light.tint,
  },
  tabText: {
    fontSize: fontSizes.sm,
    color: Colors.light.secondaryText,
  },
  activeTabText: {
    color: 'white',
    fontWeight: fontWeights.medium as '500',
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontSize: fontSizes.md,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium as '500',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSizes.md,
    color: Colors.light.secondaryText,
    textAlign: 'center',
  },
  filterPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: FILTER_PANEL_HEIGHT,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  filterPanelHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.light.grey,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  filterPanelContent: {
    flex: 1,
    padding: spacing.lg,
  },
  filterPanelTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as '700',
    marginBottom: spacing.xl,
  },
  filterLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium as '500',
    marginBottom: spacing.md,
  },
  applyButton: {
    marginTop: spacing.xl,
  },
  resetButton: {
    marginTop: spacing.md,
  },
});