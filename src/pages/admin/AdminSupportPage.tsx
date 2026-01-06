// AdminSupportPage.tsx - صفحة دعم مستقلة للأدمن (Helpdesk Style)
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import {
    MessageCircle,
    Search,
    Filter,
    Archive,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Send,
    User,
    MoreVertical,
    RefreshCw,
    ArrowLeft,
    Inbox,
    Users,
    Timer,
    BarChart3,
    Star,
    Flag,
    Tag,
    Paperclip,
    Smile,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SupportTicket {
    _id: string;
    participants: {
        _id: string;
        name: string;
        email: string;
        profileImg?: string;
        role: string;
    }[];
    type: string;
    supportStatus: 'open' | 'in_progress' | 'resolved' | 'closed';
    lastMessage?: {
        content: string;
        createdAt: string;
    };
    lastMessageAt: string;
    isArchived: boolean;
    assignedAdmin?: {
        _id: string;
        name: string;
    };
    createdAt: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface Message {
    _id: string;
    content: string;
    sender: {
        _id: string;
        name: string;
        profileImg?: string;
        role: string;
    };
    createdAt: string;
    readBy?: string[];
}

type FilterStatus = 'all' | 'open' | 'in_progress' | 'resolved' | 'closed' | 'archived';

const AdminSupportPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';
    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('userId');

    // State
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [newMessage, setNewMessage] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        avgResponseTime: '0m',
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch support tickets
    const fetchTickets = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/chat/admin/support`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res.data?.data || [];
            setTickets(data);

            // Calculate stats
            setStats({
                total: data.length,
                open: data.filter((t: SupportTicket) => t.supportStatus === 'open').length,
                inProgress: data.filter((t: SupportTicket) => t.supportStatus === 'in_progress').length,
                resolved: data.filter((t: SupportTicket) => t.supportStatus === 'resolved' || t.supportStatus === 'closed').length,
                avgResponseTime: '15m', // Mock - would calculate from actual data
            });
        } catch (error) {
            console.error('Failed to fetch support tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages for selected ticket
    const fetchMessages = async (ticketId: string) => {
        if (!token) return;
        setMessagesLoading(true);
        try {
            const res = await axios.get(
                `${API_BASE_URL}/api/v1/chat/conversations/${ticketId}/messages`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { limit: 100 },
                }
            );
            setMessages(res.data?.data || []);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setMessagesLoading(false);
        }
    };

    // Send message
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedTicket || !token) return;

        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/v1/chat/messages`,
                {
                    conversationId: selectedTicket._id,
                    content: newMessage,
                    messageType: 'text',
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages([...messages, res.data?.data]);
            setNewMessage('');
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    // Update ticket status
    const handleUpdateStatus = async (ticketId: string, status: string) => {
        if (!token) return;
        try {
            await axios.put(
                `${API_BASE_URL}/api/v1/chat/admin/support/${ticketId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTickets();
            if (selectedTicket?._id === ticketId) {
                setSelectedTicket({ ...selectedTicket, supportStatus: status as any });
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    // Archive ticket
    const handleArchive = async (ticketId: string) => {
        if (!token) return;
        try {
            await axios.put(
                `${API_BASE_URL}/api/v1/chat/conversations/${ticketId}/archive`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTickets();
            if (selectedTicket?._id === ticketId) {
                setSelectedTicket(null);
            }
        } catch (error) {
            console.error('Failed to archive:', error);
        }
    };

    // Filter tickets
    const filteredTickets = tickets.filter((ticket) => {
        // Search filter
        const user = ticket.participants[0];
        const matchesSearch =
            !searchQuery ||
            user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        if (filterStatus === 'archived') return ticket.isArchived && matchesSearch;
        if (filterStatus === 'all') return !ticket.isArchived && matchesSearch;
        return ticket.supportStatus === filterStatus && !ticket.isArchived && matchesSearch;
    });

    // Initial load
    useEffect(() => {
        fetchTickets();
    }, [token]);

    // Load messages when ticket selected
    useEffect(() => {
        if (selectedTicket) {
            fetchMessages(selectedTicket._id);
            // Auto-update status to in_progress if it was open
            if (selectedTicket.supportStatus === 'open') {
                handleUpdateStatus(selectedTicket._id, 'in_progress');
            }
        }
    }, [selectedTicket?._id]);

    // Format time
    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return t('chat.now') || 'الآن';
        if (diffMins < 60) return `${diffMins}${t('chat.minuteShort') || 'د'}`;
        if (diffHours < 24) return `${diffHours}${t('chat.hourShort') || 'س'}`;
        return `${diffDays}${t('chat.dayShort') || 'ي'}`;
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'open':
                return { label: t('support.new') || 'جديد', color: 'bg-green-100 text-green-700 border-green-200', icon: AlertCircle };
            case 'in_progress':
                return { label: t('support.inProgress') || 'قيد المعالجة', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock };
            case 'resolved':
                return { label: t('support.resolved') || 'تم الحل', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 };
            case 'closed':
                return { label: t('support.closed') || 'مغلق', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle };
            default:
                return { label: status, color: 'bg-gray-100 text-gray-700', icon: MessageCircle };
        }
    };

    const getUser = (ticket: SupportTicket) => {
        return ticket.participants?.find(p => p.role !== 'admin') || ticket.participants[0];
    };

    return (
        <div className="flex h-screen bg-gray-100 pt-20" dir={dir}>
            {/* Left Panel - Ticket List */}
            <div className="w-[400px] bg-white border-e border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20"
                                onClick={() => navigate('/AdminDashboard')}
                            >
                                {dir === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-white">{t('support.helpdesk') || 'مركز الدعم'}</h1>
                                <p className="text-sm text-white/70">{t('support.manageTickets') || 'إدارة التذاكر والمحادثات'}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20"
                            onClick={fetchTickets}
                        >
                            <RefreshCw className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-2 mt-4">
                        <div className="bg-white/20 backdrop-blur rounded-lg p-2 text-center">
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                            <p className="text-[10px] text-white/70">{t('support.total') || 'الكل'}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-lg p-2 text-center">
                            <p className="text-2xl font-bold text-green-300">{stats.open}</p>
                            <p className="text-[10px] text-white/70">{t('support.new') || 'جديد'}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-lg p-2 text-center">
                            <p className="text-2xl font-bold text-yellow-300">{stats.inProgress}</p>
                            <p className="text-[10px] text-white/70">{t('support.pending') || 'معلق'}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-lg p-2 text-center">
                            <p className="text-2xl font-bold text-blue-300">{stats.resolved}</p>
                            <p className="text-[10px] text-white/70">{t('support.done') || 'منتهي'}</p>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="p-4 border-b border-gray-100 space-y-3">
                    <div className="relative">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder={t('support.searchTickets') || 'ابحث عن تذكرة...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="ps-10 bg-gray-50 border-gray-200"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {[
                            { key: 'all', label: t('support.all') || 'الكل', icon: Inbox },
                            { key: 'open', label: t('support.new') || 'جديد', icon: AlertCircle },
                            { key: 'in_progress', label: t('support.inProgress') || 'قيد', icon: Clock },
                            { key: 'resolved', label: t('support.resolved') || 'محلول', icon: CheckCircle2 },
                            { key: 'archived', label: t('support.archived') || 'أرشيف', icon: Archive },
                        ].map(({ key, label, icon: Icon }) => (
                            <Button
                                key={key}
                                variant={filterStatus === key ? 'default' : 'outline'}
                                size="sm"
                                className={`flex-shrink-0 ${filterStatus === key ? 'bg-blue-600' : ''}`}
                                onClick={() => setFilterStatus(key as FilterStatus)}
                            >
                                <Icon className="w-3 h-3 me-1" />
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Ticket List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-gray-500">
                            <RefreshCw className="w-5 h-5 animate-spin me-2" />
                            {t('common.loading') || 'جاري التحميل...'}
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <Inbox className="w-12 h-12 mb-2" />
                            <p>{t('support.noTickets') || 'لا توجد تذاكر'}</p>
                        </div>
                    ) : (
                        filteredTickets.map((ticket) => {
                            const user = getUser(ticket);
                            const statusConfig = getStatusConfig(ticket.supportStatus);
                            const isSelected = selectedTicket?._id === ticket._id;

                            return (
                                <div
                                    key={ticket._id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-s-4 border-s-blue-600' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Avatar className="w-10 h-10 flex-shrink-0">
                                            <AvatarImage src={user?.profileImg} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                                {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">{user?.name}</h3>
                                                <span className="text-xs text-gray-400 flex-shrink-0">
                                                    {formatTime(ticket.lastMessageAt)}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 truncate mb-2">
                                                {ticket.lastMessage?.content || t('support.noMessages') || 'لا توجد رسائل'}
                                            </p>

                                            <div className="flex items-center gap-2">
                                                <Badge className={`text-[10px] px-2 py-0.5 ${statusConfig.color} border`}>
                                                    <statusConfig.icon className="w-3 h-3 me-1" />
                                                    {statusConfig.label}
                                                </Badge>
                                                <span className="text-[10px] text-gray-400">
                                                    {user?.role === 'manager' ? '🎓 مدرب' : '👤 طالب'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Panel - Chat View */}
            {selectedTicket ? (
                <div className="flex-1 flex flex-col bg-white">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={getUser(selectedTicket)?.profileImg} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                    {getUser(selectedTicket)?.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-bold text-gray-900">{getUser(selectedTicket)?.name}</h2>
                                <p className="text-sm text-gray-500">{getUser(selectedTicket)?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Status Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className={getStatusConfig(selectedTicket.supportStatus).color}>
                                        {getStatusConfig(selectedTicket.supportStatus).label}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(selectedTicket._id, 'open')}>
                                        <AlertCircle className="w-4 h-4 me-2 text-green-600" />
                                        {t('support.new') || 'جديد'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(selectedTicket._id, 'in_progress')}>
                                        <Clock className="w-4 h-4 me-2 text-yellow-600" />
                                        {t('support.inProgress') || 'قيد المعالجة'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(selectedTicket._id, 'resolved')}>
                                        <CheckCircle2 className="w-4 h-4 me-2 text-blue-600" />
                                        {t('support.resolved') || 'تم الحل'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(selectedTicket._id, 'closed')}>
                                        <XCircle className="w-4 h-4 me-2 text-gray-600" />
                                        {t('support.closed') || 'مغلق'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* More Options */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleArchive(selectedTicket._id)}>
                                        <Archive className="w-4 h-4 me-2" />
                                        {t('support.archive') || 'أرشفة'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Flag className="w-4 h-4 me-2" />
                                        {t('support.markPriority') || 'تحديد أولوية'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Tag className="w-4 h-4 me-2" />
                                        {t('support.addTag') || 'إضافة وسم'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messagesLoading ? (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <RefreshCw className="w-5 h-5 animate-spin me-2" />
                                {t('common.loading') || 'جاري التحميل...'}
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <MessageCircle className="w-16 h-16 mb-4" />
                                <p>{t('chat.noMessages') || 'لا توجد رسائل'}</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isAdmin = msg.sender?.role === 'admin';
                                return (
                                    <div
                                        key={msg._id}
                                        className={`flex gap-3 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {!isAdmin && (
                                            <Avatar className="w-8 h-8 flex-shrink-0">
                                                <AvatarImage src={msg.sender?.profileImg} />
                                                <AvatarFallback className="bg-blue-500 text-white text-sm">
                                                    {msg.sender?.name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}

                                        <div className={`max-w-md ${isAdmin ? 'order-1' : ''}`}>
                                            <div
                                                className={`px-4 py-3 rounded-2xl ${isAdmin
                                                    ? 'bg-blue-600 text-white rounded-br-none'
                                                    : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                                                    }`}
                                            >
                                                <p className="text-sm">{msg.content}</p>
                                            </div>
                                            <p className={`text-xs text-gray-400 mt-1 ${isAdmin ? 'text-end' : ''}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>

                                        {isAdmin && (
                                            <Avatar className="w-8 h-8 flex-shrink-0 order-2">
                                                <AvatarImage src={msg.sender?.profileImg} />
                                                <AvatarFallback className="bg-purple-500 text-white text-sm">
                                                    A
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex items-end gap-3">
                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                                <Paperclip className="w-5 h-5 text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                                <Smile className="w-5 h-5 text-gray-500" />
                            </Button>

                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder={t('chat.typeMessage') || 'اكتب رسالتك...'}
                                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl resize-none max-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={1}
                            />

                            <Button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6"
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Quick Replies */}
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                            {[
                                t('support.quickReply1') || 'شكراً لتواصلك معنا',
                                t('support.quickReply2') || 'سيتم الرد قريباً',
                                t('support.quickReply3') || 'تم حل المشكلة',
                                t('support.quickReply4') || 'هل تحتاج مساعدة أخرى؟',
                            ].map((reply, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    className="flex-shrink-0 text-xs"
                                    onClick={() => setNewMessage(reply)}
                                >
                                    {reply}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                // Empty State
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <MessageCircle className="w-16 h-16" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-600 mb-2">
                        {t('support.selectTicket') || 'اختر تذكرة للبدء'}
                    </h2>
                    <p className="text-sm max-w-xs text-center">
                        {t('support.selectTicketHint') || 'اختر تذكرة من القائمة للرد على استفسارات المستخدمين'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminSupportPage;
