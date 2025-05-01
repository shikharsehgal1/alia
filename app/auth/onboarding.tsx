import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import Colors from '@/constants/Colors';
import { spacing, fontSizes, fontWeights } from '@/constants/Styles';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import RadioInput from '@/components/common/RadioInput';
import { useAuthStore } from '@/store/useAuthStore';

const INTERESTS = [
  'Art & Culture', 'Books', 'Coffee', 'Cooking', 'Crafts',
  'Dancing', 'Fashion', 'Food', 'Gaming', 'Languages',
  'Movies', 'Music', 'Photography', 'Technology', 'Travel',
  'Writing', 'Board Games', 'Collecting', 'DIY', 'Podcasts'
];

const ACTIVITIES = [
  'Basketball', 'Soccer', 'Tennis', 'Running', 'Swimming',
  'Yoga', 'Cycling', 'Volleyball', 'Golf', 'Hiking',
  'Fitness', 'Rock Climbing', 'Martial Arts', 'Skating', 'Surfing'
];

export default function OnboardingScreen() {
  const router = useRouter();
  const updateProfile = useAuthStore(state => state.updateProfile);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  
  // Step 2: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // Step 3: Activities
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  
  // Step 4: Preferences
  const [searchRadius, setSearchRadius] = useState('5');
  const [meetingPreference, setMeetingPreference] = useState('');
  
  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!name.trim()) newErrors.name = 'Name is required';
      if (!age.trim()) newErrors.age = 'Age is required';
      else if (parseInt(age) < 18) newErrors.age = 'Must be 18 or older';
      else if (parseInt(age) > 100) newErrors.age = 'Invalid age';
      if (!bio.trim()) newErrors.bio = 'Bio is required';
    } else if (step === 2) {
      if (selectedInterests.length < 3) {
        newErrors.interests = 'Please select at least 3 interests';
      }
    } else if (step === 3) {
      if (selectedActivities.length === 0) {
        newErrors.activities = 'Please select at least 1 activity';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const nextStep = () => {
    if (validateStep()) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        completeOnboarding();
      }
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };
  
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };
  
  const toggleActivity = (activity: string) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter(a => a !== activity));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };
  
  const completeOnboarding = async () => {
    setLoading(true);
    
    try {
      await updateProfile({
        name,
        age: parseInt(age),
        bio,
        interests: selectedInterests,
        activities: selectedActivities,
        preferences: {
          searchRadius: parseInt(searchRadius),
          meetingPreference
        }
      });
      
      router.replace('/(tabs)');
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevStep}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4].map((s) => (
            <View 
              key={s} 
              style={[
                styles.progressDot, 
                s === step && styles.activeProgressDot
              ]} 
            />
          ))}
        </View>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Tell us about yourself</Text>
            <Text style={styles.stepSubtitle}>Help others get to know you better</Text>
            
            <Input
              label="Full Name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />
            
            <Input
              label="Age"
              placeholder="Your age"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              error={errors.age}
            />
            
            <Input
              label="Bio"
              placeholder="Write a short bio about yourself"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              error={errors.bio}
            />
          </View>
        )}
        
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What are your interests?</Text>
            <Text style={styles.stepSubtitle}>Select at least 3 interests to help find like-minded people</Text>
            
            <View style={styles.tagsContainer}>
              {INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.tag,
                    selectedInterests.includes(interest) && styles.selectedTag,
                  ]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      selectedInterests.includes(interest) && styles.selectedTagText,
                    ]}
                  >
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.interests && <Text style={styles.error}>{errors.interests}</Text>}
            
            <View style={styles.selectedContainer}>
              <Text style={styles.selectedLabel}>
                Selected ({selectedInterests.length}):
              </Text>
              <View style={styles.selectedItemsContainer}>
                {selectedInterests.map((interest) => (
                  <Badge
                    key={interest}
                    label={interest}
                    type="primary"
                    style={styles.selectedBadge}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
        
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What activities do you enjoy?</Text>
            <Text style={styles.stepSubtitle}>Select activities you'd like to do with others</Text>
            
            <View style={styles.tagsContainer}>
              {ACTIVITIES.map((activity) => (
                <TouchableOpacity
                  key={activity}
                  style={[
                    styles.tag,
                    selectedActivities.includes(activity) && styles.selectedTag,
                  ]}
                  onPress={() => toggleActivity(activity)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      selectedActivities.includes(activity) && styles.selectedTagText,
                    ]}
                  >
                    {activity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.activities && <Text style={styles.error}>{errors.activities}</Text>}
            
            <View style={styles.selectedContainer}>
              <Text style={styles.selectedLabel}>
                Selected ({selectedActivities.length}):
              </Text>
              <View style={styles.selectedItemsContainer}>
                {selectedActivities.map((activity) => (
                  <Badge
                    key={activity}
                    label={activity}
                    type="secondary"
                    style={styles.selectedBadge}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
        
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Set your preferences</Text>
            <Text style={styles.stepSubtitle}>Customize your experience</Text>
            
            <Input
              label="Search Radius (km)"
              placeholder="5"
              value={searchRadius}
              onChangeText={setSearchRadius}
              keyboardType="number-pad"
            />
            
            <RadioInput
              label="Meeting Preferences"
              options={[
                { label: 'Meet at public places', value: 'public' },
                { label: 'Group activities', value: 'group' },
                { label: 'Open to both', value: 'both' }
              ]}
              selectedValue={meetingPreference}
              onSelect={(value) => setMeetingPreference(value.toString())}
            />
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title={step === 4 ? 'Complete' : 'Next'}
          onPress={nextStep}
          loading={loading}
          size="large"
          style={styles.button}
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
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.lightGrey,
    marginHorizontal: 4,
  },
  activeProgressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.tint,
  },
  backButton: {
    fontSize: fontSizes.md,
    color: Colors.light.tint,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  stepContainer: {
    marginBottom: spacing.xl,
  },
  stepTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as '700',
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: fontSizes.md,
    color: Colors.light.secondaryText,
    marginBottom: spacing.xl,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
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
  selectedContainer: {
    marginTop: spacing.md,
  },
  selectedLabel: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
    color: Colors.light.secondaryText,
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedBadge: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  button: {
    width: '100%',
  },
  error: {
    color: Colors.light.error,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
});