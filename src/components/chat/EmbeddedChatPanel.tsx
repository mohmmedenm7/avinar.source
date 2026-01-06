import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2, Maximize2, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { useTranslation } from 'react-i18next';

interface EmbeddedChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullScreen: () => void;
  conversationId?: string;
  courseId?: string;
}

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    profileImg?: string;
  };
  createdAt: string;
  readBy?: string[];
}

interface Conversation {
  _id: string;
  participants: any[];
  type: 'direct' | 'admin_support' | 'course';
  lastMessage?: Message;
  unreadCount?: number;
}

const EmbeddedChatPanel: React.FC<EmbeddedChatPanelProps> = ({
  isOpen,
  onClose,
  onOpenFullScreen,
  conversationId,
  courseId,
}) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('token');
  const dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversation and messages
  useEffect(() => {
    if (!isOpen || !conversationId || !token) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [convRes, msgRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/v1/chat/conversations/${conversationId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/v1/chat/conversations/${conversationId}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: 30 },
          }),
        ]);

        setConversation(convRes.data?.data);
        setMessages(msgRes.data?.data || []);

        // Mark as read
        await axios.post(
          `${API_BASE_URL}/api/v1/chat/conversations/${conversationId}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Failed to fetch chat data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, conversationId, token]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !token) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/chat/messages`,
        {
          conversationId,
          content: newMessage,
          messageType: 'text',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([...messages, res.data?.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!isOpen) return null;

  const getOtherParticipant = () => {
    const currentUserId = localStorage.getItem('userId');
    return conversation?.participants?.find((p: any) => p._id !== currentUserId);
  };

  const otherParticipant = getOtherParticipant();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Chat Panel */}
      <div
        className={`
          fixed bottom-0 right-0 md:absolute md:bottom-auto md:right-auto
          w-full md:w-96 md:h-96
          bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl
          shadow-2xl z-50
          flex flex-col
          transition-all duration-300
          ${isMinimized ? 'h-16' : 'h-screen md:h-96'}
          md:${isMinimized ? 'h-16' : 'h-96'}
        `}
        dir={dir}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/30 rounded-t-2xl md:rounded-t-2xl">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {otherParticipant?.profileImg && (
              <img
                src={otherParticipant.profileImg}
                alt={otherParticipant.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {otherParticipant?.name || t('chat.support') || 'Support'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {conversation?.type === 'admin_support' ? t('chat.adminSupport') : t('chat.message')}
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            {/* Minimize Button */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={isMinimized ? t('chat.expand') : t('chat.minimize')}
            >
              {isMinimized ? (
                <Maximize2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Minimize2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Full Screen Button */}
            <button
              onClick={onOpenFullScreen}
              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors hidden md:block"
              title={t('chat.fullScreen')}
            >
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={t('chat.close')}
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>{t('chat.noMessages') || 'No messages yet'}</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender._id === localStorage.getItem('userId');
                  return (
                    <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`
                          max-w-xs px-4 py-2 rounded-lg
                          ${isOwn
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                          }
                        `}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('chat.typeMessage') || 'Type a message...'}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
};

export default EmbeddedChatPanel;
