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
  Search,
  Bell,
  PlusCircle
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

// Sub-components
import GamificationDashboard from "@/components/gamification/GamificationDashboard";
import DailyChallenges from "@/components/gamification/DailyChallenges";
import Leaderboard from "@/components/gamification/Leaderboard";
import ProgressOverview from "@/components/progress/ProgressOverview";
import CourseProgress from "@/components/progress/CourseProgress";
import QuizResults from "@/components/student/QuizResults";
import AssignmentResults from "@/components/student/AssignmentResults";

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
      const [statsRes, quizRes, assignRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/student/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/v1/student/quiz-results`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/v1/student/assignment-results`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setDashboardStats(statsRes.data?.data || statsRes.data);
      setQuizResults(quizRes.data?.data || []);
      setAssignmentResults(assignRes.data?.data || []);
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
      toast({ title: "Request sent successfully", className: "bg-green-500 text-white" });
      fetchUserProfile();
    } catch (error) {
      toast({ title: "Error sending request", variant: "destructive" });
    }
  };

  const menuItems = [
    { id: "gamification", label: t('dashboard.gamification'), icon: <Trophy size={20} /> },
    { id: "purchased", label: t('dashboard.myCourses'), icon: <Library size={20} /> },
    { id: "available", label: t('dashboard.explore'), icon: <ShoppingBag size={20} /> },
    { id: "progress", label: t('dashboard.progress'), icon: <TrendingUp size={20} /> },
    { id: "quizzes", label: t('dashboard.quizzes'), icon: <GraduationCap size={20} /> },
    { id: "assignments", label: t('dashboard.assignments'), icon: <FileText size={20} /> },
    { id: "wishlist", label: t('dashboard.wishlist'), icon: <Heart size={20} />, action: () => navigate("/wishlist") },
    { id: "profile", label: t('dashboard.profile'), icon: <User size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F4F2EE] font-sans overflow-hidden pt-24" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className="w-[280px] bg-[#1a1c1e] text-gray-400 flex flex-col m-4 rounded-[30px] shadow-2xl overflow-hidden relative">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8 text-white">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="font-bold text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-brand">{t('dashboard.student')}</h1>
          </div>

          {userProfile?.role === "user" && !userProfile?.upgradeRequested && (
            <button
              onClick={handleRequestUpgrade}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full py-3 px-6 flex items-center justify-center gap-2 font-medium transition-transform active:scale-95 shadow-lg shadow-green-500/30 mb-8 text-sm"
            >
              <GraduationCap size={18} />
              <span>{t('dashboard.becomeInstructor')}</span>
            </button>
          )}

          {userProfile?.upgradeRequested && (
            <div className="mb-8 p-3 bg-white/10 rounded-xl text-center">
              <p className="text-yellow-400 text-sm font-medium">{t('dashboard.requestPending')}</p>
            </div>
          )}

          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action ? item.action : () => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 ${activeTab === item.id
                  ? "bg-white text-black shadow-lg font-semibold translate-x-1"
                  : "hover:bg-white/5 hover:text-gray-200"
                  }`}
              >
                <span className={activeTab === item.id ? "text-green-500" : ""}>{item.icon}</span>
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
        <header className="flex items-center justify-between px-8 py-4 mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.overview')}</h2>
            <p className="text-gray-500 text-sm">{t('dashboard.keepLearning')}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 text-black border-white shadow-sm cursor-pointer">
                <AvatarFallback>{userProfile?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold text-gray-900">{userProfile?.name || "Student"}</p>
                <p className="text-xs text-gray-500">{t('dashboard.role')}: {userProfile?.role || "User"}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {activeTab === "gamification" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <GamificationDashboard stats={dashboardStats} />
                <DailyChallenges />
              </div>
              <div>
                <Leaderboard />
              </div>
            </div>
          )}

          {activeTab === "purchased" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedProducts.map((product) => (
                <Card key={product._id} className="border-none shadow-sm rounded-[24px] overflow-hidden hover:shadow-md transition-all h-full">
                  <img src={getImageUrl(product.imageCover)} alt={product.title} className="w-full h-48 object-cover" />
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{product.title}</h3>
                    <Button className="w-full rounded-xl bg-green-600 hover:bg-green-700" onClick={() => navigate(`/course/${product._id}`)}>
                      {t('common.view')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "available" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unpurchasedProducts.map((product) => (
                <Card key={product._id} className="border-none shadow-sm rounded-[24px] overflow-hidden hover:shadow-md transition-all h-full">
                  <img src={getImageUrl(product.imageCover)} alt={product.title} className="w-full h-48 object-cover" />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{product.title}</h3>
                      <span className="text-green-600 font-bold">${product.price}</span>
                    </div>
                    <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700" onClick={() => navigate(`/course-details/${product._id}`)}>
                      {t('common.view')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "progress" && (
            <div className="space-y-6">
              <ProgressOverview
                totalCourses={purchasedProducts.length}
                completedCourses={1} // mock
                totalLessons={45}
                completedLessons={23}
                totalMinutes={185}
                averageProgress={51}
              />
              {purchasedProducts.map((p, i) => (
                <CourseProgress
                  key={p._id}
                  courseId={p._id}
                  courseTitle={p.title}
                  courseImage={p.imageCover}
                  completedLessons={5}
                  totalLessons={10}
                  totalMinutes={60}
                  completedMinutes={30}
                />
              ))}
            </div>
          )}

          {activeTab === "quizzes" && (
            <QuizResults results={quizResults} loading={false} />
          )}

          {activeTab === "assignments" && (
            <AssignmentResults results={assignmentResults} loading={false} />
          )}
        </div>
      </main>
    </div>
  );
};
export default UserDashboard;
