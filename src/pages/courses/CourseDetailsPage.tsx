import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowRight, Users, Clock, CheckCircle, ShoppingCart,
    PlayCircle, Star, Globe, Award, BookOpen, Shield,
    Play, Gift, ChevronDown, ChevronUp, Lock, Eye, Smartphone,
    Pencil, Settings, BarChart3, ExternalLink, UserCheck, EyeOff, PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { API_BASE_URL } from '@/config/env';
import { getImageUrl, getVideoUrl } from "@/utils/imageUtils";
import { ReviewsDisplay } from "@/components/reviews/ReviewsDisplay";
import { ChatButton } from "@/components/chat";
import { CourseSEO } from "@/components/seo/CourseSEO";
import { discoveryService, SEOData } from "@/services/discoveryService";

interface Lecture {
    title: string;
    video: string;
    videoUrl?: string;
    description: string;
    duration: number;
    isFree?: boolean;
}

interface Section {
    title: string;
    lectures: Lecture[];
}

interface Course {
    _id: string;
    title: string;
    description: string;
    price: number;
    priceAfterDiscount?: number;
    isFree?: boolean;
    imageCover?: string;
    previewVideo?: string;
    previewVideoUrl?: string;
    curriculum?: Section[];
    whatWillYouLearn?: string[];
    instructor?: {
        _id: string;
        name: string;
        profileImg?: string;
        instructorProfile?: {
            bio?: string;
            specialties?: string[];
            experience?: string;
        };
        studentsCount?: number;
        coursesCount?: number;
    };
    studentsCount?: number;
    rating?: number;
    ratingsCount?: number;
    category?: any;
    updatedAt?: string;
    language?: string;
}

interface InstructorStats {
    totalCourses: number;
    totalStudents: number;
    totalReviews: number;
    averageRating: number;
}

const CourseDetailsPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [course, setCourse] = useState<Course | null>(null);
    const [instructorStats, setInstructorStats] = useState<InstructorStats | null>(null);
    const [seoData, setSeoData] = useState<SEOData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPaid, setIsPaid] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [expandedSections, setExpandedSections] = useState<number[]>([0]);
    const [playingVideo, setPlayingVideo] = useState(false);

    // Instructor/Owner Mode States
    const [isOwner, setIsOwner] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [viewAsStudent, setViewAsStudent] = useState(false);

    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role");

    // Fetch payment status
    const fetchPaymentStatus = async () => {
        if (!token || !email) return false;
        try {
            const res = await axios.get(`${API_BASE_URL}/api/orders/${email}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const orders = res.data?.data || [];
            return orders.some(
                (order: any) =>
                    order.cartItems?.some((item: any) => item.product?._id === courseId) &&
                    order.isPaid
            );
        } catch {
            return false;
        }
    };

    // Fetch course data
    useEffect(() => {
        const fetchCourse = async () => {
            setLoading(true);
            try {
                const [courseRes, seoRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/v1/products/${courseId}`),
                    discoveryService.getCourseSEOData(courseId || '').catch(() => null)
                ]);

                const courseData = courseRes.data?.data;
                setCourse(courseData);
                if (seoRes) setSeoData(seoRes);

                const instructorInfo = courseData?.instructor;
                const instructorId = typeof instructorInfo === 'object' ? instructorInfo?._id : instructorInfo;
                const isUserOwner = userId && instructorId && (userId === instructorId.toString());
                const isUserAdmin = userRole === 'admin' || userRole === 'manager';
                setIsOwner(!!isUserOwner);
                setIsAdmin(!!isUserAdmin);

                if (courseData?.isFree || courseData?.price === 0) {
                    setIsPaid(true);
                } else {
                    const paidStatus = await fetchPaymentStatus();
                    setIsPaid(paidStatus);
                }

                if (courseData?.instructor?._id) {
                    const instRes = await axios.get(`${API_BASE_URL}/api/v1/users/instructor/${courseData.instructor._id}`);
                    setInstructorStats(instRes.data?.data?.stats);
                }
            } catch (err) {
                toast({ title: "خطأ في جلب بيانات الكورس", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, token, email, userId, userRole]);

    const handleAddToCart = async () => {
        if (!token) {
            toast({ title: "يرجى تسجيل الدخول أولاً", variant: "destructive" });
            navigate("/login");
            return;
        }
        setAddingToCart(true);
        try {
            await axios.post(
                `${API_BASE_URL}/api/v1/cart`,
                { productId: courseId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast({ title: "✅ تمت الإضافة للسلة بنجاح" });
        } catch (err: any) {
            toast({ title: err.response?.data?.message || "حدث خطأ", variant: "destructive" });
        } finally {
            setAddingToCart(false);
        }
    };

    const toggleSection = (index: number) => {
        setExpandedSections(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const totalLectures = course?.curriculum?.reduce((acc, sec) => acc + sec.lectures.length, 0) || 0;
    const totalDuration = course?.curriculum?.reduce((acc, sec) =>
        acc + sec.lectures.reduce((a, l) => a + (l.duration || 0), 0), 0) || 0;

    const formatDuration = (mins: number) => {
        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;
        return hours > 0 ? `${hours}س ${minutes > 0 ? `${minutes}د` : ''}` : `${minutes} دقيقة`;
    };

    const getYouTubeEmbedUrl = (url: string): string | null => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    // Resolve the actual image URL for the cover
    const resolvedCoverImage = (() => {
        if (!course?.imageCover) return "/placeholder-course.png";
        const img = course.imageCover;
        if (img.startsWith('http://') || img.startsWith('https://')) return img;
        if (img.includes('/')) return `${API_BASE_URL}/${img}`;
        return `${API_BASE_URL}/products/${img}`;
    })();

    // Resolve video URL
    const resolvedPreviewVideo = (() => {
        if (course?.previewVideoUrl) return course.previewVideoUrl;
        if (!course?.previewVideo) return null;
        const vid = course.previewVideo;
        if (vid.startsWith('http://') || vid.startsWith('https://')) return vid;
        return `${API_BASE_URL}/${vid}`;
    })();

    const hasVideo = !!(resolvedPreviewVideo || course?.previewVideoUrl);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">الكورس غير موجود</h2>
                    <Button onClick={() => navigate("/courses")} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                        العودة للكورسات
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {seoData && <CourseSEO metaTags={seoData.metaTags} structuredData={seoData.structuredData} />}

            {/* Owner Toolbar */}
            {isOwner && !viewAsStudent && (
                <div className="bg-amber-500 text-white mt-[80px]">
                    <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <UserCheck size={16} />
                            <span>أنت مالك هذا الكورس</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <Button size="sm" variant="ghost" className="h-8 text-xs bg-white/20 hover:bg-white/30 text-white gap-1.5" onClick={() => setViewAsStudent(true)}>
                                <Eye size={14} /> معاينة كطالب
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 text-xs bg-white/20 hover:bg-white/30 text-white gap-1.5" onClick={() => navigate(`/InstructorDashboard?edit=${courseId}`)}>
                                <Pencil size={14} /> تعديل
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 text-xs bg-white/20 hover:bg-white/30 text-white gap-1.5" onClick={() => navigate(`/InstructorDashboard?analytics=${courseId}`)}>
                                <BarChart3 size={14} /> إحصائيات
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {isOwner && viewAsStudent && (
                <div className="bg-blue-500 text-white sticky top-0 z-50">
                    <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
                        <span className="text-sm flex items-center gap-1.5"><Eye size={14} /> وضع معاينة الطالب</span>
                        <Button size="sm" variant="ghost" className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white gap-1" onClick={() => setViewAsStudent(false)}>
                            <EyeOff size={14} /> رجوع
                        </Button>
                    </div>
                </div>
            )}

            {/* ====== HERO ====== */}
            <div className={`bg-white border-b ${!isOwner || viewAsStudent ? 'pt-24' : 'pt-4'} pb-0`}>
                <div className="max-w-5xl mx-auto px-4">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-6">
                        <Link to="/" className="hover:text-gray-600 transition">الرئيسية</Link>
                        <ArrowRight size={12} className="rotate-180" />
                        <Link to="/courses" className="hover:text-gray-600 transition">الكورسات</Link>
                        <ArrowRight size={12} className="rotate-180" />
                        <span className="text-blue-600">{course.category?.name || "كورس"}</span>
                    </div>

                    <div className="grid lg:grid-cols-5 gap-8 pb-10">
                        {/* Info - 3 cols */}
                        <div className="lg:col-span-3">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-4">
                                {course.title}
                            </h1>
                            <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-3">
                                {course.description}
                            </p>

                            {/* Stats row */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-5">
                                <div className="flex items-center gap-1">
                                    <Star size={15} fill="#facc15" className="text-yellow-400" />
                                    <span className="font-semibold text-gray-800">{course.rating || "0"}</span>
                                    <span>({course.ratingsCount || 0})</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users size={15} className="text-blue-500" />
                                    <span>{course.studentsCount || 0} طالب</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={15} className="text-blue-500" />
                                    <span>{formatDuration(totalDuration)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <BookOpen size={15} className="text-blue-500" />
                                    <span>{totalLectures} درس</span>
                                </div>
                            </div>

                            {/* Instructor */}
                            {course.instructor && (
                                <Link to={`/instructor/${course.instructor._id}`} className="inline-flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition">
                                    <img
                                        src={getImageUrl(course.instructor?.profileImg)}
                                        onError={(e) => e.currentTarget.src = "https://github.com/shadcn.png"}
                                        alt="Instructor"
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                    />
                                    <div>
                                        <p className="text-xs text-gray-400">المدرب</p>
                                        <p className="text-sm font-semibold text-gray-800">{course.instructor?.name}</p>
                                    </div>
                                </Link>
                            )}
                        </div>

                        {/* Card - 2 cols */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden sticky top-24">
                                {/* Video / Image */}
                                <div className="relative aspect-video bg-gray-900 cursor-pointer group" onClick={() => setPlayingVideo(true)}>
                                    {playingVideo && hasVideo ? (
                                        course.previewVideoUrl && getYouTubeEmbedUrl(course.previewVideoUrl) ? (
                                            <iframe
                                                src={`${getYouTubeEmbedUrl(course.previewVideoUrl)}?autoplay=1`}
                                                className="w-full h-full"
                                                allow="autoplay; encrypted-media"
                                                allowFullScreen
                                            />
                                        ) : resolvedPreviewVideo ? (
                                            <video src={resolvedPreviewVideo} className="w-full h-full object-cover" controls autoPlay />
                                        ) : null
                                    ) : (
                                        <>
                                            <img
                                                src={resolvedCoverImage}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => e.currentTarget.src = "/placeholder-course.png"}
                                            />
                                            {hasVideo && (
                                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition flex items-center justify-center">
                                                    <div className="bg-white/90 backdrop-blur rounded-full p-4 shadow-xl group-hover:scale-110 transition-transform">
                                                        <Play size={28} fill="#2563eb" className="text-blue-600 ms-0.5" />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Price & Actions */}
                                <div className="p-5 space-y-4">
                                    {/* Price */}
                                    {course.isFree || course.price === 0 ? (
                                        <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold">
                                            <Gift size={20} /> مجاني
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-baseline gap-2">
                                                {course.priceAfterDiscount && course.priceAfterDiscount < course.price ? (
                                                    <>
                                                        <span className="text-3xl font-black text-gray-900">${course.priceAfterDiscount}</span>
                                                        <span className="text-gray-400 line-through text-base">${course.price}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-3xl font-black text-gray-900">${course.price}</span>
                                                )}
                                            </div>
                                            {course.priceAfterDiscount && course.priceAfterDiscount < course.price && (
                                                <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                                                    خصم {Math.round(((course.price - course.priceAfterDiscount) / course.price) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Buttons */}
                                    {isPaid || course.isFree || course.price === 0 ? (
                                        <Button onClick={() => navigate(`/course/${courseId}`)} className="w-full h-12 font-bold bg-blue-600 hover:bg-blue-700 rounded-xl text-base gap-2">
                                            <Play size={18} />
                                            {course.isFree || course.price === 0 ? "ابدأ التعلم" : "متابعة الكورس"}
                                        </Button>
                                    ) : !isOwner ? (
                                        <div className="space-y-2">
                                            <Button onClick={handleAddToCart} disabled={addingToCart} className="w-full h-12 font-bold bg-blue-600 hover:bg-blue-700 rounded-xl text-base gap-2">
                                                <ShoppingCart size={18} />
                                                {addingToCart ? "جاري الإضافة..." : "أضف للسلة"}
                                            </Button>
                                            <Button variant="outline" className="w-full h-10 text-sm font-medium border-gray-200 rounded-xl">
                                                شراء الآن
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="py-3 text-center text-gray-400 bg-gray-50 rounded-xl text-sm">
                                            أنت المدرب لهذا الكورس
                                        </div>
                                    )}

                                    {!(course.isFree || course.price === 0) && (
                                        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                                            <Shield size={13} /> ضمان استرداد 30 يوم
                                        </p>
                                    )}

                                    {/* Features */}
                                    <div className="pt-3 border-t space-y-2.5">
                                        {[
                                            { icon: PlayCircle, text: `${totalLectures} درس فيديو` },
                                            { icon: Clock, text: `${formatDuration(totalDuration)} محتوى` },
                                            { icon: Globe, text: "وصول مدى الحياة" },
                                            { icon: Smartphone, text: "متوفر على الهاتف" },
                                            { icon: Award, text: "شهادة إتمام" },
                                        ].map((f, i) => (
                                            <div key={i} className="flex items-center gap-2.5 text-gray-500 text-sm">
                                                <f.icon size={16} className="text-blue-500 shrink-0" />
                                                <span>{f.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ====== CONTENT ====== */}
            <div className="max-w-5xl mx-auto px-4 py-10">
                <div className="grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-8">

                        {/* What You'll Learn */}
                        {course.whatWillYouLearn && course.whatWillYouLearn.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle size={20} className="text-emerald-500" />
                                    ماذا ستتعلم؟
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {course.whatWillYouLearn.map((item, i) => (
                                        <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                                            <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Curriculum */}
                        {course.curriculum && course.curriculum.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <BookOpen size={20} className="text-blue-500" />
                                        محتوى الكورس
                                    </h2>
                                    <span className="text-gray-400 text-xs">
                                        {course.curriculum.length} أقسام • {totalLectures} درس
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {course.curriculum.map((section, sIndex) => (
                                        <div key={sIndex} className="border border-gray-100 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => toggleSection(sIndex)}
                                                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 transition text-sm"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                                                        {sIndex + 1}
                                                    </div>
                                                    <span className="font-semibold text-gray-800">{section.title}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-gray-400 text-xs">{section.lectures.length} دروس</span>
                                                    {expandedSections.includes(sIndex) ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                                </div>
                                            </button>

                                            {expandedSections.includes(sIndex) && (
                                                <div className="divide-y divide-gray-50">
                                                    {section.lectures.map((lecture, lIndex) => (
                                                        <div key={lIndex} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition text-sm">
                                                            <div className="flex items-center gap-2.5">
                                                                {isPaid || lecture.isFree ? (
                                                                    <PlayCircle size={16} className="text-blue-500" />
                                                                ) : (
                                                                    <Lock size={16} className="text-gray-300" />
                                                                )}
                                                                <span className="text-gray-700">{lecture.title}</span>
                                                                {lecture.isFree && (
                                                                    <span className="bg-emerald-50 text-emerald-600 text-[10px] px-1.5 py-0.5 rounded font-medium">
                                                                        مجاني
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-gray-400 text-xs">{lecture.duration}د</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Instructor */}
                        {course.instructor && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Award size={20} className="text-blue-500" />
                                    عن المدرب
                                </h2>

                                <div className="flex items-start gap-4">
                                    <Link to={`/instructor/${course.instructor._id}`}>
                                        <img
                                            src={getImageUrl(course.instructor?.profileImg)}
                                            onError={(e) => e.currentTarget.src = "https://github.com/shadcn.png"}
                                            alt="Instructor"
                                            className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                                        />
                                    </Link>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{course.instructor?.name}</h3>
                                        <p className="text-blue-600 text-sm mb-2">
                                            {course.instructor?.instructorProfile?.specialties?.join(" • ") || "مدرب في المنصة"}
                                        </p>
                                        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                                            <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500" /> {instructorStats?.averageRating || course.rating || 0}</span>
                                            <span className="flex items-center gap-1"><Users size={12} /> {instructorStats?.totalStudents || 0} طالب</span>
                                            <span className="flex items-center gap-1"><PlayCircle size={12} /> {instructorStats?.totalCourses || 0} كورس</span>
                                        </div>
                                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                                            {course.instructor?.instructorProfile?.bio || "لا توجد نبذة تعريفية."}
                                        </p>
                                        <Link to={`/instructor/${course.instructor._id}`} className="text-blue-600 text-xs font-medium mt-2 inline-flex items-center gap-1 hover:text-blue-700">
                                            الملف الكامل <ArrowRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Star size={20} className="text-yellow-500" />
                                التقييمات
                            </h2>
                            <ReviewsDisplay productId={courseId || ""} />
                        </div>
                    </div>

                    {/* Sidebar spacer on desktop (card is in hero) */}
                    <div className="lg:col-span-2 hidden lg:block">
                        <div className="sticky top-24 space-y-5">
                            {/* Share */}
                            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                                <h3 className="font-bold text-gray-800 text-sm mb-2">شارك مع أصدقائك</h3>
                                <p className="text-gray-500 text-xs mb-3">ساعد أصدقاءك في تطوير مهاراتهم</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs h-9">واتساب</Button>
                                    <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs h-9">تويتر</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ChatButton />
        </div>
    );
};

export default CourseDetailsPage;
