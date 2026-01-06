import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  MessageSquare,
  Archive,
  RefreshCw,
  Download,
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { useTranslation } from 'react-i18next';

interface SupportTicket {
  _id: string;
  conversationId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profileImg?: string;
  };
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  subject?: string;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
  responseTime?: number; // in minutes
  sla?: {
    targetTime: number;
    exceeded: boolean;
  };
  unreadCount?: number;
}

const AdminSupportDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'sla' | 'priority'>('newest');
  const [showDetails, setShowDetails] = useState(false);
  const token = localStorage.getItem('token');
  const dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';

  // Fetch support tickets
  useEffect(() => {
    if (!token) return;
    fetchTickets();

    // Refresh every 30 seconds
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/chat/admin/support`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = tickets;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((t) =>
        t.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.userId.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((t) => t.priority === priorityFilter);
    }

    // Sorting
    if (sortBy === 'sla') {
      filtered = filtered.sort((a, b) => {
        const aExceeded = a.sla?.exceeded ? 1 : 0;
        const bExceeded = b.sla?.exceeded ? 1 : 0;
        return bExceeded - aExceeded;
      });
    } else if (sortBy === 'priority') {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      filtered = filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    } else {
      filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredTickets(filtered);
  }, [tickets, searchQuery, statusFilter, priorityFilter, sortBy]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: t('support.open') || 'Open',
      in_progress: t('support.inProgress') || 'In Progress',
      resolved: t('support.resolved') || 'Resolved',
      closed: t('support.closed') || 'Closed',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default:
        return '';
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/v1/chat/admin/support/${ticketId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTickets();
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900" dir={dir}>
      {/* Tickets List */}
      <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('support.tickets') || 'Support Tickets'}
            </h1>
            <button
              onClick={fetchTickets}
              disabled={loading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('support.search') || 'Search by name or email...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('support.allStatus') || 'All Status'}</option>
              <option value="open">{t('support.open') || 'Open'}</option>
              <option value="in_progress">{t('support.inProgress') || 'In Progress'}</option>
              <option value="resolved">{t('support.resolved') || 'Resolved'}</option>
              <option value="closed">{t('support.closed') || 'Closed'}</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('support.allPriority') || 'All Priority'}</option>
              <option value="critical">{t('support.critical') || 'Critical'}</option>
              <option value="high">{t('support.high') || 'High'}</option>
              <option value="medium">{t('support.medium') || 'Medium'}</option>
              <option value="low">{t('support.low') || 'Low'}</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">{t('support.newest') || 'Newest'}</option>
              <option value="sla">{t('support.slaAlerts') || 'SLA Alerts'}</option>
              <option value="priority">{t('support.priority') || 'Priority'}</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
              <div className="font-bold text-yellow-700 dark:text-yellow-300">
                {tickets.filter((t) => t.status === 'open').length}
              </div>
              <div className="text-yellow-600 dark:text-yellow-400">Open</div>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <div className="font-bold text-blue-700 dark:text-blue-300">
                {tickets.filter((t) => t.status === 'in_progress').length}
              </div>
              <div className="text-blue-600 dark:text-blue-400">In Progress</div>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <div className="font-bold text-green-700 dark:text-green-300">
                {tickets.filter((t) => t.status === 'resolved').length}
              </div>
              <div className="text-green-600 dark:text-green-400">Resolved</div>
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
              <div className="font-bold text-red-700 dark:text-red-300">
                {tickets.filter((t) => t.sla?.exceeded).length}
              </div>
              <div className="text-red-600 dark:text-red-400">SLA</div>
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {t('support.noTickets') || 'No tickets found'}
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <button
                key={ticket._id}
                onClick={() => {
                  setSelectedTicket(ticket);
                  setShowDetails(true);
                }}
                className={`w-full px-4 py-3 border-b border-gray-100 dark:border-gray-700 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  selectedTicket?._id === ticket._id
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getStatusIcon(ticket.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {ticket.userId.name}
                      </h3>
                      {ticket.sla?.exceeded && (
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
                      {ticket.userId.email}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                      {ticket.unreadCount! > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {ticket.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Ticket Details */}
      {selectedTicket && (
        <div className="hidden lg:flex flex-1 flex-col bg-white dark:bg-gray-800">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedTicket.subject || 'Support Request'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTicket.userId.name} • {selectedTicket.userId.email}
                </p>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getPriorityColor(selectedTicket.priority)}`}>
                  {selectedTicket.priority.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Status and SLA */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(selectedTicket.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">SLA</p>
                <p className={`text-sm font-medium ${selectedTicket.sla?.exceeded ? 'text-red-600' : 'text-green-600'}`}>
                  {selectedTicket.sla?.exceeded ? 'Exceeded' : 'On Track'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-start gap-3">
              <img
                src={selectedTicket.userId.profileImg || 'https://via.placeholder.com/40'}
                alt={selectedTicket.userId.name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {selectedTicket.userId.name}
                </p>
                <p className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 mt-1 text-sm max-w-xs">
                  {selectedTicket.lastMessage?.content || 'No message'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {selectedTicket.lastMessage?.createdAt
                    ? new Date(selectedTicket.lastMessage.createdAt).toLocaleString()
                    : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Reply Input */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <form className="flex gap-3">
              <input
                type="text"
                placeholder={t('support.typeReply') || 'Type your reply...'}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupportDashboard;
