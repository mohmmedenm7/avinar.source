import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Users, Clock, CheckCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { API_BASE_URL } from '@/config/env';
import { getImageUrl } from "@/utils/imageUtils";

interface Lecture {
    title: string;
    video: string;
    description: string;
    duration: number;
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
    imageCover?: string;
    curriculum?: Section[];
    whatWillYouLearn?: string[];
    instructor?: string;
    studentsCount?: number;
}

const CourseDetailsPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPaid, setIsPaid] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);

    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    // Fetch payment status
    const fetchPaymentStatus = async () => {
        if (!email || !token || !courseId) return false;

        try {
            const res = await axios.get(
                `${API_BASE_URL}/api/v1/cart/status/${email}/product/${courseId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.data?.status === "success" && res.data?.data) {
                return res.data.data.isPaid || false;
            }
            return false;
        } catch (error) {
            console.error("خطأ في جلب حالة الدفع:", error);
            return false;
        }
    };

    // Fetch course data
    useEffect(() => {
        const fetchCourse = async () => {
            setLoading(true);
            try {
                // Check payment status first
                const paidStatus = await fetchPaymentStatus();
                setIsPaid(paidStatus);

                // Fetch course details
                const res = await axios.get(
                    `${API_BASE_URL}/api/v1/products/${courseId}`,
                    {
                        headers: { Authorization: `Bearer ${token || ""}` },
                    }
                );

                setCourse(res.data?.data);
            } catch (err) {
                toast({ title: "خطأ في جلب بيانات الكورس", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId, token, email]);

    // Add to cart handler
    const handleAddToCart = async () => {
        if (!token) {
            toast({ title: "يرجى تسجيل الدخول أولاً" });
            navigate("/login");
            return;
        }

        setAddingToCart(true);
        try {
            await axios.post(
                `${API_BASE_URL}/api/v1/cart`,
                { productId: courseId, quantity: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast({ title: "تمت إضافة الكورس للسلة بنجاح" });
            window.dispatchEvent(new Event("cartUpdated"));
            navigate("/cart");
        } catch (err: any) {
            console.error(err.response || err);
            toast({
                title: err.response?.data?.message || "فشل إضافة الكورس للسلة",
                variant: "destructive"
            });
        } finally {
            setAddingToCart(false);
        }
    };

    // Calculate total duration
    const totalDuration = course?.curriculum?.reduce((total, section) => {
        return total + section.lectures.reduce((sum, lecture) => sum + (lecture.duration || 0), 0);
    }, 0) || 0;

    const totalLectures = course?.curriculum?.reduce((total, section) => {
        return total + section.lectures.length;
    }, 0) || 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-600 mb-4">الكورس غير موجود</p>
                    <Button onClick={() => navigate("/courses")}>العودة للكورسات</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Button */}
            <div className="bg-white border-b shadow-sm">
                <div className="container mx-auto max-w-6xl px-4 py-4">
                    <button
                        onClick={() => navigate("/courses")}
                        className="flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-all hover:gap-3"
                    >
                        <ArrowRight size={20} />
                        <span className="font-medium">العودة للكورسات</span>
                    </button>
                </div>
            </div>

            {/* Course Header */}
            <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-16">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        {/* Course Image */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                            <img
                                src={getImageUrl(course.imageCover)}
                                alt={course.title}
                                className="relative w-full rounded-2xl shadow-2xl transform group-hover:scale-[1.02] transition duration-300"
                            />
                        </div>

                        {/* Course Info */}
                        <div className="text-right">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                {course.title}
                            </h1>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                {course.description}
                            </p>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-6 mb-6">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Users size={20} className="text-sky-600" />
                                    <span>{course.studentsCount || 0} طالب</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Clock size={20} className="text-sky-600" />
                                    <span>{Math.floor(totalDuration / 60)} ساعة</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <CheckCircle size={20} className="text-sky-600" />
                                    <span>{totalLectures} محاضرة</span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-6 hover:shadow-2xl transition-shadow duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">السعر</p>
                                        <span className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                                            ${course.price}
                                        </span>
                                    </div>
                                    {course.instructor && (
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 mb-1">المدرب</p>
                                            <span className="text-gray-900 font-semibold">
                                                {course.instructor}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Button */}
                                {isPaid ? (
                                    <Button
                                        onClick={() => navigate(`/course/${courseId}`)}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-16 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <CheckCircle className="ml-2" size={22} />
                                        الوصول للكورس
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                        className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 h-16 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                                    >
                                        <ShoppingCart className="ml-2" size={22} />
                                        {addingToCart ? "جاري الإضافة..." : "أضف للسلة"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* What You'll Learn */}
            {course.whatWillYouLearn && course.whatWillYouLearn.length > 0 && (
                <div className="container mx-auto max-w-6xl px-4 py-12">
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-right">
                            ماذا ستتعلم
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {course.whatWillYouLearn.map((item, index) => (
                                <div key={index} className="flex items-start gap-3 text-right">
                                    <CheckCircle size={20} className="text-sky-600 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Course Curriculum */}
            {course.curriculum && course.curriculum.length > 0 && (
                <div className="container mx-auto max-w-6xl px-4 pb-12">
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-right">
                            محتوى الكورس
                        </h2>
                        <div className="space-y-4">
                            {course.curriculum.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                                        <h3 className="font-bold text-gray-900 text-right">
                                            {section.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 text-right mt-1">
                                            {section.lectures.length} محاضرة
                                        </p>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {section.lectures.map((lecture, lectureIndex) => (
                                            <div
                                                key={lectureIndex}
                                                className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Clock size={16} className="text-gray-400" />
                                                    <span className="text-sm text-gray-600">
                                                        {lecture.duration} دقيقة
                                                    </span>
                                                </div>
                                                <span className="text-gray-900 text-right flex-1 mr-4">
                                                    {lecture.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetailsPage;
