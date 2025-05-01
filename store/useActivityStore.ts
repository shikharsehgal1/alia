import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface Activity {
  id: string;
  userId: string;
  type: 'check_in' | 'match' | 'rating' | 'nearby';
  data: any;
  createdAt: string;
}

type ActivityState = {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
};

type ActivityActions = {
  fetchActivities: () => Promise<void>;
  createActivity: (type: Activity['type'], data: any) => Promise<void>;
};

export const useActivityStore = create<ActivityState & ActivityActions>((set) => ({
  activities: [],
  isLoading: false,
  error: null,

  fetchActivities: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        activities: data.map(activity => ({
          id: activity.id,
          userId: activity.user_id,
          type: activity.type,
          data: activity.data,
          createdAt: activity.created_at,
        })),
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },

  createActivity: async (type, data) => {
    try {
      const { error } = await supabase
        .from('activities')
        .insert([{
          type,
          data,
        }]);

      if (error) throw error;

      // Refresh activities
      const store = useActivityStore.getState();
      await store.fetchActivities();
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  },
}));