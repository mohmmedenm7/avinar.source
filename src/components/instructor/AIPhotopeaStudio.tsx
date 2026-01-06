import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Download, Sparkles, Image as ImageIcon, Loader2,
    Upload, Save, Maximize2, Minimize2, X,
    Wand2, Palette, ChevronRight, History, Trash2,
    Layout, PenTool, MonitorPlay, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import AIMontageControl from './AIMontageControl';
import { MontageToolAction } from '@/services/aiMontageTools';

interface AIPhotopeaStudioProps {
    initialImage?: string;
    onSave?: (imageUrl: string) => void;
    onClose?: () => void;
}

interface ImageHistoryItem {
    id: string;
    url: string;
    timestamp: number;
    prompt: string;
}

export default function AIPhotopeaStudio({ initialImage, onSave, onClose }: AIPhotopeaStudioProps) {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const currentDir = i18n.language === "ar" ? "rtl" : "ltr";

    // --- State Management ---
    const [mode, setMode] = useState<'generate' | 'edit'>('generate');
    const [history, setHistory] = useState<ImageHistoryItem[]>([]);
    const [activeImage, setActiveImage] = useState<string | null>(initialImage || null);
    const [isAIControlOpen, setIsAIControlOpen] = useState(false);

    // AI Gen State
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Editor State
    const [isUploading, setIsUploading] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Start with sidebar closed in edit mode to maximize space initially
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- Helpers ---
    const addToHistory = (url: string, p: string) => {
        const newItem: ImageHistoryItem = {
            id: Date.now().toString(),
            url,
            timestamp: Date.now(),
            prompt: p
        };
        setHistory(prev => {
            const exists = prev.some(item => item.url === url);
            if (exists) return prev;
            return [newItem, ...prev];
        });
        setActiveImage(url);
    };

    const stylePresets = [
        { label: 'فوتوغرافي', prompt: 'photorealistic, 8k, highly detailed, canon 5d' },
        { label: 'سينمائي', prompt: 'cinematic lighting, movie scene, dramatic, sharp focus' },
        { label: 'ثلاثي الأبعاد', prompt: '3d render, blender, unreal engine 5, octane render' },
        { label: 'أنمي', prompt: 'anime style, studio ghibli, vibrant colors' },
        { label: 'رسم زيتي', prompt: 'oil painting, classical art, masterpiece, textured' },
        { label: 'رقمي', prompt: 'digital art, concept art, trending on artstation' },
    ];

    const getPhotopeaUrl = useCallback(() => {
        const config = {
            files: [],
            environment: {
                theme: 2, // Dark theme
                lang: 'ar',
                vmode: 0, // 0: regular (show all panels), 1: collapsed, 2: hide all
                intro: true, // Show intro panel when no image
                localsave: true,
                customIO: {
                    exportAs: true // Allow exporting to OE
                },
                panels: [0, 2, 12] // 0: HISTORY, 2: LAYERS, 12: NAVIGATOR
            },
            script: "app.echoToOE('Photopea Ready')"
        };
        return `https://www.photopea.com#${encodeURIComponent(JSON.stringify(config))}`;
    }, []);

    // Track Photopea readiness
    const [photopeaReady, setPhotopeaReady] = useState(false);
    const [pendingImageLoad, setPendingImageLoad] = useState<string | null>(null);

    // Helper to fetch image as ArrayBuffer for postMessage
    const fetchImageAsArrayBuffer = async (url: string): Promise<ArrayBuffer | null> => {
        try {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error('Failed to fetch image');
            return await response.arrayBuffer();
        } catch (error) {
            console.error('Could not fetch image as ArrayBuffer:', error);
            return null;
        }
    };

    // --- Effects ---
    // Initialize Photopea iframe when entering edit mode
    useEffect(() => {
        if (mode === 'edit' && iframeRef.current) {
            // Only set src if not already set
            if (!iframeRef.current.src.includes('photopea.com')) {
                setPhotopeaReady(false);
                iframeRef.current.src = getPhotopeaUrl();
            }
        }
    }, [mode, getPhotopeaUrl]);

    // Load image into Photopea when it's ready and there's an active image
    useEffect(() => {
        const loadImageIntoPhotopea = async () => {
            if (photopeaReady && activeImage && iframeRef.current?.contentWindow) {
                toast({ title: "جاري تحميل الصورة...", description: "يتم تحميل الصورة في المحرر" });

                try {
                    const arrayBuffer = await fetchImageAsArrayBuffer(activeImage);
                    if (arrayBuffer && iframeRef.current?.contentWindow) {
                        // Send the image as ArrayBuffer to Photopea
                        iframeRef.current.contentWindow.postMessage(arrayBuffer, '*');
                        toast({ title: "تم", description: "تم تحميل الصورة بنجاح" });
                    } else {
                        throw new Error('Could not load image');
                    }
                } catch (error) {
                    console.error("Error loading image into Photopea:", error);
                    toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل الصورة في المحرر" });
                }
            }
        };

        loadImageIntoPhotopea();
    }, [photopeaReady, activeImage, toast]);

    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== 'https://www.photopea.com') return;

            if (event.data === 'Photopea Ready') {
                setPhotopeaReady(true);
                toast({ title: "جاهز", description: "محرر الصور جاهز للاستخدام" });
            } else if (event.data instanceof ArrayBuffer) {
                try {
                    toast({ title: "جاري الحفظ", description: "يتم الآن معالجة الصورة وحفظها..." });

                    const blob = new Blob([event.data], { type: 'image/png' });
                    const file = new File([blob], `edited-${Date.now()}.png`, { type: 'image/png' });

                    const formData = new FormData();
                    formData.append('image', file);

                    const token = localStorage.getItem('token');
                    const res = await axios.post(`${API_BASE_URL}/api/v1/photopea/upload`, formData, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    const savedUrl = res.data.data.imageUrl;
                    addToHistory(savedUrl, "تعديل جديد");
                    toast({ title: "تم الحفظ", description: "تم حفظ الصورة بنجاح في ملفاتك" });
                    if (onSave) onSave(savedUrl);

                } catch (error) {
                    console.error('Save error:', error);
                    toast({ variant: "destructive", title: "فشل الحفظ", description: "حدث خطأ أثناء الاتصال بالسيرفر" });
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [toast, onSave]);

    // --- Handlers ---
    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                `${API_BASE_URL}/api/v1/instructor/ai/generate-image`,
                { prompt },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            let url = res.data?.data;
            const match = url && url.match(/\((https?:\/\/[^\)]+)\)/);
            if (match) url = match[1];

            if (url) {
                addToHistory(url, prompt);
                toast({ title: "نجاح", description: "تم إنشاء الصورة" });
                // If successful, open sidebar so user sees result
                setIsSidebarOpen(true);
            }
        } catch (e: any) {
            console.error(e);
            toast({
                variant: "destructive",
                title: "فشل",
                description: e.response?.data?.message || "تعذر إنشاء الصورة"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/api/v1/photopea/upload`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            addToHistory(res.data.data.imageUrl, "صورة مرفوعة");
            setMode('edit');
            setIsSidebarOpen(false); // Auto close sidebar on upload to show editor
        } catch (e) {
            toast({ variant: "destructive", title: "خطأ", description: "فشل رفع الصورة" });
        } finally {
            setIsUploading(false);
        }
    };

    const saveFromEditor = () => {
        if (!iframeRef.current?.contentWindow) {
            toast({ variant: "destructive", title: "خطأ", description: "المحرر غير جاهز" });
            return;
        }
        toast({ title: "جاري الحفظ...", description: "يتم الآن تجهيز الصورة" });
        iframeRef.current.contentWindow.postMessage('app.activeDocument.saveToOE("png")', '*');
    };

    // Download image function
    const downloadImage = async (imageUrl: string, promptText?: string) => {
        try {
            const link = document.createElement('a');
            link.href = imageUrl;
            
            // Generate filename with timestamp
            const timestamp = new Date().toLocaleString('ar-EG').replace(/[/:]/g, '-');
            const filename = `صورة-${timestamp}.png`;
            
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast({ 
                title: "نجاح", 
                description: "تم تحميل الصورة بنجاح" 
            });
        } catch (error) {
            console.error('Download error:', error);
            toast({ 
                variant: "destructive", 
                title: "خطأ", 
                description: "فشل تحميل الصورة" 
            });
        }
    };

    // Download all images as zip
    const downloadAllImages = async () => {
        if (history.length === 0) {
            toast({ 
                variant: "destructive", 
                title: "لا توجد صور", 
                description: "لا توجد صور لتحميلها" 
            });
            return;
        }

        try {
            const link = document.createElement('a');
            
            // Create a simple HTML file that contains all images
            let htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>الصور المولدة - استوديو الذكاء الاصطناعي</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; direction: rtl; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { text-align: center; color: #333; }
        .gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 30px; }
        .image-item { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .image-item img { width: 100%; height: auto; border-radius: 6px; margin-bottom: 10px; }
        .prompt { color: #666; font-size: 14px; line-height: 1.5; }
        .timestamp { color: #999; font-size: 12px; margin-top: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>الصور المولدة - استوديو الذكاء الاصطناعي</h1>
        <div class="gallery">
`;

            history.forEach((item, index) => {
                const date = new Date(item.timestamp).toLocaleString('ar-EG');
                htmlContent += `
            <div class="image-item">
                <a href="${item.url}" target="_blank">
                    <img src="${item.url}" alt="صورة ${index + 1}" />
                </a>
                <p class="prompt"><strong>الأمر:</strong> ${item.prompt}</p>
                <p class="timestamp">التاريخ: ${date}</p>
            </div>
`;
            });

            htmlContent += `
        </div>
    </div>
</body>
</html>
`;

            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            link.href = URL.createObjectURL(blob);
            link.download = `صور-استوديو-${new Date().toLocaleString('ar-EG').replace(/[/:]/g, '-')}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            toast({ 
                title: "نجاح", 
                description: `تم تحميل ${history.length} صورة بنجاح` 
            });
        } catch (error) {
            console.error('Batch download error:', error);
            toast({ 
                variant: "destructive", 
                title: "خطأ", 
                description: "فشل تحميل الصور" 
            });
        }
    };

    // --- Render ---
    return (
        <div ref={(el) => { if (el && isFullscreen) el.requestFullscreen().catch(() => { }) }}
            dir={currentDir}
            className={`flex flex-col bg-gray-50 dark:bg-slate-900 transition-all duration-300 relative
             ${isFullscreen ? 'fixed inset-0 z-[100] h-screen w-screen' : 'h-[calc(100vh-40px)] w-full border rounded-2xl overflow-hidden shadow-xl'}`}>

            {/* Top Bar */}
            <div className="h-12 border-b bg-white dark:bg-slate-800 flex items-center justify-between px-3 shadow-sm z-40 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-1.5 rounded-lg text-white">
                        <Wand2 size={16} />
                    </div>
                    <div className="hidden md:block">
                        <h2 className="font-bold text-sm text-gray-800 dark:text-gray-100">استوديو التصميم</h2>
                    </div>
                </div>

                {/* Center Controls */}
                <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-lg scale-90">
                    <button
                        onClick={() => setMode('generate')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-2
                        ${mode === 'generate' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Sparkles size={14} /> <span className="hidden sm:inline">إنشاء</span>
                    </button>
                    <button
                        onClick={() => setMode('edit')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-2
                        ${mode === 'edit' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Palette size={14} /> <span className="hidden sm:inline">تعديل</span>
                    </button>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1">
                    {activeImage && (
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs rounded-lg shadow-sm"
                            onClick={() => downloadImage(activeImage)}
                            title="تحميل الصورة"
                        >
                            <Download size={14} className="mr-1" />
                            <span className="hidden sm:inline">تحميل</span>
                        </Button>
                    )}

                    {mode === 'edit' && activeImage && (
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs rounded-lg shadow-sm animate-in fade-in"
                            onClick={saveFromEditor}
                        >
                            <Save size={14} className="mr-1.5" />
                            <span className="hidden sm:inline">حفظ</span>
                        </Button>
                    )}

                    {/* AI Control Button */}
                    {mode === 'edit' && activeImage && (
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white h-8 px-3 text-xs rounded-lg shadow-sm"
                            onClick={() => setIsAIControlOpen(!isAIControlOpen)}
                            title="التحكم الذكي بالأدوات"
                        >
                            <Zap size={14} className="mr-1" />
                            <span className="hidden sm:inline">ذكاء</span>
                        </Button>
                    )}

                    <div className="w-px h-5 bg-gray-200 dark:bg-slate-600 mx-1" />

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`h-8 w-8 ${isSidebarOpen ? 'bg-indigo-50 text-indigo-600' : ''}`} 
                        title={`المكتبة (${history.length})`}
                    >
                        <ImageIcon size={18} />
                        {history.length > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {history.length > 9 ? '9+' : history.length}
                            </span>
                        )}
                    </Button>

                    {history.length > 0 && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs"
                            onClick={downloadAllImages}
                            title="تحميل جميع الصور"
                        >
                            <Download size={14} />
                        </Button>
                    )}

                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFullscreen(!isFullscreen)} title="ملء الشاشة">
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </Button>
                    {onClose && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X size={18} /></Button>}
                </div>
            </div>

            {/* AI Montage Control Panel */}
            {isAIControlOpen && (
                <AIMontageControl
                    imageUrl={activeImage}
                    isOpen={isAIControlOpen}
                    onClose={() => setIsAIControlOpen(false)}
                    onApplyTool={(tool: MontageToolAction, newImageUrl: string) => {
                        addToHistory(newImageUrl, `تحسين: ${tool.name}`);
                    }}
                />
            )}

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* Floating Sidebar Overlay */}
                <div className={`
                    absolute top-0 right-0 h-full z-30 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-l shadow-2xl transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 translate-x-full overflow-hidden opacity-0'}
                `}>
                    <div className="p-3 border-b flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
                            <History size={16} /> مكتبة الصور ({history.length})
                        </h3>
                        <div className="flex gap-1">
                            {history.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-500 hover:bg-red-50"
                                    onClick={() => {
                                        setHistory([]);
                                        setActiveImage(null);
                                        toast({ title: "تم مسح جميع الصور" });
                                    }}
                                    title="مسح الكل"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsSidebarOpen(false)}>
                                <X size={14} />
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-3 pb-20">
                        <div className="space-y-3">
                            {history.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <p className="text-xs">لا توجد صور في الجلسة</p>
                                </div>
                            ) : (
                                history.map(item => (
                                    <div key={item.id}
                                        className={`group relative rounded-lg overflow-hidden border transition-all hover:shadow-md
                                         ${activeImage === item.url ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 dark:border-slate-700'}`}
                                    >
                                        <img 
                                            src={item.url} 
                                            className="w-full h-24 object-cover cursor-pointer"
                                            onClick={() => { setActiveImage(item.url); setMode('edit'); setIsSidebarOpen(false); }}
                                            alt="History" 
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadImage(item.url, item.prompt);
                                                }}
                                                className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                                                title="تحميل الصورة"
                                            >
                                                <Download size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setHistory(prev => prev.filter(h => h.id !== item.id));
                                                    if (activeImage === item.url) setActiveImage(null);
                                                }}
                                                className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                                title="حذف من السجل"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>

                    <div className="absolute bottom-0 w-full p-3 border-t bg-white/90 dark:bg-slate-800/90 backdrop-blur">
                        <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-50 border border-dashed border-indigo-200 p-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors">
                            {isUploading ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload size={16} />}
                            <span className="text-xs">رفع صورة</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                        </label>
                    </div>
                </div>

                {/* Left: Workspace */}
                <div className="flex-1 bg-gray-100 dark:bg-slate-950 relative flex flex-col w-full h-full overflow-hidden">
                    {mode === 'generate' && (
                        <div className="flex h-full items-center justify-center p-4 overflow-y-auto">
                            <div className="max-w-3xl w-full space-y-6">
                                <div className="text-center space-y-2">
                                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        استوديو الذكاء الاصطناعي
                                    </h1>
                                    <p className="text-gray-500 text-sm">أطلق العنان لإبداعك بكلمات بسيطة</p>
                                </div>

                                <Card className="p-1 shadow-xl rounded-2xl border-0 ring-1 ring-gray-200 bg-white/90 backdrop-blur">
                                    <div className="p-2">
                                        <Textarea
                                            value={prompt}
                                            onChange={e => setPrompt(e.target.value)}
                                            placeholder="صف الصورة التي تريد إنشاءها..."
                                            className="min-h-[100px] resize-none border-0 bg-transparent text-lg focus-visible:ring-0 p-3"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 border-t bg-gray-50/50 rounded-b-xl">
                                        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide max-w-[60%]">
                                            {stylePresets.map((style, i) => (
                                                <button key={i} onClick={() => setPrompt(prev => prev ? `${prev}, ${style.prompt}` : style.prompt)}
                                                    className="px-2.5 py-1 text-[10px] font-medium bg-white border rounded-full hover:border-indigo-500 hover:text-indigo-600 transition-all whitespace-nowrap">
                                                    {style.label}
                                                </button>
                                            ))}
                                        </div>
                                        <Button
                                            onClick={handleGenerate}
                                            disabled={isGenerating || !prompt}
                                            className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                                        >
                                            {isGenerating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                            {isGenerating ? 'جاري الإنشاء...' : 'إنشاء'}
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {mode === 'edit' && (
                        <div className="flex-1 w-full h-full relative bg-[#2d2d2d] flex flex-col overflow-hidden">
                            {!activeImage ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
                                    <div className="bg-gray-800 p-6 rounded-3xl">
                                        <Layout size={48} className="text-gray-600 mb-4 mx-auto" strokeWidth={1.5} />
                                        <p className="text-gray-400">لا توجد صورة محددة</p>
                                        <Button variant="outline" className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => setMode('generate')}>
                                            إنشاء صورة جديدة
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <iframe
                                    ref={iframeRef}
                                    className="w-full h-full border-0 block"
                                    title="Photopea Editor"
                                    allow="clipboard-read; clipboard-write"
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
