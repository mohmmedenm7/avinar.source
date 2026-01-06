import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    MessageCircle,
    AlertTriangle,
    Users,
    Search,
    Check,
    X,
    Ban,
    Eye,
    ChevronDown,
    ChevronUp,
    Clock,
    ExternalLink
} from 'lucide-react';
import { useChatContext } from './ChatContext';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '@/config/env';

interface Report {
    _id: string;
    reporter: { _id: string; name: string; email: string; profileImg?: string };
    reportedUser: { _id: string; name: string; email: string; profileImg?: string };
    message?: { content: string };
    reason: string;
    description?: string;
    status: string;
    adminAction: string;
    createdAt: string;
}

interface SupportConversation {
    _id: string;
    participants: { _id: string; name: string; email: string; role: string }[];
    supportStatus: string;
    lastMessage?: { content: string };
    lastMessageAt: string;
}

const AdminChatPanel: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { selectConversation, loadConversations, conversations } = useChatContext();
    const [activeTab, setActiveTab] = useState<'support' | 'reports'>('support');
    const [reports, setReports] = useState<Report[]>([]);
    const [supportConversations, setSupportConversations] = useState<SupportConversation[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (activeTab === 'reports') {
            fetchReports();
        } else {
            fetchSupport();
        }
    }, [activeTab]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/chat/admin/reports`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.status === 'success') {
                setReports(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        }
        setLoading(false);
    };

    const fetchSupport = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/chat/admin/support`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.status === 'success') {
                setSupportConversations(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch support:', error);
        }
        setLoading(false);
    };

    const handleReport = async (reportId: string, status: string, action: string, blockDays?: number) => {
        try {
            await fetch(`${API_BASE_URL}/api/v1/chat/admin/reports/${reportId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status, adminAction: action, blockDays }),
            });
            fetchReports();
            setSelectedReport(null);
        } catch (error) {
            console.error('Failed to handle report:', error);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getReasonLabel = (reason: string) => {
        const reasons: Record<string, string> = {
            spam: 'سبام',
            harassment: 'تحرش',
            inappropriate: 'محتوى غير لائق',
            scam: 'احتيال',
            other: 'أخرى'
        };
        return reasons[reason] || reason;
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <MessageCircle className="w-7 h-7 text-blue-500" />
                {t('admin.chatManagement') || 'إدارة المحادثات'}
            </h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('support')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${activeTab === 'support'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Users className="w-4 h-4 inline-block ml-1" />
                    {t('admin.supportRequests') || 'طلبات الدعم'}
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${activeTab === 'reports'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <AlertTriangle className="w-4 h-4 inline-block ml-1" />
                    {t('admin.reports') || 'التبليغات'}
                    {reports.filter(r => r.status === 'pending').length > 0 && (
                        <span className="mr-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {reports.filter(r => r.status === 'pending').length}
                        </span>
                    )}
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">{t('admin.loading') || 'جاري التحميل...'}</div>
            ) : activeTab === 'support' ? (
                /* Support Conversations */
                <div className="space-y-3">
                    {supportConversations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {t('admin.noSupport') || 'لا توجد طلبات دعم'}
                        </div>
                    ) : (
                        supportConversations.map(conv => {
                            const user = conv.participants[0];
                            return (
                                <div
                                    key={conv._id}
                                    onClick={async () => {
                                        // Update status to in_progress if it was open
                                        if (conv.supportStatus === 'open') {
                                            try {
                                                await fetch(`${API_BASE_URL}/api/v1/chat/admin/support/${conv._id}/status`, {
                                                    method: 'PUT',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        Authorization: `Bearer ${token}`
                                                    },
                                                    body: JSON.stringify({ status: 'in_progress' })
                                                });
                                            } catch (e) { console.error(e); }
                                        }

                                        // Navigate to chat with the conversation ID
                                        navigate(`/chat?conversation=${conv._id}`);
                                    }}
                                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-blue-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold relative">
                                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5">
                                                <ExternalLink className="w-3 h-3 text-blue-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${user?.role === 'manager' || user?.role === 'instructor'
                                                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                    }`}>
                                                    {user?.role === 'manager' || user?.role === 'instructor' ? 'مدرب' : 'طالب'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                            <p className="text-xs text-gray-400 mt-1 italic">
                                                {conv.lastMessage?.content?.substring(0, 60) || 'لا توجد رسائل'}...
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <span className={`px-2 py-1 rounded-full text-xs ${conv.supportStatus === 'open' ? 'bg-green-100 text-green-700' :
                                            conv.supportStatus === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {conv.supportStatus === 'open' ? 'جديد' :
                                                conv.supportStatus === 'in_progress' ? 'قيد المعالجة' : 'مغلق'}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">{formatDate(conv.lastMessageAt)}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                /* Reports */
                <div className="space-y-3">
                    {reports.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {t('admin.noReports') || 'لا توجد تبليغات'}
                        </div>
                    ) : (
                        reports.map(report => (
                            <div
                                key={report._id}
                                className={`p-4 rounded-lg border ${report.status === 'pending'
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${report.status === 'pending' ? 'bg-red-100 text-red-700' :
                                                report.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {report.status === 'pending' ? 'قيد الانتظار' :
                                                    report.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
                                            </span>
                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                                                {getReasonLabel(report.reason)}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">{report.reporter.name}</span>
                                            {' '}أبلغ عن{' '}
                                            <span className="font-medium text-red-600">{report.reportedUser.name}</span>
                                        </p>

                                        {report.message && (
                                            <p className="text-sm text-gray-500 mt-1 p-2 bg-white dark:bg-gray-700 rounded">
                                                "{report.message.content}"
                                            </p>
                                        )}

                                        {report.description && (
                                            <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                                        )}

                                        <p className="text-xs text-gray-400 mt-2">{formatDate(report.createdAt)}</p>
                                    </div>

                                    {report.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleReport(report._id, 'approved', 'warned')}
                                                className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                                                title="تحذير"
                                            >
                                                <AlertTriangle className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleReport(report._id, 'approved', 'blocked_temp', 7)}
                                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                                title="حظر 7 أيام"
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleReport(report._id, 'rejected', 'none')}
                                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                                title="رفض التبليغ"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminChatPanel;
