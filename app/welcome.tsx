import React from 'react';
import { StyleSheet, View, Text, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';
import Button from '@/components/common/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg' }}
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Heart size={48} color={Colors.light.tint} />
            </View>
            <Text style={styles.appName}>Alia</Text>
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Meet Your People</Text>
            <Text style={styles.subtitle}>
              Connect with like-minded individuals who share your passions and interests
            </Text>
            
            <View style={styles.buttonContainer}>
              <Button 
                title="Create Account" 
                onPress={() => router.push('/auth/register')}
                size="large"
                style={styles.button}
              />
              <Button 
                title="Sign In" 
                onPress={() => router.push('/auth/login')}
                type="outline"
                size="large"
                style={styles.button}
                textStyle={styles.signInText}
              />
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 42,
    fontWeight: fontWeights.bold as '700',
    color: 'white',
    letterSpacing: 1,
  },
  contentContainer: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 48,
    fontWeight: fontWeights.bold as '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.xl,
    opacity: 0.9,
    lineHeight: 28,
    paddingHorizontal: spacing.lg,
  },
  buttonContainer: {
    marginTop: spacing.xl,
  },
  button: {
    marginBottom: spacing.md,
  },
  signInText: {
    color: 'white',
  }
});