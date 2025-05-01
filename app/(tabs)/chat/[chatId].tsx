import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MoveVertical as MoreVertical } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';
import { useChatStore } from '@/store/useChatStore';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import Button from '@/components/common/Button';

export default function ChatDetailScreen() {
  const router = useRouter();
  const { chatId } = useLocalSearchParams();
  const { getConversation, sendMessage, markAsRead } = useChatStore();
  const conversation = getConversation(chatId as string);
  
  const [isTyping, setIsTyping] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  const headerHeight = useSharedValue(Platform.OS === 'ios' ? 90 : 70);

  useEffect(() => {
    if (conversation) {
      markAsRead(conversation.id);
    }
  }, [conversation]);

  const headerStyle = useAnimatedStyle(() => ({
    height: headerHeight.value,
  }));

  const handleSend = async (message: string) => {
    if (!conversation) return;
    await sendMessage(conversation.id, message);
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const handleAttachImage = async () => {
    if (!conversation) return;
    setImageUploading(true);
    
    try {
      // Image upload would be implemented here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await sendMessage(conversation.id, '📷 Image');
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setImageUploading(false);
    }
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    headerHeight.value = withSpring(
      scrollY > 0 
        ? Platform.OS === 'ios' ? 70 : 60 
        : Platform.OS === 'ios' ? 90 : 70,
      {
        damping: 15,
        stiffness: 150,
      }
    );
  };

  if (!conversation) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Conversation not found</Text>
          <Button 
            title="Go Back" 
            onPress={() => router.back()} 
            type="outline" 
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerProfile}
          onPress={() => {
            // Navigate to user profile
          }}
        >
          <Image 
            source={{ uri: conversation.user.image }} 
            style={styles.avatar} 
          />
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{conversation.user.name}</Text>
            {isTyping ? (
              <Text style={styles.typingIndicator}>typing...</Text>
            ) : (
              <Text style={styles.lastSeen}>Active now</Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </Animated.View>

      <FlatList
        ref={flatListRef}
        data={conversation.messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onScroll={handleScroll}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item, index }) => (
          <ChatMessage
            text={item.text}
            timestamp={item.timestamp}
            isSent={item.senderId === 'currentUser'}
            isRead={item.read}
            showAvatar={
              index === 0 || 
              conversation.messages[index - 1].senderId !== item.senderId
            }
            userImage={conversation.user.image}
          />
        )}
      />

      {imageUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.uploadingText}>Uploading image...</Text>
        </View>
      )}

      <ChatInput
        onSend={handleSend}
        onAttachImage={handleAttachImage}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as '700',
  },
  typingIndicator: {
    fontSize: fontSizes.sm,
    color: Colors.light.tint,
  },
  lastSeen: {
    fontSize: fontSizes.sm,
    color: Colors.light.secondaryText,
  },
  moreButton: {
    padding: spacing.sm,
    marginLeft: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSizes.lg,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  messageList: {
    padding: spacing.lg,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.md,
    color: Colors.light.text,
  },
});