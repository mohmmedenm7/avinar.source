import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, X, Mic, StopCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useChatContext } from './ChatContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';

// Common emoji list
const EMOJI_LIST = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫',
    '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
    '👍', '👎', '👏', '🙌', '🤝', '💪', '✌️', '🤞', '🤟', '🤘',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '✅', '❌', '⭐', '🔥', '💯', '🎉', '🎊', '🏆', '📚', '💡',
    '👋', '✋', '🖐️', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘',
    '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊',
    '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️',
    '🍎', '🍌', '🍕', '🍔', '🍟', '🍦', '🍩', '🍪', '☕', '🥤',
    '⚽', '🏀', '🎮', '🎨', '🎬', '🎹', '🎸', '🎺', '🎻', '🎤',
];

interface ChatInputProps {
    onSend: (content: string, type?: string) => void;
    initialValue?: string;
    isEditing?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, initialValue = '', isEditing = false }) => {
    const { t } = useTranslation();
    const { startTyping, stopTyping } = useChatContext();
    const [content, setContent] = useState(initialValue);
    const [showEmoji, setShowEmoji] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

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

    // Voice Recording Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setIsRecording(true);
            setRecordingDuration(0);
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Failed to start recording:', err);
            // Handle permission error
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setAudioBlob(null);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSendAudio = async () => {
        if (!audioBlob) return;

        const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/api/v1/chat/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            });

            if (response.data.status === 'success') {
                onSend(response.data.url, 'audio');
                setAudioBlob(null);
            }
        } catch (error) {
            console.error('Audio upload error:', error);
            toast({
                title: t('chat.uploadError') || 'خطأ في رفع التسجيل',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limit file size (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: t('chat.fileTooLarge') || 'الملف كبير جداً',
                description: t('chat.maxSize') || 'أقصى حجم مسموح به هو 5 ميجابايت',
                variant: 'destructive',
            });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/api/v1/chat/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            });

            if (response.data.status === 'success') {
                onSend(response.data.url, response.data.messageType);
            }
        } catch (error) {
            console.error('File upload error:', error);
            toast({
                title: t('chat.uploadFailed') || 'فشل رفع الملف',
                description: t('chat.uploadError') || 'حدث خطأ أثناء رفع الملف، يرجى المحاولة مرة أخرى',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
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
                {isRecording ? (
                    <div className="flex-1 flex items-center justify-between bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-2xl animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                            <span className="text-red-600 font-mono font-medium">
                                {formatDuration(recordingDuration)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={cancelRecording}
                                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={stopRecording}
                                className="p-2 text-red-600 hover:scale-110 transition-transform"
                            >
                                <StopCircle className="w-8 h-8" />
                            </button>
                        </div>
                    </div>
                ) : audioBlob ? (
                    <div className="flex-1 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-2xl">
                        <div className="flex items-center gap-3 text-blue-600">
                            <Mic className="w-5 h-5" />
                            <span className="text-sm font-medium">تسجيل صوتي جاهز</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setAudioBlob(null)}
                                className="text-sm text-gray-500 hover:text-red-600"
                            >
                                {t('common.cancel') || 'إلغاء'}
                            </button>
                            <button
                                onClick={handleSendAudio}
                                className="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600"
                            >
                                {t('chat.send') || 'إرسال'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
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

                        <button
                            className={`p-2 rounded-lg transition-colors ${isUploading ? 'animate-spin' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            <Paperclip className="w-6 h-6" />
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,audio/*,video/*,application/pdf"
                        />

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

                        {/* Record or Send button */}
                        {!content.trim() ? (
                            <button
                                onClick={startRecording}
                                className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
                            >
                                <Mic className="w-6 h-6" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSend}
                                className="p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        )}
                    </>
                )}
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
