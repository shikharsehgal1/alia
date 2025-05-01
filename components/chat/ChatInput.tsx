import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Send, Image as ImageIcon } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Styles';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface ChatInputProps {
  onSend: (message: string) => void;
  onAttachImage?: () => void;
  loading?: boolean;
}

export default function ChatInput({ onSend, onAttachImage, loading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const inputHeight = useSharedValue(48);
  const sendButtonScale = useSharedValue(1);

  const inputStyle = useAnimatedStyle(() => ({
    height: inputHeight.value,
  }));

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
  }));

  const handleSend = () => {
    if (!message.trim() || loading) return;

    sendButtonScale.value = withSpring(0.8, {}, () => {
      sendButtonScale.value = withSpring(1);
    });

    onSend(message.trim());
    setMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.attachButton}
          onPress={onAttachImage}
          disabled={loading}
        >
          <ImageIcon 
            size={24} 
            color={loading ? Colors.light.darkGrey : Colors.light.secondaryText} 
          />
        </TouchableOpacity>
        
        <AnimatedTextInput
          style={[styles.input, inputStyle]}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={1000}
          editable={!loading}
        />
        
        <Animated.View style={sendButtonStyle}>
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!message.trim() || loading) && styles.sendButtonDisabled
            ]} 
            onPress={handleSend}
            disabled={!message.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Send 
                size={20} 
                color={message.trim() ? 'white' : Colors.light.darkGrey} 
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  attachButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.lightGrey,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.md,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.lightGrey,
  },
});