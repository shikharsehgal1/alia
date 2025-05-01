import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

type AuthState = {
  user: Profile | null;
  isLoading: boolean;
  error: string | null;
};

type AuthActions = {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  setUser: (user: Profile) => void;
  clearUser: () => void;
  logout: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      set({ isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('User not created');

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ]);

      if (profileError) throw profileError;
      set({ isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },

  updateProfile: async (profile) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      set(state => ({ 
        user: state.user ? { ...state.user, ...profile } : null,
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },

  clearError: () => set({ error: null }),
}));