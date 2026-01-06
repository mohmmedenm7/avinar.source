import React from 'react';
import { MessageCircle, Headphones } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/config/env';

interface ChatButtonProps {
    instructorId?: string;
    instructorName?: string;
    courseId?: string;
    variant?: 'icon' | 'full' | 'support';
    className?: string;
}

// Reusable button to start chat from course pages
const ChatButton: React.FC<ChatButtonProps> = ({
    instructorId,
    instructorName,
    courseId,
    variant = 'full',
    className = ''
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();



    const handleClick = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect to login
            navigate('/login');
            return;
        }

        try {
            if (variant === 'support') {
                // Create admin support conversation
                const response = await fetch(`${API_BASE_URL}/api/v1/chat/admin-support`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (data.status === 'success') {
                    navigate(`/chat?conversation=${data.data._id}`);
                }
            } else if (instructorId) {
                // Create direct conversation with instructor
                const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        participantId: instructorId,
                        relatedCourse: courseId
                    }),
                });
                const data = await response.json();
                if (data.status === 'success') {
                    navigate(`/chat?conversation=${data.data._id}`);
                }
            }
        } catch (error) {
            console.error('Failed to start chat:', error);
        }
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleClick}
                className={`p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors ${className}`}
                title={t('chat.messageInstructor') || 'راسل المدرب'}
            >
                <MessageCircle className="w-5 h-5" />
            </button>
        );
    }

    if (variant === 'support') {
        return (
            <button
                onClick={handleClick}
                className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity ${className}`}
            >
                <Headphones className="w-5 h-5" />
                {t('chat.contactSupport') || 'تواصل مع الدعم'}
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${className}`}
        >
            <MessageCircle className="w-5 h-5" />
            {instructorName
                ? `${t('chat.messageInstructor') || 'راسل'} ${instructorName}`
                : (t('chat.startChat') || 'بدء المحادثة')}
        </button>
    );
};

export default ChatButton;
