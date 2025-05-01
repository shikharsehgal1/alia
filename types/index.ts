export type UserProfile = {
  id: string;
  name: string;
  age: number;
  bio: string;
  image?: string;
  interests: string[];
  activities: string[];
  education?: string;
  occupation?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating: {
    average: number;
    count: number;
  };
  lastActive: string;
  preferences?: {
    searchRadius: number;
    meetingPreference: 'public' | 'group' | 'both';
  };
};

export type Place = {
  id: string;
  name: string;
  category: 'bar' | 'club' | 'restaurant' | 'cafe' | 'park' | 'gym' | 'other';
  location: {
    latitude: number;
    longitude: number;
  };
  userCount: number;
  rating: number;
  distance: number;
  image?: string;
};

export type Sport = {
  id: string;
  name: string;
  icon: string; 
  interested: number;
};

export type CheckIn = {
  id: string;
  userId: string;
  otherUserId: string;
  date: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  isConfirmed: boolean;
};

export type AppSettings = {
  searchRadius: number;
  showNotifications: boolean;
  allowLocationSharing: boolean;
  darkMode: boolean;
};

export type Message = {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  read: boolean;
};

export type Conversation = {
  id: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
  messages: Message[];
  lastMessage: {
    text: string;
    timestamp: string;
    read: boolean;
  };
};