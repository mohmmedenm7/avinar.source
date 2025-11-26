import { useState, useEffect } from "react";
import { ArrowRight, Play, Users, Clock } from "lucide-react";
import { API_BASE_URL } from '@/config/env';

interface Lesson {
  _id: string;
  title: string;
  duration?: string;
  videoUrl?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageCover?: string;
  lessons?: Lesson[];
  instructor?: string;
  studentsCount?: number;
  totalHours?: number;
}

const CourseViewPage = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isPaid, setIsPaid] = useState<boolean>(false);

  const token =
    typeof window !== "undefined" ? localStorage?.getItem("token") : null;
  const email =
    typeof window !== "undefined" ? localStorage?.getItem("email") : null;

  const courseId =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").pop()
      : null;

  // ⭐⭐⭐ جلب حالة الدفع
  const fetchPaymentStatus = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/cart/status/${email}/product/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setIsPaid(data?.isPaid === true);
    } catch (err) {
      setIsPaid(false);
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);

      try {
        await fetchPaymentStatus(); // ⭐ جلب حالة الدفع أولاً

        const res = await fetch(
          `${API_BASE_URL}/api/v1/products/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token || ""}` },
          }
        );

        const data = await res.json();
        const courseData = data?.data;
        setCourse(courseData);

        if (courseData?.lessons?.[0]) {
          setSelectedLesson(courseData.lessons[0]);
        }
      } catch (err) {
        showToast("خطأ في جلب الكورس", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [token]);

  const showToast = (message: string, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  // ❌❌ منع الدخول لو لم يتم الدفع ❌❌
  if (!isPaid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50" dir="rtl">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          ❌ لا يمكنك الوصول لهذا الكورس
        </h1>
        <p className="text-gray-700 mb-6 text-lg">
          يجب شراء الكورس أولاً حتى تتمكن من مشاهدة الدروس.
        </p>

        <button
          onClick={() => (window.location.href = "/courses")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          الرجوع للكورسات
        </button>
      </div>
    );
  }

  // 📌 لو تم الدفع — عرض محتوى الكورس
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">لم يتم العثور على الكورس</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
            toast.type === "error" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Back Button */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
          >
            <ArrowRight size={20} />
            العودة
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg overflow-hidden shadow-md mb-6">
              <img
                src={course.imageCover || "/placeholder-course.png"}
                alt={course.title}
                className="w-full h-96 object-cover"
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {course.description}
              </p>

              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b mb-4">
                <div className="flex items-center gap-3">
                  <Users size={24} className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">الطلاب</p>
                    <p className="font-bold">{course.studentsCount || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={24} className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">الساعات</p>
                    <p className="font-bold">{course.totalHours || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Play size={24} className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">الدروس</p>
                    <p className="font-bold">{course.lessons?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lessons */}
            {course.lessons && course.lessons.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">محتوى الكورس</h2>
                <div className="space-y-2">
                  {course.lessons.map((lesson) => (
                    <button
                      key={lesson._id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`w-full p-4 text-right rounded-lg border-2 transition-all ${
                        selectedLesson?._id === lesson._id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Play size={18} className="text-blue-600 flex-shrink-0" />
                        <div className="flex-grow">
                          <p className="font-semibold">{lesson.title}</p>
                          {lesson.duration && (
                            <p className="text-sm text-gray-500">
                              المدة: {lesson.duration}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Video */}
          <div className="bg-black rounded-lg overflow-hidden shadow-lg h-fit">
            {selectedLesson?.videoUrl && (
              <video
                src={selectedLesson.videoUrl}
                controls
                className="w-full"
                style={{ maxHeight: "600px" }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewPage;
