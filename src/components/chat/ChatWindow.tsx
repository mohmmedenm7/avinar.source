import React, { useEffect, useRef, useState } from 'react';
import { useChatContext } from './ChatContext';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import {
    MoreVertical,
    Phone,
    Video,
    Pin,
    Search,
    Flag,
    Ban,
    Circle,
    ChevronDown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '@/config/env';

const ChatWindow: React.FC = () => {
    const { t } = useTranslation();
    const {
        currentConversation,
        messages,
        pinnedMessages,
        typingUsers,
        onlineUsers,
        markAsRead,
        sendMessage,
        editMessage,
        deleteMessage,
        togglePin,
        blockUser,
        reportUser,
    } = useChatContext();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [showPinned, setShowPinned] = useState(false);
    const [replyTo, setReplyTo] = useState<typeof messages[0] | null>(null);
    const [editingMessage, setEditingMessage] = useState<typeof messages[0] | null>(null);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mark as read when viewing
    useEffect(() => {
        if (currentConversation && messages.length > 0) {
            const timer = setTimeout(() => markAsRead(), 500);
            return () => clearTimeout(timer);
        }
    }, [currentConversation, messages, markAsRead]);

    if (!currentConversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <img src="/chat-illustration.svg" alt="" className="w-16 h-16 opacity-80" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                        {t('chat.selectConversation') || 'اختر محادثة للبدء'}
                    </h3>
                    <p className="text-gray-500 mt-2">
                        {t('chat.selectHint') || 'اختر محادثة من القائمة أو ابدأ محادثة جديدة'}
                    </p>
                </div>
            </div>
        );
    }

    const currentUserId = localStorage.getItem('userId');
    const otherParticipant = currentConversation.participants.find(
        p => p._id !== currentUserId
    ) || currentConversation.participants[0];

    const isOnline = onlineUsers.has(otherParticipant._id);
    const typingUser = Array.from(typingUsers.values()).find(
        u => u.conversationId === currentConversation._id
    );

    const handleSend = (content: string) => {
        if (editingMessage) {
            editMessage(editingMessage._id, content);
            setEditingMessage(null);
        } else {
            sendMessage(content, replyTo?._id);
            setReplyTo(null);
        }
    };

    const handleReport = async () => {
        const reason = prompt(t('chat.reportReason') || 'سبب التبليغ:');
        if (reason) {
            await reportUser({
                reportedUserId: otherParticipant._id,
                reason: 'other',
                description: reason
            });
            alert(t('chat.reportSubmitted') || 'تم إرسال التبليغ');
            setShowMenu(false);
        }
    };

    const handleBlock = async () => {
        if (confirm(t('chat.confirmBlock') || 'هل تريد حظر هذا المستخدم؟')) {
            await blockUser(otherParticipant._id);
            alert(t('chat.userBlocked') || 'تم حظر المستخدم');
            setShowMenu(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-900">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {otherParticipant.profileImg ? (
                                <img
                                    src={otherParticipant.profileImg.startsWith('http') ? otherParticipant.profileImg : `${API_BASE_URL}/${otherParticipant.profileImg}`}
                                    alt={otherParticipant.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                otherParticipant.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        {isOnline && (
                            <Circle className="absolute bottom-0 left-0 w-3 h-3 text-green-500 fill-green-500" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {currentConversation.type === 'admin_support'
                                ? (t('chat.adminSupport') || 'دعم المنصة')
                                : otherParticipant.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {typingUser ? (
                                <span className="text-blue-500">{t('chat.typing') || 'يكتب...'}</span>
                            ) : isOnline ? (
                                <span className="text-green-500">{t('chat.online') || 'متصل'}</span>
                            ) : (
                                t('chat.offline') || 'غير متصل'
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {pinnedMessages.length > 0 && (
                        <button
                            onClick={() => setShowPinned(!showPinned)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                        >
                            <Pin className="w-5 h-5 text-yellow-500" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                                {pinnedMessages.length}
                            </span>
                        </button>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>

                        {showMenu && (
                            <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                                <button
                                    onClick={handleReport}
                                    className="w-full px-4 py-2 text-right flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                >
                                    <Flag className="w-4 h-4" />
                                    {t('chat.report') || 'تبليغ'}
                                </button>
                                <button
                                    onClick={handleBlock}
                                    className="w-full px-4 py-2 text-right flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
                                >
                                    <Ban className="w-4 h-4" />
                                    {t('chat.block') || 'حظر'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pinned Messages Bar */}
            {showPinned && pinnedMessages.length > 0 && (
                <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 text-sm">
                        <Pin className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800 dark:text-yellow-300">
                            {t('chat.pinnedMessages') || 'الرسائل المثبتة'}:
                        </span>
                    </div>
                    <div className="mt-2 space-y-1">
                        {pinnedMessages.slice(0, 3).map(msg => (
                            <p key={msg._id} className="text-sm text-yellow-700 dark:text-yellow-400 truncate">
                                {msg.sender.name}: {msg.content}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <MessageBubble
                        key={message._id}
                        message={message}
                        isOwn={message.sender._id === currentUserId}
                        onReply={() => setReplyTo(message)}
                        onEdit={() => setEditingMessage(message)}
                        onDelete={() => deleteMessage(message._id)}
                        onPin={() => togglePin(message._id)}
                        showAvatar={
                            index === 0 || messages[index - 1]?.sender._id !== message.sender._id
                        }
                    />
                ))}

                {/* Typing indicator */}
                {typingUser && (
                    <div className="flex items-center gap-2 text-gray-500">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm">{typingUser.userName} {t('chat.isTyping') || 'يكتب...'}</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {replyTo && (
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            {t('chat.replyingTo') || 'الرد على'} {replyTo.sender.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{replyTo.content}</p>
                    </div>
                    <button onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-gray-700">×</button>
                </div>
            )}

            {/* Edit Preview */}
            {editingMessage && (
                <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800 flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            {t('chat.editing') || 'تعديل الرسالة'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{editingMessage.content}</p>
                    </div>
                    <button onClick={() => setEditingMessage(null)} className="text-gray-500 hover:text-gray-700">×</button>
                </div>
            )}

            {/* Input */}
            <ChatInput
                onSend={handleSend}
                initialValue={editingMessage?.content}
                isEditing={!!editingMessage}
            />
        </div>
    );
};

export default ChatWindow;
