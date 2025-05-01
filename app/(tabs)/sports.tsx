import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import { Search } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';
import { useSportsStore } from '@/store/useSportsStore';
import { useUserStore } from '@/store/useUserStore';
import SportCard from '@/components/sports/SportCard';
import UserCard from '@/components/users/UserCard';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

const AnimatedInput = Animated.createAnimatedComponent(Input);

export default function SportsScreen() {
  const { sports, searchSports, fetchSports, isLoading, error } = useSportsStore();
  const { nearbyUsers } = useUserStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [showUsersModal, setShowUsersModal] = useState(false);

  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

  const searchBarStyle = useAnimatedStyle(() => ({
    width: withSpring(isSearchFocused ? '100%' : '100%', {
      damping: 15,
      stiffness: 150,
    }),
  }));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchSports(query);
  };

  const handleSportPress = (sportName: string) => {
    setSelectedSport(sportName);
    setShowUsersModal(true);
  };

  const filteredUsers = selectedSport
    ? nearbyUsers.filter(user => user.activities.includes(selectedSport))
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sports & Activities</Text>
      </View>

      <View style={styles.searchContainer}>
        <AnimatedInput
          placeholder="Search sports..."
          value={searchQuery}
          onChangeText={handleSearch}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          style={[styles.searchInput, searchBarStyle]}
          leftIcon={<Search size={20} color={Colors.light.secondaryText} />}
        />
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
            onPress={fetchSports}
            type="outline"
          />
        </View>
      ) : sports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No sports found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your search</Text>
        </View>
      ) : (
        <FlatList
          data={sports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SportCard 
              sport={item} 
              onPress={() => handleSportPress(item.name)}
            />
          )}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Users Modal */}
      <Modal
        visible={showUsersModal}
        animationType="slide"
        onRequestClose={() => setShowUsersModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowUsersModal(false)}>
              <Text style={styles.backButton}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedSport} Players Nearby
            </Text>
            <View style={{ width: 50 }} />
          </View>

          {filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No players found nearby</Text>
              <Text style={styles.emptySubtext}>
                Try increasing your search radius or check back later
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <UserCard
                  user={item}
                  currentUser={nearbyUsers[0]} // Replace with actual current user
                  onPress={() => {}}
                />
              )}
              contentContainerStyle={styles.modalListContent}
            />
          )}
        </View>
      </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as '700',
  },
  searchContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchInput: {
    marginBottom: 0,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.xl,
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as '700',
  },
  backButton: {
    fontSize: fontSizes.md,
    color: Colors.light.tint,
  },
  modalListContent: {
    padding: spacing.lg,
  },
});