import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, ExternalLink, Calendar, Info, CheckCircle2, AlertTriangle, AlertCircle, Megaphone, BookOpen, Monitor } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
    sender?: { name: string; profileImg?: string };
}

export const UserNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalCount: 0, unreadCount: 0 });
    const { toast } = useToast();
    const token = localStorage.getItem('token');

    const fetchNotifications = async (unreadOnly = false) => {
        setLoading(true);
        try {
            const query = unreadOnly ? '?unreadOnly=true&limit=50' : '?limit=50';
            const res = await axios.get(`${API_BASE_URL}/api/v1/notifications/me${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data.data);
            setStats({
                totalCount: res.data.totalCount,
                unreadCount: res.data.unreadCount
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await axios.put(`${API_BASE_URL}/api/v1/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setStats(prev => ({ ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) }));
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(`${API_BASE_URL}/api/v1/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setStats(prev => ({ ...prev, unreadCount: 0 }));
            toast({ title: "تم تحديد الكل كمقروء" });
        } catch (error) {
            console.error(error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/v1/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.filter(n => n._id !== id));
            toast({ title: "تم حذف الإشعار" });
        } catch (error) {
            console.error(error);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="text-green-500" size={20} />;
            case 'warning': return <AlertTriangle className="text-amber-500" size={20} />;
            case 'error': return <AlertCircle className="text-red-500" size={20} />;
            case 'announcement': return <Megaphone className="text-blue-500" size={20} />;
            case 'course': return <BookOpen className="text-purple-500" size={20} />;
            case 'system': return <Monitor className="text-gray-500" size={20} />;
            default: return <Info className="text-blue-400" size={20} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'border-l-green-500';
            case 'warning': return 'border-l-amber-500';
            case 'error': return 'border-l-red-500';
            case 'announcement': return 'border-l-blue-500';
            case 'course': return 'border-l-purple-500';
            default: return 'border-l-gray-300';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">مركز الإشعارات</h2>
                    <p className="text-muted-foreground">تابع آخر التحديثات والإعلانات المهمة</p>
                </div>
                {stats.unreadCount > 0 && (
                    <Button variant="outline" onClick={markAllAsRead} className="gap-2">
                        <Check size={16} />
                        تحديد الكل كمقروء
                    </Button>
                )}
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={(val) => fetchNotifications(val === 'unread')}>
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="all">كل الإشعارات</TabsTrigger>
                    <TabsTrigger value="unread" className="relative">
                        غير مقروءة
                        {stats.unreadCount > 0 && (
                            <Badge variant="destructive" className="mr-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                {stats.unreadCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6 space-y-4">
                    <NotificationList
                        notifications={notifications}
                        loading={loading}
                        onRead={markAsRead}
                        onDelete={deleteNotification}
                        getTypeColor={getTypeColor}
                        getTypeIcon={getTypeIcon}
                    />
                </TabsContent>

                <TabsContent value="unread" className="mt-6 space-y-4">
                    <NotificationList
                        notifications={notifications}
                        loading={loading}
                        onRead={markAsRead}
                        onDelete={deleteNotification}
                        getTypeColor={getTypeColor}
                        getTypeIcon={getTypeIcon}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const NotificationList = ({ notifications, loading, onRead, onDelete, getTypeColor, getTypeIcon }: any) => {
    if (loading) {
        return <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>;
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">لا توجد إشعارات</h3>
                <p className="text-muted-foreground">أنت مطلع على كل شيء!</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {notifications.map((notification: Notification) => (
                <Card
                    key={notification._id}
                    className={`transition-all hover:shadow-md ${!notification.isRead ? 'bg-primary/5 border-primary/20' : ''} border-r-4 ${getTypeColor(notification.type)}`}
                >
                    <div className="flex flex-col md:flex-row gap-4 p-4">
                        <div className="flex-shrink-0 mt-1">
                            {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <h4 className={`text-base font-semibold ${!notification.isRead ? 'text-primary' : ''}`}>
                                    {notification.title}
                                    {!notification.isRead && <Badge className="mr-2 text-[10px] h-5" variant="secondary">جديد</Badge>}
                                </h4>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(notification.createdAt).toLocaleDateString('ar-EG', {
                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                {notification.message}
                            </p>
                            {notification.link && (
                                <a
                                    href={notification.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2 w-fit"
                                >
                                    عرض المزيد <ExternalLink size={12} />
                                </a>
                            )}
                        </div>
                        <div className="flex items-start gap-2 pr-4 border-r border-gray-100 dark:border-gray-800">
                            {!notification.isRead && (
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 hover:bg-blue-50" onClick={() => onRead(notification._id)} title="تحديد كمقروء">
                                    <Check size={16} />
                                </Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => onDelete(notification._id)} title="حذف">
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
