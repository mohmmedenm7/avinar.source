// mangerDashboard.tsx - مع مساحة للـ Navbar في الأعلى

import { useEffect, useState } from "react";
import {
  BarChart, LogOut, LayoutDashboard, GraduationCap, ClipboardList,
  Sparkles, Image, FileVideo, Video, PlusCircle, Search, Bell, Eye,
  ChevronDown, ChevronUp, Users, MessageSquare, Calendar,
  Heart, Share2, MoreHorizontal, TrendingUp, DollarSign,
  BookOpen, Award, Settings, Edit, Trash2, MessageCircle
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CommunityContent } from "@/pages/CommunityPage";
import { communityService } from "@/services/communityService";
import { API_BASE_URL } from '@/config/env';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { useTranslation } from "react-i18next";
import InstructorStats from "@/components/instructor/course-management/InstructorStats";
import PendingGrading from "@/components/instructor/course-management/PendingGrading";
import CourseAnalytics from "@/components/instructor/course-management/CourseAnalytics";
import AiCourseOutlineGenerator from "@/components/instructor/course-management/AiCourseOutlineGenerator";
import AIPhotopeaStudio from "@/components/instructor/photopea/AIPhotopeaStudio";
import InstructorWallet from "@/components/instructor/course-management/InstructorWallet";
import VideoTools from "@/components/instructor/video-editor/VideoTools";
import UdemyLinkModal from "@/components/instructor/shared/UdemyLinkModal";
import LiveStreamManager from "@/components/admin/LiveStreamManager";
import { AddProductModal } from '@/components/admin/AddProductModal';
import { EditProductModal } from '@/components/admin/EditProductModal';
import { ChatButton, EnhancedChatWidget } from "@/components/chat";
import UserCard from "@/components/dashboard/UserCard";
import UserProfileDetail from "@/components/dashboard/UserProfileDetail";
import ChatDashboardWidget from "@/components/chat/ChatDashboardWidget";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import { UserNotifications } from "@/components/dashboard/UserNotifications";
import NotificationBell from "@/components/dashboard/NotificationBell";
import CourseManagementAI from "@/components/instructor/course-management/CourseManagementAI";

interface Course {
  _id: string;
  title: string;
  price: number;
  studentsCount?: number;
  category?: string | { name: string; _id?: string };
  description?: string;
  imageCover?: string;
  rating?: number;
  likes?: number;
  comments?: number;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  courseTitle: string;
  joinedAt: string;
  avatar?: string;
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

interface CommunityPost {
  _id: string;
  title: string;
  category: string;
  user?: {
    name: string;
    profileImg?: string;
  };
  createdAt: string;
}



const getImageUrl = (path: string | undefined, type: 'users' | 'products' = 'products') => {
  if (!path) return undefined;
  if (path.startsWith('http')) {
    const lastIndex = path.lastIndexOf('http');
    return path.substring(lastIndex);
  }
  return `${API_BASE_URL}/${type}/${path}`;
};

export default function InstructorDashboard() {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [udemyCourses, setUdemyCourses] = useState<UdemyCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loadingUdemy, setLoadingUdemy] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [pendingGrading, setPendingGrading] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [isUdemyModalOpen, setIsUdemyModalOpen] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [isUdemyLinked, setIsUdemyLinked] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Course | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [chatRecipient, setChatRecipient] = useState<string | undefined>(undefined);
  const [latestCommunities, setLatestCommunities] = useState<CommunityPost[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Track visited tabs to keep heavy components mounted
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(["overview"]));

  useEffect(() => {
    setVisitedTabs(prev => {
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'chat') setChatRecipient(undefined);
  }, [activeTab]);

  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = localStorage.getItem("token");

  // Handle URL Query Params
  useEffect(() => {
    if (courses.length > 0) {
      const editId = searchParams.get('edit');
      const analyticsId = searchParams.get('analytics');

      if (editId) {
        const course = courses.find(c => c._id === editId);
        if (course) {
          handleEditCourse(course);
        }
      }

      if (analyticsId) {
        setActiveTab('analytics');
        setExpandedCourseId(analyticsId);
      }
    }
  }, [searchParams, courses]);

  const topStudents = [
    { name: 'أحمد', avatar: 'https://i.pravatar.cc/150?img=11' },
    { name: 'سارة', avatar: 'https://i.pravatar.cc/150?img=12' },
    { name: 'محمد', avatar: 'https://i.pravatar.cc/150?img=13' },
    { name: 'فاطمة', avatar: 'https://i.pravatar.cc/150?img=14' },
    { name: 'علي', avatar: 'https://i.pravatar.cc/150?img=15' },
  ];

  const fetchDashboardStats = async () => {
    if (!token) return;
    setLoadingStats(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/instructor/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardStats(res.data?.data || res.data);
      if (res.data?.data?.students) {
        setStudents(res.data.data.students);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPendingGrading = async () => {
    if (!token) return;
    setLoadingPending(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/instructor/pending-grading`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingGrading(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Error fetching pending grading:", error);
    } finally {
      setLoadingPending(false);
    }
  };

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
      setStudents(myStudents);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStudentClick = async (student: any) => {
    setSelectedStudent(student);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/users/${student._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch student courses from orders
      let studentCourses: any[] = [];
      try {
        console.log(`Instructor View - Fetching orders for student: ${student._id}`);
        const ordersRes = await axios.get(`${API_BASE_URL}/api/v1/orders?user=${student._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (ordersRes.data?.data) {
          let orders = ordersRes.data.data;
          // Safety filter
          orders = orders.filter((o: any) => {
            const oUserId = o.user?._id || o.user;
            return oUserId?.toString() === student._id?.toString();
          });

          studentCourses = orders.flatMap((order: any) =>
            (order.cartItems || []).reduce((acc: any[], item: any) => {
              if (item.product && item.product._id) {
                acc.push({
                  _id: item.product._id,
                  title: item.product.title || 'Untitled',
                  imageCover: item.product.imageCover,
                  price: item.price,
                  progress: 0,
                  createdAt: order.createdAt
                });
              }
              return acc;
            }, [])
          );
          // Deduplicate
          studentCourses = Array.from(new Map(studentCourses.map(c => [c._id, c])).values());
          console.log("Instructor View - Extracted courses:", studentCourses);
        }
      } catch (err) {
        console.error("Failed to fetch student orders", err);
      }

      if (res.data?.data) {
        setSelectedStudent((prev: any) => ({
          ...prev,
          ...res.data.data,
          courses: studentCourses,
          coursesCount: studentCourses.length
        }));
      }
    } catch (err) {
      console.error("Failed to fetch student details", err);
    }
  };

  const fetchUdemyCourses = async () => {
    setLoadingUdemy(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/instructor/udemy-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUdemyCourses(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch Udemy courses", err);
    } finally {
      setLoadingUdemy(false);
    }
  };

  const checkUdemyLinkStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/instructor/udemy-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsUdemyLinked(res.data?.isLinked || false);
    } catch (err) {
      setIsUdemyLinked(false);
    }
  };

  const fetchLatestCommunities = async () => {
    setLoadingCommunities(true);
    try {
      const posts = await communityService.getAllPosts();
      // Get latest 5 communities
      const sortedPosts = Array.isArray(posts)
        ? posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
        : [];
      setLatestCommunities(sortedPosts);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoadingCommunities(false);
    }
  };


  const fetchProjects = async () => {
    if (!token) return;
    setLoadingProjects(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCourses();
      fetchDashboardStats();
      fetchPendingGrading();
      checkUdemyLinkStatus();
      fetchLatestCommunities();
      fetchProjects();
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "students") fetchStudents();
  }, [activeTab, courses]);

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

  const handleEditCourse = (course: Course) => {
    setFormData({
      title: course.title,
      description: course.description || "",
      price: course.price,
      category: typeof course.category === 'object' ? course.category._id : course.category,
      imageCover: course.imageCover,
    });
    setEditingProduct(course);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm(t('dashboard.confirmDeleteCourse') || 'هل أنت متأكد من حذف هذه الدورة؟')) {
      return;
    }
    setDeletingCourseId(courseId);
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/products/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: t('dashboard.courseDeleted') || 'تم حذف الدورة بنجاح' });
      fetchCourses();
    } catch (err: any) {
      console.error("Failed to delete course", err);
      toast({ title: err.response?.data?.message || t('dashboard.deleteError') || 'فشل حذف الدورة', variant: "destructive" });
    } finally {
      setDeletingCourseId(null);
    }
  };

  const menuItems = [
    { id: "overview", label: t('dashboard.overview'), icon: <LayoutDashboard size={20} /> },
    { id: "courses", label: t('dashboard.myCourses'), icon: <BookOpen size={20} /> },
    { id: "students", label: t('dashboard.students'), icon: <GraduationCap size={20} /> },
    { id: "chat", label: t('dashboard.chat') || 'الرسائل', icon: <MessageCircle size={20} /> },
    { id: "livestreams", label: 'بث مباشر', icon: <Video size={20} /> },
    { id: "notifications", label: t('dashboard.notifications') || 'الإشعارات', icon: <Bell size={20} /> },
    { id: "analytics", label: t('dashboard.analytics') || 'الإحصائيات', icon: <BarChart size={20} /> },
    { id: "community", label: t('dashboard.community') || 'المجتمع', icon: <Users size={20} /> },
    ...(isUdemyLinked ? [{ id: "udemy", label: t('dashboard.udemyCourses'), icon: <Award size={20} /> }] : []),
    { id: "grading", label: t('dashboard.grading'), icon: <ClipboardList size={20} /> },
    { id: "wallet", label: t('dashboard.wallet') || 'المحفظة', icon: <DollarSign size={20} /> },
    { id: "ai-assistant", label: t('dashboard.aiAssistant'), icon: <Sparkles size={20} /> },
    { id: "photo-studio", label: t('dashboard.photoStudio') || 'استوديو الصور', icon: <Image size={20} /> },
    { id: "video-tools", label: t('dashboard.videoTools'), icon: <FileVideo size={20} /> },
  ];

  const getCategoryName = (category: string | { name: string } | undefined): string => {
    if (!category) return t('home.courses.course');
    if (typeof category === 'string') return category;
    return category.name || t('home.courses.course');
  };

  const currentDir = i18n.language.startsWith("ar") ? "rtl" : "ltr";

  return (
    <div className="flex h-screen bg-gray-50 pt-16" dir={currentDir}>
      {/* Left Icon Sidebar - Fixed */}
      <aside className="w-[60px] bg-white border-e border-gray-200 flex flex-col items-center py-4 space-y-2 fixed start-0 top-16 h-[calc(100vh-4rem)] z-40">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center cursor-pointer">
          <span className="text-white font-bold text-xl">W</span>
        </div>

        <nav className="flex-1 flex flex-col items-center space-y-2 overflow-y-auto">
          {[
            { id: "overview", icon: <LayoutDashboard size={20} /> },
            { id: "courses", icon: <BookOpen size={20} /> },
            { id: "students", icon: <Users size={20} /> },
            { id: "chat", icon: <MessageCircle size={20} /> },
            { id: "notifications", icon: <Bell size={20} /> },
            { id: "analytics", icon: <BarChart size={20} /> },
            { id: "community", icon: <Users size={20} /> },
            { id: "grading", icon: <ClipboardList size={20} /> },
            { id: "ai-assistant", icon: <Sparkles size={20} /> },
            { id: "course-management-ai", icon: <Sparkles size={20} /> },
            { id: "settings", icon: <Settings size={20} /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeTab === item.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                }`}
              title={item.id === "course-management-ai" ? "مساعد إدارة الكورسات" : ""}
            >
              {item.icon}
            </button>
          ))}
        </nav>

        <div className="space-y-2">
          <button
            onClick={handleLogout}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-600"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden ms-[60px]">
        {/* Top Header - Fixed below navbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 z-30 shadow-sm fixed top-16 start-[60px] end-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-gray-200">
                <AvatarImage
                  src={getImageUrl(dashboardStats?.instructor?.profileImg, 'users') || `https://api.dicebear.com/7.x/initials/svg?seed=${dashboardStats?.instructor?.name || 'IN'}`}
                  crossOrigin="anonymous"
                />
                <AvatarFallback>{dashboardStats?.instructor?.name?.[0] || 'IN'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold text-gray-900">{dashboardStats?.instructor?.name || "Amali Brown"}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span><b className="text-gray-900">{dashboardStats?.instructor?.totalCourses || courses.length}</b> {t('dashboard.projects')}</span>
                  <span><b className="text-gray-900">{dashboardStats?.instructor?.totalStudents || 0}</b> {t('dashboard.students')}</span>
                  <span className="flex items-center gap-1 text-green-600 font-bold">
                    <DollarSign size={14} />
                    {Number(dashboardStats?.instructor?.walletBalance || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(dashboardStats?.students || []).slice(0, 5).map((student: any, i: number) => (
                <Avatar key={i} className="w-10 h-10 border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform">
                  <AvatarImage
                    src={getImageUrl(student.profileImg, 'users') || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`}
                    crossOrigin="anonymous"
                  />
                  <AvatarFallback>{student.name?.[0]}</AvatarFallback>
                </Avatar >
              ))}
              {
                (dashboardStats?.students?.length || 0) > 5 && (
                  <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-500">
                    +{(dashboardStats?.students?.length || 0) - 5}
                  </div>
                )
              }
            </div >

            <div className="flex items-center gap-3">


              <Button
                onClick={() => setShowAddProductModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <PlusCircle size={18} className="me-2" />
                {t('dashboard.newCourse')}
              </Button>

              {!isUdemyLinked && (
                <Button
                  onClick={() => setIsUdemyModalOpen(true)}
                  variant="outline"
                  className="px-4 py-2 rounded-lg"
                >
                  {t('dashboard.linkUdemy') || 'ربط Udemy'}
                </Button>
              )}

              <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100">
                <Search size={20} className="text-gray-600" />
              </button>
              <NotificationBell onViewAll={() => setActiveTab('notifications')} />
            </div>
          </div >
        </header >

        <div className="flex-1 flex overflow-hidden mt-[56px]">
          {/* Left Sidebar Menu - Fixed */}
          <aside className="w-52 bg-white border-e border-gray-200 overflow-y-auto fixed start-[60px] top-[120px] h-[calc(100vh-120px)] z-20">
            <div className="p-6 space-y-6">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder={t('dashboard.searchPlaceholder')}
                  className="ps-10 bg-gray-50 border-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-start ${activeTab === item.id
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 text-start">
                  {t('dashboard.latestCommunities') || 'آخر المجتمعات'}
                </h3>
                <div className="space-y-2">
                  {loadingCommunities ? (
                    <div className="text-sm text-gray-400">{t('common.loading') || 'جاري التحميل...'}</div>
                  ) : latestCommunities.length > 0 ? (
                    latestCommunities.map((community, i) => {
                      const categoryColors: Record<string, string> = {
                        'General': 'bg-blue-500',
                        'Programming': 'bg-green-500',
                        'Career': 'bg-purple-500',
                        'Help': 'bg-orange-500',
                        'Showcase': 'bg-pink-500'
                      };
                      const dotColor = categoryColors[community.category] || 'bg-gray-500';
                      return (
                        <div
                          key={community._id}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
                          onClick={() => navigate(`/community?post=${community._id}`)}
                        >
                          <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                          <span className="truncate" title={community.title}>{community.title}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-gray-400">{t('dashboard.noCommunities') || 'لا توجد مجتمعات بعد'}</div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content with offset for sidebars */}
          <main className={`flex-1 flex flex-col bg-gray-50 ms-52 ${activeTab === 'video-tools' || activeTab === 'photo-studio' ? 'p-0 overflow-hidden' : 'p-4 overflow-y-auto'}`}>
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  {[
                    { key: 'feed', label: t('dashboard.feed') || 'Feed' },
                    { key: 'following', label: t('dashboard.following') || 'Following' },
                    { key: 'recentWorks', label: t('dashboard.recentWorks') || 'Recent Works' }
                  ].map((tab, i) => (
                    <Button
                      key={i}
                      variant={i === 0 ? "default" : "outline"}
                      className={`rounded-full ${i === 0 ? 'bg-blue-600' : ''}`}
                      size="sm"
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-6">
                  <Card className="p-6 bg-white border-none shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="text-blue-600" size={20} />
                      </div>
                      <TrendingUp className="text-green-500" size={16} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{courses.length}</h3>
                    <p className="text-sm text-gray-500">{t('dashboard.totalCourses')}</p>
                  </Card>

                  <Card className="p-6 bg-white border-none shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="text-green-600" size={20} />
                      </div>
                      <TrendingUp className="text-green-500" size={16} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{dashboardStats?.instructor?.totalStudents || students.length || 0}</h3>
                    <p className="text-sm text-gray-500">{t('dashboard.totalStudents')}</p>
                  </Card>

                  <Card className="p-6 bg-white border-none shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="text-orange-600" size={20} />
                      </div>
                      <TrendingUp className="text-green-500" size={16} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">${Number(dashboardStats?.totalRevenue || 0).toFixed(2)}</h3>
                    <p className="text-sm text-gray-500">{t('dashboard.revenue')}</p>
                  </Card>

                  <Card className="p-6 bg-white border-none shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Award className="text-purple-600" size={20} />
                      </div>
                      <TrendingUp className="text-green-500" size={16} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{Number(dashboardStats?.completionRate || 0).toFixed(2)}%</h3>
                    <p className="text-sm text-gray-500">{t('dashboard.completionRate')}</p>
                  </Card>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {courses.slice(0, 6).map((course, i) => {
                    const gradients = [
                      'from-purple-400 via-pink-400 to-blue-400',
                      'from-blue-400 via-cyan-400 to-teal-400',
                      'from-orange-400 via-red-400 to-pink-400',
                      'from-green-400 via-emerald-400 to-cyan-400',
                      'from-yellow-400 via-orange-400 to-red-400',
                      'from-indigo-400 via-purple-400 to-pink-400'
                    ];

                    const courseStats = dashboardStats?.courses?.find((c: any) => c.course._id === course._id) || {};
                    const studentCount = courseStats.enrolledStudents || course.studentsCount || 0;
                    const commentCount = courseStats.comments || course.comments || 0;
                    const rating = courseStats.averageRating || course.rating || 0;
                    const imageUrl = course.imageCover
                      ? (course.imageCover.startsWith('http') ? course.imageCover : `${API_BASE_URL}/products/${course.imageCover}`)
                      : null;

                    return (
                      <Card key={course._id} className="bg-white border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
                        <div className={`relative h-48 ${!imageUrl ? `bg-gradient-to-br ${gradients[i % gradients.length]}` : 'bg-gray-100'}`}>
                          {imageUrl ? (
                            <>
                              <img
                                src={getImageUrl(imageUrl, 'products') || ""} // imageUrl already handled some part but let's use helper consistently if possible, or just apply crossOrigin
                                alt={course.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                crossOrigin="anonymous"
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                            </>
                          ) : (
                            <div className="h-full flex items-center justify-center text-white text-5xl font-bold">
                              {course.title.charAt(0)}
                            </div>
                          )}

                          <div className="absolute top-4 end-4 flex gap-2 z-10">
                            <button
                              onClick={() => navigate(`/course/${course._id}`)}
                              className="w-8 h-8 bg-blue-600/90 backdrop-blur rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-sm"
                              title={t('common.view') || 'عرض'}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEditCourse(course)}
                              className="w-8 h-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors shadow-sm"
                              title={t('dashboard.editCourse') || 'تعديل'}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course._id)}
                              disabled={deletingCourseId === course._id}
                              className="w-8 h-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 shadow-sm"
                              title={t('dashboard.deleteCourse') || 'حذف'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
                          <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                            {course.description || t('dashboard.noDescription') || 'لا يوجد وصف متاح لهذا الكورس.'}
                          </p>
                          <div className="flex items-center justify-between border-t pt-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">
                                <Users size={14} className="text-blue-500" />
                                <span>{studentCount} {t('dashboard.students')}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors text-xs font-medium cursor-pointer">
                                <MessageSquare size={14} />
                                <span>{commentCount}</span>
                              </div>
                              {rating > 0 && (
                                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                  <span>★</span>
                                  <span>{Number(rating).toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                            <span className="text-lg font-bold text-green-600">${Number(course.price || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "courses" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">{t('dashboard.myCourses')}</h3>
                <div className="grid grid-cols-3 gap-6">
                  {courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map((course) => {
                    const courseStats = dashboardStats?.courses?.find((c: any) => c.course._id === course._id) || {};
                    const enrolledCount = courseStats.enrolledStudents || course.studentsCount || 0;

                    return (
                      <Card key={course._id} className="overflow-hidden hover:shadow-md transition-all">
                        <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-5xl font-bold">
                          {course.imageCover ? (
                            <img
                              src={getImageUrl(course.imageCover, 'products') || ""}
                              alt={course.title}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              {course.title.charAt(0)}
                            </div>
                          )}
                          <div className="absolute top-4 end-4 flex gap-2">
                            <button
                              onClick={() => navigate(`/course/${course._id}`)}
                              className="w-8 h-8 bg-blue-600/90 backdrop-blur rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-sm"
                              title={t('common.view') || 'عرض'}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEditCourse(course)}
                              className="w-8 h-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
                              title={t('dashboard.editCourse') || 'تعديل'}
                            >
                              <Edit size={16} className="text-gray-700 hover:text-white" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course._id)}
                              disabled={deletingCourseId === course._id}
                              className="w-8 h-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                              title={t('dashboard.deleteCourse') || 'حذف'}
                            >
                              <Trash2 size={16} className="text-gray-700 hover:text-white" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold mb-2">{course.title}</h3>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>${Number(course.price || 0).toFixed(2)}</span>
                            <span>{enrolledCount} {t('dashboard.students')}</span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "wallet" && (
              <InstructorWallet token={token || ""} />
            )}

            {activeTab === "livestreams" && (
              <LiveStreamManager token={token || ""} />
            )}

            {activeTab === "students" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{t('dashboard.myStudents')}</h2>
                  {!selectedStudent && <p className="text-gray-500">{(dashboardStats?.students || []).length} {t('dashboard.students')}</p>}
                </div>

                {selectedStudent ? (
                  <UserProfileDetail
                    user={selectedStudent}
                    currentUserRole="instructor"
                    onBack={() => setSelectedStudent(null)}
                    onChat={() => {
                      setChatRecipient(selectedStudent._id);
                      setActiveTab("chat");
                    }}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {(dashboardStats?.students || []).map((student: any) => (
                        <UserCard
                          key={student._id}
                          user={{
                            ...student,
                            role: 'Student'
                          }}
                          onClick={() => handleStudentClick(student)}
                        />
                      ))}
                    </div>
                    {(dashboardStats?.students || []).length === 0 && (
                      <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Users size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">{t('dashboard.noStudentsFound') || 'لم يتم العثور على طلاب مسجلين بعد'}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "grading" && <PendingGrading items={pendingGrading} loading={loadingPending} onGrade={handleGrade} />}
            {activeTab === "ai-assistant" && <AiCourseOutlineGenerator />}
            {activeTab === "course-management-ai" && (
              <div className="h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-2xl bg-white">
                <CourseManagementAI
                  courses={courses}
                  students={students}
                  token={token}
                  onAction={(action, data) => {
                    if (action === 'refresh') {
                      fetchCourses();
                      fetchStudents();
                    }
                  }}
                />
              </div>
            )}
            {/* Persist Photo Studio State */}
            <div style={{ display: activeTab === "photo-studio" ? 'block' : 'none' }}>
              {(visitedTabs.has("photo-studio") || activeTab === "photo-studio") && <AIPhotopeaStudio />}
            </div>

            {/* Persist Video Tools State */}
            <div className="h-full flex flex-col" style={{ display: activeTab === "video-tools" ? 'flex' : 'none' }}>
              <div className="flex-1 min-h-[600px] h-full">
                {(visitedTabs.has("video-tools") || activeTab === "video-tools") && <VideoTools />}
              </div>
            </div>

            {/* Persist Chat State */}
            <div style={{ display: activeTab === "chat" ? 'block' : 'none' }} className="h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-2xl">
              {(visitedTabs.has("chat") || activeTab === "chat") && <ChatDashboardWidget variant="full" targetUserId={chatRecipient} />}
            </div>

            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <UserNotifications />
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">{t('dashboard.analytics') || 'الإحصائيات'}</h2>
                {expandedCourseId ? (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <Button variant="outline" size="sm" onClick={() => setExpandedCourseId(null)}>
                        {t('common.back') || 'عودة'}
                      </Button>
                      <span className="font-bold text-lg">
                        {courses.find(c => c._id === expandedCourseId)?.title}
                      </span>
                    </div>
                    <CourseAnalytics courseId={expandedCourseId} token={token || ''} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                      <Card
                        key={course._id}
                        className="cursor-pointer hover:shadow-md transition-all"
                        onClick={() => setExpandedCourseId(course._id)}
                      >
                        <div className="p-6">
                          <h3 className="font-bold mb-2">{course.title}</h3>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>{course.studentsCount || 0} {t('dashboard.students')}</span>
                            <BarChart size={16} className="text-blue-500" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}


            {activeTab === "community" && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <CommunityContent />
              </div>
            )}

            {activeTab === "udemy" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{t('dashboard.udemyCourses')}</h3>
                  <Button onClick={fetchUdemyCourses} disabled={loadingUdemy}>
                    {loadingUdemy ? t('dashboard.updating') : t('dashboard.update')}
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {udemyCourses.map((course) => (
                    <Card key={course.id} className="p-4">
                      <h3 className="font-bold mb-2">{course.title}</h3>
                      <div className="flex justify-between text-sm">
                        <span>{course.price}</span>
                        <span>{Number(course.rating || 0).toFixed(2)} ⭐</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <ProfileSettings
                user={dashboardStats?.instructor || { name: 'Instructor' }}
                token={token || ''}
                onUpdate={(updated) => {
                  fetchDashboardStats();
                  toast({ title: "Profile Updated" });
                }}
              />
            )}
          </main>
        </div>
      </div >

      {showAddProductModal && (
        <AddProductModal
          show={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          token={token || ''}
          fetchProducts={fetchCourses}
        />
      )
      }

      {
        editingProduct && (
          <EditProductModal
            product={editingProduct}
            formData={formData}
            setFormData={setFormData}
            setEditingProduct={setEditingProduct}
            fetchProducts={fetchCourses}
            token={token || ''}
          />
        )
      }

      <UdemyLinkModal
        isOpen={isUdemyModalOpen}
        onClose={() => setIsUdemyModalOpen(false)}
        onSuccess={() => {
          setIsUdemyLinked(true);
          fetchUdemyCourses();
          toast({ title: t('common.success'), description: t('dashboard.udemyLinkedSuccess') || "تم ربط حساب Udemy بنجاح" });
        }}
      />
    </div >
  );
}