import React from 'react';
import { StyleSheet, View, Image, ViewStyle } from 'react-native';
import { User } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface AvatarProps {
  size?: number;
  source?: string;
  style?: ViewStyle;
}

export default function Avatar({ size = 50, source, style }: AvatarProps) {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[styles.image, containerStyle]}
        />
      ) : (
        <View style={[styles.placeholder, containerStyle]}>
          <User size={size * 0.5} color={Colors.light.background} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Colors.light.lightGrey,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: Colors.light.darkGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
});