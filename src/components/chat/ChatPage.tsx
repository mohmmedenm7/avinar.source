import React, { useState, useEffect } from 'react';
import { ChatProvider } from './ChatProvider';
import { useChatContext } from './ChatContext';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { X, Search, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { API_BASE_URL } from '@/config/env';
import Navbar from '../layout/Navbar';

interface User {
    _id: string;
    name: string;
    profileImg?: string;
    role: string;
    chatStatus: string;
}

// User search modal for starting new conversation
const NewChatModal: React.FC<{ onClose: () => void; onSelect: (userId: string) => void }> = ({ onClose, onSelect }) => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'manager'>('all');

    useEffect(() => {
        const fetchUsers = async () => {
            if (!search && roleFilter === 'all') {
                setUsers([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                // Use the main users endpoint for better search across all roles
                let url = `${API_BASE_URL}/api/v1/users?`;
                if (search) url += `keyword=${encodeURIComponent(search)}&`;
                if (roleFilter !== 'all') url += `role=${roleFilter}`;

                const response = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (data.status === 'success' || data.data) {
                    // Filter out current user
                    const currentUserId = localStorage.getItem('userId');
                    const filteredUsers = (data.data || []).filter((u: any) => u._id !== currentUserId);
                    setUsers(filteredUsers);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
            setLoading(false);
        };

        const timer = setTimeout(fetchUsers, 300);
        return () => clearTimeout(timer);
    }, [search, roleFilter]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md mx-4 shadow-2xl">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('chat.newConversation') || 'محادثة جديدة'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="relative mb-3">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('chat.searchUsers') || 'ابحث عن مستخدم...'}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Role Filter Buttons Removed - Searching all by default */}

                    <div className="max-h-64 overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-4 text-gray-500">{t('chat.loading') || 'جاري التحميل...'}</div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                {t('chat.noUsers') || 'لا يوجد مستخدمين'}
                            </div>
                        ) : (
                            users.map(user => (
                                <button
                                    key={user._id}
                                    onClick={() => onSelect(user._id)}
                                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                        {user.profileImg ? (
                                            <img src={user.profileImg.startsWith('http') ? user.profileImg : `${API_BASE_URL}/${user.profileImg}`} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="text-right flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {user.role === 'manager' ? (t('chat.instructor') || 'مدرب') : (t('chat.student') || 'طالب')}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Inner component that uses context
const ChatPageContent: React.FC = () => {
    const { t } = useTranslation();
    const { createConversation, selectConversation, isConnected, unreadTotal, conversations } = useChatContext();
    const [showNewChat, setShowNewChat] = useState(false);

    const handleNewChat = async (userId: string) => {
        try {
            const conv = await createConversation(userId);
            selectConversation(conv);
            setShowNewChat(false);
        } catch (error) {
            console.error('Failed to create conversation:', error);
        }
    };

    // Handle initial conversation selection from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const convId = params.get('conversation');
        if (convId && conversations.length > 0) {
            const conv = conversations.find(c => c._id === convId);
            if (conv) {
                selectConversation(conv);
                // Clean up URL without reload
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, [conversations, selectConversation]);

    return (
        <div className="h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-950">
            {/* Navbar for Mobile */}
            <div className="md:hidden">
                <Navbar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden pt-16 md:pt-0 relative">
                {/* Connection indicator */}
                {!isConnected && (
                    <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-white text-center py-1 text-sm z-50">
                        {t('chat.reconnecting') || 'جاري إعادة الاتصال...'}
                    </div>
                )}

                {/* Sidebar */}
                <ChatSidebar
                    onNewChat={() => setShowNewChat(true)}
                />

                {/* Chat Window */}
                <ChatWindow />
            </div>

            {/* New Chat Modal */}
            {showNewChat && (
                <NewChatModal onClose={() => setShowNewChat(false)} onSelect={handleNewChat} />
            )}
        </div>
    );
};

// Main Chat page - now just uses the global provider
const ChatPage: React.FC = () => {
    return <ChatPageContent />;
};

export default ChatPage;
