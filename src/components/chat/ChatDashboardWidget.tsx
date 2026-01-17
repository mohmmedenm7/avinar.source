import React, { useState, useEffect, useRef } from 'react';
import {
    Send, Paperclip, Smile, Search, MoreVertical, Phone, Video,
    Clock, CheckCheck, Reply, Trash2, Flag, X,
    Plus, MessageCircle, ChevronLeft, ChevronRight,
    Inbox, FileText, MoreHorizontal, Filter,
    LayoutGrid, Star, Archive, ShieldAlert,
    Mic, Image as ImageIcon, Headphones
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { useChatContext, Message, Conversation } from './ChatContext';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

interface ChatDashboardWidgetProps {
    variant?: 'compact' | 'full';
    onClose?: () => void;
    targetUserId?: string;
}

const ChatDashboardWidget: React.FC<ChatDashboardWidgetProps> = ({
    variant = 'full',
    onClose,
    targetUserId
}) => {
    const { t, i18n } = useTranslation();
    const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'assigned' | 'archived'>('all');

    // UI States
    const [showInfoPanel, setShowInfoPanel] = useState(true);
    const [showMobileList, setShowMobileList] = useState(true);

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const token = localStorage.getItem('token');
    const {
        conversations,
        messages,
        currentConversation,
        selectConversation,
        sendMessage,
        deleteMessage,
        togglePin,
        editMessage
    } = useChatContext();

    const currentUserId = localStorage.getItem('userId');
    const dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';

    // Auto-scroll helper that only affects the chat container
    const scrollToBottom = (smooth = true) => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            messagesContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    };

    const createConversation = async (userId: string) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/v1/chat/conversations`, {
                participantId: userId
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (res.data?.data) {
                selectConversation(res.data.data);
            }
        } catch (err) {
            console.error("Failed to create conversation", err);
        }
    };

    // Auto-select conversation based on targetUserId
    useEffect(() => {
        if (!targetUserId || conversations.length === 0) return;

        const existingConv = conversations.find(c =>
            c.participants.some(p => p._id === targetUserId)
        );

        if (existingConv) {
            if (currentConversation?._id !== existingConv._id) {
                selectConversation(existingConv);
            }
        } else {
            createConversation(targetUserId);
        }
    }, [targetUserId, conversations]);

    // Simplified effect for conversation filtering
    useEffect(() => {
        let filtered = [...conversations];
        if (activeFilter === 'unread') {
            filtered = filtered.filter(c => (c.myUnreadCount || 0) > 0);
        }

        if (searchQuery) {
            filtered = filtered.filter(c => {
                const other = c.participants.find(p => p._id !== currentUserId);
                return other?.name.toLowerCase().includes(searchQuery.toLowerCase());
            });
        }

        filtered.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        setFilteredConversations(filtered);
    }, [conversations, activeFilter, searchQuery, currentUserId]);

    // Update message loading logic to use context
    useEffect(() => {
        if (currentConversation) {
            setTimeout(() => scrollToBottom(false), 100);
            if (window.innerWidth < 768) {
                setShowMobileList(false);
            }
        } else {
            setShowMobileList(true);
        }
    }, [currentConversation]);

    const handleSendMessage = (content: string, type?: string) => {
        if (!currentConversation) return;
        sendMessage(content, undefined, type);
        setTimeout(() => scrollToBottom(), 50);
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getOtherParticipant = (conv: Conversation) => conv.participants.find(p => p._id !== currentUserId);

    // --- RENDER HELPERS ---

    // Sidebar Item
    const FilterItem = ({ id, icon: Icon, label, count }: any) => (
        <button
            onClick={() => setActiveFilter(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-xl mb-1 ${activeFilter === id
                ? 'bg-[#6366f1] text-white shadow-lg shadow-indigo-500/30' // Active: Modern Indigo
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
        >
            <Icon size={18} />
            <span className="flex-1 text-start">{label}</span>
            {count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeFilter === id ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'}`}>
                    {count}
                </span>
            )}
        </button>
    );

    return (
        <div className="flex h-full bg-[#f3f4f6] dark:bg-gray-900 overflow-hidden font-sans rounded-3xl shadow-2xl border border-white/20" dir={dir}>



            {/* 2. CONVERSATION LIST */}
            <div className={`w-full md:w-80 lg:w-[360px] bg-white dark:bg-gray-800 flex flex-col border-r border-gray-100 dark:border-gray-700 ${!showMobileList ? 'hidden md:flex' : 'flex'}`}>
                {/* Search Header */}
                <div className="p-5 pb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 hidden md:block">{t('chat.chats') || 'Chats'}</h1>
                    <div className="relative group">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder={t('chat.searchPlaceholder') || 'Search...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-3 ps-10 pe-4 text-sm focus:ring-2 focus:ring-indigo-100 transition-all dark:text-white placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
                    {filteredConversations.map(conv => {
                        const other = getOtherParticipant(conv);
                        const isSelected = currentConversation?._id === conv._id;

                        return (
                            <button
                                key={conv._id}
                                onClick={() => selectConversation(conv)}
                                className={`w-full p-3 rounded-2xl flex items-start gap-3 transition-all duration-200 group ${isSelected
                                    ? 'bg-[#f4f7fe] dark:bg-gray-700/50'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/30 bg-white'
                                    }`}
                            >
                                <div className="relative shrink-0">
                                    <img
                                        src={other?.profileImg ? `${API_BASE_URL}/uploads/users/${other.profileImg}` : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(other?.name || 'User')}`}
                                        alt={other?.name}
                                        className="w-12 h-12 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
                                        crossOrigin="anonymous"
                                    />
                                    {other?.chatStatus === 'online' && (
                                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 text-start">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h3 className={`font-semibold text-sm truncate ${isSelected ? 'text-indigo-900' : 'text-gray-900'} dark:text-white`}>
                                            {other?.name}
                                        </h3>
                                        <span className="text-[10px] text-gray-400">{formatTime(conv.lastMessageAt)}</span>
                                    </div>
                                    <p className={`text-xs truncate leading-relaxed ${isSelected ? 'text-indigo-600/80 font-medium' : 'text-gray-500'}`}>
                                        {conv.lastMessage?.content || 'No messages yet'}
                                    </p>
                                </div>
                                {(conv.myUnreadCount || 0) > 0 && (
                                    <div className="shrink-0 self-center">
                                        <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg shadow-indigo-200">
                                            {conv.myUnreadCount}
                                        </span>
                                    </div>
                                )}
                            </button>
                        );
                    })
                    }
                </div>
            </div>

            {/* 3. MAIN CHAT AREA */}
            {currentConversation ? (
                <div className={`flex-1 flex flex-col bg-[#fafafa] dark:bg-[#111] relative ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm z-10">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => selectConversation(null as any)}
                                className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="relative">
                                <img
                                    src={getOtherParticipant(currentConversation)?.profileImg ? (getOtherParticipant(currentConversation)!.profileImg!.startsWith('http') ? getOtherParticipant(currentConversation)!.profileImg : `${API_BASE_URL}/${getOtherParticipant(currentConversation)!.profileImg}`) : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(getOtherParticipant(currentConversation)?.name || 'User')}`}
                                    className="w-10 h-10 rounded-full object-cover shadow-sm"
                                />
                                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${getOtherParticipant(currentConversation)?.chatStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                                    {getOtherParticipant(currentConversation)?.name}
                                </h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    {getOtherParticipant(currentConversation)?.chatStatus === 'online' ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Phone size={20} /></button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Video size={20} /></button>
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                            <button
                                onClick={() => setShowInfoPanel(!showInfoPanel)}
                                className={`p-2 rounded-lg transition-colors ${showInfoPanel ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100'}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-[#fafafa] to-[#ffffff] dark:from-[#111] dark:to-[#1a1a1a]">
                        {messages.length === 0 ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <Inbox size={48} className="mb-2 opacity-20" />
                                <p className="text-sm">لا توجد رسائل بعد</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.sender._id === currentUserId;
                                const isNextSame = messages[idx + 1]?.sender._id === msg.sender._id;

                                return (
                                    <MessageBubble
                                        key={msg._id}
                                        message={msg as any}
                                        isOwn={isMe}
                                        onReply={() => { }}
                                        onEdit={() => { }}
                                        onDelete={() => deleteMessage(msg._id)}
                                        onPin={() => togglePin(msg._id)}
                                        showAvatar={!isNextSame}
                                    />
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-100 dark:border-gray-700">
                        <ChatInput
                            onSend={handleSendMessage}
                        />
                    </div>
                </div>
            ) : (
                <div className={`flex-1 flex-col items-center justify-center bg-gray-50/50 hidden md:flex`}>
                    <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <MessageCircle size={64} className="text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Select a Conversation</h3>
                    <p className="text-gray-500 text-sm max-w-xs text-center">Choose a chat from the left list to start messaging.</p>
                </div>
            )}

            {/* 4. RIGHT INFO PANEL (Collapsible) */}
            {currentConversation && showInfoPanel && (
                <div className="hidden xl:flex w-80 bg-white dark:bg-gray-800 border-l border-gray-100 dark:border-gray-700 flex-col overflow-y-auto">
                    {/* User Profile */}
                    <div className="p-8 flex flex-col items-center border-b border-gray-100 dark:border-gray-700">
                        <img
                            src={getOtherParticipant(currentConversation)?.profileImg ? (getOtherParticipant(currentConversation)!.profileImg!.startsWith('http') ? getOtherParticipant(currentConversation)!.profileImg : `${API_BASE_URL}/${getOtherParticipant(currentConversation)!.profileImg}`) : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(getOtherParticipant(currentConversation)?.name || 'User')}`}
                            className="w-24 h-24 rounded-3xl object-cover shadow-lg mb-4 ring-4 ring-gray-50"
                        />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{getOtherParticipant(currentConversation)?.name}</h2>
                        <span className="text-sm text-gray-500 mb-4">{getOtherParticipant(currentConversation)?.role || 'User'}</span>

                        <div className="flex gap-3 w-full">
                            <button className="flex-1 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">Profile</button>
                            <button className="flex-1 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors">Call</button>
                        </div>
                    </div>

                    {/* General Info */}
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">General Info</h4>
                            <button className="p-1 hover:bg-gray-100 rounded"><MoreHorizontal size={14} /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><Inbox size={16} /></div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase">Email</p>
                                    <p className="text-sm font-medium text-gray-800 truncate w-40">{getOtherParticipant(currentConversation)?.email || 'hidden@email.com'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-500"><Phone size={16} /></div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase">Phone</p>
                                    <p className="text-sm font-medium text-gray-800">{getOtherParticipant(currentConversation)?.phone || '+1 234 567 890'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shared Files (Mock) */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shared Files</h4>
                            <button className="text-indigo-600 text-xs font-bold hover:underline">See All</button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors cursor-pointer group">
                                <div className="p-2.5 bg-red-100 text-red-500 rounded-lg"><FileText size={16} /></div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold text-gray-700 truncate">Project_brief.pdf</p>
                                    <p className="text-[10px] text-gray-400">2.4 MB • 12 Oct</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors cursor-pointer group">
                                <div className="p-2.5 bg-blue-100 text-blue-500 rounded-lg"><ImageIcon size={16} /></div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold text-gray-700 truncate">Screenshot_2024.png</p>
                                    <p className="text-[10px] text-gray-400">1.8 MB • Just now</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatDashboardWidget;
