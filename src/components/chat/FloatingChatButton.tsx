// FloatingChatButton.tsx - زر شات عائم يظهر في الزاوية السفلية
import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Headphones, Send, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from './ChatContext';
import { API_BASE_URL } from '@/config/env';

interface FloatingChatButtonProps {
    variant?: 'default' | 'support' | 'combined';
    position?: 'bottom-right' | 'bottom-left';
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
    variant = 'combined',
    position = 'bottom-right'
}) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';

    // Fetch unread count
    useEffect(() => {
        if (!token) return;

        const fetchUnread = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/chat/conversations`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.status === 'success') {
                    const total = (data.data || []).reduce((sum: number, conv: any) =>
                        sum + (conv.myUnreadCount || 0), 0
                    );
                    setUnreadCount(total);
                }
            } catch (error) {
                console.error('Failed to fetch unread:', error);
            }
        };

        fetchUnread();
        // Refresh every minute
        const interval = setInterval(fetchUnread, 60000);
        return () => clearInterval(interval);
    }, [token]);

    // Handle chat navigation
    const handleChatClick = () => {
        navigate('/chat');
    };

    // Handle support request
    const handleSupportClick = async () => {
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/chat/admin-support`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status === 'success') {
                navigate(`/chat?conversation=${data.data._id}`);
            }
        } catch (error) {
            console.error('Failed to create support:', error);
        }
    };

    // Handle admin dashboard navigation
    const handleAdminSupportClick = () => {
        navigate('/admin/support');
    };

    // Don't show if not logged in
    if (!token) return null;

    const positionClasses = position === 'bottom-right'
        ? 'bottom-6 end-6'
        : 'bottom-6 start-6';

    return (
        <div className={`fixed ${positionClasses} z-50 flex flex-col items-end gap-3`} dir={dir}>
            {/* Expanded Menu */}
            {isOpen && (
                <div className="flex flex-col gap-2 mb-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                    {/* Messages Button */}
                    <button
                        onClick={handleChatClick}
                        className="group flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
                    >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-start">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {t('chat.messages') || 'الرسائل'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {unreadCount > 0
                                    ? `${unreadCount} ${t('chat.unread') || 'غير مقروءة'}`
                                    : t('chat.noNewMessages') || 'لا توجد رسائل جديدة'
                                }
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </div>
                        )}
                    </button>

                    {/* Support Button (for users) */}
                    {role !== 'admin' && (
                        <button
                            onClick={handleSupportClick}
                            className="group flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
                        >
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                <Headphones className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-start">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {t('chat.contactSupport') || 'تواصل مع الدعم'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {t('chat.supportDescription') || 'نحن هنا لمساعدتك'}
                                </p>
                            </div>
                        </button>
                    )}

                    {/* Admin Support Center (for admin) */}
                    {role === 'admin' && (
                        <button
                            onClick={handleAdminSupportClick}
                            className="group flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
                        >
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                                <Headphones className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-start">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {t('dashboard.helpdesk') || 'مركز الدعم الفني'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {t('support.manageTickets') || 'إدارة تذاكر الدعم'}
                                </p>
                            </div>
                        </button>
                    )}
                </div>
            )}

            {/* Main Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen
                        ? 'bg-gray-800 dark:bg-gray-700'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600'
                    }`}
            >
                {isOpen ? (
                    <X className="w-7 h-7 text-white" />
                ) : (
                    <>
                        <MessageCircle className="w-7 h-7 text-white" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </>
                )}
            </button>
        </div>
    );
};

export default FloatingChatButton;
