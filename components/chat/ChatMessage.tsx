import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';

interface ChatMessageProps {
  text: string;
  timestamp: string;
  isSent: boolean;
  isRead: boolean;
  showAvatar?: boolean;
  userImage?: string;
}

export default function ChatMessage({ 
  text, 
  timestamp, 
  isSent, 
  isRead,
  showAvatar,
  userImage,
}: ChatMessageProps) {
  const isImageMessage = text.startsWith('📷');

  return (
    <View style={[
      styles.container,
      isSent ? styles.sentContainer : styles.receivedContainer
    ]}>
      {!isSent && showAvatar && userImage && (
        <Image source={{ uri: userImage }} style={styles.avatar} />
      )}
      
      <View style={[
        styles.bubble,
        isSent ? styles.sentBubble : styles.receivedBubble,
        isImageMessage && styles.imageBubble
      ]}>
        <Text style={[
          styles.text,
          isSent ? styles.sentText : styles.receivedText
        ]}>
          {text}
        </Text>
      </View>
      
      <View style={[
        styles.footer,
        isSent ? styles.sentFooter : styles.receivedFooter
      ]}>
        <Text style={styles.timestamp}>
          {new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
        {isSent && (
          <Text style={[
            styles.status,
            isRead ? styles.read : styles.unread
          ]}>
            {isRead ? '✓✓' : '✓'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    marginVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  sentContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginHorizontal: spacing.sm,
  },
  bubble: {
    borderRadius: 20,
    padding: spacing.md,
    maxWidth: '100%',
  },
  sentBubble: {
    backgroundColor: Colors.light.tint,
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: Colors.light.lightGrey,
    borderBottomLeftRadius: 4,
  },
  imageBubble: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  text: {
    fontSize: fontSizes.md,
    lineHeight: 20,
  },
  sentText: {
    color: 'white',
  },
  receivedText: {
    color: Colors.light.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  sentFooter: {
    justifyContent: 'flex-end',
  },
  receivedFooter: {
    justifyContent: 'flex-start',
  },
  timestamp: {
    fontSize: fontSizes.xs,
    color: Colors.light.secondaryText,
  },
  status: {
    fontSize: fontSizes.xs,
    marginLeft: spacing.xs,
  },
  read: {
    color: Colors.light.tint,
  },
  unread: {
    color: Colors.light.secondaryText,
  },
});