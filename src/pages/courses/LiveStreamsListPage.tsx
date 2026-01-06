import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Video,
    Radio,
    Calendar,
    Clock,
    Users,
    Play,
    Film,
    ChevronRight
} from 'lucide-react';

interface LiveStream {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    status: 'scheduled' | 'live' | 'ended' | 'cancelled';
    scheduledAt: string;
    duration: number;
    currentViewers: number;
    totalViews: number;
    isFree: boolean;
    price: number;
    instructor: {
        _id: string;
        name: string;
        profileImg: string;
    };
}

const LiveStreamsListPage = () => {
    const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
    const [scheduledStreams, setScheduledStreams] = useState<LiveStream[]>([]);
    const [recordings, setRecordings] = useState<LiveStream[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('live');
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = currentUser._id;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch live streams
                const liveRes = await axios.get(`${API_BASE_URL}/api/v1/livestreams?status=live`);
                setLiveStreams(liveRes.data.data || []);

                // Fetch scheduled streams
                const scheduledRes = await axios.get(`${API_BASE_URL}/api/v1/livestreams?upcoming=true`);
                setScheduledStreams(scheduledRes.data.data || []);

                // Fetch recordings
                const recordingsRes = await axios.get(`${API_BASE_URL}/api/v1/livestreams/recordings`);
                setRecordings(recordingsRes.data.data || []);

            } catch (error) {
                console.error('Error fetching streams:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const StreamCard = ({ stream, isLive = false }: { stream: LiveStream; isLive?: boolean }) => (
        <div className="relative group">
            <Link to={`/live/${stream._id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                    <div className="relative h-48 bg-gradient-to-br from-red-500 to-purple-600 overflow-hidden">
                        {stream.thumbnail && !stream.thumbnail.includes('default') && (
                            <img
                                src={stream.thumbnail}
                                alt={stream.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                            {stream.status === 'live' && (
                                <Badge className="bg-red-500 text-white animate-pulse gap-1">
                                    <Radio size={12} />
                                    مباشر
                                </Badge>
                            )}
                            {stream.status === 'scheduled' && (
                                <Badge variant="outline" className="bg-white/90 border-blue-500 text-blue-600 gap-1">
                                    <Calendar size={12} />
                                    قريباً
                                </Badge>
                            )}
                            {stream.status === 'ended' && (
                                <Badge variant="secondary" className="gap-1">
                                    <Film size={12} />
                                    تسجيل
                                </Badge>
                            )}
                        </div>

                        {/* Price Badge */}
                        <div className="absolute top-3 left-3">
                            {stream.isFree ? (
                                <Badge className="bg-green-500 text-white">مجاني</Badge>
                            ) : (
                                <Badge className="bg-yellow-500 text-black">{stream.price} ر.س</Badge>
                            )}
                        </div>

                        {/* Viewers/Views */}
                        <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                            <Users size={12} />
                            {isLive ? `${stream.currentViewers} يشاهدون` : `${stream.totalViews} مشاهدة`}
                        </div>

                        {/* Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                <Play size={28} className="text-red-500 mr-[-2px]" fill="currentColor" />
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-5">
                        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-red-500 transition-colors">
                            {stream.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{stream.description}</p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={stream.instructor?.profileImg ? `${API_BASE_URL}/uploads/users/${stream.instructor.profileImg}` : ''} />
                                    <AvatarFallback className="text-xs">{stream.instructor?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-gray-600">{stream.instructor?.name}</span>
                            </div>

                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock size={12} />
                                {stream.status === 'scheduled'
                                    ? new Date(stream.scheduledAt).toLocaleDateString('ar-EG')
                                    : `${stream.duration} دقيقة`
                                }
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            {/* Instructor Actions */}
            {userId === stream.instructor?._id && stream.status === 'scheduled' && (
                <div className="absolute bottom-24 right-4 z-10">
                    <Button
                        className="bg-red-500 hover:bg-red-600 shadow-lg gap-2 rounded-full px-6"
                        onClick={() => navigate(`/live/${stream._id}`)}
                    >
                        <Video size={18} />
                        ابدأ البث
                    </Button>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full mb-4">
                        <Video size={20} />
                        <span className="font-semibold">البث المباشر</span>
                    </div>
                    <h1 className="text-4xl font-black mb-4">المحاضرات المباشرة والتسجيلات</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        انضم للبث المباشر مع أفضل المدربين، أو شاهد التسجيلات في أي وقت يناسبك
                    </p>
                </div>

                {/* Live Now Section - Always visible if there are live streams */}
                {liveStreams.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Radio className="text-red-500 animate-pulse" />
                                مباشر الآن
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {liveStreams.map((stream) => (
                                <StreamCard key={stream._id} stream={stream} isLive={true} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="mb-8 bg-white shadow-sm rounded-full p-1">
                        <TabsTrigger
                            value="upcoming"
                            className="rounded-full px-6 data-[state=active]:bg-red-500 data-[state=active]:text-white"
                        >
                            <Calendar size={16} className="ml-2" />
                            البث القادم ({scheduledStreams.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="recordings"
                            className="rounded-full px-6 data-[state=active]:bg-red-500 data-[state=active]:text-white"
                        >
                            <Film size={16} className="ml-2" />
                            التسجيلات ({recordings.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming">
                        {scheduledStreams.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                                <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-400 mb-2">لا توجد بثوث قادمة</h3>
                                <p className="text-gray-400">تابعنا لمعرفة مواعيد البث القادمة</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {scheduledStreams.map((stream) => (
                                    <StreamCard key={stream._id} stream={stream} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="recordings">
                        {recordings.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                                <Film size={64} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-400 mb-2">لا توجد تسجيلات</h3>
                                <p className="text-gray-400">ستظهر هنا تسجيلات البث بعد انتهائها</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recordings.map((stream) => (
                                    <StreamCard key={stream._id} stream={stream} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default LiveStreamsListPage;
