import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, X } from 'lucide-react';
import { useChatContext } from './ChatContext';
import { useTranslation } from 'react-i18next';

// Common emoji list
const EMOJI_LIST = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫',
    '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
    '👍', '👎', '👏', '🙌', '🤝', '💪', '✌️', '🤞', '🤟', '🤘',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '✅', '❌', '⭐', '🔥', '💯', '🎉', '🎊', '🏆', '📚', '💡',
];

interface ChatInputProps {
    onSend: (content: string) => void;
    initialValue?: string;
    isEditing?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, initialValue = '', isEditing = false }) => {
    const { t } = useTranslation();
    const { startTyping, stopTyping } = useChatContext();
    const [content, setContent] = useState(initialValue);
    const [showEmoji, setShowEmoji] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (initialValue) {
            setContent(initialValue);
            textareaRef.current?.focus();
        }
    }, [initialValue]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
        }
    }, [content]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);

        // Typing indicator
        startTyping();
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 2000);
    };

    const handleSend = () => {
        if (!content.trim()) return;

        onSend(content.trim());
        setContent('');
        stopTyping();
        setShowEmoji(false);

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const insertEmoji = (emoji: string) => {
        setContent(prev => prev + emoji);
        textareaRef.current?.focus();
    };

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            {/* Emoji Picker */}
            {showEmoji && (
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {t('chat.emoji') || 'الإيموجي'}
                        </span>
                        <button
                            onClick={() => setShowEmoji(false)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                    <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto">
                        {EMOJI_LIST.map((emoji, i) => (
                            <button
                                key={i}
                                onClick={() => insertEmoji(emoji)}
                                className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="flex items-end gap-2">
                {/* Emoji button */}
                <button
                    onClick={() => setShowEmoji(!showEmoji)}
                    className={`p-2 rounded-lg transition-colors ${showEmoji
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
                        }`}
                >
                    <Smile className="w-6 h-6" />
                </button>

                {/* Textarea */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder={t('chat.typeMessage') || 'اكتب رسالتك...'}
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl resize-none text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-36"
                        rows={1}
                    />
                </div>

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={!content.trim()}
                    className={`p-3 rounded-xl transition-all ${content.trim()
                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>

            {/* Edit mode indicator */}
            {isEditing && (
                <p className="text-xs text-yellow-600 mt-2">
                    {t('chat.pressEnterToSave') || 'اضغط Enter للحفظ أو Shift+Enter لسطر جديد'}
                </p>
            )}
        </div>
    );
};

export default ChatInput;
