import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Search, Plus, Flag, Phone, Video, MoreVertical } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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
  lastMessageAt: string;
  unreadCount?: number;
}

const FullScreenChatPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  const dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations
  useEffect(() => {
    if (!token) return;
    fetchConversations();
  }, [token]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    if (!token) return;
    setMessageLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/chat/conversations/${conversationId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 50 },
        }
      );
      setMessages(res.data?.data || []);

      // Mark as read
      await axios.post(
        `${API_BASE_URL}/api/v1/chat/conversations/${conversationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setMessageLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !token) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/chat/messages`,
        {
          conversationId: selectedConversation._id,
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

  // Search users
  useEffect(() => {
    if (!showNewChatModal) {
      setSearchQuery('');
      setUsers([]);
      return;
    }

    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (!token) return;
      setSearchLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/users`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { keyword: searchQuery },
        });
        const filtered = (res.data?.data || []).filter((u: any) => u._id !== currentUserId);
        setUsers(filtered);
      } catch (error) {
        console.error('Failed to search users:', error);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, showNewChatModal, token, currentUserId]);

  const handleCreateConversation = async (participantId: string) => {
    if (!token) return;
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/chat/conversations`,
        { participantId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newConv = res.data?.data;
      if (newConv) {
        setConversations([newConv, ...conversations]);
        setSelectedConversation(newConv);
        setShowNewChatModal(false);
        setSearchQuery('');
        setUsers([]);
        await fetchMessages(newConv._id);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleCreateAdminSupport = async () => {
    if (!token) return;
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/chat/admin-support`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newConv = res.data?.data;
      if (newConv) {
        const existingAdminSupport = conversations.find((c) => c.type === 'admin_support');
        if (existingAdminSupport) {
          setSelectedConversation(existingAdminSupport);
          await fetchMessages(existingAdminSupport._id);
        } else {
          setConversations([newConv, ...conversations]);
          setSelectedConversation(newConv);
          await fetchMessages(newConv._id);
        }
        setShowNewChatModal(false);
      }
    } catch (error) {
      console.error('Failed to create admin support:', error);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getOtherParticipant = () => {
    return selectedConversation?.participants?.find((p: any) => p._id !== currentUserId);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900" dir={dir}>
      {/* Conversations Sidebar */}
      <div className="w-full sm:w-80 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('chat.messages') || 'Messages'}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleCreateAdminSupport}
              className="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Flag className="w-4 h-4" />
              {t('chat.support') || 'Support'}
            </button>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('chat.new') || 'New'}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('chat.search') || 'Search...'}
              className="w-full pr-10 pl-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              {t('chat.loading') || 'Loading...'}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {t('chat.noConversations') || 'No conversations'}
            </div>
          ) : (
            conversations.map((conv) => {
              const other = conv.participants?.find((p) => p._id !== currentUserId);
              const isSelected = selectedConversation?._id === conv._id;

              return (
                <button
                  key={conv._id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full px-4 py-3 border-b border-gray-100 dark:border-gray-700 text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex gap-3">
                    {other?.profileImg && (
                      <img
                        src={other.profileImg}
                        alt={other?.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {other?.name || 'Unknown'}
                        </h3>
                        {conv.unreadCount! > 0 && (
                          <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conv.lastMessage?.content || t('chat.noMessages') || 'No messages'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden sm:flex flex-1 flex-col bg-white dark:bg-gray-800">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center gap-3">
                {getOtherParticipant()?.profileImg && (
                  <img
                    src={getOtherParticipant().profileImg}
                    alt={getOtherParticipant()?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getOtherParticipant()?.name || 'Unknown'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedConversation.type === 'admin_support'
                      ? t('chat.adminSupport') || 'Admin Support'
                      : selectedConversation.type === 'course'
                      ? t('chat.courseDiscussion') || 'Course Discussion'
                      : t('chat.directMessage') || 'Direct Message'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messageLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>{t('chat.noMessages') || 'No messages yet'}</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender._id === currentUserId;
                  return (
                    <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-3 max-w-xs ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isOwn && msg.sender.profileImg && (
                          <img
                            src={msg.sender.profileImg}
                            alt={msg.sender.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              isOwn
                                ? 'bg-blue-500 text-white rounded-br-none'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-right text-gray-500' : 'text-left text-gray-500'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('chat.typeMessage') || 'Type a message...'}
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>{t('chat.selectConversation') || 'Select a conversation to start'}</p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md mx-4 shadow-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('chat.newConversation') || 'New Conversation'}
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('chat.searchUsers') || 'Search users...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {searchLoading ? (
                  <p className="text-center py-4 text-gray-500">{t('chat.loading') || 'Loading...'}</p>
                ) : users.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">{t('chat.noUsers') || 'No users found'}</p>
                ) : (
                  users.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleCreateConversation(user._id)}
                      className="w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-left"
                    >
                      <img
                        src={user.profileImg || 'https://via.placeholder.com/40'}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.role === 'instructor' ? 'مدرب' : 'طالب'}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullScreenChatPage;
