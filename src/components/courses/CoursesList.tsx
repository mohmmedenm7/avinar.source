import { useState, useEffect } from "react";
import { Play, Clock, Star, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from '@/config/env';
import { getImageUrl } from "@/utils/imageUtils";

interface Course {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  imageCover?: string;
  video?: string;
  category?: { name: string };
  studentsCount?: number;
  ratingsAverage?: number;
}

interface UserCourse {
  _id: string;
  courseId: Course;
  userId: string;
  purchasedAt: string;
  isPaid: boolean;
}

interface Props {
  userId?: string;
  token?: string;
}

export default function UserCoursesView({ userId, token }: Props) {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (token && userId) {
      fetchUserCourses();
    }
  }, [token, userId]);

  const fetchUserCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("فشل جلب الكورسات");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setCourses(data?.data || []);
    } catch (err) {
      console.error("خطأ في جلب الكورسات:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Play size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">لا توجد كورسات بعد</h2>
          <p className="text-gray-600">قم بشراء كورس لبدء التعلم</p>
        </div>
      </div>
    );
  }

  if (showPlayer && selectedCourse) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">{selectedCourse.title}</h1>
            <button
              onClick={() => {
                setShowPlayer(false);
                setSelectedCourse(null);
              }}
              className="text-white hover:text-gray-300 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Video Player */}
          {selectedCourse.video ? (
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              <video
                controls
                className="w-full aspect-video bg-black"
                src={selectedCourse.video}
              >
                متصفحك لا يدعم تشغيل الفيديو
              </video>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg w-full aspect-video flex items-center justify-center mb-6">
              <p className="text-gray-400">لا يوجد فيديو متاح</p>
            </div>
          )}

          {/* Course Info */}
          <div className="bg-gray-900 rounded-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">معلومات الكورس</h2>
            <div className="space-y-3">
              <p className="text-gray-300">{selectedCourse.description}</p>
              <div className="flex items-center gap-4 text-sm">
                {selectedCourse.category && (
                  <span className="bg-blue-600 px-3 py-1 rounded">
                    {selectedCourse.category.name}
                  </span>
                )}
                {selectedCourse.ratingsAverage && (
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400" />
                    <span>{selectedCourse.ratingsAverage}</span>
                  </div>
                )}
                {selectedCourse.studentsCount && (
                  <span>{selectedCourse.studentsCount} طالب</span>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setShowPlayer(false);
                setSelectedCourse(null);
              }}
              className="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              العودة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">كورساتي</h1>
          <p className="text-gray-600">جميع الكورسات التي اشتريتها</p>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((userCourse) => {
            const course = userCourse.courseId;
            return (
              <div

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowPlayer(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4">
                        <Play size={32} fill="white" />
                      </div>
                    </button>
                  </div>

                  {/* Paid Badge */ }
            {
              userCourse.isPaid && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  مدفوع
                </div>
              )
            }
                </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {course.description}
          </p>

          {/* Meta */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center justify-between text-gray-700">
              <span>السعر:</span>
              <span className="font-bold text-blue-600">${course.price}</span>
            </div>

            {course.category && (
              <div className="flex items-center justify-between text-gray-700">
                <span>التصنيف:</span>
                <span className="text-sm">{course.category.name}</span>
              </div>
            )}

            {userCourse.purchasedAt && (
              <div className="flex items-center justify-between text-gray-600 text-xs">
                <Clock size={14} />
                <span>
                  {new Date(userCourse.purchasedAt).toLocaleDateString("ar-EG")}
                </span>
              </div>
            )}
          </div>

          {/* Watch Button */}
          <button
            onClick={() => {
              setSelectedCourse(course);
              setShowPlayer(true);
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Play size={18} fill="white" />
            تفضل شاهد
          </button>
        </div>
      </div>
      );
          })}
    </div>
      </div >
    </div >
  );
}