import React, { useState } from 'react';
import { Check, CheckCheck, MoreVertical, Reply, Edit2, Trash2, Pin, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { API_BASE_URL } from '@/config/env';

interface Message {
    _id: string;
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

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    onReply: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onPin: () => void;
    showAvatar: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isOwn,
    onReply,
    onEdit,
    onDelete,
    onPin,
    showAvatar,
}) => {
    const { t } = useTranslation();
    const [showMenu, setShowMenu] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(message.content);
        setShowMenu(false);
    };

    // Emoji detection for larger display
    const isOnlyEmojis = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]+$/u.test(message.content);

    return (
        <div className={`flex ${isOwn ? 'justify-start' : 'justify-end'} group`}>
            {/* Avatar */}
            {!isOwn && showAvatar && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold ml-2 flex-shrink-0">
                    {message.sender.profileImg ? (
                        <img
                            src={message.sender.profileImg.startsWith('http') ? message.sender.profileImg : `${API_BASE_URL}/${message.sender.profileImg}`}
                            alt={message.sender.name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        message.sender.name.charAt(0).toUpperCase()
                    )}
                </div>
            )}
            {!isOwn && !showAvatar && <div className="w-8 ml-2" />}

            <div className={`max-w-[70%] ${isOwn ? 'order-1' : 'order-2'}`}>
                {/* Sender name for non-own messages */}
                {!isOwn && showAvatar && (
                    <p className="text-xs text-gray-500 mb-1 mr-3">
                        {message.sender.name}
                        {message.sender.role === 'manager' && (
                            <span className="mr-1 text-yellow-600">({t('chat.instructor') || 'مدرب'})</span>
                        )}
                    </p>
                )}

                {/* Reply preview */}
                {message.replyTo && (
                    <div className={`mb-1 px-3 py-1 rounded-lg text-xs ${isOwn
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-r-2 border-blue-500'
                        : 'bg-gray-100 dark:bg-gray-800 border-r-2 border-gray-400'
                        }`}>
                        <p className="font-medium text-gray-600 dark:text-gray-400">
                            {message.replyTo.sender.name}
                        </p>
                        <p className="text-gray-500 truncate">{message.replyTo.content}</p>
                    </div>
                )}

                {/* Message bubble */}
                <div
                    className={`relative px-4 py-2 rounded-2xl ${message.isDeleted
                        ? 'bg-gray-200 dark:bg-gray-700 italic text-gray-500'
                        : isOwn
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        } ${message.isPinned ? 'ring-2 ring-yellow-400' : ''}`}
                >
                    {message.isPinned && (
                        <Pin className="absolute -top-2 -left-2 w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}

                    {/* Content */}
                    <p className={`whitespace-pre-wrap break-words ${isOnlyEmojis ? 'text-4xl' : ''}`}>
                        {message.content}
                    </p>

                    {/* Meta info */}
                    <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                        <span>{formatTime(message.createdAt)}</span>
                        {message.isEdited && (
                            <span>({t('chat.edited') || 'معدل'})</span>
                        )}
                        {isOwn && (
                            message.isRead ? (
                                <CheckCheck className="w-4 h-4 text-blue-200" />
                            ) : (
                                <Check className="w-4 h-4 text-blue-200" />
                            )
                        )}
                    </div>

                    {/* Actions menu */}
                    {!message.isDeleted && (
                        <div className={`absolute top-0 ${isOwn ? 'left-full ml-1' : 'right-full mr-1'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-1 rounded-full bg-white dark:bg-gray-700 shadow hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                </button>

                                {showMenu && (
                                    <div className={`absolute top-full mt-1 ${isOwn ? 'left-0' : 'right-0'} w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50`}>
                                        <button
                                            onClick={() => { onReply(); setShowMenu(false); }}
                                            className="w-full px-3 py-2 text-right flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                                        >
                                            <Reply className="w-4 h-4" />
                                            {t('chat.reply') || 'رد'}
                                        </button>

                                        <button
                                            onClick={copyToClipboard}
                                            className="w-full px-3 py-2 text-right flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                                        >
                                            <Copy className="w-4 h-4" />
                                            {t('chat.copy') || 'نسخ'}
                                        </button>

                                        <button
                                            onClick={() => { onPin(); setShowMenu(false); }}
                                            className="w-full px-3 py-2 text-right flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                                        >
                                            <Pin className="w-4 h-4" />
                                            {message.isPinned ? (t('chat.unpin') || 'إلغاء التثبيت') : (t('chat.pin') || 'تثبيت')}
                                        </button>

                                        {isOwn && (
                                            <>
                                                <button
                                                    onClick={() => { onEdit(); setShowMenu(false); }}
                                                    className="w-full px-3 py-2 text-right flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    {t('chat.edit') || 'تعديل'}
                                                </button>

                                                <button
                                                    onClick={() => { onDelete(); setShowMenu(false); }}
                                                    className="w-full px-3 py-2 text-right flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 text-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    {t('chat.delete') || 'حذف'}
                                                </button>
                                            </>
                                        )}

                                        {message.isEdited && message.editHistory.length > 0 && (
                                            <button
                                                onClick={() => { setShowHistory(!showHistory); setShowMenu(false); }}
                                                className="w-full px-3 py-2 text-right flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                                            >
                                                {t('chat.viewHistory') || 'عرض السجل'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit history */}
                {showHistory && message.editHistory.length > 0 && (
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
                        <p className="font-medium mb-1 text-gray-600 dark:text-gray-400">
                            {t('chat.editHistory') || 'سجل التعديلات'}:
                        </p>
                        {message.editHistory.map((edit, i) => (
                            <div key={i} className="text-gray-500 border-b border-gray-200 dark:border-gray-700 py-1 last:border-0">
                                <p className="text-xs text-gray-400">{formatTime(edit.editedAt)}</p>
                                <p>{edit.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Own avatar */}
            {isOwn && showAvatar && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold mr-2 flex-shrink-0 order-2">
                    {message.sender.profileImg ? (
                        <img
                            src={message.sender.profileImg.startsWith('http') ? message.sender.profileImg : `${API_BASE_URL}/${message.sender.profileImg}`}
                            alt={message.sender.name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        message.sender.name.charAt(0).toUpperCase()
                    )}
                </div>
            )}
            {isOwn && !showAvatar && <div className="w-8 mr-2 order-2" />}
        </div>
    );
};

export default MessageBubble;
