import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';
import { useChatStore } from '@/store/useChatStore';
import Input from '@/components/common/Input';

const AnimatedInput = Animated.createAnimatedComponent(Input);

export default function ChatScreen() {
  const router = useRouter();
  const { conversations, isLoading } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchBarStyle = useAnimatedStyle(() => ({
    width: withSpring(isSearchFocused ? '100%' : '100%', {
      damping: 15,
      stiffness: 150,
    }),
  }));

  const filteredConversations = conversations.filter(
    conversation =>
      conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTimeString = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diff = now.getTime() - messageDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <View style={styles.searchContainer}>
        <AnimatedInput
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          style={[styles.searchInput, searchBarStyle]}
          leftIcon={<Search size={20} color={Colors.light.secondaryText} />}
        />
      </View>

      {filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Start chatting with people nearby to make new connections
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.conversationItem}
              onPress={() => router.push(`/chat/${item.id}`)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: item.user.image }}
                style={styles.avatar}
              />
              
              <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                  <Text style={styles.userName}>{item.user.name}</Text>
                  <Text style={styles.timeText}>
                    {getTimeString(item.lastMessage.timestamp)}
                  </Text>
                </View>
                
                <View style={styles.messagePreview}>
                  <Text 
                    style={[
                      styles.lastMessage,
                      !item.lastMessage.read && styles.unreadMessage
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage.text}
                  </Text>
                  {!item.lastMessage.read && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadCount}>1</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSizes.md,
    color: Colors.light.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold as '700',
  },
  timeText: {
    fontSize: fontSizes.sm,
    color: Colors.light.secondaryText,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: fontSizes.md,
    color: Colors.light.secondaryText,
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadMessage: {
    color: Colors.light.text,
    fontWeight: fontWeights.medium as '500',
  },
  unreadBadge: {
    backgroundColor: Colors.light.tint,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: 'white',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold as '700',
  },
});