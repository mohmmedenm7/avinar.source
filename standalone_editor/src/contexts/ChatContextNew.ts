import React, { createContext, useContext, useState, useCallback } from 'react';

interface ChatContextType {
  // Embedded Panel State
  isEmbeddedOpen: boolean;
  openEmbeddedChat: (conversationId: string) => void;
  closeEmbeddedChat: () => void;

  // Full Screen State
  isFullScreenOpen: boolean;
  openFullScreen: () => void;
  closeFullScreen: () => void;

  // Current Conversation
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;

  // Notifications
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEmbeddedOpen, setIsEmbeddedOpen] = useState(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const openEmbeddedChat = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
    setIsEmbeddedOpen(true);
  }, []);

  const closeEmbeddedChat = useCallback(() => {
    setIsEmbeddedOpen(false);
  }, []);

  const openFullScreen = useCallback(() => {
    setIsFullScreenOpen(true);
  }, []);

  const closeFullScreen = useCallback(() => {
    setIsFullScreenOpen(false);
  }, []);

  const value: ChatContextType = {
    isEmbeddedOpen,
    openEmbeddedChat,
    closeEmbeddedChat,
    isFullScreenOpen,
    openFullScreen,
    closeFullScreen,
    currentConversationId,
    setCurrentConversationId,
    unreadCount,
    setUnreadCount,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
