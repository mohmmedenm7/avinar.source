import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Video,
    Radio,
    Users,
    Calendar,
    Clock,
    Send,
    MessageSquare,
    ChevronLeft,
    Play,
    User,
    Film,
    Monitor,
    Camera,
    Mic,
    MicOff,
    Settings as SettingsIcon,
    StopCircle
} from 'lucide-react';

interface ChatMessage {
    user: {
        _id: string;
        name: string;
        profileImg?: string;
    };
    message: string;
    timestamp: string;
}

interface LiveStreamData {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    status: 'scheduled' | 'live' | 'ended' | 'cancelled';
    scheduledAt: string;
    startedAt?: string;
    endedAt?: string;
    duration: number;
    streamUrl?: string;
    recordingUrl?: string;
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
    settings: {
        allowChat: boolean;
        allowQuestions: boolean;
    };
    chat: ChatMessage[];
}

const LiveStreamPage = () => {
    const { id } = useParams();
    const [stream, setStream] = useState<LiveStreamData | null>(null);
    const [loading, setLoading] = useState(true);
    const [chatMessage, setChatMessage] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [hasJoined, setHasJoined] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const storedUserId = localStorage.getItem('userId');
    const userRole = (currentUser.role || '').toLowerCase();
    const userId = storedUserId || currentUser._id || currentUser.id;
    const isOwner = (userId?.toString() === stream?.instructor?._id?.toString() || userId?.toString() === stream?.instructor?.toString());
    const isInstructor = userRole === 'instructor';
    const isAdminOrManager = userRole === 'manager' || userRole === 'admin';
    const canManage = isOwner || isAdminOrManager;

    useEffect(() => {
        console.log("LiveStreamPage Auth Debug:", { userId, instructorId: stream?.instructor?._id, role: userRole, canManage });
    }, [userId, stream, userRole, canManage]);

    // Virtual Studio State
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const fetchStream = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/livestreams/${id}`);
            console.log("Fetched Stream Data:", res.data.data);
            setStream(res.data.data);
            setChatMessages(res.data.data.chat || []);
        } catch (error) {
            console.error('Error fetching stream:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStream();
    }, [id]);

    // Warning when trying to leave while uploading
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (uploadProgress > 0 && uploadProgress < 100) {
                e.preventDefault();
                e.returnValue = 'جاري رفع التسجيل، هل أنت متأكد من المغادرة؟ قد تفقد تسجيل البث.';
                return e.returnValue;
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [uploadProgress]);

    useEffect(() => {
        // Scroll chat to bottom when new messages arrive
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Auto-stop camera if stream ends or component unmounts
    useEffect(() => {
        if (stream?.status === 'ended' && localStream) {
            console.log("Stream ended, stopping local media...");
            stopLocalStream();
        }

        return () => {
            // This runs on component unmount
            if (localStream) {
                console.log("Component unmounting, stopping local media...");
                // Note: localStream is a stale closure here if we don't include it in deps,
                // but since we want to stop WHATEVER is running, it's better to use a ref or the current state if handled correctly.
                // However, standard React practice for this cleanup:
                const tracks = localStream.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, [stream?.status, localStream]);

    const handleJoinStream = async () => {
        if (!token) {
            toast({
                title: "يجب تسجيل الدخول",
                description: "قم بتسجيل الدخول للانضمام للبث",
                variant: "destructive"
            });
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/api/v1/livestreams/${id}/join`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHasJoined(true);
            toast({ title: "تم الانضمام للبث بنجاح! 🎉" });
            fetchStream();
        } catch (error: any) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "فشل في الانضمام للبث",
                variant: "destructive"
            });
        }
    };

    const handleSendMessage = async () => {
        if (!chatMessage.trim() || !token) return;

        try {
            await axios.post(`${API_BASE_URL}/api/v1/livestreams/${id}/chat`,
                { message: chatMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setChatMessage('');

            // Add message locally for immediate feedback
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : { name: 'أنت' };
            setChatMessages(prev => [...prev, {
                user: { _id: user._id, name: user.name, profileImg: user.profileImg },
                message: chatMessage,
                timestamp: new Date().toISOString()
            }]);
        } catch (error: any) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "فشل في إرسال الرسالة",
                variant: "destructive"
            });
        }
    };

    const stopLocalStream = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
    };

    const startCamera = async () => {
        stopLocalStream();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                },
                audio: true
            });
            setLocalStream(stream);
            setIsSharingScreen(false);
            setIsMicMuted(false);
        } catch (err: any) {
            console.error("Camera error:", err);
            let msg = "فشل الوصول للكاميرا";
            if (err.name === 'NotAllowedError') msg = "تم رفض الإذن بالوصول للكاميرا. يرجى تفعيلها من إعدادات المتصفح.";
            if (err.name === 'NotFoundError') msg = "لم يتم العثور على كاميرا متصلة.";
            toast({ title: msg, variant: "destructive" });
        }
    };

    const startScreenShare = async () => {
        stopLocalStream();
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });
            setLocalStream(stream);
            setIsSharingScreen(true);
            setIsMicMuted(false);

            // Handle when user stops sharing via browser UI
            stream.getVideoTracks()[0].onended = () => {
                setIsSharingScreen(false);
                setLocalStream(null);
            };
        } catch (err: any) {
            console.error("Screen share error:", err);
            let msg = "فشل مشاركة الشاشة";
            if (err.name === 'NotAllowedError') msg = "تم إلغاء مشاركة الشاشة.";
            toast({ title: msg, variant: "destructive" });
        }
    };

    const toggleMic = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicMuted(!audioTrack.enabled);
            }
        } else {
            setIsMicMuted(!isMicMuted);
        }
    };

    const handleStartLive = async () => {
        try {
            if (!localStream) {
                toast({ title: "يرجى تشغيل الكاميرا قبل بدء البث", variant: "destructive" });
                return;
            }

            await axios.post(`${API_BASE_URL}/api/v1/livestreams/${id}/start`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Start Client-side Recording
            try {
                const options = { mimeType: 'video/webm;codecs=vp9,opus' };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    options.mimeType = 'video/webm';
                }

                const recorder = new MediaRecorder(localStream, options);
                recordedChunksRef.current = [];

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                    }
                };

                recorder.onstop = async () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    await uploadRecording(blob);
                };

                recorder.start(1000); // collect data every second
                mediaRecorderRef.current = recorder;
                setIsRecording(true);
            } catch (recErr) {
                console.error("Recording start error:", recErr);
            }

            toast({ title: "تم بدء البث المباشر بنجاح! 🔴" });
            fetchStream();
        } catch (error: any) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "فشل بدء البث",
                variant: "destructive"
            });
        }
    };

    const uploadRecording = async (blob: Blob) => {
        try {
            setUploadProgress(1); // Start indicator
            const formData = new FormData();
            formData.append('recording', blob, `stream-recording-${id}.webm`);

            await axios.post(`${API_BASE_URL}/api/v1/livestreams/${id}/recordings`, formData, {
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

            toast({ title: "تم رفع التسجيل بنجاح وتحويله للمعالجة" });
            setUploadProgress(0);
            fetchStream();
        } catch (error: any) {
            console.error("Upload error:", error);
            toast({
                title: "فشل رفع التسجيل",
                description: "حدث خطأ أثناء رفع ملف الفيديو",
                variant: "destructive"
            });
            setUploadProgress(0);
        }
    };

    const handleEndLive = async () => {
        try {
            // Stop recorder first if active
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
            }

            await axios.post(`${API_BASE_URL}/api/v1/livestreams/${id}/end`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Stop local camera/mic stream
            stopLocalStream();

            toast({ title: "تم إنهاء البث المباشر." });
            fetchStream();
        } catch (error: any) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "فشل إنهاء البث",
                variant: "destructive"
            });
        }
    };

    const handleTogglePublishRecording = async () => {
        try {
            await axios.put(`${API_BASE_URL}/api/v1/livestreams/${id}/publish-recording`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: "تم تحديث حالة نشر التسجيل بنجاح" });
            fetchStream();
        } catch (error: any) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "فشل تحديث حالة النشر",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (!stream) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                <Video size={64} className="text-gray-600 mb-4" />
                <h2 className="text-2xl font-bold mb-4">البث غير موجود</h2>
                <Link to="/">
                    <Button variant="outline">العودة للرئيسية</Button>
                </Link>
            </div>
        );
    }

    const isLive = stream.status === 'live';
    const isEnded = stream.status === 'ended';
    const isScheduled = stream.status === 'scheduled';

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-20">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
                <div className="container mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                        <span>العودة</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {isLive && (
                            <Badge className="bg-red-500 text-white animate-pulse gap-1">
                                <Radio size={12} />
                                مباشر الآن
                                {isRecording && <span className="ml-1 w-2 h-2 bg-white rounded-full"></span>}
                            </Badge>
                        )}

                        {uploadProgress > 0 && (
                            <Badge className="bg-blue-600 text-white gap-2">
                                <Clock size={12} className="animate-spin" />
                                جاري رفع التسجيل ({uploadProgress}%)
                            </Badge>
                        )}

                        {/* Instructor/Admin Management Buttons */}
                        {canManage && (
                            <div className="flex items-center gap-2">
                                {isScheduled && (
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 gap-2"
                                        onClick={handleStartLive}
                                    >
                                        <Play size={16} />
                                        ابدأ البث
                                    </Button>
                                )}
                                {isLive && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="gap-2"
                                        onClick={handleEndLive}
                                    >
                                        <Radio size={16} />
                                        إنهاء البث
                                    </Button>
                                )}
                                {isEnded && stream.recordingUrl && (
                                    <Button
                                        size="sm"
                                        variant={stream.isRecordingPublished ? "outline" : "default"}
                                        className={stream.isRecordingPublished ? "" : "bg-green-600 hover:bg-green-700"}
                                        onClick={handleTogglePublishRecording}
                                    >
                                        {stream.isRecordingPublished ? 'إلغاء النشر' : 'نشر التسجيل للطلاب'}
                                    </Button>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-400">
                            <Users size={16} />
                            <span>{stream.currentViewers} مشاهد</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Player Section */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Video Player / Studio Preview */}
                        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                            {/* IF INSTRUCTOR/ADMIN: Show Studio Interface */}
                            {canManage && (isLive || isScheduled) ? (
                                <div className="absolute inset-0 flex flex-col">
                                    {localStream ? (
                                        <video
                                            ref={localVideoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-full object-contain bg-black"
                                        />
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 text-center p-8">
                                            <Video size={64} className="text-gray-600 mb-4" />
                                            <h3 className="text-xl font-bold mb-2">استوديو البث المباشر</h3>
                                            <p className="text-gray-400 max-w-sm mb-6">قم بإعداد الكاميرا أو مشاركة الشاشة قبل البدء</p>
                                        </div>
                                    )}

                                    {/* Studio Controls Overlay */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-md p-4 rounded-3xl border border-white/20 z-20">
                                        <Button
                                            size="icon"
                                            variant={!isSharingScreen && localStream ? "default" : "secondary"}
                                            className={`rounded-full w-12 h-12 ${!isSharingScreen && localStream ? 'bg-blue-600' : ''}`}
                                            onClick={startCamera}
                                            title="فتح الكاميرا"
                                        >
                                            <Camera size={20} />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant={isSharingScreen ? "default" : "secondary"}
                                            className={`rounded-full w-12 h-12 ${isSharingScreen ? 'bg-blue-600' : ''}`}
                                            onClick={startScreenShare}
                                            title="مشاركة الشاشة"
                                        >
                                            <Monitor size={20} />
                                        </Button>
                                        <div className="w-[1px] h-8 bg-white/20 mx-2" />
                                        <Button
                                            size="icon"
                                            variant={isMicMuted ? "destructive" : "secondary"}
                                            className="rounded-full w-12 h-12"
                                            onClick={toggleMic}
                                            title={isMicMuted ? "تفعيل الميكروفون" : "كتم الميكروفون"}
                                        >
                                            {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                        </Button>

                                        {/* Start/End Live Actions in Studio */}
                                        <div className="w-[1px] h-8 bg-white/20 mx-2" />

                                        {isScheduled ? (
                                            <Button
                                                className="bg-red-600 hover:bg-red-700 gap-2 px-6 rounded-full animate-pulse"
                                                onClick={() => {
                                                    if (!localStream) {
                                                        toast({ title: "يرجى فتح الكاميرا أو مشاركة الشاشة أولاً", variant: "destructive" });
                                                        return;
                                                    }
                                                    handleStartLive();
                                                }}
                                            >
                                                <Radio size={18} />
                                                بث مباشر الآن
                                            </Button>
                                        ) : isLive ? (
                                            <Button
                                                variant="destructive"
                                                className="gap-2 px-6 rounded-full"
                                                onClick={handleEndLive}
                                            >
                                                <StopCircle size={18} />
                                                إنهاء البث
                                            </Button>
                                        ) : null}
                                    </div>

                                    {localStream && (
                                        <div className="absolute top-6 left-6 flex items-center gap-2">
                                            <Badge className="bg-blue-600 text-white border-0 py-1.5 px-3">
                                                معاينة مباشرة
                                            </Badge>
                                            {isMicMuted && (
                                                <Badge variant="destructive" className="border-0 py-1.5 px-3">
                                                    الميكروفون مكتوم
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* IF STUDENT OR RECORDING: Show normal player */
                                isLive && hasJoined && stream.streamUrl ? (
                                    <video
                                        src={stream.streamUrl}
                                        className="w-full h-full"
                                        controls
                                        autoPlay
                                    />
                                ) : isEnded && (stream.isRecordingPublished || canManage) && stream.recordingUrl ? (
                                    <div className="relative w-full h-full">
                                        <video
                                            src={stream.recordingUrl}
                                            className="w-full h-full"
                                            controls
                                        />
                                        {canManage && !stream.isRecordingPublished && (
                                            <div className="absolute top-4 left-4">
                                                <Badge className="bg-yellow-600 text-white border-0">
                                                    معاينة خاصة (غير منشور للطلاب)
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                        {stream.thumbnail && !stream.thumbnail.includes('default') && (
                                            <img
                                                src={stream.thumbnail}
                                                alt={stream.title}
                                                className="absolute inset-0 w-full h-full object-cover opacity-30"
                                            />
                                        )}
                                        <div className="relative z-10 text-center">
                                            {isScheduled && (
                                                <>
                                                    <Calendar size={64} className="mx-auto text-blue-400 mb-4" />
                                                    <h3 className="text-xl font-bold mb-2">البث لم يبدأ بعد</h3>
                                                    <p className="text-gray-400">
                                                        موعد البث: {new Date(stream.scheduledAt).toLocaleDateString('ar-EG')} -
                                                        {new Date(stream.scheduledAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </>
                                            )}
                                            {isLive && !hasJoined && (
                                                <>
                                                    <Radio size={64} className="mx-auto text-red-500 mb-4 animate-pulse" />
                                                    <h3 className="text-xl font-bold mb-4">البث مباشر الآن!</h3>
                                                    <Button
                                                        size="lg"
                                                        className="bg-red-500 hover:bg-red-600 gap-2"
                                                        onClick={handleJoinStream}
                                                    >
                                                        <Play size={20} />
                                                        انضم الآن
                                                    </Button>
                                                </>
                                            )}
                                            {isEnded && (
                                                <>
                                                    <Film size={64} className="mx-auto text-gray-400 mb-4" />
                                                    <h3 className="text-xl font-bold mb-2">انتهى البث المباشر</h3>
                                                    {canManage ? (
                                                        <div className="space-y-4">
                                                            {uploadProgress > 0 ? (
                                                                <div className="flex flex-col items-center gap-4">
                                                                    <div className="w-full max-w-xs bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                                                        <div
                                                                            className="bg-blue-600 h-full transition-all duration-300"
                                                                            style={{ width: `${uploadProgress}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <p className="text-blue-400 animate-pulse">جاري رفع التسجيل... {uploadProgress}%</p>
                                                                    <p className="text-xs text-gray-500">من فضلك لا تغلق الصفحة حتى يكتمل الرفع</p>
                                                                </div>
                                                            ) : !stream.recordingUrl ? (
                                                                <div className="flex flex-col items-center gap-4">
                                                                    <p className="text-blue-400">التسجيل قيد المعالجة حالياً. يرجى العودة لاحقاً لنشره للطلاب.</p>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={fetchStream}
                                                                        className="text-white border-white/20 hover:bg-white/10"
                                                                    >
                                                                        تحديث الحالة
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <p className="text-yellow-400">التسجيل جاهز ولكنه غير منشور للطلاب بعد.</p>
                                                                    <Button onClick={handleTogglePublishRecording} className="bg-green-600 hover:bg-green-700">
                                                                        نشر التسجيل الآن
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-400">التسجيل غير متاح حالياً. سيتم نشره فور جاهزيته.</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Stream Info */}
                        <Card className="bg-gray-800 border-gray-700">
                            <CardContent className="p-6">
                                <h1 className="text-2xl font-bold mb-4">{stream.title}</h1>

                                <div className="flex items-center gap-4 mb-4">
                                    <Link to={`/instructor/${stream.instructor._id}`} className="flex items-center gap-3 group">
                                        <Avatar className="h-12 w-12 border-2 border-gray-600">
                                            <AvatarImage
                                                src={stream.instructor.profileImg ? `${API_BASE_URL}/uploads/users/${stream.instructor.profileImg}` : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(stream.instructor.name)}`}
                                                crossOrigin="anonymous"
                                            />
                                            <AvatarFallback>{stream.instructor.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold group-hover:text-red-400 transition-colors">{stream.instructor.name}</p>
                                            <p className="text-sm text-gray-400">المدرب</p>
                                        </div>
                                    </Link>
                                </div>

                                <p className="text-gray-300 leading-relaxed">{stream.description}</p>

                                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-700 text-sm text-gray-400">
                                    <span className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        {new Date(stream.scheduledAt).toLocaleDateString('ar-EG')}
                                    </span>
                                    {stream.duration > 0 && (
                                        <span className="flex items-center gap-2">
                                            <Clock size={16} />
                                            {stream.duration} دقيقة
                                        </span>
                                    )}
                                    <span className="flex items-center gap-2">
                                        <Users size={16} />
                                        {stream.totalViews} مشاهدة
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chat Section */}
                    <div className="lg:col-span-1">
                        <Card className="bg-gray-800 border-gray-700 h-[600px] flex flex-col">
                            <CardHeader className="border-b border-gray-700 py-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <MessageSquare size={20} className="text-red-400" />
                                    الدردشة المباشرة
                                </CardTitle>
                            </CardHeader>

                            <ScrollArea className="flex-1 p-4">
                                {chatMessages.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>لا توجد رسائل بعد</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {chatMessages.map((msg, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <Avatar className="h-8 w-8 flex-shrink-0">
                                                    <AvatarImage
                                                        src={msg.user.profileImg ? `${API_BASE_URL}/uploads/users/${msg.user.profileImg}` : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(msg.user.name)}`}
                                                        crossOrigin="anonymous"
                                                    />
                                                    <AvatarFallback className="text-xs">{msg.user.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm">{msg.user.name}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-300 text-sm">{msg.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>
                                )}
                            </ScrollArea>

                            {isLive && stream.settings.allowChat && (
                                <div className="p-4 border-t border-gray-700">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="اكتب رسالتك..."
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            className="bg-gray-700 border-gray-600 text-white"
                                        />
                                        <Button
                                            size="icon"
                                            className="bg-red-500 hover:bg-red-600"
                                            onClick={handleSendMessage}
                                            disabled={!token}
                                        >
                                            <Send size={18} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveStreamPage;
