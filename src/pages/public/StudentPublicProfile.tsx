import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import {
    Trophy,
    Award,
    Calendar,
    BookOpen,
    CheckCircle,
    Zap,
    Star,
    MessageSquare,
    Link as LinkIcon,
    ChevronLeft
} from "lucide-react";
import { API_BASE_URL } from "@/config/env";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface StudentData {
    student: {
        _id: string;
        name: string;
        profileImg: string;
        xp: number;
        level: number;
        totalPoints: number;
        dailyStreak: number;
        longestStreak: number;
        badges: any[];
        memberSince: string;
    };
    stats: {
        totalEnrolled: number;
        completedCourses: number;
        totalBadges: number;
    };
    courses: any[];
}

const StudentPublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [data, setData] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/v1/users/student/${id}`);
                setData(res.data.data);
            } catch (error) {
                console.error("Error fetching student profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const handleSendMessage = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            // Create or get conversation with this student
            const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    participantId: id,
                }),
            });
            const chatData = await response.json();
            if (chatData.status === 'success') {
                navigate(`/chat?conversation=${chatData.data._id}`);
            } else {
                toast({
                    title: "خطأ",
                    description: "فشل في بدء المحادثة",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Failed to start chat:', error);
            toast({
                title: "خطأ",
                description: "حدث خطأ أثناء محاولة بدء المحادثة",
                variant: "destructive",
            });
        }
    };

    const handleShareProfile = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: "تم نسخ الرابط! 🔗",
            description: "يمكنك الآن مشاركة الملف الشخصي مع الآخرين.",
            className: "bg-green-600 text-white",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] pt-20">
                <h2 className="text-2xl font-bold mb-4">المستخدم غير موجود</h2>
                <Link to="/">
                    <Button variant="outline">العودة للرئيسية</Button>
                </Link>
            </div>
        );
    }

    const { student, stats, courses } = data;

    return (
        <div className="min-h-screen bg-[#f0f2f5] font-cairo py-12 px-4 md:px-8 pt-24">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Back Button */}
                <Link to="/leaderboard" className="inline-flex items-center text-gray-600 hover:text-primary transition-colors mb-4">
                    <ChevronLeft size={20} className="ml-1" />
                    العودة للوحة المتصدرين
                </Link>

                {/* Main Profile Header */}
                <div className="relative bg-white/40 backdrop-blur-xl border border-white/50 rounded-[40px] p-8 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="relative flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-2 bg-gradient-to-tr from-primary to-purple-500 shadow-xl">
                                <Avatar className="w-full h-full border-4 border-white">
                                    <AvatarImage src={student.profileImg ? `${API_BASE_URL}/uploads/users/${student.profileImg}` : ''} />
                                    <AvatarFallback className="text-3xl text-gray-400 bg-gray-100">{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white px-4 py-1.5 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
                                <Zap size={18} className="text-yellow-500 fill-yellow-500" />
                                <span className="font-bold text-gray-800">Lvl {student.level}</span>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-right space-y-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 leading-tight">
                                    {student.name}
                                </h1>
                                <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 text-sm">
                                    <Calendar size={16} />
                                    عضو منذ {new Date(student.memberSince).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="bg-white/60 px-6 py-3 rounded-2xl border border-white/50 shadow-sm transition-all hover:scale-105">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Trophy size={18} className="text-yellow-600" />
                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">نقاط الخبرة XP</span>
                                    </div>
                                    <span className="text-2xl font-black text-gray-800 tracking-tight">{student.xp.toLocaleString()}</span>
                                </div>

                                <div className="bg-white/60 px-6 py-3 rounded-2xl border border-white/50 shadow-sm transition-all hover:scale-105">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Star size={18} className="text-primary" />
                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">سلسلة الإنجاز</span>
                                    </div>
                                    <span className="text-2xl font-black text-gray-800 tracking-tight">{student.dailyStreak} أيام</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button className="rounded-2xl px-8 h-12 shadow-lg hover:scale-105 transition-all text-base gap-2"
                                onClick={handleSendMessage}
                            >
                                <MessageSquare size={18} />
                                إرسال رسالة
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-2xl bg-white/50 backdrop-blur-md px-8 h-12 text-base gap-2"
                                onClick={handleShareProfile}
                            >
                                <LinkIcon size={18} />
                                مشاركة الملف
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Stats & Progress Side */}
                    <div className="space-y-8">
                        {/* Stats Card */}
                        <Card className="bg-white/60 backdrop-blur-lg border-white/50 rounded-[32px] shadow-xl overflow-hidden">
                            <CardHeader className="bg-white/20 border-b border-white/30">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Award size={20} className="text-primary" />
                                    إحصائيات النجاح
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl">
                                    <span className="text-gray-600 font-medium">الكورسات المسجلة</span>
                                    <span className="font-bold text-xl">{stats.totalEnrolled}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl">
                                    <span className="text-gray-600 font-medium">الكورسات المكتملة</span>
                                    <span className="font-bold text-xl text-green-600">{stats.completedCourses}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl">
                                    <span className="text-gray-600 font-medium">الأوسمة المحققة</span>
                                    <span className="font-bold text-xl text-purple-600">{stats.totalBadges}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Badges */}
                        <Card className="bg-white/60 backdrop-blur-lg border-white/50 rounded-[32px] shadow-xl overflow-hidden">
                            <CardHeader className="bg-white/20 border-b border-white/30">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Trophy size={20} className="text-yellow-600" />
                                    آخر الأوسمة
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {student.badges.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-4">
                                        {student.badges.slice(0, 6).map((b, idx) => (
                                            <div key={idx} className="flex flex-col items-center text-center group">
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-inner bg-gradient-to-b ${b.badge.rarity === 'legendary' ? 'from-orange-400 to-red-500' :
                                                    b.badge.rarity === 'epic' ? 'from-purple-400 to-indigo-600' :
                                                        b.badge.rarity === 'rare' ? 'from-blue-400 to-primary' : 'from-gray-200 to-gray-400'
                                                    } transition-transform group-hover:scale-110 duration-300`}>
                                                    <Award size={32} className="text-white drop-shadow-md" />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-600 leading-tight">{b.badge.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center py-6 text-gray-500 text-sm">لم يتم كسب أي أوسمة بعد</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Courses Main Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                            <BookOpen size={28} className="text-primary" />
                            رحلة التعلم
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {courses.length > 0 ? (
                                courses.map((item, idx) => (
                                    <Card key={idx} className="group overflow-hidden bg-white/60 backdrop-blur-lg border-white/50 rounded-[30px] shadow-xl transition-all hover:-translate-y-2 hover:shadow-2xl">
                                        <div className="relative h-48">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <img
                                                src={item.product?.imageCover ? `${API_BASE_URL}/uploads/products/${item.product.imageCover}` : "https://via.placeholder.com/400x200"}
                                                alt={item.product?.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            {item.completionPercentage === 100 && (
                                                <div className="absolute top-4 left-4 z-20 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                                                    <CheckCircle size={14} /> مـكتـمل
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-6 space-y-4">
                                            <div>
                                                <h4 className="font-bold text-base text-gray-900 line-clamp-1 mb-1">{item.product?.title}</h4>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-5 h-5">
                                                        <AvatarImage src={item.product?.instructor?.profileImg ? `${API_BASE_URL}/uploads/users/${item.product.instructor.profileImg}` : ''} />
                                                        <AvatarFallback className="text-[8px]">{item.product?.instructor?.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs text-gray-500">{item.product?.instructor?.name}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-600">
                                                    <span>التقدم {item.completionPercentage}%</span>
                                                </div>
                                                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                                                    <div
                                                        className="absolute top-0 right-0 h-full bg-gradient-to-l from-primary to-purple-500 transition-all duration-1000"
                                                        style={{ width: `${item.completionPercentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <Link to={`/course/${item.product?._id}`}>
                                                <Button variant="ghost" className="w-full text-primary hover:bg-primary/10 rounded-xl text-xs font-bold mt-2">
                                                    مشاهدة تفاصيل الكورس
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-20 bg-white/40 rounded-[40px] border border-dashed border-gray-300">
                                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-bold">لا توجد كورسات مسجلة ظاهرة حالياً</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
                .font-cairo { font-family: 'Cairo', sans-serif; }
            `}} />
        </div>
    );
};

export default StudentPublicProfile;
