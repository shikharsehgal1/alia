import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Filter, Search } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';
import { useUserStore } from '@/store/useUserStore';
import { useCheckInStore } from '@/store/useCheckInStore';
import { UserProfile } from '@/types';
import UserCard from '@/components/users/UserCard';
import UserDetail from '@/components/users/UserDetail';
import RangeSlider from '@/components/common/RangeSlider';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { calculateSimilarityScore } from '@/utils/locationUtils';

export default function PeopleScreen() {
  const router = useRouter();
  const searchRadius = useUserStore(state => state.searchRadius);
  const updateSearchRadius = useUserStore(state => state.updateSearchRadius);
  const { fetchNearbyUsers, users, nearbyUsers, isLoading, error } = useUserStore();
  const createCheckIn = useCheckInStore(state => state.createCheckIn);
  const checkInLoading = useCheckInStore(state => state.isLoading);
  
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  // Mocked current user hobbies and sports for similarity calculation
  const currentUserHobbies = ['Photography', 'Hiking', 'Reading'];
  const currentUserSports = ['Tennis', 'Running'];
  
  useEffect(() => {
    // Initial fetch of nearby users
    const userLocation = { latitude: 37.7749, longitude: -122.4194 }; // Sample location (San Francisco)
    fetchNearbyUsers(userLocation.latitude, userLocation.longitude);
  }, [fetchNearbyUsers]);
  
  useEffect(() => {
    // Filter users based on search text
    if (searchText.trim() === '') {
      setFilteredUsers(nearbyUsers);
    } else {
      const filtered = nearbyUsers.filter(user => 
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.hobbies.some(hobby => hobby.toLowerCase().includes(searchText.toLowerCase())) ||
        user.sports.some(sport => sport.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchText, nearbyUsers]);
  
  const handleUserPress = (user: UserProfile) => {
    setSelectedUser(user);
    setDetailModalVisible(true);
  };
  
  const handleCheckIn = async (user: UserProfile) => {
    try {
      await createCheckIn(
        user.id, 
        // Mock current user location
        { latitude: 37.7749, longitude: -122.4194 }
      );
      setDetailModalVisible(false);
      // Show success message or navigate to check-in confirmation
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };
  
  const handleFilterApply = () => {
    setFilterModalVisible(false);
    // Re-fetch users with new radius
    const userLocation = { latitude: 37.7749, longitude: -122.4194 }; // Sample location
    fetchNearbyUsers(userLocation.latitude, userLocation.longitude);
  };
  
  // Calculate similarity score for sorting
  const sortedUsers = [...(filteredUsers || [])].sort((a, b) => {
    const scoreA = calculateSimilarityScore(
      currentUserHobbies,
      currentUserSports,
      a.hobbies,
      a.sports
    );
    
    const scoreB = calculateSimilarityScore(
      currentUserHobbies,
      currentUserSports,
      b.hobbies,
      b.sports
    );
    
    return scoreB - scoreA; // Sort in descending order (highest match first)
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>People Nearby</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.light.secondaryText} style={styles.searchIcon} />
          <Input
            placeholder="Search by name, interests..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
        </View>
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
              const userLocation = { latitude: 37.7749, longitude: -122.4194 };
              fetchNearbyUsers(userLocation.latitude, userLocation.longitude);
            }}
            type="outline"
          />
        </View>
      ) : sortedUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No people found nearby</Text>
          <Text style={styles.emptySubtext}>Try increasing your search radius</Text>
        </View>
      ) : (
        <FlatList
          data={sortedUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const similarityScore = calculateSimilarityScore(
              currentUserHobbies,
              currentUserSports,
              item.hobbies,
              item.sports
            );
            
            return (
              <UserCard
                user={item}
                similarityScore={similarityScore}
                onPress={handleUserPress}
              />
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.closeButton}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.filterLabel}>Search Radius (km)</Text>
              <RangeSlider
                min={1}
                max={20}
                value={searchRadius}
                onChange={updateSearchRadius}
                valueLabel="km"
                width={250}
              />
              
              <Button 
                title="Apply Filters" 
                onPress={handleFilterApply}
                style={styles.applyButton}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* User Detail Modal */}
      {selectedUser && (
        <Modal
          visible={detailModalVisible}
          animationType="slide"
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <View style={styles.detailModalContainer}>
            <View style={styles.detailModalHeader}>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Text style={styles.backButton}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.detailModalTitle}>Profile</Text>
              <View style={{ width: 50 }} />
            </View>
            
            <UserDetail
              user={selectedUser}
              currentUserHobbies={currentUserHobbies}
              currentUserSports={currentUserSports}
              onCheckIn={handleCheckIn}
              loading={checkInLoading}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60, // Account for status bar
    paddingBottom: spacing.md,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as '700',
  },
  filterButton: {
    padding: spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.light.background,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.lightGrey,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
    marginBottom: 0,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as '700',
  },
  closeButton: {
    fontSize: fontSizes.md,
    color: Colors.light.tint,
  },
  modalBody: {
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium as '500',
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  applyButton: {
    marginTop: spacing.xl,
    width: '100%',
  },
  detailModalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  detailModalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as '700',
  },
  backButton: {
    fontSize: fontSizes.md,
    color: Colors.light.tint,
  },
});