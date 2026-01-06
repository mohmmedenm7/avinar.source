import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { useNavigate } from 'react-router-dom';

interface MessagesFloatingButtonProps {
  onOpenChat?: () => void;
}

const MessagesFloatingButton: React.FC<MessagesFloatingButtonProps> = ({ onOpenChat }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    // Fetch unread count
    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const conversations = res.data?.data || [];
        const total = conversations.reduce((sum: number, conv: any) => sum + (conv.unreadCount || 0), 0);
        setUnreadCount(total);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [token]);

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Menu */}
        {showMenu && (
          <div className="absolute bottom-20 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden min-w-56 border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">Messages</h3>
            </div>

            <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
              <button
                onClick={() => {
                  navigate('/chat');
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left text-gray-900 dark:text-white text-sm font-medium"
              >
                📨 View All Chats
              </button>

              <button
                onClick={() => {
                  navigate('/chat?action=support');
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left text-gray-900 dark:text-white text-sm font-medium"
              >
                🚩 Contact Support
              </button>

              <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>

              {unreadCount > 0 && (
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="relative p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          title="Messages"
        >
          <MessageCircle className="w-6 h-6" />

          {/* Badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-6 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </button>
      </div>

      {/* Backdrop */}
      {showMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
};

export default MessagesFloatingButton;
