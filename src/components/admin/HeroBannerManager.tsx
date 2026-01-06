import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '@/config/env';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
    Plus,
    Trash2,
    Edit2,
    Save,
    X,
    Image as ImageIcon,
    Video,
    Eye,
    EyeOff,
    GripVertical,
    Clock,
    Link as LinkIcon,
    Palette,
    AlignCenter,
    Upload,
    BarChart3,
    MousePointer
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface HeroBanner {
    _id: string;
    title?: string;
    description?: string;
    type: 'image' | 'video';
    mediaUrl: string;
    mediaFile?: string;
    linkUrl?: string;
    linkText?: string;
    displayOrder: number;
    duration: number;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    views: number;
    clicks: number;
    overlayColor?: string;
    textColor?: string;
    textPosition?: string;
    createdBy?: { name: string };
    createdAt: string;
}

interface HeroBannerManagerProps {
    token: string;
}

const HeroBannerManager = ({ token }: HeroBannerManagerProps) => {
    const [banners, setBanners] = useState<HeroBanner[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'image' as 'image' | 'video',
        mediaUrl: '',
        linkUrl: '',
        linkText: 'اعرف المزيد',
        duration: 5000,
        isActive: true,
        startDate: '',
        endDate: '',
        overlayColor: 'rgba(0,0,0,0.3)',
        textColor: '#ffffff',
        textPosition: 'center'
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const fetchBanners = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/banners`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBanners(res.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch banners:', error);
            toast({ title: 'فشل في جلب البانرات', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const isVideo = file.type.startsWith('video/');
            setFormData(prev => ({ ...prev, type: isVideo ? 'video' : 'image' }));

            // Create preview
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'image',
            mediaUrl: '',
            linkUrl: '',
            linkText: 'اعرف المزيد',
            duration: 5000,
            isActive: true,
            startDate: '',
            endDate: '',
            overlayColor: 'rgba(0,0,0,0.3)',
            textColor: '#ffffff',
            textPosition: 'center'
        });
        setSelectedFile(null);
        setPreviewUrl('');
        setEditingBanner(null);
        setIsCreating(false);
    };

    const handleSubmit = async () => {
        try {
            const formDataToSend = new FormData();

            if (selectedFile) {
                formDataToSend.append('media', selectedFile);
            } else if (formData.mediaUrl) {
                formDataToSend.append('mediaUrl', formData.mediaUrl);
            } else if (!editingBanner) {
                toast({ title: 'يرجى اختيار صورة أو فيديو', variant: 'destructive' });
                return;
            }

            Object.entries(formData).forEach(([key, value]) => {
                if (key !== 'mediaUrl' || !selectedFile) {
                    formDataToSend.append(key, String(value));
                }
            });

            setUploadProgress(0);

            if (editingBanner) {
                await axios.put(`${API_BASE_URL}/api/v1/banners/${editingBanner._id}`, formDataToSend, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = progressEvent.total
                            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                            : 0;
                        setUploadProgress(progress);
                    }
                });
                toast({ title: 'تم تحديث البانر بنجاح', className: 'bg-green-500 text-white' });
            } else {
                await axios.post(`${API_BASE_URL}/api/v1/banners`, formDataToSend, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = progressEvent.total
                            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                            : 0;
                        setUploadProgress(progress);
                    }
                });
                toast({ title: 'تم إنشاء البانر بنجاح', className: 'bg-green-500 text-white' });
            }

            resetForm();
            fetchBanners();
        } catch (error: any) {
            console.error('Failed to save banner:', error);
            toast({
                title: error.response?.data?.message || 'فشل في حفظ البانر',
                variant: 'destructive'
            });
        } finally {
            setUploadProgress(0);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا البانر؟')) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/v1/banners/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: 'تم حذف البانر بنجاح', className: 'bg-green-500 text-white' });
            fetchBanners();
        } catch (error) {
            toast({ title: 'فشل في حذف البانر', variant: 'destructive' });
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await axios.patch(`${API_BASE_URL}/api/v1/banners/${id}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBanners();
        } catch (error) {
            toast({ title: 'فشل في تغيير حالة البانر', variant: 'destructive' });
        }
    };

    const handleEdit = (banner: HeroBanner) => {
        setEditingBanner(banner);
        setIsCreating(true);
        setFormData({
            title: banner.title || '',
            description: banner.description || '',
            type: banner.type,
            mediaUrl: banner.mediaUrl,
            linkUrl: banner.linkUrl || '',
            linkText: banner.linkText || 'اعرف المزيد',
            duration: banner.duration,
            isActive: banner.isActive,
            startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
            endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '',
            overlayColor: banner.overlayColor || 'rgba(0,0,0,0.3)',
            textColor: banner.textColor || '#ffffff',
            textPosition: banner.textPosition || 'center'
        });
        setPreviewUrl(getMediaUrl(banner));
    };

    const handleReorder = async (newOrder: HeroBanner[]) => {
        setBanners(newOrder);
        try {
            await axios.put(`${API_BASE_URL}/api/v1/banners/reorder`, {
                bannerIds: newOrder.map(b => b._id)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            toast({ title: 'فشل في تحديث الترتيب', variant: 'destructive' });
            fetchBanners();
        }
    };

    const getMediaUrl = (banner: HeroBanner) => {
        if (banner.mediaFile) {
            return `${API_BASE_URL}/uploads/banners/${banner.mediaFile}`;
        }
        if (banner.mediaUrl?.startsWith('http')) {
            return banner.mediaUrl;
        }
        return `${API_BASE_URL}/${banner.mediaUrl}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <ImageIcon className="text-white" size={20} />
                        </div>
                        إدارة بانرات الصفحة الرئيسية
                    </h2>
                    <p className="text-gray-500 mt-1">أضف صور أو فيديوهات إعلانية تظهر في الصفحة الرئيسية</p>
                </div>

                {!isCreating && (
                    <Button
                        onClick={() => setIsCreating(true)}
                        className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl px-6 gap-2"
                    >
                        <Plus size={20} />
                        إضافة بانر جديد
                    </Button>
                )}
            </div>

            {/* Create/Edit Form */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card className="p-6 border-2 border-sky-100 bg-gradient-to-br from-sky-50/50 to-blue-50/50">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {editingBanner ? 'تعديل البانر' : 'إضافة بانر جديد'}
                                </h3>
                                <Button variant="ghost" size="icon" onClick={resetForm}>
                                    <X size={20} />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Media Upload Section */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        الوسائط (صورة أو فيديو)
                                    </label>

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all group"
                                    >
                                        {previewUrl ? (
                                            <div className="relative">
                                                {formData.type === 'video' ? (
                                                    <video
                                                        src={previewUrl}
                                                        className="w-full h-48 object-cover rounded-xl"
                                                        muted
                                                        loop
                                                        autoPlay
                                                    />
                                                ) : (
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="w-full h-48 object-cover rounded-xl"
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                                    <Upload className="text-white" size={32} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-8">
                                                <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                                                <p className="text-gray-500">اضغط لرفع صورة أو فيديو</p>
                                                <p className="text-xs text-gray-400 mt-2">JPG, PNG, WEBP, MP4 - حتى 50MB</p>
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />

                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-sky-500 h-2 rounded-full transition-all"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    )}

                                    <div className="text-center text-gray-400">أو</div>

                                    <Input
                                        placeholder="أدخل رابط الصورة أو الفيديو"
                                        value={formData.mediaUrl}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, mediaUrl: e.target.value }));
                                            setPreviewUrl(e.target.value);
                                        }}
                                        className="rounded-xl"
                                    />
                                </div>

                                {/* Settings Section */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                                            <Input
                                                placeholder="عنوان البانر (اختياري)"
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <Clock size={14} />
                                                مدة العرض (ثانية)
                                            </label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={60}
                                                value={formData.duration / 1000}
                                                onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) * 1000 }))}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                                        <Input
                                            placeholder="وصف قصير (اختياري)"
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            className="rounded-xl"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <LinkIcon size={14} />
                                                رابط النقر
                                            </label>
                                            <Input
                                                placeholder="https://..."
                                                value={formData.linkUrl}
                                                onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">نص الزر</label>
                                            <Input
                                                placeholder="اعرف المزيد"
                                                value={formData.linkText}
                                                onChange={(e) => setFormData(prev => ({ ...prev, linkText: e.target.value }))}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <Palette size={14} />
                                                لون الطبقة
                                            </label>
                                            <Input
                                                placeholder="rgba(0,0,0,0.3)"
                                                value={formData.overlayColor}
                                                onChange={(e) => setFormData(prev => ({ ...prev, overlayColor: e.target.value }))}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">لون النص</label>
                                            <Input
                                                type="color"
                                                value={formData.textColor}
                                                onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                                                className="rounded-xl h-10 p-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <AlignCenter size={14} />
                                                موضع النص
                                            </label>
                                            <select
                                                value={formData.textPosition}
                                                onChange={(e) => setFormData(prev => ({ ...prev, textPosition: e.target.value }))}
                                                className="w-full rounded-xl border border-gray-200 p-2 text-sm"
                                            >
                                                <option value="center">المنتصف</option>
                                                <option value="top-left">أعلى اليسار</option>
                                                <option value="top-right">أعلى اليمين</option>
                                                <option value="bottom-left">أسفل اليسار</option>
                                                <option value="bottom-right">أسفل اليمين</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ البدء</label>
                                            <Input
                                                type="datetime-local"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الانتهاء</label>
                                            <Input
                                                type="datetime-local"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-4">
                                        <Button
                                            onClick={handleSubmit}
                                            className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl gap-2"
                                        >
                                            <Save size={18} />
                                            {editingBanner ? 'حفظ التغييرات' : 'إنشاء البانر'}
                                        </Button>
                                        <Button variant="outline" onClick={resetForm} className="rounded-xl">
                                            إلغاء
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Banners List */}
            {banners.length === 0 ? (
                <Card className="p-20 text-center border-2 border-dashed">
                    <ImageIcon className="mx-auto text-gray-300 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">لا توجد بانرات</h3>
                    <p className="text-gray-400 mb-6">أضف بانرات لتظهر في الصفحة الرئيسية</p>
                    <Button
                        onClick={() => setIsCreating(true)}
                        className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2"
                    >
                        <Plus size={18} />
                        إضافة أول بانر
                    </Button>
                </Card>
            ) : (
                <Reorder.Group axis="y" values={banners} onReorder={handleReorder} className="space-y-4">
                    {banners.map((banner) => (
                        <Reorder.Item key={banner._id} value={banner}>
                            <Card className={`p-4 transition-all hover:shadow-lg ${!banner.isActive ? 'opacity-50' : ''}`}>
                                <div className="flex items-center gap-4">
                                    {/* Drag Handle */}
                                    <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                                        <GripVertical size={20} />
                                    </div>

                                    {/* Preview */}
                                    <div className="w-32 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                        {banner.type === 'video' ? (
                                            <video
                                                src={getMediaUrl(banner)}
                                                className="w-full h-full object-cover"
                                                muted
                                            />
                                        ) : (
                                            <img
                                                src={getMediaUrl(banner)}
                                                alt={banner.title || 'Banner'}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {banner.type === 'video' ? (
                                                <Video size={16} className="text-purple-500" />
                                            ) : (
                                                <ImageIcon size={16} className="text-sky-500" />
                                            )}
                                            <span className="font-bold text-gray-900 truncate">
                                                {banner.title || 'بدون عنوان'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">{banner.description || 'بدون وصف'}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {banner.duration / 1000}ث
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <BarChart3 size={12} />
                                                {banner.views} مشاهدة
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MousePointer size={12} />
                                                {banner.clicks} نقرة
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleToggle(banner._id)}
                                            className={banner.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}
                                        >
                                            {banner.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(banner)}
                                            className="text-sky-500 hover:bg-sky-50"
                                        >
                                            <Edit2 size={18} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(banner._id)}
                                            className="text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            )}

            {/* Help Text */}
            <Card className="p-4 bg-amber-50 border-amber-200">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        💡
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-900">ملاحظات هامة</h4>
                        <ul className="text-sm text-amber-700 mt-1 space-y-1">
                            <li>• يمكنك سحب وإفلات البانرات لإعادة ترتيبها</li>
                            <li>• البانرات ستظهر بالترتيب المحدد في الصفحة الرئيسية تحت أزرار "ابدأ مجاناً" و"تصفح الدورات" و"مدربينا"</li>
                            <li>• إذا لم تتم إضافة أي بانر نشط، ستظهر الصورة الافتراضية</li>
                            <li>• يمكنك تحديد تواريخ البدء والانتهاء لجدولة البانرات</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default HeroBannerManager;
