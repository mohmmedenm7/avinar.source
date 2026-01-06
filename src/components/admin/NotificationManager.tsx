import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Bell, Send, Users, GraduationCap, UserCog, Trash2, Eye, RefreshCw } from "lucide-react";

interface NotificationStats {
    total: number;
    unread: number;
    byAudience: { _id: string; count: number; readCount: number }[];
}

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    targetAudience: string;
    isRead: boolean;
    createdAt: string;
    recipient?: { name: string };
    sender?: { name: string };
}

export const NotificationManager = ({ token }: { token: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'announcement',
        targetAudience: 'all',
        link: '',
        userIds: '', // Added for specific user targeting
    });

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/notifications/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchRecentNotifications = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/notifications?limit=10&sort=-createdAt`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecentNotifications(res.data.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchRecentNotifications();
    }, [token]);

    const handleSend = async () => {
        if (!formData.title || !formData.message) {
            toast({
                title: "خطأ",
                description: "يرجى ملء العنوان والرسالة",
                variant: "destructive"
            });
            return;
        }

        if (formData.targetAudience === 'specific' && !formData.userIds.trim()) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال معرف المستخدم (User ID)",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            // Prepare payload
            const payload = {
                ...formData,
                userIds: formData.targetAudience === 'specific'
                    ? formData.userIds.split(',').map(id => id.trim()).filter(id => id)
                    : undefined
            };

            const res = await axios.post(`${API_BASE_URL}/api/v1/notifications/send`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast({
                title: "تم الإرسال بنجاح! 🔔",
                description: res.data.message,
                className: "bg-green-500 text-white",
            });

            setFormData({
                title: '',
                message: '',
                type: 'announcement',
                targetAudience: 'all',
                link: '',
                userIds: '',
            });
            setIsOpen(false);
            fetchStats();
            fetchRecentNotifications();
        } catch (error: any) {
            toast({
                title: "خطأ في الإرسال",
                description: error.response?.data?.message || "حدث خطأ ما",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const getAudienceLabel = (audience: string) => {
        switch (audience) {
            case 'all': return 'الجميع';
            case 'students': return 'الطلاب';
            case 'instructors': return 'المدربين';
            case 'specific': return 'مستخدم محدد';
            default: return audience;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-100 text-green-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'error': return 'bg-red-100 text-red-800';
            case 'announcement': return 'bg-blue-100 text-blue-800';
            case 'course': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">إدارة الإشعارات</h2>
                    <p className="text-muted-foreground">إرسال إشعارات للطلاب والمدربين</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <Send size={16} />
                            إرسال إشعار جديد
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-right text-xl">إرسال إشعار جديد</DialogTitle>
                            <DialogDescription className="text-right">
                                أرسل إشعارًا للطلاب أو المدربين أو مخصص لمستخدم
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-5 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-right">الجمهور المستهدف</label>
                                <Select
                                    value={formData.targetAudience}
                                    onValueChange={v => setFormData({ ...formData, targetAudience: v })}
                                >
                                    <SelectTrigger className="flex-row-reverse">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="justify-end">
                                            <div className="flex items-center gap-2">
                                                <Users size={14} />
                                                جميع المستخدمين
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="students" className="justify-end">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap size={14} />
                                                الطلاب فقط
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="instructors" className="justify-end">
                                            <div className="flex items-center gap-2">
                                                <UserCog size={14} />
                                                المدربين فقط
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="specific" className="justify-end">
                                            <div className="flex items-center gap-2">
                                                <UserCog size={14} />
                                                مستخدم محدد (User ID)
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.targetAudience === 'specific' && (
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-right">معرف المستخدم (User ID)</label>
                                    <Input
                                        className="text-left font-mono"
                                        placeholder="64a1b2c3d4e5f6g7h8i9j0k1"
                                        value={formData.userIds}
                                        onChange={e => setFormData({ ...formData, userIds: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground text-right">يمكنك إدخال معرفات متعددة مفصولة بفاصلة (,)</p>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-right">نوع الإشعار</label>
                                <Select
                                    value={formData.type}
                                    onValueChange={v => setFormData({ ...formData, type: v })}
                                >
                                    <SelectTrigger className="flex-row-reverse">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="announcement" className="justify-end">إعلان عام</SelectItem>
                                        <SelectItem value="info" className="justify-end">معلومات</SelectItem>
                                        <SelectItem value="success" className="justify-end">نجاح</SelectItem>
                                        <SelectItem value="warning" className="justify-end">تحذير</SelectItem>
                                        <SelectItem value="course" className="justify-end">خاص بالدورات</SelectItem>
                                        <SelectItem value="system" className="justify-end">نظام</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-right">عنوان الإشعار</label>
                                <Input
                                    className="text-right"
                                    placeholder="مثال: دورة جديدة متاحة الآن!"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-right">نص الرسالة</label>
                                <Textarea
                                    className="text-right min-h-[120px]"
                                    placeholder="اكتب محتوى الإشعار هنا..."
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-right">رابط (اختياري)</label>
                                <Input
                                    className="text-left"
                                    dir="ltr"
                                    placeholder="https://example.com/course/123"
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                />
                            </div>

                            <Button
                                className="w-full gap-2"
                                onClick={handleSend}
                                disabled={loading}
                            >
                                {loading ? (
                                    <RefreshCw className="animate-spin" size={16} />
                                ) : (
                                    <Send size={16} />
                                )}
                                {loading ? 'جاري الإرسال...' : 'إرسال الإشعار'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900">إجمالي الإشعارات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-700">{stats?.total || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-900">غير مقروءة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-700">{stats?.unread || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-900">نسبة القراءة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700">
                            {stats?.total ? Math.round(((stats.total - stats.unread) / stats.total) * 100) : 0}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Notifications Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell size={20} />
                        آخر الإشعارات المرسلة
                    </CardTitle>
                    <CardDescription>
                        عرض آخر 10 إشعارات تم إرسالها
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">العنوان</TableHead>
                                <TableHead className="text-right">النوع</TableHead>
                                <TableHead className="text-right">الجمهور</TableHead>
                                <TableHead className="text-right">التاريخ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentNotifications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                        لا توجد إشعارات مرسلة بعد
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentNotifications.map((notification) => (
                                    <TableRow key={notification._id}>
                                        <TableCell>
                                            <div className="font-medium">{notification.title}</div>
                                            <div className="text-xs text-muted-foreground line-clamp-1">
                                                {notification.message}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                                                {notification.type}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {getAudienceLabel(notification.targetAudience)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(notification.createdAt).toLocaleDateString('ar-EG', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
