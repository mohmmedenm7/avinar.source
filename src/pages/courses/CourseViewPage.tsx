import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Users, Clock, CheckCircle, ChevronDown, ChevronUp, MessageCircle, Star, Settings, BookOpen, Download, Share2 } from "lucide-react";
import { API_BASE_URL } from '@/config/env';
import { getImageUrl } from "@/utils/imageUtils";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/progress";
import { ChatButton } from "@/components/chat";
// import CourseDiscussions from "@/components/courses/CourseDiscussions";
import StudyAssistant from "@/components/courses/StudyAssistant";

interface Lecture {
  _id: string;
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
  const { t, i18n } = useTranslation();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"curriculum" | "discussions">("curriculum");
  const [courseProgress, setCourseProgress] = useState(0);
  const [watchedLessons, setWatchedLessons] = useState<string[]>([]);
  const [progressData, setProgressData] = useState<any>(null);
  const [timeSpentInMinutes, setTimeSpentInMinutes] = useState(0);

  const token =
    typeof window !== "undefined" ? localStorage?.getItem("token") : null;
  const email =
    typeof window !== "undefined" ? localStorage?.getItem("email") : null;

  const courseId =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").pop()
      : null;

  const currentDir = i18n.language.startsWith("ar") ? "rtl" : "ltr";

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
    const fetchCourseAndProgress = async () => {
      setLoading(true);
      try {
        await fetchPaymentStatus();

        // Fetch Course
        const res = await fetch(`${API_BASE_URL}/api/v1/products/${courseId}`, {
          headers: { Authorization: `Bearer ${token || ""}` },
        });
        const data = await res.json();
        const courseData = data?.data;
        setCourse(courseData);

        // Fetch Progress
        if (token && courseId) {
          const progressRes = await fetch(`${API_BASE_URL}/api/v1/progress/course/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const pData = await progressRes.json();
          if (pData?.status === "success" && pData?.data) {
            setProgressData(pData.data);
            const completedTitles = (pData.data.completedLessons || []).map((l: any) =>
              typeof l === 'string' ? l : l.lessonTitle
            );
            setWatchedLessons(completedTitles);
            setCourseProgress(pData.data.completionPercentage || 0);

            // Select last watched lecture or first one
            if (pData.data.lastWatchedSection !== undefined && pData.data.lastWatchedLecture !== undefined) {
              const lastSec = courseData.curriculum[pData.data.lastWatchedSection];
              const lastLec = lastSec?.lectures[pData.data.lastWatchedLecture];
              if (lastLec) setSelectedLecture(lastLec);
              else if (courseData?.curriculum?.[0]?.lectures?.[0]) setSelectedLecture(courseData.curriculum[0].lectures[0]);
            } else if (courseData?.curriculum?.[0]?.lectures?.[0]) {
              setSelectedLecture(courseData.curriculum[0].lectures[0]);
            }
          } else if (courseData?.curriculum?.[0]?.lectures?.[0]) {
            setSelectedLecture(courseData.curriculum[0].lectures[0]);
          }
        }
      } catch (err) {
        showToast("خطأ في جلب البيانات", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndProgress();
  }, [token, courseId]);

  // Timer for time spent
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedLecture && isPaid) {
      interval = setInterval(() => {
        setTimeSpentInMinutes(prev => prev + (1 / 60)); // Add 1 second in minutes
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedLecture, isPaid]);

  // Save progress occasionally or on lecture change
  const saveProgress = async (lecture?: Lecture, sectionIdx?: number, lectureIdx?: number, isFinished = false) => {
    if (!token || !courseId || !selectedLecture) return;

    try {
      const body = {
        lessonTitle: isFinished ? (lecture?.title || selectedLecture.title) : undefined,
        timeSpent: timeSpentInMinutes > 0.1 ? Math.round(timeSpentInMinutes) : 0,
        sectionIndex: sectionIdx,
        lectureIndex: lectureIdx
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/progress/course/${courseId}/lesson`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.status === 'success') {
        setProgressData(data.data);
        const completedTitles = (data.data.completedLessons || []).map((l: any) =>
          typeof l === 'string' ? l : l.lessonTitle
        );
        setWatchedLessons(completedTitles);
        setCourseProgress(data.data.completionPercentage || 0);
        setTimeSpentInMinutes(0); // Reset timer after saving
      }
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  const markLessonComplete = async () => {
    if (selectedLecture) {
      await saveProgress(selectedLecture, undefined, undefined, true);
      showToast(t('course.lessonCompleted') || "أحسنت! لقد أكملت هذا الدرس (+10 XP) 🎉");
    }
  };

  const handleLectureSelect = (lecture: Lecture, sIdx: number, lIdx: number) => {
    // Save progress of current lecture before switching
    saveProgress(undefined, sIdx, lIdx);
    setSelectedLecture(lecture);
  };

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
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#00b8a3] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600 font-medium">{t('common.loading') || 'جاري التحميل...'}</p>
        </div>
      </div>
    );
  }

  // ❌❌ منع الدخول لو لم يتم الدفع ❌❌
  if (!isPaid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] pt-20" dir={currentDir}>
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center border border-gray-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t('course.accessDenied') || 'لا يمكنك الوصول لهذا الكورس'}
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {t('course.purchaseRequired') || 'يجب شراء الكورس أولاً حتى تتمكن من مشاهدة الدروس.'}
          </p>

          <button
            onClick={() => (window.location.href = "/courses")}
            className="w-full px-6 py-4 bg-[#00b8a3] text-white rounded-xl hover:bg-[#00a693] transition-all font-bold shadow-lg shadow-[#00b8a3]/20"
          >
            {t('course.backToCourses') || 'الرجوع للكورسات'}
          </button>
        </div>
      </div>
    );
  }

  // 📌 لو تم الدفع — عرض محتوى الكورس
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <p className="text-lg text-gray-600">{t('course.notFound') || 'لم يتم العثور على الكورس'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-20" dir={currentDir}>
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-24 ${currentDir === 'rtl' ? 'end-4' : 'start-4'} px-6 py-3 rounded-xl text-white z-50 shadow-xl ${toast.type === "error" ? "bg-red-500" : "bg-[#00b8a3]"
            }`}
        >
          {toast.message}
        </div>
      )}

      {/* Main Layout - Video Left, Sidebar Right */}
      <div className="flex h-[calc(100vh-5rem)]">

        {/* Video Section - Main Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Video Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-[#00b8a3] transition-all font-medium"
              >
                <ArrowLeft size={20} className={currentDir === 'rtl' ? 'rotate-180' : ''} />
                <span>{t('common.back') || 'عودة'}</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                <Share2 size={20} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                <Download size={20} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Video Player Container */}
          <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center relative">
            {selectedLecture ? (
              <div className="w-full h-full flex items-center justify-center">
                {(() => {
                  const videoUrl = selectedLecture.video || "";
                  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

                  if (isYouTube) {
                    // Extract YouTube video ID
                    let videoId = '';
                    if (videoUrl.includes('youtube.com/watch?v=')) {
                      videoId = videoUrl.split('v=')[1]?.split('&')[0];
                    } else if (videoUrl.includes('youtu.be/')) {
                      videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
                    }

                    return (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                        title={selectedLecture.title}
                      />
                    );
                  } else {
                    // Direct video file
                    return (
                      <video
                        src={videoUrl}
                        controls
                        onEnded={markLessonComplete}
                        className="w-full h-full object-contain"
                      />
                    );
                  }
                })()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                  <Play size={48} className="text-[#00b8a3] ms-2" />
                </div>
                <p className="text-lg">{t('course.selectLecture') || 'اختر محاضرة من القائمة لبدء المشاهدة'}</p>
              </div>
            )}
          </div>

          {/* Video Info Bar */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-[#00b8a3] rounded-sm"></span>
              <h2 className="text-xl font-bold text-gray-800">
                {selectedLecture?.title || course.title}
              </h2>
            </div>
            {selectedLecture?.description && (
              <p className="text-gray-600 text-sm">{selectedLecture.description}</p>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-[400px] bg-white border-s border-gray-200 flex flex-col overflow-hidden">
          {/* Course Title */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-lg font-bold text-gray-800 leading-relaxed mb-4">
              {course.title}
            </h1>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('course.progress') || 'التقدم'}</span>
                <span className="font-bold text-[#00b8a3]">{courseProgress}%</span>
              </div>
              <Progress value={courseProgress} className="h-2 bg-gray-100" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 space-y-3 border-b border-gray-200">
            <button className="w-full flex items-center justify-center gap-2 bg-[#00b8a3] text-white py-3 px-4 rounded-xl font-bold hover:bg-[#00a693] transition-all shadow-lg shadow-[#00b8a3]/20">
              <Settings size={18} />
              <span>{t('course.showGrades') || 'إظهار العلامات'}</span>
            </button>
            <button className="w-full flex items-center justify-center gap-2 bg-[#00b8a3] text-white py-3 px-4 rounded-xl font-bold hover:bg-[#00a693] transition-all shadow-lg shadow-[#00b8a3]/20">
              <BookOpen size={18} />
              <span>{t('course.courseUpdates') || 'تحديثات المساق'}</span>
            </button>
            <ChatButton
              instructorId={(course.instructor as any)._id || course.instructor}
              instructorName={(course.instructor as any).name || course.instructor}
              courseId={courseId}
              className="w-full bg-white border-2 border-[#00b8a3] text-[#00b8a3] hover:bg-[#00b8a3] hover:text-white transition-all py-3 rounded-xl font-bold"
            />
            <Link
              to={`/instructor/${(course.instructor as any)._id || course.instructor}`}
              target="_blank"
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 rounded-xl font-bold transition-all"
            >
              <Users size={18} />
              <span>{t('course.viewInstructorProfile') || 'عرض ملف المدرب'}</span>
            </Link>
          </div>

          {/* Rating Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">{t('course.rateCourse') || 'قيّم هذه الدورة'}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} className="p-1 hover:scale-110 transition-transform">
                    <Star size={20} className="text-gray-300 hover:text-yellow-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Curriculum List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {course.curriculum && course.curriculum.length > 0 && (
              <div className="divide-y divide-gray-100">
                {course.curriculum.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(sectionIndex)}
                      className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between text-start"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#00b8a3]/10 flex items-center justify-center">
                          {expandedSections.has(sectionIndex) ? (
                            <ChevronUp size={18} className="text-[#00b8a3]" />
                          ) : (
                            <ChevronDown size={18} className="text-[#00b8a3]" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{section.title}</h3>
                          <span className="text-xs text-gray-500">
                            {section.lectures.length} {t('course.lesson') || 'محاضرة'}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Lectures List */}
                    {expandedSections.has(sectionIndex) && (
                      <div className="bg-white">
                        {section.lectures.map((lecture, lectureIndex) => (
                          <button
                            key={lectureIndex}
                            onClick={() => handleLectureSelect(lecture, sectionIndex, lectureIndex)}
                            className={`w-full p-4 text-start hover:bg-[#00b8a3]/5 transition-all border-s-4 ${selectedLecture === lecture
                              ? "border-[#00b8a3] bg-[#00b8a3]/10"
                              : "border-transparent"
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${selectedLecture === lecture
                                ? 'bg-[#00b8a3] text-white'
                                : watchedLessons.includes(lecture.title)
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-gray-100 text-gray-500'
                                }`}>
                                {watchedLessons.includes(lecture.title) ? <CheckCircle size={14} /> : <Play size={14} />}
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className={`font-medium truncate ${selectedLecture === lecture ? 'text-[#00b8a3]' : 'text-gray-700'
                                  }`}>
                                  {lecture.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                  <Clock size={12} />
                                  <span>{lecture.duration} {t('course.minutes') || 'دقيقة'}</span>
                                </div>
                              </div>
                              {watchedLessons.includes(lecture.title) && (
                                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Reviews Section (Below main content) */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <ReviewsSection productId={courseId || ""} />
        </div>
      </div>
      <StudyAssistant
        courseId={courseId || ""}
        lectureId={selectedLecture?._id}
        lectureTitle={selectedLecture?.title}
      />
    </div>
  );
};

export default CourseViewPage;
