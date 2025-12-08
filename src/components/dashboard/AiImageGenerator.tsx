import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';

export default function AiImageGenerator() {
    const { t, i18n } = useTranslation();
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt) return;

        setLoading(true);
        setImageUrl(null);

        try {
            const token = localStorage.getItem("token");
            // Use Backend API
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/instructor/ai/generate-image`,
                { prompt },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data?.data;
            console.log("Backend Response Data:", data); // DEBUG LOG
            // If the backend returns a URL or Base64, set it.
            // Assuming OpenRouter/Gemini returns a markdown image like ![alt](url) or just a URL.
            // We need to parse it if it's markdown.
            let url = data;
            // Simple regex to extract URL from markdown if present: ![text](url)
            const match = data && data.match(/\((https?:\/\/[^\)]+)\)/);
            if (match && match[1]) {
                url = match[1];
            } else if (data && data.startsWith('http')) {
                // It might be a raw URL
                url = data.trim();
            }

            setImageUrl(url);
        } catch (error) {
            console.error("Error generating image:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!imageUrl) return;

        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ai-generated-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading image:", error);
        }
    };

    const currentDir = i18n.language === "ar" ? "rtl" : "ltr";

    return (
        <div className="space-y-6" dir={currentDir}>
            <Card className="p-8 border-none shadow-sm rounded-[30px] bg-white">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.aiImages')}</h2>
                        <p className="text-gray-500">{t('aiImages.description')}</p>
                    </div>
                </div>

                <div className="flex gap-4 mb-8">
                    <Input
                        placeholder={t('aiImages.promptPlaceholder')}
                        className={`flex-1 rounded-full border-gray-200 focus:border-purple-500 py-6 px-6 ${currentDir === 'rtl' ? 'text-right' : 'text-left'}`}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !prompt}
                        className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 h-auto transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : t('aiImages.generate')}
                    </Button>
                </div>

                <div className="min-h-[400px] border-2 border-dashed border-gray-200 rounded-[30px] flex items-center justify-center bg-gray-50 relative overflow-hidden group">
                    {loading ? (
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 animate-pulse">{t('aiImages.generating')}</p>
                        </div>
                    ) : imageUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-black/5">
                            <img
                                src={imageUrl}
                                alt="AI Generated"
                                className="max-h-[600px] max-w-full object-contain shadow-lg rounded-xl"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <Button
                                    onClick={handleDownload}
                                    className="bg-white text-black hover:bg-gray-100 rounded-full px-6 py-3 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all font-bold"
                                >
                                    <Download size={20} />
                                    {t('aiImages.download')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">{t('aiImages.startTyping')}</p>
                        </div>
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-purple-50 p-6 rounded-[24px]">
                    <h3 className="font-bold text-purple-800 mb-2">Creative Prompts</h3>
                    <p className="text-sm text-purple-600 opacity-80 mb-4">Try: "Cyberpunk city with neon lights, realistic, 8k"</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-[24px]">
                    <h3 className="font-bold text-blue-800 mb-2">High Quality</h3>
                    <p className="text-sm text-blue-600 opacity-80 mb-4">Add keywords like "Ultra realistic, 4k, cinematic lighting"</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-[24px]">
                    <h3 className="font-bold text-orange-800 mb-2">Styles</h3>
                    <p className="text-sm text-orange-600 opacity-80 mb-4">Try "Oil painting", "Digital Art", "3D Render", "Sketch"</p>
                </div>
            </div>
        </div>
    );
}
