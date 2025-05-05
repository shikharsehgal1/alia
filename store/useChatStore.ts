import { create } from 'zustand';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  read: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  image: string;
}

interface Conversation {
  id: string;
  user: ChatUser;
  messages: Message[];
  lastMessage: {
    text: string;
    timestamp: string;
    read: boolean;
  };
}

type ChatState = {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
};

type ChatActions = {
  getConversation: (id: string) => Conversation | undefined;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  createConversation: (user: ChatUser) => string;
};

// Mock data
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    user: {
      id: 'user1',
      name: 'Sarah Wilson',
      image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    },
    messages: [
      {
        id: 'm1',
        text: 'Hey! I saw you\'re into photography too!',
        senderId: 'user1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true,
      },
      {
        id: 'm2',
        text: 'Yes! I love taking landscape photos. What about you?',
        senderId: 'currentUser',
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        read: true,
      },
      {
        id: 'm3',
        text: 'I mostly do street photography. Would you like to meet up for a photo walk sometime?',
        senderId: 'user1',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        read: false,
      },
    ],
    lastMessage: {
      text: 'I mostly do street photography. Would you like to meet up for a photo walk sometime?',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      read: false,
    },
  },
  {
    id: '2',
    user: {
      id: 'user2',
      name: 'Mike Chen',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    },
    messages: [
      {
        id: 'm4',
        text: 'Are you joining the basketball game tomorrow?',
        senderId: 'currentUser',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
      },
    ],
    lastMessage: {
      text: 'Are you joining the basketball game tomorrow?',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
    },
  },
];

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  conversations: [],
  isLoading: false,
  error: null,

  getConversation: (id) => {
    return get().conversations.find(conv => conv.id === id);
  },

  createConversation: (user) => {
    const conversationId = `conv_${Date.now()}`;
    const newConversation: Conversation = {
      id: conversationId,
      user,
      messages: [],
      lastMessage: {
        text: '',
        timestamp: new Date().toISOString(),
        read: true,
      },
    };

    set(state => ({
      conversations: [...state.conversations, newConversation],
    }));

    return conversationId;
  },

  sendMessage: async (conversationId, text) => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newMessage = {
        id: `m${Date.now()}`,
        text,
        senderId: 'currentUser',
        timestamp: new Date().toISOString(),
        read: true,
      };

      set(state => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [...conv.messages, newMessage],
                lastMessage: {
                  text: newMessage.text,
                  timestamp: newMessage.timestamp,
                  read: true,
                },
              }
            : conv
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        isLoading: false,
        error: (error as Error).message,
      });
    }
  },

  markAsRead: async (conversationId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      set(state => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: conv.messages.map(msg => ({ ...msg, read: true })),
                lastMessage: { ...conv.lastMessage, read: true },
              }
            : conv
        ),
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },
}));