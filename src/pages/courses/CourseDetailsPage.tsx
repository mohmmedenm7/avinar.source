import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
import { getImageUrl } from "@/utils/imageUtils";
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
        studentsCount?: number; // Check if backend populates this, otherwise might need another way
        coursesCount?: number; // Check if backend populates
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
    const [showVideo, setShowVideo] = useState(false);

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

    // Fetch course data and SEO data
    useEffect(() => {
        const fetchCourse = async () => {
            setLoading(true);
            try {
                // Fetch course data and SEO data in parallel
                const [courseRes, seoRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/v1/products/${courseId}`),
                    discoveryService.getCourseSEOData(courseId || '').catch(() => null)
                ]);

                const courseData = courseRes.data?.data;
                setCourse(courseData);

                if (seoRes) {
                    setSeoData(seoRes);
                }

                // Check if current user is the owner or admin
                const instructorInfo = courseData?.instructor;
                const instructorId = typeof instructorInfo === 'object' ? instructorInfo?._id : instructorInfo;

                const isUserOwner = userId && instructorId && (userId === instructorId.toString());
                const isUserAdmin = userRole === 'admin' || userRole === 'manager';

                setIsOwner(!!isUserOwner);
                setIsAdmin(!!isUserAdmin);

                // Show notification for owner/admin
                if (isUserOwner) {
                    toast({
                        title: "🎓 أنت تشاهد الكورس الخاص بك",
                        description: "يمكنك التبديل بين عرض المدرب وعرض الطالب",
                    });
                }

                if (courseData?.isFree || courseData?.price === 0) {
                    setIsPaid(true);
                } else {
                    const paidStatus = await fetchPaymentStatus();
                    setIsPaid(paidStatus);
                }

                // Fetch Instructor Stats
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

    // Add to cart
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

    // Calculate totals
    const totalLectures = course?.curriculum?.reduce((acc, sec) => acc + sec.lectures.length, 0) || 0;
    const totalDuration = course?.curriculum?.reduce((acc, sec) =>
        acc + sec.lectures.reduce((a, l) => a + (l.duration || 0), 0), 0) || 0;

    const formatDuration = (mins: number) => {
        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;
        return hours > 0 ? `${hours} ساعة ${minutes > 0 ? `و ${minutes} دقيقة` : ''}` : `${minutes} دقيقة`;
    };

    // Get YouTube embed URL
    const getYouTubeEmbedUrl = (url: string): string | null => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل الكورس...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">الكورس غير موجود</h2>
                    <Button onClick={() => navigate("/courses")} className="bg-sky-500 hover:bg-sky-600">
                        العودة للكورسات
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F4F6]" dir="rtl">
            {/* SEO Meta Tags & Structured Data */}
            {seoData && (
                <CourseSEO
                    metaTags={seoData.metaTags}
                    structuredData={seoData.structuredData}
                />
            )}

            {/* Instructor/Admin Toolbar */}
            {isOwner && !viewAsStudent && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white mt-[85px]">
                    <div className="container mx-auto max-w-6xl px-6 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                    {isOwner ? (
                                        <>
                                            <UserCheck size={18} />
                                            <span className="font-medium text-sm">أنت مالك هذا الكورس</span>
                                        </>
                                    ) : (
                                        <>
                                            <Shield size={18} />
                                            <span className="font-medium text-sm">وضع المدير</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" variant="ghost" className="bg-white/20 hover:bg-white/30 text-white gap-2" onClick={() => setViewAsStudent(true)}>
                                    <Eye size={16} />
                                    معاينة كطالب
                                </Button>
                                <Button size="sm" variant="ghost" className="bg-white/20 hover:bg-white/30 text-white gap-2" onClick={() => navigate(`/InstructorDashboard?edit=${courseId}`)}>
                                    <Pencil size={16} />
                                    تعديل الكورس
                                </Button>
                                <Button size="sm" variant="ghost" className="bg-white/20 hover:bg-white/30 text-white gap-2" onClick={() => navigate(`/InstructorDashboard?edit=${courseId}&tab=curriculum`)}>
                                    <PlusCircle size={16} />
                                    إضافة درس
                                </Button>
                                <Button size="sm" variant="ghost" className="bg-white/20 hover:bg-white/30 text-white gap-2" onClick={() => navigate(`/InstructorDashboard?analytics=${courseId}`)}>
                                    <BarChart3 size={16} />
                                    الإحصائيات
                                </Button>
                                <Button size="sm" variant="ghost" className="bg-white/20 hover:bg-white/30 text-white gap-2" onClick={() => navigate(isAdmin ? '/AdminDashboard' : '/InstructorDashboard')}>
                                    <ExternalLink size={16} />
                                    لوحة التحكم
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Student View Mode Banner */}
            {isOwner && viewAsStudent && (
                <div className="bg-gradient-to-r from-sky-500 to-blue-500 text-white sticky top-0 z-50">
                    <div className="container mx-auto max-w-6xl px-6 py-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Eye size={18} />
                                <span className="font-medium text-sm">أنت تشاهد الكورس كما يراه الطالب</span>
                            </div>
                            <Button size="sm" variant="ghost" className="bg-white/20 hover:bg-white/30 text-white gap-2" onClick={() => setViewAsStudent(false)}>
                                <EyeOff size={16} />
                                العودة لوضع المدرب
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] -z-0"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-0"></div>

                <div className="container mx-auto max-w-6xl px-6 py-16 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Course Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                                <Link to="/" className="hover:text-white transition">الرئيسية</Link>
                                <ArrowRight size={14} className="rotate-180" />
                                <Link to="/courses" className="hover:text-white transition">الكورسات</Link>
                                <ArrowRight size={14} className="rotate-180" />
                                <span className="text-sky-400">{course.category?.name || "كورس"}</span>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                                {course.title}
                            </h1>

                            {/* Description */}
                            <p className="text-gray-300 text-lg leading-relaxed mb-8 line-clamp-3">
                                {course.description}
                            </p>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-6 mb-8">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <Star size={18} fill="currentColor" />
                                        <span className="font-bold text-white">{course.rating || "0"}</span>
                                    </div>
                                    <span className="text-gray-500">({course.ratingsCount || 0} تقييم)</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Users size={18} className="text-sky-400" />
                                    <span>{course.studentsCount || 0} طالب</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Clock size={18} className="text-sky-400" />
                                    <span>{formatDuration(totalDuration)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <BookOpen size={18} className="text-sky-400" />
                                    <span>{totalLectures} درس</span>
                                </div>
                            </div>

                            {/* Instructor */}
                            {course.instructor && (
                                <div className="flex items-center gap-4">
                                    <Link to={`/instructor/${course.instructor._id}`} className="shrink-0 transition-transform hover:scale-105">
                                        <img
                                            src={getImageUrl(course.instructor?.profileImg)}
                                            onError={(e) => e.currentTarget.src = "https://github.com/shadcn.png"}
                                            alt="Instructor"
                                            className="w-12 h-12 rounded-full object-cover border-2 border-sky-400"
                                        />
                                    </Link>
                                    <div>
                                        <p className="text-gray-400 text-sm">المدرب</p>
                                        <Link to={`/instructor/${course.instructor._id}`} className="text-white font-semibold hover:text-sky-400 transition">
                                            {course.instructor?.name}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Course Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:justify-self-end w-full max-w-md"
                        >
                            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                                {/* Video/Image Preview */}
                                <div className="relative aspect-video bg-gray-900 cursor-pointer group overflow-hidden" onClick={() => setShowVideo(true)}>
                                    {showVideo && (course.previewVideoUrl || course.previewVideo) ? (
                                        course.previewVideoUrl && getYouTubeEmbedUrl(course.previewVideoUrl) ? (
                                            <iframe
                                                src={`${getYouTubeEmbedUrl(course.previewVideoUrl)}?autoplay=1`}
                                                className="w-full h-full"
                                                allow="autoplay; encrypted-media"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <video src={course.previewVideo} className="w-full h-full object-cover" controls autoPlay />
                                        )
                                    ) : (
                                        <>
                                            {/* Show preview video as background with autoplay if available */}
                                            {course.previewVideo ? (
                                                <video
                                                    src={course.previewVideo}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    loop
                                                    autoPlay
                                                    playsInline
                                                    poster={getImageUrl(course.imageCover || "")}
                                                />
                                            ) : course.previewVideoUrl && getYouTubeEmbedUrl(course.previewVideoUrl) ? (
                                                // YouTube thumbnail as background
                                                <img
                                                    src={`https://img.youtube.com/vi/${getYouTubeEmbedUrl(course.previewVideoUrl)?.split('/embed/')[1]}/maxresdefault.jpg`}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => e.currentTarget.src = getImageUrl(course.imageCover || "")}
                                                />
                                            ) : (
                                                <img
                                                    src={getImageUrl(course.imageCover || "")}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                <div className="bg-white/95 backdrop-blur-sm rounded-full p-5 shadow-2xl group-hover:scale-110 transition-transform">
                                                    <Play size={32} fill="#0ea5e9" className="text-sky-500 ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-4 left-4 right-4 text-center">
                                                <span className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                                                    {course.previewVideo || course.previewVideoUrl ? 'تشغيل الفيديو التعريفي' : 'معاينة الكورس'}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Card Content */}
                                <div className="p-6 space-y-5">
                                    {/* Price */}
                                    {course.isFree || course.price === 0 ? (
                                        <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl">
                                            <Gift size={28} className="text-white" />
                                            <span className="text-2xl font-bold text-white">مجاني بالكامل</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                {course.priceAfterDiscount && course.priceAfterDiscount < course.price ? (
                                                    <>
                                                        <span className="text-4xl font-black text-gray-900">${course.priceAfterDiscount}</span>
                                                        <span className="text-gray-400 line-through text-lg">${course.price}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-4xl font-black text-gray-900">${course.price}</span>
                                                )}
                                            </div>
                                            {course.priceAfterDiscount && course.priceAfterDiscount < course.price && (
                                                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                                                    خصم {Math.round(((course.price - course.priceAfterDiscount) / course.price) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        {isPaid || course.isFree || course.price === 0 ? (
                                            <Button
                                                onClick={() => navigate(`/course/${courseId}`)}
                                                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-xl shadow-lg shadow-sky-500/25"
                                            >
                                                <Play size={20} className="ml-2" />
                                                {course.isFree || course.price === 0 ? "ابدأ التعلم الآن" : "متابعة الكورس"}
                                            </Button>
                                        ) : !isOwner ? (
                                            <>
                                                <Button
                                                    onClick={handleAddToCart}
                                                    disabled={addingToCart}
                                                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-xl shadow-lg shadow-sky-500/25"
                                                >
                                                    <ShoppingCart size={20} className="ml-2" />
                                                    {addingToCart ? "جاري الإضافة..." : "أضف للسلة"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-12 text-base font-semibold border-2 border-gray-200 hover:bg-gray-50 rounded-xl"
                                                >
                                                    شراء الآن
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="w-full py-4 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                                                <span className="font-medium">أنت المدرب لهذا الكورس</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Guarantee */}
                                    {
                                        !(course.isFree || course.price === 0) && (
                                            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                                                <Shield size={16} />
                                                <span>ضمان استرداد الأموال لمدة 30 يوم</span>
                                            </div>
                                        )
                                    }

                                    {/* Features */}
                                    <div className="pt-4 border-t space-y-3">
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <PlayCircle size={18} className="text-sky-500" />
                                            <span>{totalLectures} درس فيديو</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Clock size={18} className="text-sky-500" />
                                            <span>{formatDuration(totalDuration)} من المحتوى</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Globe size={18} className="text-sky-500" />
                                            <span>وصول مدى الحياة</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Award size={18} className="text-sky-500" />
                                            <span>شهادة إتمام</span>
                                        </div>
                                    </div>
                                </div >
                            </div >
                        </motion.div >
                    </div >
                </div >
            </section >

            {/* Main Content */}
            < div className="container mx-auto max-w-6xl px-6 py-12" >
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* What You'll Learn */}
                        {course.whatWillYouLearn && course.whatWillYouLearn.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                                        <CheckCircle size={22} className="text-sky-600" />
                                    </div>
                                    ماذا ستتعلم؟
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {course.whatWillYouLearn.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-sky-50 transition"
                                        >
                                            <CheckCircle size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                                            <span className="text-gray-700">{item}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Curriculum */}
                        {course.curriculum && course.curriculum.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                                            <BookOpen size={22} className="text-sky-600" />
                                        </div>
                                        محتوى الكورس
                                    </h2>
                                    <span className="text-gray-500 text-sm">
                                        {course.curriculum.length} أقسام • {totalLectures} درس
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {course.curriculum.map((section, sIndex) => (
                                        <div key={sIndex} className="border border-gray-100 rounded-xl overflow-hidden">
                                            {/* Section Header */}
                                            <button
                                                onClick={() => toggleSection(sIndex)}
                                                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-sky-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                                        {sIndex + 1}
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{section.title}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-gray-500 text-sm">{section.lectures.length} دروس</span>
                                                    {expandedSections.includes(sIndex) ? (
                                                        <ChevronUp size={20} className="text-gray-400" />
                                                    ) : (
                                                        <ChevronDown size={20} className="text-gray-400" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Lectures */}
                                            {expandedSections.includes(sIndex) && (
                                                <div className="divide-y divide-gray-100">
                                                    {section.lectures.map((lecture, lIndex) => (
                                                        <div
                                                            key={lIndex}
                                                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {isPaid || lecture.isFree ? (
                                                                    <PlayCircle size={18} className="text-sky-500" />
                                                                ) : (
                                                                    <Lock size={18} className="text-gray-400" />
                                                                )}
                                                                <span className="text-gray-700">{lecture.title}</span>
                                                                {lecture.isFree && (
                                                                    <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                                                        <Eye size={12} /> مجاني
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-gray-400 text-sm">
                                                                {lecture.duration} دقيقة
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Instructor Section */}
                        {course.instructor && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                                        <Award size={22} className="text-sky-600" />
                                    </div>
                                    عن المدرب
                                </h2>

                                <div className="flex items-start gap-6">
                                    <Link to={`/instructor/${course.instructor._id}`} className="shrink-0 transition-transform hover:scale-105">
                                        <img
                                            src={getImageUrl(course.instructor?.profileImg)}
                                            onError={(e) => e.currentTarget.src = "https://github.com/shadcn.png"}
                                            alt="Instructor"
                                            className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100"
                                        />
                                    </Link>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{course.instructor?.name}</h3>
                                        <p className="text-sky-600 font-medium mb-3">
                                            {course.instructor?.instructorProfile?.specialties?.join(" | ") || "مدرب في المنصة"}
                                        </p>

                                        {/* Instructor Stats - Real Data */}
                                        <div className="flex flex-wrap gap-4 text-gray-500 text-sm mb-4">
                                            <span className="flex items-center gap-1">
                                                <Star size={14} className="text-yellow-500" /> {instructorStats?.averageRating || course.rating || 0} تقييم المدرب
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users size={14} /> {instructorStats?.totalStudents || course.studentsCount || 0} طالب
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <PlayCircle size={14} /> {instructorStats?.totalCourses || 0} كورس
                                            </span>
                                        </div>

                                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                            {course.instructor?.instructorProfile?.bio || "لا توجد نبذة تعريفية متاحة حالياً."}
                                        </p>

                                        <div className="mt-4">
                                            <Link
                                                to={`/instructor/${course.instructor._id}`}
                                                className="text-sky-600 hover:text-sky-800 font-medium text-sm flex items-center gap-1"
                                            >
                                                عرض الملف الشخصي الكامل <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Reviews */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                                    <Star size={22} className="text-sky-600" />
                                </div>
                                التقييمات والمراجعات
                            </h2>
                            <ReviewsDisplay productId={courseId || ""} />
                        </motion.div>
                    </div>

                    {/* Right Sidebar - Sticky on Desktop */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            {/* Quick Info Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4">يتضمن هذا الكورس:</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <PlayCircle size={20} className="text-sky-500 shrink-0" />
                                        <span>{totalLectures} درس فيديو حسب الطلب</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Clock size={20} className="text-sky-500 shrink-0" />
                                        <span>{formatDuration(totalDuration)} من المحتوى التعليمي</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Smartphone size={20} className="text-sky-500 shrink-0" />
                                        <span>إمكانية الوصول عبر الهاتف والتلفاز</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Globe size={20} className="text-sky-500 shrink-0" />
                                        <span>وصول كامل مدى الحياة</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Award size={20} className="text-sky-500 shrink-0" />
                                        <span>شهادة إتمام معتمدة من المنصة</span>
                                    </div>
                                </div>
                            </div>

                            {/* Share Card */}
                            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-100">
                                <h3 className="font-bold text-gray-900 mb-3">شارك مع أصدقائك</h3>
                                <p className="text-gray-600 text-sm mb-4">ساعد أصدقاءك في تطوير مهاراتهم</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 rounded-xl">
                                        واتساب
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 rounded-xl">
                                        تويتر
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            <ChatButton />
        </div >
    );
};

export default CourseDetailsPage;
