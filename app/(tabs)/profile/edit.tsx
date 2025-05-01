import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Camera, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';
import { useAuthStore } from '@/store/useAuthStore';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';

const INTERESTS = [
  'Art & Culture', 'Books', 'Coffee', 'Cooking', 'Crafts',
  'Dancing', 'Fashion', 'Food', 'Gaming', 'Languages',
  'Movies', 'Music', 'Photography', 'Technology', 'Travel',
];

const ACTIVITIES = [
  'Basketball', 'Soccer', 'Tennis', 'Running', 'Swimming',
  'Yoga', 'Cycling', 'Volleyball', 'Golf', 'Hiking',
  'Fitness', 'Rock Climbing', 'Martial Arts', 'Skating', 'Surfing',
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    bio: user?.bio || '',
    education: user?.education || '',
    occupation: user?.occupation || '',
    interests: user?.interests || [],
    activities: user?.activities || [],
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (parseInt(formData.age) < 18) {
      newErrors.age = 'Must be 18 or older';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    }

    if (formData.interests.length < 3) {
      newErrors.interests = 'Select at least 3 interests';
    }

    if (formData.activities.length === 0) {
      newErrors.activities = 'Select at least 1 activity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUploading(true);
        // Upload image to storage and get URL
        // For now, we'll just simulate the delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setImageUploading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setImageUploading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleActivity = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity],
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await updateProfile({
        ...user,
        ...formData,
        age: parseInt(formData.age),
      });
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: user?.image_url || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg' }}
            style={styles.profileImage}
          />
          <View style={styles.imageActions}>
            <TouchableOpacity
              style={[styles.imageButton, styles.uploadButton]}
              onPress={handleImagePick}
              disabled={imageUploading}
            >
              {imageUploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Camera size={20} color="white" />
                  <Text style={styles.buttonText}>Change Photo</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.imageButton, styles.removeButton]}
              onPress={() => {/* Handle remove photo */}}
            >
              <Trash2 size={20} color={Colors.light.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Input
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            error={errors.name}
          />
          <Input
            label="Age"
            value={formData.age}
            onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
            keyboardType="number-pad"
            error={errors.age}
          />
          <Input
            label="Bio"
            value={formData.bio}
            onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
            multiline
            numberOfLines={4}
            style={styles.bioInput}
            error={errors.bio}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education & Work</Text>
          <Input
            label="Education"
            value={formData.education}
            onChangeText={(text) => setFormData(prev => ({ ...prev, education: text }))}
            placeholder="e.g., Bachelor's in Computer Science"
          />
          <Input
            label="Occupation"
            value={formData.occupation}
            onChangeText={(text) => setFormData(prev => ({ ...prev, occupation: text }))}
            placeholder="e.g., Software Engineer"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <Text style={styles.sectionSubtitle}>Select at least 3 interests</Text>
          {errors.interests && <Text style={styles.error}>{errors.interests}</Text>}
          <View style={styles.tagsContainer}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.tag,
                  formData.interests.includes(interest) && styles.selectedTag,
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.tagText,
                    formData.interests.includes(interest) && styles.selectedTagText,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activities</Text>
          <Text style={styles.sectionSubtitle}>Select activities you enjoy</Text>
          {errors.activities && <Text style={styles.error}>{errors.activities}</Text>}
          <View style={styles.tagsContainer}>
            {ACTIVITIES.map((activity) => (
              <TouchableOpacity
                key={activity}
                style={[
                  styles.tag,
                  formData.activities.includes(activity) && styles.selectedTag,
                ]}
                onPress={() => toggleActivity(activity)}
              >
                <Text
                  style={[
                    styles.tagText,
                    formData.activities.includes(activity) && styles.selectedTagText,
                  ]}
                >
                  {activity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          size="large"
          style={styles.saveButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.md,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as '700',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
  },
  imageActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    marginHorizontal: spacing.xs,
  },
  uploadButton: {
    backgroundColor: Colors.light.tint,
  },
  removeButton: {
    backgroundColor: `${Colors.light.error}10`,
  },
  buttonText: {
    color: 'white',
    marginLeft: spacing.xs,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium as '500',
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as '700',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: fontSizes.sm,
    color: Colors.light.secondaryText,
    marginBottom: spacing.md,
  },
  bioInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  tag: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: Colors.light.lightGrey,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedTag: {
    backgroundColor: `${Colors.light.tint}20`,
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  tagText: {
    fontSize: fontSizes.sm,
    color: Colors.light.text,
  },
  selectedTagText: {
    color: Colors.light.tint,
    fontWeight: fontWeights.medium as '500',
  },
  error: {
    color: Colors.light.error,
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  saveButton: {
    width: '100%',
  },
});