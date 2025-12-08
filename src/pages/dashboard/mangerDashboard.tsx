import { useEffect, useState } from "react";
import {
  BarChart,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  Sparkles,
  Image,
  FileVideo,
  PlusCircle,
  Search,
  Bell,
  ChevronDown,
  ChevronUp,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '@/config/env';
import { ProductsComponent } from "@/components/admin/ProductsComponent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { useTranslation } from "react-i18next";
import AiImageGenerator from "@/components/dashboard/AiImageGenerator";
import InstructorStats from "@/components/instructor/InstructorStats";
import PendingGrading from "@/components/instructor/PendingGrading";
import CourseAnalytics from "@/components/instructor/CourseAnalytics";
import AiCourseOutlineGenerator from "@/components/instructor/AiCourseOutlineGenerator";
import PhotopeaEditor from "@/components/instructor/PhotopeaEditor";
import VideoTools from "@/components/instructor/VideoTools";
import UdemyLinkModal from "@/components/instructor/UdemyLinkModal";

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

interface UdemyCourse {
  id: string;
  title: string;
  price: string;
  rating: number;
  num_reviews: number;
  num_lectures: number;
  num_students?: number;
  url: string;
}

export default function InstructorDashboard() {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [udemyCourses, setUdemyCourses] = useState<UdemyCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUdemy, setLoadingUdemy] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // New state for API data
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [pendingGrading, setPendingGrading] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [isUdemyModalOpen, setIsUdemyModalOpen] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch Stats
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch Students (Simplified for brevity)
  const fetchStudents = async () => {
    // Logic from previous file largely preserved in intent but omitted for brevity if complex
    // Just re-implementing basic fetch from before
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
      setStudents(myStudents);
    } catch (err) { console.error(err) }
  };

  // Fetch Udemy Courses
  const fetchUdemyCourses = async () => {
    setLoadingUdemy(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/instructor/udemy-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUdemyCourses(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch Udemy courses", err);
      toast({ title: "Error", description: "Failed to fetch Udemy courses", variant: "destructive" });
    } finally {
      setLoadingUdemy(false);
    }
  };

  // Refresh Udemy Data
  const refreshUdemyData = async () => {
    await fetchUdemyCourses();
    toast({ title: "Refreshed", description: "Udemy data updated successfully" });
  };

  useEffect(() => {
    if (token) {
      fetchCourses();
      fetchDashboardStats();
      fetchPendingGrading();
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "students") fetchStudents();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "udemy") fetchUdemyCourses();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleGrade = (itemId: string) => {
    toast({ title: "Opening grading interface..." });
  };

  const menuItems = [
    { id: "overview", label: t('dashboard.overview'), icon: <BarChart size={20} /> },
    { id: "courses", label: t('dashboard.myCourses'), icon: <LayoutDashboard size={20} /> },
    { id: "students", label: t('dashboard.students'), icon: <GraduationCap size={20} /> },
    { id: "udemy", label: t('dashboard.udemyCourses'), icon: <GraduationCap size={20} /> },
    { id: "grading", label: t('dashboard.grading'), icon: <ClipboardList size={20} /> },
    { id: "ai-assistant", label: t('dashboard.aiAssistant'), icon: <Sparkles size={20} /> },
    { id: "ai-images", label: t('dashboard.aiImages'), icon: <Image size={20} /> },
    { id: "photopea", label: t('dashboard.photoEditor'), icon: <Image size={20} /> },
    { id: "video-tools", label: t('dashboard.videoTools'), icon: <FileVideo size={20} /> },
  ];

  const currentDir = i18n.language === "ar" ? "rtl" : "ltr";

  return (
    <div className="flex h-screen bg-[#F4F2EE] font-sans overflow-hidden pt-24" dir={currentDir}>
      {/* Sidebar */}
      <aside className="w-[280px] bg-[#1a1c1e] text-gray-400 flex flex-col m-4 rounded-[30px] shadow-2xl overflow-hidden relative">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8 text-white">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-lg">I</span>
            </div>
            <h1 className="text-xl font-bold tracking-brand">Instructor</h1>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 px-6 flex items-center justify-center gap-2 font-medium transition-transform active:scale-95 shadow-lg shadow-blue-500/30 mb-8">
            <PlusCircle size={20} />
            <span>{t('dashboard.newCourse')}</span>
          </button>

          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 ${activeTab === item.id
                  ? "bg-white text-black shadow-lg font-semibold transform ltr:translate-x-1 rtl:-translate-x-1"
                  : "hover:bg-white/5 hover:text-gray-200"
                  }`}
              >
                <span className={activeTab === item.id ? "text-blue-500" : ""}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10 mx-6 mb-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span>{t('dashboard.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden p-4 pr-0">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.dashboard')}</h2>
            <p className="text-gray-500 text-sm">{t('dashboard.welcomeInstructor')}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-96 hidden md:block">
              <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${currentDir === 'rtl' ? 'left-4' : 'right-4'}`} size={20} />
              <Input
                placeholder={t('dashboard.searchCourses')}
                className={`w-full bg-white border-none rounded-full py-6 shadow-sm focus-visible:ring-1 focus-visible:ring-blue-500 ${currentDir === 'rtl' ? 'pl-12 pr-6' : 'pr-12 pl-6'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsUdemyModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium"
              >
                ربط حساب Udemy
              </Button>
              <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors relative">
                <Bell size={20} className="text-gray-600" />
              </button>

              <div className={`flex items-center gap-3 ${currentDir === 'rtl' ? 'pr-4 border-r' : 'pl-4 border-l'} border-gray-200`}>
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm cursor-pointer">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>IN</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">

          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-8 border-none shadow-sm rounded-[30px] bg-white flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <LayoutDashboard size={32} />
                  </div>
                  <div>
                    <p className="text-gray-500">{t('dashboard.totalCourses')}</p>
                    <h3 className="text-4xl font-bold text-gray-900">{courses.length}</h3>
                  </div>
                </Card>
                <Card className="p-8 border-none shadow-sm rounded-[30px] bg-white flex items-center gap-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                    <Users size={32} />
                  </div>
                  <div>
                    <p className="text-gray-500">{t('dashboard.totalStudents')}</p>
                    <h3 className="text-4xl font-bold text-gray-900">{students.length}</h3>
                  </div>
                </Card>
              </div>
              <InstructorStats stats={dashboardStats} loading={loadingStats} />
            </div>
          )}

          {activeTab === "courses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">{t('dashboard.myCourses')}</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {courses
                  .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((course) => (
                    <Card key={course._id} className="border-none shadow-sm rounded-[24px] overflow-hidden hover:shadow-md transition-all">
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                            {course.title.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <span>${course.price}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span>{course.studentsCount || 0} {t('common.students')}</span>
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="rounded-full hover:bg-gray-100"
                          onClick={() => setExpandedCourseId(expandedCourseId === course._id ? null : course._id)}
                        >
                          {expandedCourseId === course._id ? <ChevronUp /> : <ChevronDown />}
                        </Button>
                      </div>
                      {expandedCourseId === course._id && (
                        <div className="bg-gray-50 p-6 border-t border-gray-100">
                          <CourseAnalytics courseId={course._id} token={token || ""} />
                        </div>
                      )}
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {activeTab === "grading" && (
            <div className="space-y-6">
              <PendingGrading items={pendingGrading} loading={loadingPending} onGrade={handleGrade} />
            </div>
          )}

          {activeTab === "ai-assistant" && <AiCourseOutlineGenerator />}
          {activeTab === "ai-images" && <AiImageGenerator />}
          {activeTab === "photopea" && (
            <Card className="h-[800px] border-none shadow-sm rounded-[30px] overflow-hidden">
              <PhotopeaEditor />
            </Card>
          )}
          {activeTab === "video-tools" && <VideoTools />}

          {activeTab === "students" && (
            <div className="space-y-4">
              {students.length > 0 ? (
                students.map((student, i) => (
                  <Card key={i} className="p-4 border-none shadow-sm rounded-[20px] flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <Avatar>
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold">{student.name}</h4>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">{student.courseTitle}</p>
                      <p className="text-xs text-gray-400">{new Date(student.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">{t('dashboard.noStudentsFound')}</div>
              )}
            </div>
          )}

          {activeTab === "udemy" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">{t('dashboard.udemyCourses')}</h3>
                <Button onClick={refreshUdemyData} disabled={loadingUdemy} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {loadingUdemy ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
              {loadingUdemy ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {udemyCourses.length > 0 ? (
                    udemyCourses
                      .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((course) => (
                        <Card key={course.id} className="border-none shadow-sm rounded-[24px] overflow-hidden hover:shadow-md transition-all">
                          <div className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-500/20">
                                U
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                  <span>{course.price}</span>
                                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                  <span>{course.num_lectures} lectures</span>
                                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                  <span>{course.rating} ⭐ ({course.num_reviews} reviews)</span>
                                  {course.num_students && (
                                    <>
                                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                      <span>{course.num_students} students</span>
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                              <Button variant="outline" onClick={() => window.open(course.url, '_blank')}>
                                View on Udemy
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      No Udemy courses found. Link your Udemy account to get started.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <UdemyLinkModal isOpen={isUdemyModalOpen} onClose={() => setIsUdemyModalOpen(false)} />
    </div>
  );
}
