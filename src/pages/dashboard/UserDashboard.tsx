import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { LogOut, Library, TrendingUp, Heart, ShoppingBag, Trophy, FileText, GraduationCap, User, Lock, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/utils/imageUtils";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import GamificationDashboard from "@/components/gamification/GamificationDashboard";
import DailyChallenges from "@/components/gamification/DailyChallenges";
import Leaderboard from "@/components/gamification/Leaderboard";
import ProgressOverview from "@/components/progress/ProgressOverview";
import CourseProgress from "@/components/progress/CourseProgress";
import QuizResults from "@/components/student/QuizResults";
import AssignmentResults from "@/components/student/AssignmentResults";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageCover?: string;
  category?: any;
  isPaid?: boolean;
}

const UserDashboard = () => {
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
  const [unpurchasedProducts, setUnpurchasedProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState("purchased");
  const [loading, setLoading] = useState(false);

  // New state for API data
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [assignmentResults, setAssignmentResults] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Profile state
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    password: "",
    passwordConfirm: ""
  });

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
    } catch (error) {
      return false;
    }
  };

  // Fetch all products and separate by payment status
  const fetchProducts = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allProducts = res.data?.data || [];

      if (email && token) {
        // Check payment status for all products
        const productsWithStatus = await Promise.all(
          allProducts.map(async (product: Product) => {
            const isPaid = await fetchPaymentStatus(product._id);
            return { ...product, isPaid };
          })
        );

        // Separate purchased and unpurchased
        const purchased = productsWithStatus.filter(p => p.isPaid);
        const unpurchased = productsWithStatus.filter(p => !p.isPaid);

        setPurchasedProducts(purchased);
        setUnpurchasedProducts(unpurchased);
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast({
        title: "خطأ في جلب الكورسات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Student Dashboard Stats
  const fetchDashboardStats = async () => {
    if (!token) return;
    setLoadingStats(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/student/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardStats(res.data?.data || res.data);
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Student Progress
  const fetchStudentProgress = async () => {
    if (!token) return;
    setLoadingProgress(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/student/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgressData(res.data?.data || res.data);
    } catch (error: any) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoadingProgress(false);
    }
  };

  // Fetch Quiz Results
  const fetchQuizResults = async () => {
    if (!token) return;
    setLoadingQuizzes(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/student/quiz-results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizResults(res.data?.data || res.data || []);
    } catch (error: any) {
      console.error("Error fetching quiz results:", error);
      setQuizResults([]);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  // Fetch Assignment Results
  const fetchAssignmentResults = async () => {
    if (!token) return;
    setLoadingAssignments(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/student/assignment-results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignmentResults(res.data?.data || res.data || []);
    } catch (error: any) {
      console.error("Error fetching assignment results:", error);
      setAssignmentResults([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Fetch User Profile
  const fetchUserProfile = async () => {
    if (!token) return;
    setLoadingProfile(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/users/getMe`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = res.data?.data || res.data;
      setUserProfile(profile);
      setProfileForm({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || ""
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "خطأ في جلب البيانات الشخصية",
        variant: "destructive",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  // Update User Profile
  const handleUpdateProfile = async () => {
    if (!token) return;
    setUpdatingProfile(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/v1/users/updateMe`,
        profileForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserProfile(res.data?.data || res.data);
      toast({
        title: "تم تحديث البيانات بنجاح",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "خطأ في تحديث البيانات",
        description: error.response?.data?.message || "حدث خطأ ما",
        variant: "destructive",
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (!token) return;
    if (passwordForm.password !== passwordForm.passwordConfirm) {
      toast({
        title: "كلمة المرور غير متطابقة",
        variant: "destructive",
      });
      return;
    }
    setChangingPassword(true);
    try {
      await axios.put(
        `${API_BASE_URL}/api/v1/users/changeMyPassword`,
        passwordForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "تم تغيير كلمة المرور بنجاح",
      });
      setPasswordForm({
        currentPassword: "",
        password: "",
        passwordConfirm: ""
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: error.response?.data?.message || "حدث خطأ ما",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (!token) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/users/deleteMe`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "تم حذف الحساب بنجاح",
      });
      handleLogout();
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "خطأ في حذف الحساب",
        description: error.response?.data?.message || "حدث خطأ ما",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDashboardStats();
    fetchStudentProgress();
    fetchQuizResults();
    fetchAssignmentResults();
    fetchUserProfile();
  }, [token, email]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-20" dir="rtl">
      <div className="flex">
        {/* Sidebar (Right) */}
        <aside className="w-64 bg-white border-l border-gray-200 h-[calc(100vh-80px)] fixed right-0 top-20 hidden md:flex md:flex-col">
          <div className="p-6 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800 mb-6">لوحة المستخدم</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6">
            <nav className="space-y-2 pb-6">
              <button
                onClick={() => setActiveTab("purchased")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "purchased"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Library size={20} />
                كورساتي المشتراة
              </button>
              <button
                onClick={() => setActiveTab("available")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "available"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <ShoppingBag size={20} />
                كورسات متاحة
              </button>
              <button
                onClick={() => setActiveTab("gamification")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "gamification"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Trophy size={20} />
                التحفيز والجوائز
              </button>
              <button
                onClick={() => setActiveTab("progress")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "progress"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <TrendingUp size={20} />
                التقدم
              </button>
              <button
                onClick={() => setActiveTab("quizzes")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "quizzes"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <GraduationCap size={20} />
                الاختبارات
              </button>
              <button
                onClick={() => setActiveTab("assignments")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "assignments"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <FileText size={20} />
                المهام
              </button>
              <button
                onClick={() => navigate("/wishlist")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
              >
                <Heart size={20} />
                المفضلة
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "profile"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <User size={20} />
                الملف الشخصي
              </button>
            </nav>
          </div>

          <div className="flex-shrink-0 p-6 border-t border-gray-100">
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
            <h1 className="text-2xl font-bold text-gray-900">لوحة المستخدم</h1>
          </div>

          {/* Gamification Dashboard (Always Visible at Top) */}
          <GamificationDashboard stats={dashboardStats} />

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] p-6">

            {/* Gamification Tab */}
            {activeTab === "gamification" && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <DailyChallenges />
                </div>
                <div>
                  <Leaderboard />
                </div>
              </div>
            )}

            {/* Purchased Products Tab */}
            {activeTab === "purchased" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">كورساتي المشتراة</h2>
                  <span className="text-sm text-gray-500">
                    {purchasedProducts.length} كورس
                  </span>
                </div>

                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {purchasedProducts.length > 0 ? (
                      purchasedProducts.map((product) => (
                        <Card key={product._id} className="flex flex-col hover:shadow-md transition-shadow">
                          <CardHeader className="p-0">
                            <img
                              src={getImageUrl(product.imageCover)}
                              alt={product.title}
                              className="w-full h-48 object-cover rounded-t-xl"
                            />
                          </CardHeader>

                          <CardContent className="flex flex-col flex-grow p-6">
                            <CardTitle className="text-right text-lg mb-2">{product.title}</CardTitle>
                            <p className="text-right text-gray-600 mb-4 text-sm line-clamp-2">
                              {product.description}
                            </p>
                            <div className="mt-auto">
                              <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => navigate(`/course/${product._id}`)}
                              >
                                عرض الكورس
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12 text-gray-500">
                        <Library size={48} className="mx-auto mb-4 opacity-20" />
                        <p>لم تشتري أي كورس بعد</p>
                        <Button
                          variant="link"
                          onClick={() => navigate("/courses")}
                          className="text-blue-600 mt-2"
                        >
                          تصفح الكورسات المتاحة
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Available (Unpurchased) Products Tab */}
            {activeTab === "available" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">كورسات متاحة للشراء</h2>
                  <span className="text-sm text-gray-500">
                    {unpurchasedProducts.length} كورس
                  </span>
                </div>

                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unpurchasedProducts.length > 0 ? (
                      unpurchasedProducts.map((product) => (
                        <Card key={product._id} className="flex flex-col hover:shadow-md transition-shadow">
                          <CardHeader className="p-0">
                            <img
                              src={getImageUrl(product.imageCover)}
                              alt={product.title}
                              className="w-full h-48 object-cover rounded-t-xl"
                            />
                          </CardHeader>

                          <CardContent className="flex flex-col flex-grow p-6">
                            <div className="flex justify-between items-start mb-2">
                              <CardTitle className="text-right text-lg">{product.title}</CardTitle>
                              <span className="text-blue-600 font-bold text-lg">${product.price}</span>
                            </div>
                            <p className="text-right text-gray-600 mb-4 text-sm line-clamp-2">
                              {product.description}
                            </p>
                            <div className="mt-auto">
                              <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => navigate(`/course-details/${product._id}`)}
                              >
                                عرض التفاصيل
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12 text-gray-500">
                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                        <p>لقد اشتريت جميع الكورسات المتاحة!</p>
                        <p className="text-sm mt-2">تحقق لاحقاً للحصول على كورسات جديدة</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === "progress" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">تقدمي في الكورسات</h2>
                </div>

                {/* Progress Overview */}
                <ProgressOverview
                  totalCourses={purchasedProducts.length}
                  completedCourses={1}
                  totalLessons={45}
                  completedLessons={23}
                  totalMinutes={185}
                  averageProgress={51}
                />

                {/* Course Progress List */}
                <div className="space-y-4">
                  {purchasedProducts.length > 0 ? (
                    purchasedProducts.map((product, index) => (
                      <CourseProgress
                        key={product._id}
                        courseId={product._id}
                        courseTitle={product.title}
                        courseImage={product.imageCover}
                        completedLessons={index === 0 ? 15 : index === 1 ? 8 : 0}
                        totalLessons={index === 0 ? 20 : index === 1 ? 15 : 10}
                        lastWatchedLesson={index === 0 ? "الدرس الخامس عشر: المفاهيم المتقدمة" : index === 1 ? "الدرس الثامن: البداية" : undefined}
                        totalMinutes={index === 0 ? 120 : index === 1 ? 90 : 60}
                        completedMinutes={index === 0 ? 90 : index === 1 ? 48 : 0}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
                      <p>لا توجد كورسات مشتراة لتتبع التقدم</p>
                      <p className="text-sm mt-2">ابدأ بشراء كورس لتتبع تقدمك هنا</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quizzes Tab */}
            {activeTab === "quizzes" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">نتائج الاختبارات</h2>
                  <span className="text-sm text-gray-500">
                    {quizResults.length} اختبار
                  </span>
                </div>
                <QuizResults results={quizResults} loading={loadingQuizzes} />
              </div>
            )}

            {/* Assignments Tab */}
            {activeTab === "assignments" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">نتائج المهام</h2>
                  <span className="text-sm text-gray-500">
                    {assignmentResults.length} مهمة
                  </span>
                </div>
                <AssignmentResults results={assignmentResults} loading={loadingAssignments} />
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">الملف الشخصي</h2>
                </div>

                {loadingProfile ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Update Profile Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User size={20} />
                          تحديث البيانات الشخصية
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">الاسم</Label>
                          <Input
                            id="name"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            placeholder="أدخل اسمك"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">البريد الإلكتروني</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            placeholder="أدخل بريدك الإلكتروني"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">رقم الهاتف</Label>
                          <Input
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            placeholder="أدخل رقم هاتفك"
                          />
                        </div>
                        <Button
                          onClick={handleUpdateProfile}
                          disabled={updatingProfile}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {updatingProfile ? "جاري التحديث..." : "تحديث البيانات"}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Change Password Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock size={20} />
                          تغيير كلمة المرور
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            placeholder="أدخل كلمة المرور الحالية"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordForm.password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                            placeholder="أدخل كلمة المرور الجديدة"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordForm.passwordConfirm}
                            onChange={(e) => setPasswordForm({ ...passwordForm, passwordConfirm: e.target.value })}
                            placeholder="أعد إدخال كلمة المرور الجديدة"
                          />
                        </div>
                        <Button
                          onClick={handleChangePassword}
                          disabled={changingPassword}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {changingPassword ? "جاري التغيير..." : "تغيير كلمة المرور"}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Delete Account Card */}
                    <Card className="md:col-span-2 border-red-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <Trash2 size={20} />
                          حذف الحساب
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">
                          تحذير: حذف الحساب سيؤدي إلى فقدان جميع بياناتك بشكل دائم ولا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <Button
                          onClick={() => setShowDeleteDialog(true)}
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          حذف الحساب نهائياً
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف حسابك؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك بشكل دائم.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              نعم، احذف حسابي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserDashboard;
