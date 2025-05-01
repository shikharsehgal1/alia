import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import * as Notifications from 'expo-notifications';

interface Notification {
  id: string;
  userId: string;
  type: 'match' | 'message' | 'nearby' | 'check_in';
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
};

type NotificationActions = {
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
};

export const useNotificationStore = create<NotificationState & NotificationActions>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notifications = data.map(notification => ({
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        read: notification.read,
        createdAt: notification.created_at,
      }));

      set({ 
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },

  markAsRead: async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: state.unreadCount - 1,
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) throw error;

      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  requestPermissions: async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },
}));