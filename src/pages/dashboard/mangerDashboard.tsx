import { useEffect, useState } from "react";
import { BookOpen, LogOut, Users, Search, LayoutDashboard, GraduationCap, ClipboardList, BarChart, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '@/config/env';
import { ProductsComponent } from "@/components/admin/ProductsComponent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import InstructorStats from "@/components/instructor/InstructorStats";
import PendingGrading from "@/components/instructor/PendingGrading";
import CourseAnalytics from "@/components/instructor/CourseAnalytics";
import AiCourseOutlineGenerator from "@/components/instructor/AiCourseOutlineGenerator";

interface Course {
  _id: string;
  title: string;
  price: number;
  studentsCount?: number;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  courseTitle: string;
  joinedAt: string;
}

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // New state for API data
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [pendingGrading, setPendingGrading] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch Instructor Dashboard Stats
  const fetchDashboardStats = async () => {
    if (!token) return;
    setLoadingStats(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/instructor/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardStats(res.data?.data || res.data);
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Pending Grading
  const fetchPendingGrading = async () => {
    if (!token) return;
    setLoadingPending(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/instructor/pending-grading`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingGrading(res.data?.data || res.data || []);
    } catch (error: any) {
      console.error("Error fetching pending grading:", error);
      setPendingGrading([]);
    } finally {
      setLoadingPending(false);
    }
  };

  // Fetch Courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const url = userId
        ? `${API_BASE_URL}/api/v1/products?instructor=${userId}`
        : `${API_BASE_URL}/api/v1/products`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch courses", err);
      toast({
        title: "خطأ",
        description: "فشل تحميل الكورسات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Students
  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orders = res.data?.data || [];
      const myStudents: Student[] = [];
      const myCourseIds = new Set(courses.map(c => c._id));

      orders.forEach((order: any) => {
        if (!order.isPaid) return;

        order.cartItems.forEach((item: any) => {
          if (myCourseIds.has(item.product?._id)) {
            myStudents.push({
              _id: order.user?._id || Math.random().toString(),
              name: order.user?.name || "Unknown",
              email: order.user?.email || "Unknown",
              courseTitle: item.product?.title || "Unknown Course",
              joinedAt: order.createdAt || new Date().toISOString(),
            });
          }
        });
      });

      const uniqueStudents = myStudents.filter((student, index, self) =>
        index === self.findIndex((t) => (
          t.email === student.email && t.courseTitle === student.courseTitle
        ))
      );

      setStudents(uniqueStudents);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCourses();
      fetchDashboardStats();
      fetchPendingGrading();
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "students" && courses.length > 0) {
      fetchStudents();
    }
  }, [activeTab, courses]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleGrade = (itemId: string) => {
    toast({
      title: "التصحيح",
      description: "سيتم فتح صفحة التصحيح قريباً",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-20" dir="rtl">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-l border-gray-200 min-h-[calc(100vh-80px)] fixed right-0 top-20 hidden md:block">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">لوحة المدرب</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "overview"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <BarChart size={20} />
                نظرة عامة
              </button>
              <button
                onClick={() => setActiveTab("courses")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "courses"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <LayoutDashboard size={20} />
                إدارة الكورسات
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "students"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <GraduationCap size={20} />
                الطلاب المسجلين
              </button>
              <button
                onClick={() => setActiveTab("grading")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "grading"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <ClipboardList size={20} />
                التصحيح المعلق
              </button>
              <button
                onClick={() => setActiveTab("ai-assistant")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "ai-assistant"
                  ? "bg-purple-50 text-purple-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Sparkles size={20} />
                مساعد AI
              </button>
            </nav>
          </div>

          <div className="absolute bottom-0 w-full p-6 border-t border-gray-100">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 gap-3"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              تسجيل خروج
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:mr-64 p-8">
          {/* Mobile Header */}
          <div className="md:hidden mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم المدرب</h1>
          </div>

          {/* Instructor Stats (Always visible at top) */}
          <InstructorStats stats={dashboardStats} loading={loadingStats} />

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] p-6">

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">نظرة عامة</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">ملخص الكورسات</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">عدد الكورسات</span>
                        <span className="font-bold text-gray-900">{courses.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">إجمالي الطلاب</span>
                        <span className="font-bold text-gray-900">{students.length}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">التصحيح المعلق</h3>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">المهام المعلقة</span>
                        <span className="font-bold text-orange-600">{pendingGrading.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === "courses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">إدارة الكورسات</h2>
                  <div className="relative w-64">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="بحث..."
                      className="pr-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4">
                  {courses
                    .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((course) => (
                      <Card key={course._id} className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl">
                              {course.title.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{course.title}</h3>
                              <p className="text-sm text-gray-500">{course.studentsCount || 0} طالب • ${course.price}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedCourseId(expandedCourseId === course._id ? null : course._id)}
                              className="gap-2"
                            >
                              {expandedCourseId === course._id ? "إخفاء التحليلات" : "عرض التحليلات"}
                              {expandedCourseId === course._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </Button>
                          </div>
                        </div>

                        {expandedCourseId === course._id && (
                          <div className="bg-gray-50/50 p-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                            <CourseAnalytics courseId={course._id} token={token || ""} />
                          </div>
                        )}
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === "students" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">قائمة الطلاب</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{students.length} طالب</span>
                </div>

                {students.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>لا يوجد طلاب مسجلين حتى الآن</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                        <tr>
                          <th className="px-6 py-3 rounded-r-lg">الاسم</th>
                          <th className="px-6 py-3">البريد الإلكتروني</th>
                          <th className="px-6 py-3">الكورس</th>
                          <th className="px-6 py-3 rounded-l-lg">تاريخ التسجيل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((student, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                            <td className="px-6 py-4 text-gray-600">{student.email}</td>
                            <td className="px-6 py-4 text-blue-600 font-medium">{student.courseTitle}</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">
                              {new Date(student.joinedAt).toLocaleDateString('ar-EG')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Grading Tab */}
            {activeTab === "grading" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">التصحيح المعلق</h2>
                  <span className="text-sm text-gray-500">
                    {pendingGrading.length} مهمة
                  </span>
                </div>
                <PendingGrading
                  items={pendingGrading}
                  loading={loadingPending}
                  onGrade={handleGrade}
                />
              </div>
            )}

            {/* AI Assistant Tab */}
            {activeTab === "ai-assistant" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">مساعد الذكاء الاصطناعي</h2>
                </div>
                <AiCourseOutlineGenerator />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}