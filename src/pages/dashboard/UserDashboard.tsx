import { useState, useEffect } from "react";
import {
  Library, TrendingUp, Heart, ShoppingBag, Trophy, FileText,
  GraduationCap, User, LogOut, Search as SearchIcon, Bell,
  ChevronRight, LayoutDashboard, PlusCircle, MessageCircle,
  Sparkles, Video, BookOpen, Clock, Award, Star, Play
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/utils/imageUtils";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

// Sub-components
import GamificationDashboard from "@/components/gamification/GamificationDashboard";
import DailyChallenges from "@/components/gamification/DailyChallenges";
import MyBadges from "@/components/gamification/MyBadges";
import Leaderboard from "@/components/gamification/Leaderboard";
import ProgressOverview from "@/components/progress/ProgressOverview";
import CourseProgress from "@/components/progress/CourseProgress";
import QuizResults from "@/components/student/QuizResults";
import AssignmentResults from "@/components/student/AssignmentResults";
import { ChatButton } from "@/components/chat";
import ChatDashboardWidget from "@/components/chat/ChatDashboardWidget";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import { UserNotifications } from "@/components/dashboard/UserNotifications";
import NotificationBell from "@/components/dashboard/NotificationBell";
import StudentAiChat from "@/components/student/StudentAiChat";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageCover?: string;
  isPaid?: boolean;
}

const UserDashboard = () => {
  const { t, i18n } = useTranslation();
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
  const [unpurchasedProducts, setUnpurchasedProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [assignmentResults, setAssignmentResults] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [allProgress, setAllProgress] = useState<any[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  const fetchPaymentStatus = async (productId: string): Promise<boolean> => {
    if (!email || !token) return false;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/cart/status/${email}/product/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.status === "success" && res.data?.data) {
        return res.data.data.isPaid || false;
      }
      return false;
    } catch (error) { return false; }
  };

  const fetchProducts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allProducts = res.data?.data || [];
      if (email && token) {
        const productsWithStatus = await Promise.all(
          allProducts.map(async (product: Product) => {
            const isPaid = await fetchPaymentStatus(product._id);
            return { ...product, isPaid };
          })
        );
        setPurchasedProducts(productsWithStatus.filter(p => p.isPaid));
        setUnpurchasedProducts(productsWithStatus.filter(p => !p.isPaid));
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/users/getMe`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(res.data?.data || res.data);
    } catch (e) { console.error(e) }
  };

  const fetchStats = async () => {
    if (!token) return;
    try {
      const [statsRes, quizRes, assignRes, progressRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/student/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/v1/student/quiz-results`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/v1/student/assignment-results`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/v1/student/progress`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setDashboardStats(statsRes.data?.data || statsRes.data);
      setQuizResults(quizRes.data?.data || []);
      setAssignmentResults(assignRes.data?.data || []);
      setAllProgress(progressRes.data?.data || []);
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    fetchProducts();
    fetchUserProfile();
    fetchStats();
  }, [token, email]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleRequestUpgrade = async () => {
    if (!token) return;
    try {
      await axios.post(`${API_BASE_URL}/api/v1/users/requestUpgrade`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: t('common.success'), className: "bg-green-500 text-white" });
      fetchUserProfile();
    } catch (error) {
      toast({ title: t('common.error'), variant: "destructive" });
    }
  };

  // Resolve image for products
  const resolveProductImage = (imageCover?: string) => {
    if (!imageCover) return "/placeholder-course.png";
    if (imageCover.startsWith('http://') || imageCover.startsWith('https://')) return imageCover;
    if (imageCover.includes('/')) return `${API_BASE_URL}/${imageCover}`;
    return `${API_BASE_URL}/products/${imageCover}`;
  };

  const menuItems = [
    { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
    { id: "purchased", label: "كورساتي", icon: Library },
    { id: "progress", label: "تقدمي", icon: TrendingUp },
    { id: "available", label: "استكشاف", icon: ShoppingBag },
    { id: "live", label: "بث مباشر", icon: Video },
    { id: "gamification", label: "الإنجازات", icon: Trophy },
    { id: "quizzes", label: "الاختبارات", icon: GraduationCap },
    { id: "assignments", label: "الواجبات", icon: FileText },
    { id: "chat", label: "الرسائل", icon: MessageCircle },
    { id: "ai-chat", label: "المساعد الذكي", icon: Sparkles },
    { id: "notifications", label: "الإشعارات", icon: Bell },
    { id: "profile", label: "الملف الشخصي", icon: User },
  ];

  const currentDir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';

  const completedCourses = allProgress.filter(p => p.isCompleted).length;
  const avgProgress = allProgress.length > 0 ? Math.round(allProgress.reduce((acc, p) => acc + (p.completionPercentage || 0), 0) / allProgress.length) : 0;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden pt-[72px]" dir={currentDir}>

      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'} flex flex-col bg-white border-e border-gray-100 transition-all duration-300 z-10`}>
        {/* Logo */}
        <div className={`p-4 ${sidebarCollapsed ? 'px-3' : 'px-5'} border-b border-gray-50`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <span className="font-bold text-white text-lg">A</span>
            </div>
            {!sidebarCollapsed && <h1 className="text-lg font-bold text-gray-800 tracking-tight">Avinar</h1>}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <Icon size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Upgrade card */}
        {!sidebarCollapsed && userProfile?.role === "user" && !userProfile?.upgradeRequested && (
          <div className="mx-3 mb-3 p-3.5 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-blue-700 font-semibold text-xs mb-1">كن مدرباً</p>
            <p className="text-blue-500 text-[10px] mb-2.5">شارك معرفتك مع العالم</p>
            <Button onClick={handleRequestUpgrade} size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 text-xs font-semibold">
              <PlusCircle size={14} className="me-1" /> طلب ترقية
            </Button>
          </div>
        )}

        {/* Logout */}
        <div className="p-3 border-t border-gray-50">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 text-gray-400 hover:text-red-500 transition px-3 py-2 rounded-xl hover:bg-red-50 text-sm ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={17} />
            {!sidebarCollapsed && <span className="font-medium">خروج</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400">
              {t('dashboard.welcomeAdmin') || `مرحباً ${userProfile?.name?.split(' ')[0] || ''} 👋`}
            </p>
            <h2 className="text-xl font-bold text-gray-800">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <ChatButton variant="support" className="hidden sm:flex" />
            <NotificationBell onViewAll={() => setActiveTab('notifications')} />
            <div className="flex items-center gap-2.5 ps-3 border-s border-gray-100">
              <Avatar className="w-9 h-9 ring-2 ring-gray-100">
                <AvatarImage src={getImageUrl(userProfile?.avatar)} />
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">{userProfile?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{userProfile?.name || "Student"}</p>
                <p className="text-[10px] text-gray-400">{userProfile?.role === 'user' ? 'طالب' : userProfile?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-in fade-in duration-300">

            {/* ===== OVERVIEW ===== */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "كورساتي", value: purchasedProducts.length, icon: BookOpen, color: "blue", bg: "bg-blue-50", iconColor: "text-blue-500" },
                    { label: "معدل التقدم", value: `${avgProgress}%`, icon: TrendingUp, color: "emerald", bg: "bg-emerald-50", iconColor: "text-emerald-500" },
                    { label: "مكتملة", value: completedCourses, icon: Award, color: "purple", bg: "bg-purple-50", iconColor: "text-purple-500" },
                    { label: "الاختبارات", value: quizResults.length, icon: GraduationCap, color: "amber", bg: "bg-amber-50", iconColor: "text-amber-500" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 transition">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                          <stat.icon size={20} className={stat.iconColor} />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Current courses */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">متابعة التعلم</h3>
                    <button onClick={() => setActiveTab("purchased")} className="text-blue-600 text-xs font-medium hover:text-blue-700">
                      عرض الكل
                    </button>
                  </div>
                  {purchasedProducts.length > 0 ? (
                    <div className="grid gap-3">
                      {purchasedProducts.slice(0, 3).map((product) => {
                        const progress = allProgress.find(p => p.product?._id === product._id);
                        const pct = progress?.completionPercentage || 0;
                        return (
                          <div
                            key={product._id}
                            onClick={() => navigate(`/course/${product._id}`)}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition group"
                          >
                            <img
                              src={resolveProductImage(product.imageCover)}
                              alt={product.title}
                              className="w-16 h-12 rounded-lg object-cover border border-gray-100"
                              onError={(e) => e.currentTarget.src = "/placeholder-course.png"}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition">{product.title}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">{pct}%</span>
                              </div>
                            </div>
                            <Play size={16} className="text-gray-300 group-hover:text-blue-500 transition shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Library size={40} className="mx-auto text-gray-200 mb-3" />
                      <p className="text-sm text-gray-400">لم تشترك في أي كورس بعد</p>
                      <Button onClick={() => setActiveTab("available")} variant="outline" size="sm" className="mt-3 rounded-xl text-xs">
                        استكشف الكورسات
                      </Button>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "بث مباشر", icon: Video, color: "text-red-500", bg: "bg-red-50", action: () => navigate('/live') },
                    { label: "المساعد الذكي", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50", action: () => setActiveTab('ai-chat') },
                    { label: "الرسائل", icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-50", action: () => setActiveTab('chat') },
                    { label: "الإنجازات", icon: Trophy, color: "text-amber-500", bg: "bg-amber-50", action: () => setActiveTab('gamification') },
                  ].map((item, i) => (
                    <button key={i} onClick={item.action} className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition text-center group">
                      <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                        <item.icon size={20} className={item.color} />
                      </div>
                      <p className="text-xs font-medium text-gray-600">{item.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ===== GAMIFICATION ===== */}
            {activeTab === "gamification" && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl p-5 border border-gray-100">
                    <GamificationDashboard stats={dashboardStats} />
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-gray-100">
                    <DailyChallenges />
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-gray-100">
                    <MyBadges />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 h-fit">
                  <Leaderboard />
                </div>
              </div>
            )}

            {/* ===== PURCHASED ===== */}
            {activeTab === "purchased" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {purchasedProducts.length > 0 ? purchasedProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={resolveProductImage(product.imageCover)}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => e.currentTarget.src = "/placeholder-course.png"}
                      />
                      <Badge className="absolute top-3 start-3 bg-emerald-500 text-white border-none text-[10px]">
                        مشترك
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 line-clamp-1 mb-1">{product.title}</h3>
                      <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                        {product.description || "تابع تعلمك الآن"}
                      </p>
                      <Button
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 text-sm gap-1.5"
                        onClick={() => navigate(`/course/${product._id}`)}
                      >
                        <Play size={15} /> متابعة
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center">
                    <Library size={48} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 font-medium">لم تشترك في أي كورس بعد</p>
                  </div>
                )}
              </div>
            )}

            {/* ===== LIVE ===== */}
            {activeTab === "live" && (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Video size={32} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">المحاضرات المباشرة</h3>
                <p className="text-gray-400 text-sm mb-5">انضم للمحاضرات التفاعلية مع مدربيك</p>
                <Button className="bg-red-500 hover:bg-red-600 rounded-xl h-10 px-6 font-semibold text-sm" onClick={() => navigate('/live')}>
                  عرض المحاضرات المباشرة
                </Button>
              </div>
            )}

            {/* ===== AVAILABLE ===== */}
            {activeTab === "available" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {unpurchasedProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={resolveProductImage(product.imageCover)}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => e.currentTarget.src = "/placeholder-course.png"}
                      />
                      <div className="absolute top-3 end-3 bg-white/90 backdrop-blur rounded-lg px-2 py-1 shadow-sm">
                        <span className="text-emerald-600 font-bold text-sm">${product.price}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 line-clamp-1 mb-1">{product.title}</h3>
                      <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                        {product.description || "اكتشف هذا الكورس"}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold h-10 text-sm"
                        onClick={() => navigate(`/course-details/${product._id}`)}
                      >
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== PROGRESS ===== */}
            {activeTab === "progress" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <ProgressOverview
                    totalCourses={allProgress.length}
                    completedCourses={completedCourses}
                    totalLessons={allProgress.reduce((acc, p) => acc + (p.product?.curriculum?.reduce((s: number, c: any) => s + c.lectures.length, 0) || 0), 0)}
                    completedLessons={allProgress.reduce((acc, p) => acc + (p.completedLessons?.length || 0), 0)}
                    totalMinutes={allProgress.reduce((acc, p) => acc + (p.timeSpent || 0), 0)}
                    averageProgress={avgProgress}
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {allProgress.map((p) => (
                    <div key={p._id} className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-gray-200 transition">
                      <CourseProgress
                        courseId={p.product?._id}
                        courseTitle={p.product?.title || "Course"}
                        courseImage={resolveProductImage(p.product?.imageCover)}
                        completedLessons={p.completedLessons?.length || 0}
                        totalLessons={p.product?.curriculum?.reduce((s: number, c: any) => s + c.lectures.length, 0) || 0}
                        totalMinutes={p.product?.curriculum?.reduce((s: number, c: any) => s + c.lectures.reduce((sl: number, l: any) => sl + (l.duration || 0), 0), 0) || 0}
                        completedMinutes={p.timeSpent || 0}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== QUIZZES ===== */}
            {activeTab === "quizzes" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <QuizResults results={quizResults} loading={false} />
              </div>
            )}

            {/* ===== ASSIGNMENTS ===== */}
            {activeTab === "assignments" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <AssignmentResults results={assignmentResults} loading={false} />
              </div>
            )}

            {/* ===== PROFILE ===== */}
            {activeTab === "profile" && (
              <ProfileSettings
                user={userProfile}
                token={token || ''}
                onUpdate={(updatedUser) => {
                  setUserProfile(updatedUser);
                  toast({ title: t('common.success') || 'تم التحديث بنجاح', className: "bg-green-500 text-white" });
                }}
              />
            )}

            {/* ===== CHAT ===== */}
            {activeTab === "chat" && (
              <div className="h-[calc(100vh-180px)] rounded-2xl overflow-hidden border border-gray-100">
                <ChatDashboardWidget variant="full" />
              </div>
            )}

            {/* ===== AI CHAT ===== */}
            {activeTab === "ai-chat" && (
              <div className="h-[calc(100vh-180px)] rounded-2xl overflow-hidden border border-gray-100">
                <StudentAiChat />
              </div>
            )}

            {/* ===== NOTIFICATIONS ===== */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <UserNotifications />
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
