import React, { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileVideo, Download, Loader2, Play } from 'lucide-react';

export default function VideoTools() {
    const [loaded, setLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [outputVideo, setOutputVideo] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('اضغط لتحميل FFmpeg (مطلوب للمعالجة)');
    const ffmpegRef = useRef(new FFmpeg());
    const messageRef = useRef<HTMLParagraphElement | null>(null);
    const { toast } = useToast();

    const load = async () => {
        setIsLoading(true);
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        const ffmpeg = ffmpegRef.current;

        ffmpeg.on('log', ({ message }) => {
            if (messageRef.current) messageRef.current.innerHTML = message;
            console.log(message);
        });

        ffmpeg.on('progress', ({ progress }) => {
            setProgress(Math.round(progress * 100));
        });

        try {
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            setLoaded(true);
            setMessage('FFmpeg جاهز للاستخدام');
            toast({ title: "تم التحميل", description: "محرك معالجة الفيديو جاهز الآن" });
        } catch (error) {
            console.error(error);
            toast({ title: "خطأ", description: "فشل تحميل FFmpeg", variant: "destructive" });
            setMessage('فشل التحميل. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setOutputVideo(null);
            setProgress(0);
        }
    };

    const transcode = async () => {
        if (!videoFile) return;

        const ffmpeg = ffmpegRef.current;
        setIsLoading(true);
        setMessage('جاري معالجة الفيديو...');

        try {
            await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
            // Compress video: scale to 720p, crf 28 (lower quality/size)
            await ffmpeg.exec(['-i', 'input.mp4', '-vf', 'scale=-1:720', '-c:v', 'libx264', '-crf', '28', '-preset', 'fast', 'output.mp4']);

            const data = await ffmpeg.readFile('output.mp4');
            const binaryData = data instanceof Uint8Array ? data : new Uint8Array(data as any); // Ensure Uint8Array
            const url = URL.createObjectURL(new Blob([binaryData], { type: 'video/mp4' }));

            if (outputVideo) URL.revokeObjectURL(outputVideo); // Cleanup previous URL
            setOutputVideo(url);
            setMessage('تمت المعالجة بنجاح!');
            toast({ title: "نجاح", description: "تم ضغط الفيديو بنجاح" });
        } catch (error) {
            console.error(error);
            toast({ title: "خطأ", description: "حدث خطأ أثناء المعالجة", variant: "destructive" });
            setMessage('حدث خطأ أثناء المعالجة');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8" dir="rtl">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FileVideo className="text-blue-600" />
                    أدوات الفيديو (FFmpeg)
                </h2>
                {!loaded && (
                    <Button onClick={load} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin ml-2" /> : <Download className="ml-2" />}
                        تحميل المحرك
                    </Button>
                )}
            </div>

            <Card className="p-6 space-y-6">
                {!loaded ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                        <p>يجب تحميل محرك FFmpeg أولاً للبدء في معالجة الفيديوهات</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-6">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors relative">
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    accept="video/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                    <Upload size={40} />
                                    <p className="font-medium">اضغط أو اسحب ملف فيديو هنا</p>
                                    <p className="text-sm">MP4, MOV, AVI (Max 2GB)</p>
                                </div>
                            </div>

                            {videoFile && (
                                <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileVideo className="text-blue-600" />
                                        <div>
                                            <p className="font-semibold text-gray-900">{videoFile.name}</p>
                                            <p className="text-sm text-gray-500">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <Button onClick={transcode} disabled={isLoading}>
                                        {isLoading ? <Loader2 className="animate-spin ml-2" /> : <Play className="ml-2" />}
                                        ضغط وتحويل (720p)
                                    </Button>
                                </div>
                            )}
                        </div>

                        {isLoading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>جاري المعالجة...</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-gray-400 font-mono" ref={messageRef}></p>
                            </div>
                        )}

                        {outputVideo && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <h3 className="font-semibold text-gray-900">النتيجة:</h3>
                                <video src={outputVideo} controls className="w-full rounded-lg border bg-black" />
                                <div className="flex justify-end">
                                    <a href={outputVideo} download={`compressed_${videoFile?.name || 'video.mp4'}`}>
                                        <Button variant="default" className="bg-green-600 hover:bg-green-700">
                                            <Download className="ml-2" />
                                            تحميل الفيديو المضغوط
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>

            <div className="text-sm text-gray-500 text-center">
                <p>يتم معالجة الفيديو محلياً في المتصفح باستخدام WebAssembly. لا يتم رفع ملفاتك إلى أي خادم.</p>
            </div>
        </div>
    );
}
