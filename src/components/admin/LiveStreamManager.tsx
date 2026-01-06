import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/config/env';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Video,
    PlayCircle,
    StopCircle,
    Calendar,
    Users,
    Eye,
    Clock,
    Plus,
    Edit,
    Trash2,
    Upload,
    Radio,
    Film,
    CheckCircle,
    XCircle
} from 'lucide-react';

interface LiveStream {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    status: 'scheduled' | 'live' | 'ended' | 'cancelled';
    scheduledAt: string;
    startedAt?: string;
    endedAt?: string;
    duration: number;
    streamKey: string;
    recordingUrl?: string;
    isRecorded: boolean;
    isRecordingPublished: boolean;
    isFree: boolean;
    price: number;
    currentViewers: number;
    totalViews: number;
    instructor: {
        _id: string;
        name: string;
        profileImg: string;
    };
}

interface LiveStreamManagerProps {
    token: string;
}

const LiveStreamManager = ({ token }: LiveStreamManagerProps) => {
    const [streams, setStreams] = useState<LiveStream[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStream, setEditingStream] = useState<LiveStream | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'live' | 'ended'>('all');
    const { toast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        scheduledAt: '',
        isFree: true,
        price: 0,
        isRecorded: true,
    });

    const fetchStreams = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/livestreams/instructor/my-streams`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStreams(res.data.data || []);
        } catch (error) {
            console.error('Error fetching streams:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStreams();
    }, [token]);

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            scheduledAt: '',
            isFree: true,
            price: 0,
            isRecorded: true,
        });
        setEditingStream(null);
    };

    const handleSubmit = async () => {
        if (!formData.scheduledAt) {
            toast({ title: "يرجى تحديد موعد البث", variant: "destructive" });
            return;
        }
        try {
            if (editingStream) {
                await axios.put(`${API_BASE_URL}/api/v1/livestreams/${editingStream._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast({ title: "تم تحديث البث بنجاح" });
            } else {
                await axios.post(`${API_BASE_URL}/api/v1/livestreams`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast({ title: "تم جدولة البث بنجاح" });
            }
            setIsDialogOpen(false);
            resetForm();
            fetchStreams();
        } catch (error: any) {
            console.error('Submit Error:', error.response?.data || error.message);
            toast({
                title: "خطأ في الاتصال",
                description: error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || "حدث خطأ أثناء حفظ البيانات",
                variant: "destructive"
            });
        }
    };

    const handleEdit = (stream: LiveStream) => {
        setEditingStream(stream);
        setFormData({
            title: stream.title,
            description: stream.description,
            scheduledAt: new Date(stream.scheduledAt).toISOString().slice(0, 16),
            isFree: stream.isFree,
            price: stream.price,
            isRecorded: stream.isRecorded,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا البث؟')) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/v1/livestreams/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: "تم حذف البث بنجاح" });
            fetchStreams();
        } catch (error: any) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "حدث خطأ ما",
                variant: "destructive"
            });
        }
    };

    const handleStartStream = async (id: string) => {
        try {
            await axios.post(`${API_BASE_URL}/api/v1/livestreams/${id}/start`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: "تم بدء البث المباشر! 🔴", className: "bg-red-500 text-white" });
            fetchStreams();
        } catch (error: any) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "حدث خطأ ما",
                variant: "destructive"
            });
        }
    };

    const handleEndStream = async (id: string) => {
        if (!confirm('هل أنت متأكد من إنهاء البث؟')) return;
        try {
            await axios.post(`${API_BASE_URL}/api/v1/livestreams/${id}/end`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: "تم إنهاء البث" });
            fetchStreams();
        } catch (error: any) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "حدث خطأ ما",
                variant: "destructive"
            });
        }
    };

    const handleTogglePublishRecording = async (id: string) => {
        try {
            const res = await axios.put(`${API_BASE_URL}/api/v1/livestreams/${id}/publish-recording`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: res.data.message });
            fetchStreams();
        } catch (error: any) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "حدث خطأ ما",
                variant: "destructive"
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'live':
                return <Badge className="bg-red-500 text-white animate-pulse gap-1"><Radio size={12} /> مباشر</Badge>;
            case 'scheduled':
                return <Badge variant="outline" className="border-blue-500 text-blue-600 gap-1"><Calendar size={12} /> مجدول</Badge>;
            case 'ended':
                return <Badge variant="secondary" className="gap-1"><Film size={12} /> منتهي</Badge>;
            case 'cancelled':
                return <Badge variant="destructive" className="gap-1"><XCircle size={12} /> ملغي</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const filteredStreams = streams.filter(s => {
        if (activeTab === 'all') return true;
        return s.status === activeTab;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Video className="text-red-500" />
                        إدارة البث المباشر
                    </h2>
                    <p className="text-gray-500 text-sm">إنشاء وإدارة البث المباشر والتسجيلات</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-red-500 hover:bg-red-600">
                            <Plus size={18} />
                            جدولة بث جديد
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingStream ? 'تعديل البث' : 'جدولة بث جديد'}</DialogTitle>
                            <DialogDescription>
                                قم بملء البيانات أدناه لجدولة موعد البث المباشر القادم.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>عنوان البث</Label>
                                <Input
                                    placeholder="مثال: ورشة عمل تطوير الويب"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>وصف البث</Label>
                                <Textarea
                                    placeholder="وصف تفصيلي للبث..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>موعد البث</Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.scheduledAt}
                                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={formData.isFree}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
                                    />
                                    <Label>بث مجاني</Label>
                                </div>

                                {!formData.isFree && (
                                    <div className="flex items-center gap-2">
                                        <Label>السعر:</Label>
                                        <Input
                                            type="number"
                                            className="w-24"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: +e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.isRecorded}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isRecorded: checked })}
                                />
                                <Label>تسجيل البث</Label>
                            </div>

                            <Button className="w-full" onClick={handleSubmit}>
                                {editingStream ? 'حفظ التعديلات' : 'جدولة البث'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b pb-2">
                {[
                    { key: 'all', label: 'الكل' },
                    { key: 'scheduled', label: 'المجدول' },
                    { key: 'live', label: 'مباشر الآن' },
                    { key: 'ended', label: 'المنتهي' },
                ].map((tab) => (
                    <Button
                        key={tab.key}
                        variant={activeTab === tab.key ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab(tab.key as any)}
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
                </div>
            ) : filteredStreams.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <Video size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">لا توجد بثوث {activeTab !== 'all' ? 'في هذا القسم' : ''}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStreams.map((stream) => (
                        <Card key={stream._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative h-40 bg-gradient-to-br from-red-500 to-purple-600">
                                {stream.thumbnail && !stream.thumbnail.includes('default') && (
                                    <img src={stream.thumbnail} alt={stream.title} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute top-3 right-3">
                                    {getStatusBadge(stream.status)}
                                </div>
                                {stream.status === 'live' && (
                                    <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                        <Users size={12} /> {stream.currentViewers} مشاهد
                                    </div>
                                )}
                            </div>

                            <CardContent className="p-4 space-y-3">
                                <h3 className="font-bold text-lg line-clamp-1">{stream.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{stream.description}</p>

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(stream.scheduledAt).toLocaleDateString('ar-EG')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(stream.scheduledAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                {stream.status === 'ended' && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1 text-gray-500">
                                            <Eye size={12} /> {stream.totalViews} مشاهدة
                                        </span>
                                        <span className="flex items-center gap-1 text-gray-500">
                                            <Clock size={12} /> {stream.duration} دقيقة
                                        </span>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2 border-t">
                                    {stream.status === 'scheduled' && (
                                        <>
                                            <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 gap-1" onClick={() => navigate(`/live/${stream._id}`)}>
                                                <Video size={14} /> دخول الاستوديو
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(stream)}>
                                                <Edit size={14} />
                                            </Button>
                                        </>
                                    )}

                                    {stream.status === 'live' && (
                                        <div className="flex flex-col w-full gap-2">
                                            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 gap-1" onClick={() => navigate(`/live/${stream._id}`)}>
                                                <Video size={14} /> الاستوديو المباشر
                                            </Button>
                                            <Button size="sm" variant="destructive" className="w-full gap-1" onClick={() => handleEndStream(stream._id)}>
                                                <StopCircle size={14} /> إنهاء البث
                                            </Button>
                                        </div>
                                    )}

                                    {stream.status === 'ended' && stream.recordingUrl && (
                                        <Button
                                            size="sm"
                                            variant={stream.isRecordingPublished ? "default" : "outline"}
                                            className="flex-1 gap-1"
                                            onClick={() => handleTogglePublishRecording(stream._id)}
                                        >
                                            {stream.isRecordingPublished ? (
                                                <><CheckCircle size={14} /> منشور</>
                                            ) : (
                                                <><Upload size={14} /> نشر التسجيل</>
                                            )}
                                        </Button>
                                    )}

                                    {stream.status !== 'live' && (
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" className="text-blue-500" onClick={() => navigate(`/live/${stream._id}`)}>
                                                <Eye size={14} />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(stream._id)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LiveStreamManager;
