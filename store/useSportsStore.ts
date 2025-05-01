import { create } from 'zustand';
import { Sport } from '@/types';

type SportsState = {
  sports: Sport[];
  isLoading: boolean;
  error: string | null;
};

type SportsActions = {
  fetchSports: () => Promise<void>;
  searchSports: (query: string) => Promise<void>;
};

const SPORTS_DATA: Sport[] = [
  {
    id: '1',
    name: 'Basketball',
    icon: 'basketball',
    interested: 28,
  },
  {
    id: '2',
    name: 'Tennis',
    icon: 'tennis',
    interested: 15,
  },
  {
    id: '3',
    name: 'Soccer',
    icon: 'football',
    interested: 42,
  },
  {
    id: '4',
    name: 'Running',
    icon: 'timer',
    interested: 24,
  },
  {
    id: '5',
    name: 'Yoga',
    icon: 'pulse',
    interested: 31,
  },
  {
    id: '6',
    name: 'Cycling',
    icon: 'bike',
    interested: 19,
  },
  {
    id: '7',
    name: 'Swimming',
    icon: 'wave',
    interested: 22,
  },
  {
    id: '8',
    name: 'Volleyball',
    icon: 'ball',
    interested: 16,
  },
  {
    id: '9',
    name: 'Golf',
    icon: 'golf',
    interested: 12,
  },
  {
    id: '10',
    name: 'Rock Climbing',
    icon: 'mountain',
    interested: 25,
  },
  {
    id: '11',
    name: 'Martial Arts',
    icon: 'fist',
    interested: 18,
  },
  {
    id: '12',
    name: 'Skiing',
    icon: 'ski',
    interested: 14,
  }
];

export const useSportsStore = create<SportsState & SportsActions>((set) => ({
  sports: SPORTS_DATA,
  isLoading: false,
  error: null,

  fetchSports: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set({ 
        sports: SPORTS_DATA,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },

  searchSports: async (query) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const filteredSports = SPORTS_DATA.filter(sport =>
        sport.name.toLowerCase().includes(query.toLowerCase())
      );
      
      set({ 
        sports: filteredSports,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  }
}));