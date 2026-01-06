import React, { useState, useEffect } from 'react';
import { useChatContext } from './ChatContext';
import { Search, Plus, MessageCircle, Headphones, Users, Circle, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '@/config/env';

interface ChatSidebarProps {
    onNewChat?: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onNewChat }) => {
    const { t } = useTranslation();
    const {
        conversations,
        currentConversation,
        loadConversations,
        selectConversation,
        onlineUsers,
        createAdminSupport,
    } = useChatContext();

    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread' | 'support'>('all');

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    const filteredConversations = conversations.filter(conv => {
        if (filter === 'unread' && conv.myUnreadCount === 0) return false;
        if (filter === 'support' && conv.type !== 'admin_support') return false;
        if (searchQuery) {
            const participantNames = conv.participants.map(p => p.name.toLowerCase()).join(' ');
            return participantNames.includes(searchQuery.toLowerCase());
        }
        return true;
    });

    const handleContactSupport = async () => {
        try {
            const conv = await createAdminSupport();
            selectConversation(conv);
        } catch (error) {
            console.error('Failed to contact support:', error);
        }
    };

    const getOtherParticipant = (conv: typeof conversations[0]) => {
        const currentUserId = localStorage.getItem('userId');
        return conv.participants.find(p => p._id !== currentUserId) || conv.participants[0];
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 86400000) { // Less than 24 hours
            return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <button
                            onClick={() => window.history.back()}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            aria-label="Back"
                        >
                            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                        </button>
                        <MessageCircle className="w-6 h-6" />
                        {t('chat.title') || 'الرسائل'}
                    </h2>
                    {onNewChat && (
                        <button
                            onClick={onNewChat}
                            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('chat.search') || 'بحث في المحادثات...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 mt-3">
                    {(['all', 'unread', 'support'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${filter === f
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {f === 'all' && (t('chat.all') || 'الكل')}
                            {f === 'unread' && (t('chat.unread') || 'غير مقروءة')}
                            {f === 'support' && (t('chat.support') || 'الدعم')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contact Support Button */}
            <button
                onClick={handleContactSupport}
                className="mx-4 mt-3 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
                <Headphones className="w-5 h-5" />
                {t('chat.contactSupport') || 'تواصل مع الدعم'}
            </button>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto mt-3">
                {filteredConversations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>{t('chat.noConversations') || 'لا توجد محادثات'}</p>
                    </div>
                ) : (
                    filteredConversations.map(conv => {
                        const other = getOtherParticipant(conv);
                        const isOnline = onlineUsers.has(other._id);
                        const isActive = currentConversation?._id === conv._id;

                        return (
                            <div
                                key={conv._id}
                                onClick={() => selectConversation(conv)}
                                className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                            {other.profileImg ? (
                                                <img
                                                    src={other.profileImg.startsWith('http') ? other.profileImg : `${API_BASE_URL}/${other.profileImg}`}
                                                    alt={other.name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                other.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        {isOnline && (
                                            <Circle className="absolute bottom-0 left-0 w-3.5 h-3.5 text-green-500 fill-green-500" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {conv.type === 'admin_support' ? (
                                                    <span className="flex items-center gap-1">
                                                        <Headphones className="w-4 h-4 text-purple-500" />
                                                        {t('chat.adminSupport') || 'دعم المنصة'}
                                                    </span>
                                                ) : (
                                                    other.name
                                                )}
                                            </h3>
                                            <span className="text-xs text-gray-500">
                                                {formatTime(conv.lastMessageAt)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                                                {conv.lastMessage?.content || t('chat.noMessages') || 'لا توجد رسائل'}
                                            </p>
                                            {conv.myUnreadCount > 0 && (
                                                <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full">
                                                    {conv.myUnreadCount}
                                                </span>
                                            )}
                                        </div>

                                        {/* Role badge */}
                                        {other.role === 'manager' && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
                                                {t('chat.instructor') || 'مدرب'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;
