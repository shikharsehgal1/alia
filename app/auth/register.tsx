import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Smile, ChevronLeft } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useAuthStore } from '@/store/useAuthStore';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore(state => state.register);
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  const clearError = useAuthStore(state => state.clearError);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateForm = () => {
    const errors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    let isValid = true;

    if (!name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

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
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleRegister = async () => {
    clearError();
    if (validateForm()) {
      try {
        await register(name, email, password);
        router.replace('/auth/onboarding');
      } catch (error) {
        // Error is handled by the auth store
      }
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
      
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join Alia to find people with similar interests nearby</Text>
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      <View style={styles.form}>
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          error={formErrors.name}
          autoCapitalize="words"
        />
        
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
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          error={formErrors.password}
          secureTextEntry
        />
        
        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={formErrors.confirmPassword}
          secureTextEntry
        />
        
        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={isLoading}
          style={styles.button}
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Link href="/auth/login" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>Sign In</Text>
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
  button: {
    marginTop: spacing.md,
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