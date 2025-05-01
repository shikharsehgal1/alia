import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Smile, ChevronLeft } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore(state => state.login);
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  const clearError = useAuthStore(state => state.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  const validateForm = () => {
    const errors = {
      email: '',
      password: '',
    };
    let isValid = true;

    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleLogin = async () => {
    clearError();
    if (validateForm()) {
      try {
        await login(email, password);
        router.replace('/(tabs)');
      } catch (error) {
        // Error is handled by the auth store
      }
    }
  };

  // For demo purposes, create a demo login function
  const handleDemoLogin = async () => {
    clearError();
    try {
      await login('demo@example.com', 'password');
      router.replace('/(tabs)');
    } catch (error) {
      // Error is handled by the auth store
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={24} color={Colors.light.text} />
      </TouchableOpacity>
      
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Smile size={48} color={Colors.light.tint} />
        </View>
        <Text style={styles.appName}>Alia</Text>
      </View>
      
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue finding people near you</Text>
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      <View style={styles.form}>
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          error={formErrors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          error={formErrors.password}
          secureTextEntry
        />
        
        <Link href="/auth/forgot-password" asChild>
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>
        </Link>
        
        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.button}
        />
        
        <Button
          title="Demo Login"
          onPress={handleDemoLogin}
          type="secondary"
          style={styles.demoButton}
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Link href="/auth/register" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: `${Colors.light.tint}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  appName: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as '700',
    color: Colors.light.tint,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: Colors.light.secondaryText,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  forgotPassword: {
    color: Colors.light.tint,
  },
  button: {
    marginBottom: spacing.md,
  },
  demoButton: {
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: Colors.light.secondaryText,
    marginRight: spacing.xs,
  },
  link: {
    color: Colors.light.tint,
    fontWeight: fontWeights.medium as '500',
  },
  error: {
    color: Colors.light.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});