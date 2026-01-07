import { useState, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { useNavigate } from "react-router-dom";

interface Notification {
    _id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type: string;
}

interface NotificationBellProps {
    onViewAll?: () => void;
    userId?: string; // Optional: for socket listening specific to user
}

const NotificationBell = ({ onViewAll }: NotificationBellProps) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const token = localStorage.getItem("token");

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/notifications/me?limit=5&sort=-createdAt`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(res.data.data);
            setUnreadCount(res.data.unreadCount);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Poll every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await axios.put(`${API_BASE_URL}/api/v1/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        // If we want to navigate purely based on notification type, we can do it here.
        // For now, if onViewAll is passed, we switch to the notifications tab.
        if (onViewAll) {
            onViewAll();
            setIsOpen(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                    <Bell size={22} />

                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
                    <h4 className="font-semibold text-sm">الإشعارات</h4>
                    {unreadCount > 0 && <Badge variant="secondary" className="text-xs">{unreadCount} جديد</Badge>}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400">
                            <Bell size={32} className="mb-2 opacity-20" />
                            <p className="text-sm">لا توجد إشعارات حالياً</p>
                        </div>
                    ) : (
                        <div className="grid">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer text-right ${!notification.isRead ? 'bg-orange-50/30' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1">
                                            <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <span className="text-[10px] text-gray-300 mt-1 block">
                                                {new Date(notification.createdAt).toLocaleDateString('ar-EG', { hour: 'numeric', minute: 'numeric' })}
                                            </span>
                                        </div>
                                        {!notification.isRead && (
                                            <span className="h-2 w-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t bg-gray-50/30">
                    <Button
                        variant="ghost"
                        className="w-full text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-8 font-medium"
                        onClick={() => {
                            setIsOpen(false);
                            if (onViewAll) onViewAll();
                        }}
                    >
                        عرض كل الإشعارات
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;
