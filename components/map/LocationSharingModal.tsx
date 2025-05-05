import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import { useLocationStore } from '@/store/useLocationStore';
import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';

interface LocationSharingModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LocationSharingModal({ visible, onClose }: LocationSharingModalProps) {
  const { setShareMode } = useLocationStore();

  const handleShareMode = (mode: 'always' | 'once' | 'never') => {
    setShareMode(mode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Share Your Location</Text>
          <Text style={styles.description}>
            Allow Alia to share your live location with others?
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => handleShareMode('always')}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Always Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => handleShareMode('once')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Share Once
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={() => handleShareMode('never')}
          >
            <Text style={[styles.buttonText, styles.tertiaryButtonText]}>
              Don't Share
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: spacing.xl,
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSizes.md,
    color: Colors.light.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  button: {
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
  },
  secondaryButton: {
    backgroundColor: Colors.light.card,
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium as '500',
  },
  primaryButtonText: {
    color: 'white',
  },
  secondaryButtonText: {
    color: Colors.light.text,
  },
  tertiaryButtonText: {
    color: Colors.light.secondaryText,
  },
}); 