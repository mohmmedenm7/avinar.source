import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Download, Save, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '@/config/env';
import axios from 'axios';

interface PhotopeaEditorProps {
    initialImage?: string;
    onSave?: (imageUrl: string) => void;
}

export default function PhotopeaEditor({ initialImage, onSave }: PhotopeaEditorProps) {
    const [imageUrl, setImageUrl] = useState(initialImage || '');
    const [loading, setLoading] = useState(false);
    const [savedImageUrl, setSavedImageUrl] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { toast } = useToast();

    // Photopea configuration
    const getPhotopeaUrl = () => {
        const config = {
            files: imageUrl ? [imageUrl] : [],
            server: {
                version: 1,
                url: `${API_BASE_URL}/api/v1/photopea/save`,
                formats: ['png', 'jpg:0.8']
            },
            script: "app.echoToOE('Photopea Loaded Successfully')"
        };

        const encodedConfig = encodeURIComponent(JSON.stringify(config));
        return `https://www.photopea.com#${encodedConfig}`;
    };

    // Listen for messages from Photopea
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== 'https://www.photopea.com') return;

            const message = event.data;
            console.log('Photopea message:', message);

            // Handle different message types
            if (typeof message === 'string') {
                if (message === 'Photopea Loaded Successfully') {
                    toast({
                        title: 'نجاح',
                        description: 'تم تحميل محرر الصور بنجاح',
                    });
                } else if (message === 'Saved OK') {
                    toast({
                        title: 'تم الحفظ',
                        description: 'تم حفظ الصورة بنجاح',
                    });
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [toast]);

    // Load image from URL
    const handleLoadImage = () => {
        if (!imageUrl) {
            toast({
                title: 'خطأ',
                description: 'الرجاء إدخال رابط الصورة',
                variant: 'destructive',
            });
            return;
        }

        // Reload iframe with new image
        if (iframeRef.current) {
            iframeRef.current.src = getPhotopeaUrl();
        }
    };

    // Upload image file
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'خطأ',
                description: 'الرجاء اختيار ملف صورة',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/api/v1/photopea/upload`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            const uploadedUrl = response.data.data.imageUrl;
            setImageUrl(uploadedUrl);

            // Load the uploaded image in Photopea
            if (iframeRef.current) {
                const config = {
                    files: [uploadedUrl],
                    server: {
                        version: 1,
                        url: `${API_BASE_URL}/api/v1/photopea/save`,
                        formats: ['png', 'jpg:0.8']
                    },
                    script: "app.echoToOE('Image Loaded')"
                };
                const encodedConfig = encodeURIComponent(JSON.stringify(config));
                iframeRef.current.src = `https://www.photopea.com#${encodedConfig}`;
            }

            toast({
                title: 'نجاح',
                description: 'تم رفع الصورة بنجاح',
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'خطأ',
                description: 'فشل رفع الصورة',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Send command to Photopea to save
    const handleSaveImage = () => {
        if (iframeRef.current) {
            // Tell Photopea to save the current document
            iframeRef.current.contentWindow?.postMessage('app.activeDocument.saveToOE("png")', '*');

            toast({
                title: 'جاري الحفظ',
                description: 'جاري حفظ الصورة...',
            });
        }
    };

    // Download current image
    const handleDownload = () => {
        if (iframeRef.current) {
            // Tell Photopea to export as PNG
            iframeRef.current.contentWindow?.postMessage(
                'app.activeDocument.saveToOE("png")',
                '*'
            );
        }
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <Card className="p-4">
                <div className="flex flex-wrap gap-4 items-end">
                    {/* URL Input */}
                    <div className="flex-1 min-w-[300px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            رابط الصورة
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="url"
                                placeholder="https://example.com/image.png"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={handleLoadImage} variant="outline">
                                <RefreshCw size={16} className="ml-2" />
                                تحميل
                            </Button>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            أو ارفع صورة
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="image-upload"
                                disabled={loading}
                            />
                            <Button
                                onClick={() => document.getElementById('image-upload')?.click()}
                                variant="outline"
                                disabled={loading}
                            >
                                <Upload size={16} className="ml-2" />
                                {loading ? 'جاري الرفع...' : 'رفع صورة'}
                            </Button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button onClick={handleSaveImage} className="bg-blue-600 hover:bg-blue-700">
                            <Save size={16} className="ml-2" />
                            حفظ
                        </Button>
                        <Button onClick={handleDownload} variant="outline">
                            <Download size={16} className="ml-2" />
                            تنزيل
                        </Button>
                    </div>
                </div>

                {savedImageUrl && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                            تم الحفظ: <a href={savedImageUrl} target="_blank" rel="noopener noreferrer" className="underline">{savedImageUrl}</a>
                        </p>
                    </div>
                )}
            </Card>

            {/* Photopea iframe */}
            <Card className="p-0 overflow-hidden">
                <iframe
                    ref={iframeRef}
                    src={getPhotopeaUrl()}
                    className="w-full h-[800px] border-0"
                    title="Photopea Editor"
                />
            </Card>

            {/* Instructions */}
            <Card className="p-4 bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">كيفية الاستخدام:</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>أدخل رابط صورة أو ارفع صورة من جهازك</li>
                    <li>استخدم أدوات Photopea لتحرير الصورة</li>
                    <li>اضغط "حفظ" لحفظ الصورة على السيرفر</li>
                    <li>أو اضغط "تنزيل" لتنزيل الصورة على جهازك</li>
                </ul>
            </Card>
        </div>
    );
}
