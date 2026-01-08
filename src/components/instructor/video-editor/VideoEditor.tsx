import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-quality-levels';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Scissors, Download, Loader2, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

// Extend videojs types
declare module 'video.js' {
    interface VideoJsPlayer {
        qualityLevels?: () => any;
    }
}

export default function VideoEditor() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<any>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isTrimMode, setIsTrimMode] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Initialize Video.js player with plugins
        if (videoRef.current && !playerRef.current) {
            const player = videojs(videoRef.current, {
                controls: true,
                responsive: true,
                fluid: true,
                playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
                controlBar: {
                    children: [
                        'playToggle',
                        'volumePanel',
                        'currentTimeDisplay',
                        'timeDivider',
                        'durationDisplay',
                        'progressControl',
                        'liveDisplay',
                        'seekToLive',
                        'remainingTimeDisplay',
                        'customControlSpacer',
                        'playbackRateMenuButton',
                        'chaptersButton',
                        'descriptionsButton',
                        'subsCapsButton',
                        'audioTrackButton',
                        'fullscreenToggle',
                    ],
                },
                userActions: {
                    hotkeys: true,
                },
            });

            playerRef.current = player;

            // Event listeners
            player.on('loadedmetadata', () => {
                const dur = player.duration();
                if (dur && !isNaN(dur) && isFinite(dur)) {
                    setDuration(dur);
                    setTrimEnd(dur);
                }
            });

            player.on('timeupdate', () => {
                const time = player.currentTime();
                setCurrentTime(time);

                // Auto-loop trimmed section when in trim mode
                if (isTrimMode && time >= trimEnd) {
                    player.currentTime(trimStart);
                }
            });

            player.on('play', () => setIsPlaying(true));
            player.on('pause', () => setIsPlaying(false));
            player.on('ended', () => {
                if (isTrimMode) {
                    player.currentTime(trimStart);
                    player.play();
                }
            });

            // Add custom styling for Arabic
            player.addClass('vjs-rtl');
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, []);

    // Update trim mode effect
    useEffect(() => {
        if (playerRef.current && isTrimMode) {
            playerRef.current.currentTime(trimStart);
        }
    }, [isTrimMode, trimStart]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('video/')) {
            if (videoUrl) URL.revokeObjectURL(videoUrl);

            setVideoFile(file);
            const url = URL.createObjectURL(file);
            setVideoUrl(url);

            if (playerRef.current) {
                playerRef.current.src({ type: file.type, src: url });
                playerRef.current.load();
            }

            // Reset trim settings
            setTrimStart(0);
            setIsTrimMode(false);

            toast({ title: "تم الرفع", description: "تم رفع الفيديو بنجاح" });
        } else {
            toast({ title: "خطأ", description: "يرجى اختيار ملف فيديو صالح", variant: "destructive" });
        }
    };

    const handleSpeedChange = (value: number[]) => {
        const speed = value[0];
        setPlaybackSpeed(speed);
        if (playerRef.current) {
            playerRef.current.playbackRate(speed);
            toast({
                title: "تم تغيير السرعة",
                description: `السرعة الحالية: ${speed}x`,
                duration: 1500
            });
        }
    };

    const handleTrimStartChange = (value: number[]) => {
        const start = value[0];
        if (start < trimEnd) {
            setTrimStart(start);
            if (playerRef.current) {
                playerRef.current.currentTime(start);
            }
        }
    };

    const handleTrimEndChange = (value: number[]) => {
        const end = value[0];
        if (end > trimStart) {
            setTrimEnd(end);
        }
    };

    const toggleTrimMode = () => {
        const newTrimMode = !isTrimMode;
        setIsTrimMode(newTrimMode);

        if (newTrimMode && playerRef.current) {
            playerRef.current.currentTime(trimStart);
            toast({
                title: "وضع القص مفعّل",
                description: `سيتم تشغيل الفيديو من ${trimStart.toFixed(1)}ث إلى ${trimEnd.toFixed(1)}ث`,
            });
        } else {
            toast({
                title: "وضع القص معطّل",
                description: "تم إلغاء تفعيل وضع القص",
            });
        }
    };

    const resetTrim = () => {
        setTrimStart(0);
        setTrimEnd(duration);
        setIsTrimMode(false);
        if (playerRef.current) {
            playerRef.current.currentTime(0);
        }
        toast({ title: "تم إعادة التعيين", description: "تم إعادة تعيين نقاط القص" });
    };

    const downloadTrimmedVideo = async () => {
        if (!videoFile) {
            toast({ title: "خطأ", description: "لا يوجد فيديو لتحميله", variant: "destructive" });
            return;
        }

        setIsProcessing(true);

        try {
            // Note: This downloads the original file
            // For actual trimming, FFmpeg.wasm would be needed
            const link = document.createElement('a');
            link.href = videoUrl!;
            link.download = `edited_${videoFile.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "تم التحميل",
                description: "للحصول على فيديو مقصوص فعلياً، استخدم أداة FFmpeg في تبويب 'أدوات الفيديو'",
                duration: 5000,
            });
        } catch (error) {
            console.error(error);
            toast({ title: "خطأ", description: "فشل تحميل الفيديو", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Scissors className="text-purple-600" />
                        محرر الفيديو المتقدم
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">محرر فيديو احترافي مع Video.js</p>
                </div>
            </div>

            <Card className="p-6 space-y-6">
                {/* Upload Section */}
                {!videoFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors relative">
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            accept="video/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-3 text-gray-500">
                            <Upload size={48} className="text-purple-500" />
                            <div>
                                <p className="font-medium text-lg">اضغط أو اسحب ملف فيديو هنا</p>
                                <p className="text-sm mt-1">MP4, WebM, MOV, AVI</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Video Player */}
                        <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                            <div data-vjs-player>
                                <video
                                    ref={videoRef}
                                    className="video-js vjs-big-play-centered vjs-16-9"
                                    playsInline
                                />
                            </div>
                        </div>

                        {/* Timeline Info */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">الوقت الحالي</p>
                                    <p className="text-lg font-bold text-purple-600">{formatTime(currentTime)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">المدة الكلية</p>
                                    <p className="text-lg font-bold text-blue-600">{formatTime(duration)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">مدة القص</p>
                                    <p className="text-lg font-bold text-green-600">{formatTime(trimEnd - trimStart)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Controls Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Playback Speed Control */}
                            <Card className="p-5 space-y-4 border-2 border-blue-100">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold text-gray-900">سرعة التشغيل</Label>
                                    <span className="text-2xl font-bold text-blue-600">{playbackSpeed}x</span>
                                </div>
                                <Slider
                                    value={[playbackSpeed]}
                                    onValueChange={handleSpeedChange}
                                    min={0.25}
                                    max={2}
                                    step={0.25}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>بطيء (0.25x)</span>
                                    <span>عادي (1x)</span>
                                    <span>سريع (2x)</span>
                                </div>
                            </Card>

                            {/* Trim Controls */}
                            <Card className="p-5 space-y-4 border-2 border-purple-100">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold text-gray-900">قص الفيديو</Label>
                                    <Button
                                        onClick={toggleTrimMode}
                                        size="sm"
                                        variant={isTrimMode ? "default" : "outline"}
                                        className={isTrimMode ? "bg-purple-600" : ""}
                                    >
                                        {isTrimMode ? "معطّل" : "مفعّل"}
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <Label className="text-sm">نقطة البداية</Label>
                                            <span className="text-sm font-semibold text-purple-600">{formatTime(trimStart)}</span>
                                        </div>
                                        <Slider
                                            value={[trimStart]}
                                            onValueChange={handleTrimStartChange}
                                            min={0}
                                            max={duration}
                                            step={0.1}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <Label className="text-sm">نقطة النهاية</Label>
                                            <span className="text-sm font-semibold text-purple-600">{formatTime(trimEnd)}</span>
                                        </div>
                                        <Slider
                                            value={[trimEnd]}
                                            onValueChange={handleTrimEndChange}
                                            min={trimStart}
                                            max={duration}
                                            step={0.1}
                                            className="w-full"
                                        />
                                    </div>

                                    <Button onClick={resetTrim} variant="outline" className="w-full" size="sm">
                                        <RotateCcw className="ml-2" size={16} />
                                        إعادة تعيين
                                    </Button>
                                </div>
                            </Card>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-center pt-4">
                            <Button
                                onClick={() => {
                                    setVideoFile(null);
                                    setVideoUrl(null);
                                    setTrimStart(0);
                                    setTrimEnd(0);
                                    setDuration(0);
                                    setIsTrimMode(false);
                                }}
                                variant="outline"
                                className="px-6"
                            >
                                <Upload className="ml-2" size={18} />
                                رفع فيديو جديد
                            </Button>

                            <Button
                                onClick={downloadTrimmedVideo}
                                disabled={isProcessing}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
                            >
                                {isProcessing ? (
                                    <Loader2 className="animate-spin ml-2" size={18} />
                                ) : (
                                    <Download className="ml-2" size={18} />
                                )}
                                تحميل الفيديو
                            </Button>
                        </div>

                        {/* Info Banner */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="text-blue-600 mt-0.5">ℹ️</div>
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">ملاحظات مهمة:</p>
                                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                                        <li>يوفر Video.js معاينة احترافية للفيديو مع التحكم في السرعة والقص</li>
                                        <li>وضع القص يتيح لك معاينة الجزء المحدد بشكل متكرر</li>
                                        <li>للحصول على ملف فيديو مقصوص فعلياً، استخدم أداة FFmpeg في تبويب "أدوات الفيديو"</li>
                                        <li>جميع العمليات تتم محلياً في المتصفح دون رفع الملفات</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}
