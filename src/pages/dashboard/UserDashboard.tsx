import { useState, useEffect } from "react";
import {
  Library,
  TrendingUp,
  Heart,
  ShoppingBag,
  Trophy,
  FileText,
  GraduationCap,
  User,
  LogOut,
  Search as SearchIcon,
  Bell,
  ChevronRight,
  LayoutDashboard,
  PlusCircle,
  MessageCircle,
  Sparkles,
  Video
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/utils/imageUtils";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
  const [activeTab, setActiveTab] = useState("gamification");
  const [loading, setLoading] = useState(false);

  // New state for API data
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [assignmentResults, setAssignmentResults] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [allProgress, setAllProgress] = useState<any[]>([]);

  const { toast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  // Check payment status for a product
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

  // Fetch all products
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

  const menuItems = [
    { id: "gamification", label: t('dashboard.gamification'), icon: <LayoutDashboard size={20} /> },
    { id: "purchased", label: t('dashboard.myCourses'), icon: <Library size={20} /> },
    { id: "live", label: 'بث مباشر', icon: <Video size={20} /> },
    { id: "available", label: t('dashboard.explore'), icon: <ShoppingBag size={20} /> },
    { id: "chat", label: t('dashboard.chat') || 'الرسائل', icon: <MessageCircle size={20} /> },
    { id: "ai-chat", label: t('dashboard.aiAssistant') || 'المساعد الذكي', icon: <Sparkles size={20} /> },
    { id: "notifications", label: t('dashboard.notifications') || 'الإشعارات', icon: <Bell size={20} /> },
    { id: "progress", label: t('dashboard.progress'), icon: <TrendingUp size={20} /> },
    { id: "quizzes", label: t('dashboard.quizzes'), icon: <GraduationCap size={20} /> },
    { id: "assignments", label: t('dashboard.assignments'), icon: <FileText size={20} /> },
    { id: "wishlist", label: t('dashboard.wishlist'), icon: <Heart size={20} />, action: () => navigate("/wishlist") },
    { id: "profile", label: t('dashboard.profile'), icon: <User size={20} /> },
  ];

  const currentDir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';

  return (
    <div className="flex h-screen bg-[linear-gradient(135deg,#c3e7e3_0%,#dbe9f4_50%,#ebdcf0_100%)] font-sans overflow-hidden pt-20" dir={currentDir}>
      {/* Side Main Wrapper for Glass Effect - Expanded to fill more screen */}
      <div className="flex flex-1 m-1 sm:m-2 bg-white/40 backdrop-blur-2xl rounded-[24px] lg:rounded-[32px] shadow-2xl border border-white/50 overflow-hidden relative">

        {/* Sidebar */}
        <aside className="w-[280px] flex flex-col border-e border-white/30 bg-white/20 backdrop-blur-sm z-10">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-10 text-[#2D3748]">
              <div className="w-10 h-10 bg-[#1A365D] rounded-xl flex items-center justify-center shadow-lg shadow-[#1A365D]/20 transition-transform hover:scale-105">
                <span className="font-bold text-white text-xl">V</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{t('app.title')}</h1>
            </div>

            <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-320px)] pe-2 custom-scrollbar">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action ? item.action : () => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] transition-all duration-300 relative group overflow-hidden ${activeTab === item.id
                    ? "bg-[#1A365D] text-white shadow-xl shadow-[#1A365D]/20 translate-x-1"
                    : "text-[#4A5568] hover:bg-white/40 hover:text-[#2D3748]"
                    }`}
                >
                  <span className={`transition-colors duration-300 ${activeTab === item.id ? "text-white" : "group-hover:text-[#1A365D]"}`}>
                    {item.icon}
                  </span>
                  <span className="font-semibold text-[15px]">{item.label}</span>
                  {activeTab === item.id && (
                    <div className="absolute end-4 w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
            </nav>

            {userProfile?.role === "user" && !userProfile?.upgradeRequested && (
              <div className="mt-8 p-5 bg-[#EBF8FF] rounded-[24px] border border-[#BEE3F8]">
                <h4 className="text-[#2C5282] font-bold text-sm mb-2">{t('dashboard.becomeInstructor')}</h4>
                <p className="text-[#4299E1] text-[11px] mb-4">Start sharing your knowledge with the world.</p>
                <Button
                  onClick={handleRequestUpgrade}
                  className="w-full bg-[#3182CE] hover:bg-[#2B6CB0] text-white rounded-xl py-2 flex items-center justify-center gap-2 font-bold shadow-md shadow-[#3182CE]/20 transition-all active:scale-95 text-xs"
                >
                  <PlusCircle size={16} />
                  <span>{t('common.save')}</span>
                </Button>
              </div>
            )}
          </div>

          <div className="mt-auto p-8 border-t border-white/30">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between group text-[#718096] hover:text-[#E53E3E] transition-all p-3 rounded-xl hover:bg-red-50/50"
            >
              <div className="flex items-center gap-3">
                <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="font-bold">{t('dashboard.logout')}</span>
              </div>
              <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/10">

          {/* Header */}
          <header className="flex items-center justify-between ps-10 pe-12 py-8 bg-white/20 backdrop-blur-md border-b border-white/30">
            <div className="space-y-1">
              <h4 className="text-[#3182ce] text-sm font-medium">
                {t('dashboard.welcomeAdmin') || `Welcome back, ${userProfile?.name?.split(' ')[0]} 👋`}
              </h4>
              <h2 className="text-3xl font-extrabold text-[#2D3748] tracking-tight">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h2>
            </div>

            <div className="flex items-center gap-6">
              {/* Search Mockup */}
              <div className="hidden sm:flex items-center bg-white/40 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/50 shadow-inner group transition-all focus-within:ring-2 focus-within:ring-[#3182ce]/30">
                <SearchIcon size={18} className="text-[#718096] group-focus-within:text-[#3182ce]" />
                <input
                  type="text"
                  placeholder={t('dashboard.searchPlaceholder')}
                  className="bg-transparent border-none outline-none ps-3 text-sm text-[#4A5568] placeholder-[#A0AEC0] w-48"
                />
              </div>

              <div className="flex items-center gap-3">
                <ChatButton variant="support" className="hidden sm:flex" />

                <NotificationBell onViewAll={() => setActiveTab('notifications')} />

                <div className="flex items-center gap-3 ps-3 border-s border-white/40">
                  <Avatar className="w-11 h-11 ring-2 ring-white ring-offset-2 ring-offset-[#dbe9f4] shadow-md border-none cursor-pointer transition-transform hover:scale-105 active:scale-95">
                    <AvatarImage src={getImageUrl(userProfile?.avatar)} />
                    <AvatarFallback className="bg-[#1A365D] text-white font-bold">{userProfile?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-extrabold text-[#2D3748] leading-tight">{userProfile?.name || "Student"}</p>
                    <p className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider">{userProfile?.role || "Student"}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content Body */}
          <main className="flex-1 overflow-y-auto ps-10 pe-12 py-10 custom-scrollbar">

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {activeTab === "gamification" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white/40 backdrop-blur-md rounded-[32px] p-2 border border-white/50 shadow-xl shadow-black/[0.03]">
                      <GamificationDashboard stats={dashboardStats} />
                    </div>
                    <div className="bg-white/40 backdrop-blur-md rounded-[32px] p-2 border border-white/50 shadow-xl shadow-black/[0.03]">
                      <DailyChallenges />
                    </div>
                    <div className="bg-white/40 backdrop-blur-md rounded-[32px] p-2 border border-white/50 shadow-xl shadow-black/[0.03]">
                      <MyBadges />
                    </div>
                  </div>
                  <div className="bg-white/40 backdrop-blur-md rounded-[32px] p-2 border border-white/50 shadow-xl shadow-black/[0.03] h-fit">
                    <Leaderboard />
                  </div>
                </div>
              )}

              {activeTab === "purchased" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {purchasedProducts.length > 0 ? purchasedProducts.map((product) => (
                    <Card key={product._id} className="group border border-white/50 bg-white/40 backdrop-blur-md rounded-[32px] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={getImageUrl(product.imageCover)}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Badge className="absolute top-4 start-4 bg-white/90 backdrop-blur text-[#2D3748] border-none font-bold">
                          {t('dashboard.completed') || 'Enrolled'}
                        </Badge>
                      </div>
                      <CardContent className="p-8">
                        <h3 className="font-extrabold text-xl text-[#2D3748] mb-3 line-clamp-1">{product.title}</h3>
                        <p className="text-[#718096] text-sm mb-6 line-clamp-2 leading-relaxed">
                          {product.description || t('dashboard.keepLearning')}
                        </p>
                        <Button
                          className="w-full rounded-[18px] bg-[#3182CE] hover:bg-[#2B6CB0] text-white font-bold h-12 shadow-lg shadow-[#3182CE]/20 transition-all active:scale-95"
                          onClick={() => navigate(`/course/${product._id}`)}
                        >
                          {t('common.view')}
                        </Button>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="col-span-full py-20 text-center">
                      <Library size={64} className="mx-auto text-white/30 mb-4" />
                      <p className="text-[#718096] font-bold">{t('dashboard.noCoursesFound') || 'No courses purchased yet'}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "live" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Video className="text-red-500" />
                      المحاضرات المباشرة
                    </h2>
                  </div>
                  {/* Since we have a dedicated page for live streams, we can either link to it or embed a list */}
                  <div className="bg-white/40 backdrop-blur-md rounded-[32px] p-8 border border-white/50 text-center">
                    <Video size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold mb-4 text-gray-700">شاهد المحاضرات المباشرة الآن</h3>
                    <p className="text-gray-500 mb-6">انضم للمحاضرات التفاعلية مع مدربيك المفضلين</p>
                    <Button
                      className="bg-red-500 hover:bg-red-600 rounded-2xl h-12 px-8 font-bold"
                      onClick={() => navigate('/live')}
                    >
                      استعراض جميع المحاضرات المباشرة
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "available" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {unpurchasedProducts.map((product) => (
                    <Card key={product._id} className="group border border-white/50 bg-white/40 backdrop-blur-md rounded-[32px] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={getImageUrl(product.imageCover)}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-4 end-4 bg-white/95 backdrop-blur rounded-[14px] px-3 py-1.5 shadow-lg border border-white/50">
                          <span className="text-[#2F855A] font-extrabold text-lg">${product.price}</span>
                        </div>
                      </div>
                      <CardContent className="p-8">
                        <h3 className="font-extrabold text-xl text-[#2D3748] mb-3 line-clamp-1">{product.title}</h3>
                        <p className="text-[#718096] text-sm mb-6 line-clamp-2 leading-relaxed italic opacity-80">
                          {product.description || t('dashboard.keepLearning')}
                        </p>
                        <Button
                          className="w-full rounded-[18px] bg-[#1A365D] hover:bg-[#2A4365] text-white font-bold h-12 shadow-lg shadow-[#1A365D]/20 transition-all active:scale-95"
                          onClick={() => navigate(`/course-details/${product._id}`)}
                        >
                          {t('common.view')}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === "progress" && (
                <div className="grid grid-cols-1 gap-8">
                  <div className="bg-white/40 backdrop-blur-md rounded-[32px] p-6 border border-white/50 shadow-xl shadow-black/[0.03]">
                    <ProgressOverview
                      totalCourses={allProgress.length}
                      completedCourses={allProgress.filter(p => p.isCompleted).length}
                      totalLessons={allProgress.reduce((acc, p) => acc + (p.product?.curriculum?.reduce((s: number, c: any) => s + c.lectures.length, 0) || 0), 0)}
                      completedLessons={allProgress.reduce((acc, p) => acc + (p.completedLessons?.length || 0), 0)}
                      totalMinutes={allProgress.reduce((acc, p) => acc + (p.timeSpent || 0), 0)}
                      averageProgress={allProgress.length > 0 ? Math.round(allProgress.reduce((acc, p) => acc + (p.completionPercentage || 0), 0) / allProgress.length) : 0}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {allProgress.map((p) => (
                      <div key={p._id} className="bg-white/40 backdrop-blur-md rounded-[32px] p-4 border border-white/50 shadow-lg shadow-black/[0.02] hover:bg-white/60 transition-colors">
                        <CourseProgress
                          courseId={p.product?._id}
                          courseTitle={p.product?.title || "Course"}
                          courseImage={getImageUrl(p.product?.imageCover)}
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

              {activeTab === "quizzes" && (
                <div className="bg-white/40 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-xl shadow-black/[0.03]">
                  <QuizResults results={quizResults} loading={false} />
                </div>
              )}

              {activeTab === "assignments" && (
                <div className="bg-white/40 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-xl shadow-black/[0.03]">
                  <AssignmentResults results={assignmentResults} loading={false} />
                </div>
              )}

              {activeTab === "profile" && (
                <ProfileSettings
                  user={userProfile}
                  token={token || ''}
                  onUpdate={(updatedUser) => {
                    setUserProfile(updatedUser);
                    toast({ title: t('common.success') || 'Profile updated successfully', className: "bg-green-500 text-white" });
                  }}
                />
              )}

              {activeTab === "chat" && (
                <div className="h-[calc(100vh-140px)] rounded-[32px] overflow-hidden shadow-2xl">
                  <ChatDashboardWidget variant="full" />
                </div>
              )}

              {activeTab === "ai-chat" && (
                <div className="h-[calc(100vh-140px)] rounded-[32px] overflow-hidden shadow-2xl">
                  <StudentAiChat />
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="bg-white/40 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-xl shadow-black/[0.03]">
                  <UserNotifications />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Decorative Floating Elements (optional, context aware) */}
      <div className="absolute top-[-100px] start-[-100px] w-80 h-80 bg-[#BEE3F8]/30 blur-[100px] rounded-full -z-10"></div>
      <div className="absolute bottom-[-100px] end-[-100px] w-96 h-96 bg-[#FED7E2]/20 blur-[100px] rounded-full -z-10"></div>
    </div>
  );
};

export default UserDashboard;
