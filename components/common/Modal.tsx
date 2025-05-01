import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { spacing, fontSizes } from '@/constants/Styles';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  closeOnBackdropPress?: boolean;
}

export default function Modal({
  visible,
  onClose,
  title,
  children,
  style,
  closeOnBackdropPress = true,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback
        onPress={closeOnBackdropPress ? onClose : undefined}
      >
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.content, style]}>
              <View style={styles.header}>
                {title && <Text style={styles.title}>{title}</Text>}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <X size={24} color={Colors.light.secondaryText} />
                </TouchableOpacity>
              </View>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: 20,
  },
});