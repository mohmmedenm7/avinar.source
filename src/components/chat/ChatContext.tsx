import { createContext, useContext } from 'react';
import { Socket } from 'socket.io-client';

export interface Message {
    _id: string;
    conversation: string;
    sender: {
        _id: string;
        name: string;
        profileImg?: string;
        role: string;
    };
    content: string;
    messageType: string;
    isRead: boolean;
    isEdited: boolean;
    isDeleted: boolean;
    isPinned: boolean;
    editHistory: { content: string; editedAt: string }[];
    replyTo?: {
        _id: string;
        content: string;
        sender: { _id: string; name: string };
    };
    createdAt: string;
}

export interface Conversation {
    _id: string;
    participants: {
        _id: string;
        name: string;
        profileImg?: string;
        chatStatus: string;
        lastSeen?: string;
        email?: string;
        phone?: string;
        role: string;
    }[];
    type: 'direct' | 'admin_support' | 'group';
    lastMessage?: Message;
    lastMessageAt: string;
    myUnreadCount: number;
    relatedCourse?: {
        _id: string;
        title: string;
        imageCover: string;
    };
    supportStatus?: string;
}

export interface TypingUser {
    conversationId: string;
    userId: string;
    userName: string;
    isTyping: boolean;
}

export interface ChatContextType {
    socket: Socket | null;
    isConnected: boolean;
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: Message[];
    pinnedMessages: Message[];
    onlineUsers: Set<string>;
    typingUsers: Map<string, TypingUser>;
    unreadTotal: number;

    // Actions
    loadConversations: () => Promise<void>;
    selectConversation: (conversation: Conversation) => void;
    sendMessage: (content: string, replyTo?: string, messageType?: string) => void;
    editMessage: (messageId: string, content: string) => void;
    deleteMessage: (messageId: string) => void;
    togglePin: (messageId: string) => void;
    startTyping: () => void;
    stopTyping: () => void;
    markAsRead: () => void;
    createConversation: (participantId: string, courseId?: string) => Promise<Conversation>;
    createAdminSupport: () => Promise<Conversation>;
    searchMessages: (query: string) => Promise<Message[]>;
    blockUser: (userId: string) => Promise<void>;
    unblockUser: (userId: string) => Promise<void>;
    reportUser: (data: { reportedUserId: string; reason: string; messageId?: string; description?: string }) => Promise<void>;
    updateStatus: (status: 'online' | 'offline' | 'busy' | 'away') => void;
}

export const ChatContext = createContext<ChatContextType | null>(null);

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within ChatProvider');
    }
    return context;
};
