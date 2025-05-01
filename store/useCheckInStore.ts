import { create } from 'zustand';
import { CheckIn } from '@/types';

type CheckInState = {
  checkIns: CheckIn[];
  pendingCheckIns: CheckIn[];
  isLoading: boolean;
  error: string | null;
};

type CheckInActions = {
  createCheckIn: (otherUserId: string, location: { latitude: number; longitude: number }) => Promise<void>;
  confirmCheckIn: (checkInId: string) => Promise<void>;
  rateCheckIn: (checkInId: string, rating: number) => Promise<void>;
  fetchPendingCheckIns: () => Promise<void>;
  fetchCheckIns: () => Promise<void>;
};

export const useCheckInStore = create<CheckInState & CheckInActions>((set, get) => ({
  checkIns: [],
  pendingCheckIns: [],
  isLoading: false,
  error: null,

  createCheckIn: async (otherUserId, location) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new check-in
      const newCheckIn: CheckIn = {
        id: `chk_${Date.now()}`,
        userId: '1', // Current user ID (mock)
        otherUserId,
        date: new Date().toISOString(),
        location,
        isConfirmed: false,
      };
      
      set((state) => ({
        pendingCheckIns: [...state.pendingCheckIns, newCheckIn],
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },

  confirmCheckIn: async (checkInId) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update the check-in to confirmed status
      set((state) => ({
        pendingCheckIns: state.pendingCheckIns.filter(c => c.id !== checkInId),
        checkIns: [
          ...state.checkIns,
          {
            ...state.pendingCheckIns.find(c => c.id === checkInId)!,
            isConfirmed: true
          }
        ],
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },

  rateCheckIn: async (checkInId, rating) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update the check-in with rating
      set((state) => ({
        checkIns: state.checkIns.map(checkIn => 
          checkIn.id === checkInId 
            ? { ...checkIn, rating } 
            : checkIn
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },

  fetchPendingCheckIns: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo, create some pending check-ins
      const mockPendingCheckIns: CheckIn[] = [
        {
          id: 'chk_101',
          userId: '1',
          otherUserId: '2',
          date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          location: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          isConfirmed: false,
        }
      ];
      
      set({ 
        pendingCheckIns: mockPendingCheckIns,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  },

  fetchCheckIns: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo, create some completed check-ins
      const mockCheckIns: CheckIn[] = [
        {
          id: 'chk_100',
          userId: '1',
          otherUserId: '3',
          date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          location: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          rating: 5,
          isConfirmed: true,
        }
      ];
      
      set({ 
        checkIns: mockCheckIns,
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