import React, { useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
    Message,
    Conversation,
    TypingUser,
    ChatContextType,
    ChatContext
} from './ChatContext';

import { API_BASE_URL } from '@/config/env';

export { useChatContext } from './ChatContext';

interface ChatProviderProps {
    children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());

    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const socketRef = useRef<Socket | null>(null);

    const currentConvRef = useRef<Conversation | null>(null);
    useEffect(() => {
        currentConvRef.current = currentConversation;
    }, [currentConversation]);

    // Initialize Socket.IO connection
    useEffect(() => {
        const connectSocket = () => {
            const currentToken = localStorage.getItem('token');
            setToken(currentToken);

            if (!currentToken) {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                    setSocket(null);
                }
                setIsConnected(false);
                return;
            }

            // If already connected with same token, skip
            if (socketRef.current?.connected && (socketRef.current as any).auth?.token === currentToken) {
                return;
            }

            // Disconnect old socket if token changed
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            const newSocket = io(API_BASE_URL.replace('/api/v1', ''), {
                auth: { token: currentToken },
                transports: ['websocket', 'polling'],
            });

            newSocket.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
                setIsConnected(false);
            });

            socketRef.current = newSocket;
            setSocket(newSocket);
        };

        connectSocket();

        const handleAuthChange = () => connectSocket();
        window.addEventListener('authChanged', handleAuthChange);
        window.addEventListener('storage', (e) => {
            if (e.key === 'token') handleAuthChange();
        });

        return () => {
            window.removeEventListener('authChanged', handleAuthChange);
        };
    }, []);

    // Register event listeners when socket is available
    useEffect(() => {
        if (!socket) return;

        socket.on('new_message', ({ conversationId, message }) => {
            if (currentConvRef.current?._id === conversationId) {
                setMessages(prev => [...prev, message]);
            }
            // Update conversation list
            setConversations(prev => {
                const updated = prev.map(conv =>
                    conv._id === conversationId
                        ? { ...conv, lastMessage: message, lastMessageAt: message.createdAt, myUnreadCount: (conv.myUnreadCount || 0) + 1 }
                        : conv
                );
                // If it's a new conversation that we don't have yet, we should probably reload
                if (!updated.find(c => c._id === conversationId)) {
                    loadConversations();
                    return updated;
                }
                return [...updated].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
            });
        });

        socket.on('user_typing', (data: TypingUser) => {
            setTypingUsers(prev => {
                const updated = new Map(prev);
                if (data.isTyping) {
                    updated.set(data.userId, data);
                } else {
                    updated.delete(data.userId);
                }
                return updated;
            });
        });

        socket.on('messages_read', ({ messageIds, readBy }) => {
            setMessages(prev => prev.map(msg =>
                messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
            ));
        });

        socket.on('user_status_change', ({ userId, status }) => {
            setOnlineUsers(prev => {
                const updated = new Set(prev);
                if (status === 'online') {
                    updated.add(userId);
                } else {
                    updated.delete(userId);
                }
                return updated;
            });
        });

        socket.on('message_updated', ({ messageId, content, isEdited }) => {
            setMessages(prev => prev.map(msg =>
                msg._id === messageId ? { ...msg, content, isEdited } : msg
            ));
        });

        socket.on('message_removed', ({ messageId }) => {
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        });

        return () => {
            socket.off('new_message');
            socket.off('user_typing');
            socket.off('messages_read');
            socket.off('user_status_change');
            socket.off('message_updated');
            socket.off('message_removed');
        };
    }, [socket]);

    // Auto-join current conversation room when socket connects or conversation changes
    useEffect(() => {
        if (socket?.connected && currentConversation?._id) {
            socket.emit('join_conversation', currentConversation._id);
        }
    }, [socket, currentConversation?._id, isConnected]);

    const loadConversations = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.status === 'success') {
                setConversations(data.data);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    }, [token]);

    const selectConversation = useCallback(async (conversation: Conversation) => {
        if (!token) return;
        setCurrentConversation(conversation);
        socket?.emit('join_conversation', conversation._id);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations/${conversation._id}/messages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.status === 'success') {
                setMessages(data.data);
                setPinnedMessages(data.pinnedMessages || []);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }, [socket, token]);

    const sendMessage = useCallback((content: string, replyTo?: string, messageType: string = 'text') => {
        if (!socket || !currentConversation || !content.trim()) return;

        socket.emit('send_message', {
            conversationId: currentConversation._id,
            content,
            messageType,
            replyTo,
        });
    }, [socket, currentConversation]);

    const editMessage = useCallback((messageId: string, content: string) => {
        socket?.emit('message_edited', { messageId, content });
    }, [socket]);

    const deleteMessage = useCallback((messageId: string) => {
        socket?.emit('message_deleted', messageId);
    }, [socket]);

    const togglePin = useCallback(async (messageId: string) => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) return;
        try {
            await fetch(`${API_BASE_URL}/api/v1/chat/messages/${messageId}/pin`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${currentToken}` },
            });
            if (currentConversation) {
                selectConversation(currentConversation);
            }
        } catch (error) {
            console.error('Failed to toggle pin:', error);
        }
    }, [currentConversation, selectConversation]);

    const startTyping = useCallback(() => {
        if (currentConversation) {
            socket?.emit('typing_start', currentConversation._id);
        }
    }, [socket, currentConversation]);

    const stopTyping = useCallback(() => {
        if (currentConversation) {
            socket?.emit('typing_stop', currentConversation._id);
        }
    }, [socket, currentConversation]);

    const markAsRead = useCallback(() => {
        if (!currentConversation || messages.length === 0) return;

        const unreadIds = messages.filter(m => !m.isRead).map(m => m._id);
        if (unreadIds.length > 0) {
            socket?.emit('message_read', {
                conversationId: currentConversation._id,
                messageIds: unreadIds,
            });
        }
    }, [socket, currentConversation, messages]);

    const createConversation = useCallback(async (participantId: string, courseId?: string): Promise<Conversation> => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) throw new Error('Authentication required');
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${currentToken}`,
            },
            body: JSON.stringify({ participantId, relatedCourse: courseId }),
        });
        const data = await response.json();
        if (data.status === 'success') {
            await loadConversations();
            return data.data;
        }
        throw new Error(data.message || 'Failed to create conversation');
    }, [loadConversations]);

    const createAdminSupport = useCallback(async (): Promise<Conversation> => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) throw new Error('Authentication required');
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/admin-support`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${currentToken}` },
        });
        const data = await response.json();
        if (data.status === 'success') {
            await loadConversations();
            return data.data;
        }
        throw new Error(data.message || 'Failed to create admin support');
    }, [loadConversations]);

    const searchMessages = useCallback(async (query: string): Promise<Message[]> => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) return [];
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/search?q=${encodeURIComponent(query)}`, {
            headers: { Authorization: `Bearer ${currentToken}` },
        });
        const data = await response.json();
        return data.data || [];
    }, []);

    const blockUser = useCallback(async (userId: string) => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) return;
        await fetch(`${API_BASE_URL}/api/v1/chat/block/${userId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${currentToken}` },
        });
    }, []);

    const unblockUser = useCallback(async (userId: string) => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) return;
        await fetch(`${API_BASE_URL}/api/v1/chat/block/${userId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${currentToken}` },
        });
    }, []);

    const reportUser = useCallback(async (data: { reportedUserId: string; reason: string; messageId?: string; description?: string }) => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) return;
        await fetch(`${API_BASE_URL}/api/v1/chat/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${currentToken}`,
            },
            body: JSON.stringify(data),
        });
    }, []);

    const updateStatus = useCallback((status: 'online' | 'offline' | 'busy' | 'away') => {
        socket?.emit('update_status', status);
    }, [socket]);

    const unreadTotal = conversations.reduce((sum, conv) => sum + (conv.myUnreadCount || 0), 0);

    const value: ChatContextType = {
        socket,
        isConnected,
        conversations,
        currentConversation,
        messages,
        pinnedMessages,
        onlineUsers,
        typingUsers,
        unreadTotal,
        loadConversations,
        selectConversation,
        sendMessage,
        editMessage,
        deleteMessage,
        togglePin,
        startTyping,
        stopTyping,
        markAsRead,
        createConversation,
        createAdminSupport,
        searchMessages,
        blockUser,
        unblockUser,
        reportUser,
        updateStatus,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatProvider;
