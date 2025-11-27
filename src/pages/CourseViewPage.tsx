import { useState, useEffect } from "react";
import { ArrowRight, Play, Users, Clock, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
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

const CourseViewPage = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
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
        `${API_BASE_URL}/api/v1/cart/status/${email}/product/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      // التحقق من البنية الصحيحة للاستجابة
      if (data?.status === "success" && data?.data) {
        setIsPaid(data.data.isPaid === true);
      } else {
        setIsPaid(false);
      }
    } catch (err) {
      console.error("خطأ في جلب حالة الدفع:", err);
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

        // Select first lecture from first section
        if (courseData?.curriculum?.[0]?.lectures?.[0]) {
          setSelectedLecture(courseData.curriculum[0].lectures[0]);
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

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  // Calculate total lectures and duration
  const totalLectures = course?.curriculum?.reduce((sum, section) => sum + section.lectures.length, 0) || 0;
  const totalDuration = course?.curriculum?.reduce(
    (sum, section) => sum + section.lectures.reduce((s, l) => s + (l.duration || 0), 0),
    0
  ) || 0;

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
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${toast.type === "error" ? "bg-red-500" : "bg-green-500"
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
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Course Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Course Image */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img
                src={getImageUrl(course.imageCover)}
                alt={course.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Course Details */}
            <div className="bg-white rounded-lg shadow p-6">
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
                    <p className="text-sm text-gray-600">الدقائق</p>
                    <p className="font-bold">{totalDuration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Play size={24} className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">المحاضرات</p>
                    <p className="font-bold">{totalLectures}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What Will You Learn */}
            {course.whatWillYouLearn && course.whatWillYouLearn.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">ماذا ستتعلم؟</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {course.whatWillYouLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            {course.curriculum && course.curriculum.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">محتوى الكورس</h2>
                <div className="space-y-3">
                  {course.curriculum.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border rounded-lg overflow-hidden">
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(sectionIndex)}
                        className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {expandedSections.has(sectionIndex) ? (
                            <ChevronUp size={20} className="text-blue-600" />
                          ) : (
                            <ChevronDown size={20} className="text-blue-600" />
                          )}
                          <h3 className="font-bold text-lg">{section.title}</h3>
                          <span className="text-sm text-gray-500">
                            ({section.lectures.length} محاضرة)
                          </span>
                        </div>
                      </button>

                      {/* Lectures List */}
                      {expandedSections.has(sectionIndex) && (
                        <div className="divide-y">
                          {section.lectures.map((lecture, lectureIndex) => (
                            <button
                              key={lectureIndex}
                              onClick={() => setSelectedLecture(lecture)}
                              className={`w-full p-4 text-right hover:bg-blue-50 transition-all ${selectedLecture === lecture
                                ? "bg-blue-100 border-r-4 border-blue-600"
                                : ""
                                }`}
                            >
                              <div className="flex items-start gap-3">
                                <Play size={18} className="text-blue-600 flex-shrink-0 mt-1" />
                                <div className="flex-grow text-right">
                                  <p className="font-semibold">{lecture.title}</p>
                                  {lecture.description && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {lecture.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Clock size={14} />
                                      {lecture.duration} دقيقة
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Video Player */}
          <div className="md:col-span-1">
            <div className="bg-black rounded-lg overflow-hidden shadow-lg sticky top-24">
              {selectedLecture?.video ? (
                <div>
                  <video
                    src={selectedLecture.video}
                    controls
                    className="w-full"
                    style={{ maxHeight: "400px" }}
                  />
                  <div className="bg-white p-4">
                    <h3 className="font-bold text-lg mb-2">{selectedLecture.title}</h3>
                    {selectedLecture.description && (
                      <p className="text-gray-600 text-sm">{selectedLecture.description}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                  <p className="text-gray-400">اختر محاضرة لبدء المشاهدة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewPage;
