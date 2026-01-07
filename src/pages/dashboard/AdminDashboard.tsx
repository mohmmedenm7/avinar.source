import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

// Components
import { OrdersComponent } from "@/components/admin/OrdersComponent";
import { ProductsComponent } from "@/components/admin/ProductsComponent";
import { UsersComponent } from "@/components/admin/UsersComponent";
import { CouponsComponent } from "@/components/admin/CouponsComponent";
import { CategoriesComponent } from "@/components/admin/CategoriesComponent";
import { SubCategoriesComponent } from "@/components/admin/SubCategoriesComponent";
import PlatformStats from "@/components/admin/PlatformStats";
import { InstructorRequestsComponent } from "@/components/admin/InstructorRequestsComponent";
import AllStudentsTable from "@/components/admin/AllStudentsTable";
import AllCoursesTable from "@/components/admin/AllCoursesTable";
import WithdrawalsManager from "@/components/admin/WithdrawalsManager";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { AdminChatPanel } from "@/components/chat";
import ChatDashboardWidget from "@/components/chat/ChatDashboardWidget";
import UserCard from "@/components/dashboard/UserCard";
import UserProfileDetail from "@/components/dashboard/UserProfileDetail";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import { GamificationManager } from "@/components/admin/GamificationManager";
import { TrainingCentersComponent } from "@/components/admin/TrainingCentersComponent";
import LiveStreamManager from "@/components/admin/LiveStreamManager";
import { AddProductModal } from "@/components/admin/AddProductModal";
import HeroBannerManager from "@/components/admin/HeroBannerManager";
import CourseManagementAI from "@/components/instructor/CourseManagementAI";

// Icons
import {
    LogOut,
    Users,
    Box,
    ShoppingCart,
    DollarSign,
    ShoppingBag,
    Folder,
    FolderTree,
    Ticket,
    Heart,
    BarChart,
    Database,
    GraduationCap,
    Search,
    Bell,
    PlusCircle,
    MessageCircle,
    Settings,
    Headphones,
    ExternalLink,
    Trophy,
    Building,
    Video,
    Image,
    Sparkles
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config/env";
import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ------------------- Interfaces -------------------
interface User {
    _id: string;
    name: string;
    email: string;
    role?: string;
}

interface Product {
    _id: string;
    title: string;
    price: number;
    imageCover?: string;
}

interface OrderItem {
    product: {
        title: string;
        price: number;
    };
    quantity: number;
}

interface Order {
    _id: string;
    totalOrderPrice: number;
    cartItems: OrderItem[];
    user: {
        name: string;
        email: string;
    };
    isPaid?: boolean;
    paymentReceipt?: string;
    coupon?: {
        _id: string;
        name: string;
        discount: number;
    } | string;
}

interface StatCard {
    label: string;
    value: number | string;
    icon: "user" | "box" | "shopping-cart" | "dollar-sign" | "shopping-bag";
    color: string;
    trend?: string;
}

// =====================================================
//                     Dashboard
// =====================================================

const AdminDashboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const { t, i18n } = useTranslation();
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);

    const [errorUsers, setErrorUsers] = useState<string | null>(null);
    const [errorProducts, setErrorProducts] = useState<string | null>(null);
    const [errorOrders, setErrorOrders] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState("analytics"); // Default to stats for dashboard look

    const token = localStorage.getItem("token");
    const { toast } = useToast();
    const navigate = useNavigate();

    // New state for admin dashboard
    const [dashboardStats, setDashboardStats] = useState<any>(null);
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [allCourses, setAllCourses] = useState<any[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [chatRecipient, setChatRecipient] = useState<string | undefined>(undefined);
    const [userFilter, setUserFilter] = useState<'all' | 'student' | 'instructor'>('all');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showAddProductModal, setShowAddProductModal] = useState(false);

    // Filter states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (activeTab !== 'chat') {
            setChatRecipient(undefined);
        }
    }, [activeTab]);

    // =============== Fetch Users ===============
    const fetchUsers = async () => {
        setLoadingUsers(true);
        setErrorUsers(null);

        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUsers(res.data?.data || []);
        } catch (err: any) {
            const msg = err.response?.data?.message || "فشل تحميل المستخدمين";
            setErrorUsers(msg);
            toast({ title: msg, variant: "destructive" });
        } finally {
            setLoadingUsers(false);
        }
    };

    // =============== Fetch Products ===============
    const fetchProducts = async () => {
        setLoadingProducts(true);
        setErrorProducts(null);

        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/products`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setProducts(res.data?.data || []);
        } catch (err: any) {
            const msg = err.response?.data?.message || "فشل تحميل المنتجات";
            setErrorProducts(msg);
            toast({ title: msg, variant: "destructive" });
        } finally {
            setLoadingProducts(false);
        }
    };

    // =============== Fetch Orders ===============
    const fetchOrders = async () => {
        setLoadingOrders(true);
        setErrorOrders(null);

        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setOrders(res.data?.data || []);
        } catch (err: any) {
            const msg = err.response?.data?.message || "فشل تحميل الطلبات";
            setErrorOrders(msg);
            toast({ title: msg, variant: "destructive" });
        } finally {
            setLoadingOrders(false);
        }
    };

    // =============== Fetch Admin Dashboard Stats ===============
    const fetchDashboardStats = async () => {
        if (!token) return;
        setLoadingStats(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/admin/dashboard`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDashboardStats(res.data?.data || res.data);
        } catch (error: any) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            setLoadingStats(false);
        }
    };

    // =============== Fetch All Students ===============
    const fetchAllStudents = async (page: number = 1) => {
        if (!token) return;
        setLoadingStudents(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/admin/students?page=${page}&limit=50`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllStudents(res.data?.data || res.data || []);
            setTotalPages(res.data?.totalPages || 1);
        } catch (error: any) {
            console.error("Error fetching students:", error);
            setAllStudents([]);
        } finally {
            setLoadingStudents(false);
        }
    };

    // =============== Fetch All Courses ===============
    const fetchAllCourses = async () => {
        if (!token) return;
        setLoadingCourses(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/admin/courses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAllCourses(res.data?.data || res.data || []);
        } catch (error: any) {
            console.error("Error fetching courses:", error);
            setAllCourses([]);
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchCurrentUser = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/users/getMe`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentUser(res.data?.data || res.data);
        } catch (e) { console.error(e) }
    };

    // =============== Delete User ===============
    const handleDeleteUser = async (userId: string) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/v1/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: "User deleted successfully", className: "bg-green-500 text-white" });
            fetchUsers();
            fetchAllStudents(currentPage);
            setSelectedUser(null);
        } catch (error: any) {
            toast({ title: error.response?.data?.message || "Error deleting user", variant: "destructive" });
        }
    };

    // =============== Handle Card Click ===============
    const handleCardClick = async (user: any) => {
        setSelectedUser(user);
        try {
            // If instructor/manager, fetch public profile which has courses
            if (user.role === 'manager' || user.role === 'instructor' || user.role === 'Instructor') {
                console.log("Fetching instructor data for:", user._id);
                const res = await axios.get(`${API_BASE_URL}/api/v1/users/instructor/${user._id}`);
                console.log("Instructor API response:", res.data);
                if (res.data?.data) {
                    const { instructor, courses, stats } = res.data.data;
                    setSelectedUser((prev: any) => {
                        const newState = {
                            ...prev,
                            ...instructor,
                            role: 'Instructor', // Ensure role stays consistent
                            myCourses: courses,
                            studentsCount: stats?.totalStudents,
                            coursesCount: stats?.totalCourses
                        };
                        console.log("New Selected User State:", newState);
                        return newState;
                    });
                }
            } else {
                // Regular user
                const res = await axios.get(`${API_BASE_URL}/api/v1/users/${user._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Fetch orders to get student's courses with enhanced safety and logging
                let userCourses: any[] = [];
                try {
                    console.log(`Fetching orders for user: ${user._id}`);
                    const ordersRes = await axios.get(`${API_BASE_URL}/api/v1/orders?user=${user._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (ordersRes.data?.data) {
                        let orders = ordersRes.data.data;
                        console.log(`Initial orders found: ${orders.length}`);

                        // Client-side safety filter: Ensure orders belong to this user
                        // This handles cases where backend filter might be ignored (e.g. server not restarted)
                        orders = orders.filter((o: any) => {
                            const oUserId = o.user?._id || o.user;
                            return oUserId?.toString() === user._id?.toString();
                        });
                        console.log(`Orders after filtering for ${user._id}: ${orders.length}`);

                        userCourses = orders.flatMap((order: any) =>
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

                        // Deduplicate courses
                        userCourses = Array.from(new Map(userCourses.map(c => [c._id, c])).values());
                        console.log("Extracted courses for student (Reduce method):", userCourses);
                    }
                } catch (err) {
                    console.error("Failed to fetch user orders", err);
                }

                if (res.data?.data) {
                    setSelectedUser((prev: any) => {
                        const finalUserData = {
                            ...prev,
                            ...res.data.data,
                            courses: userCourses,
                            coursesCount: userCourses.length
                        };
                        console.log("Setting selected user data (Student):", finalUserData);
                        return finalUserData;
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching details", error);
        }
    };

    // =============== On Load ===============
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        fetchUsers();
        fetchProducts();
        fetchOrders();
        fetchDashboardStats();
        fetchAllStudents();
        fetchAllCourses();
        fetchCurrentUser();
    }, [token]);

    // =============== Logout ===============
    const handleLogout = () => {
        localStorage.removeItem("token");
        toast({ title: "تم تسجيل الخروج بنجاح" });
        navigate("/login");
    };

    // =============== Stats ===============
    const totalUsers = users.length;
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
        (sum, order) => sum + (order.totalOrderPrice || 0),
        0
    );

    const iconMap = {
        user: <Users size={20} className="text-purple-600" />,
        box: <Box size={20} className="text-orange-600" />,
        "shopping-cart": <ShoppingCart size={20} className="text-blue-600" />,
        "dollar-sign": <DollarSign size={20} className="text-green-600" />,
        "shopping-bag": <ShoppingBag size={20} className="text-indigo-600" />,
    };

    const statsCards = [
        { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: "dollar-sign", color: "bg-green-50", trend: "+12%" },
        { label: "Platform Wallet", value: `$${dashboardStats?.finances?.platformTotal?.toFixed(2) || 0}`, icon: "shopping-cart", color: "bg-blue-50", trend: "70/30 Split" },
        { label: "Orders", value: totalOrders, icon: "shopping-bag", color: "bg-purple-50", trend: "+8%" },
        { label: "Users", value: totalUsers, icon: "user", color: "bg-yellow-50", trend: "+2%" }
    ];

    const menuItems = [
        { id: "withdrawals", label: t('dashboard.wallet') || 'المحفظة المالية', icon: <DollarSign size={20} /> },
        { id: "chat", label: t('dashboard.chat') || 'الرسائل والدعم', icon: <MessageCircle size={20} /> },
        { id: "chat-admin", label: t('dashboard.chatAdmin') || 'إدارة الدردشة', icon: <Settings size={20} /> },
        { id: "settings", label: t('dashboard.profile') || 'الإعدادات', icon: <Settings size={20} /> },
        { id: "helpdesk", label: t('dashboard.helpdesk') || 'مركز الدعم الفني', icon: <Headphones size={20} />, isLink: true, href: '/admin/support' },
        { id: "analytics", label: t('dashboard.analytics'), icon: <BarChart size={20} /> },
        { id: "requests", label: t('dashboard.instructorRequests'), icon: <GraduationCap size={20} /> },
        { id: "orders", label: t('dashboard.orders'), icon: <ShoppingBag size={20} /> },
        { id: "products", label: t('dashboard.products'), icon: <Box size={20} /> },
        { id: "users", label: t('dashboard.users'), icon: <Users size={20} /> },
        { id: "categories", label: t('dashboard.categories'), icon: <Folder size={20} /> },
        { id: "subcategories", label: t('dashboard.subCategories'), icon: <FolderTree size={20} /> },
        { id: "training-centers", label: "Training Centers", icon: <Building size={20} /> },
        { id: "coupons", label: t('dashboard.coupons'), icon: <Ticket size={20} /> },
        { id: "gamification", label: t('dashboard.gamification') || "نظام الألعاب", icon: <Trophy size={20} /> },
        { id: "notifications", label: t('dashboard.notifications') || "إدارة الإشعارات", icon: <Bell size={20} /> },
        { id: "allStudents", label: t('dashboard.allStudents'), icon: <Users size={20} /> },
        { id: "allCourses", label: t('dashboard.allCourses'), icon: <Database size={20} /> },
        { id: "livestreams", label: 'إدارة البث المباشر', icon: <Video size={20} /> },
        { id: "hero-banners", label: 'إعلانات الصفحة الرئيسية', icon: <Image size={20} /> },
        { id: "course-management-ai", label: 'مساعد الكورسات AI', icon: <Sparkles size={20} /> },
    ];

    const currentDir = i18n.language.startsWith("ar") ? "rtl" : "ltr";

    return (
        <div className="flex h-screen bg-[#F4F2EE] font-sans overflow-hidden pt-24" dir={currentDir}>
            {/* Sidebar */}
            <aside className="w-[280px] bg-[#1a1c1e] text-gray-400 flex flex-col m-4 rounded-[30px] shadow-2xl overflow-hidden relative">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-8 text-white">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-lg">P</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-brand">{t('app.title')}</h1>
                    </div>

                    <button
                        onClick={() => setShowAddProductModal(true)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-3 px-6 flex items-center justify-center gap-2 font-medium transition-transform active:scale-95 shadow-lg shadow-orange-500/30 mb-8"
                    >
                        <PlusCircle size={20} />
                        <span>{t('dashboard.createProject')}</span>
                    </button>

                    <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
                        {menuItems.map((item: any) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.isLink && item.href) {
                                        navigate(item.href);
                                    } else {
                                        setActiveTab(item.id);
                                    }
                                }}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 ${activeTab === item.id
                                    ? "bg-white text-black shadow-lg font-semibold transform ltr:translate-x-1 rtl:-translate-x-1"
                                    : "hover:bg-white/5 hover:text-gray-200"
                                    }`}
                            >
                                <span className={activeTab === item.id ? "text-orange-500" : ""}>{item.icon}</span>
                                <span className="flex-1">{item.label}</span>
                                {item.isLink && (
                                    <ExternalLink size={14} className="text-gray-500" />
                                )}
                                {item.id === 'chat-admin' && (
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                )}
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
                        <span>{t('nav.logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden p-4 pr-0">
                {/* Header */}
                <header className="flex items-center justify-between px-8 py-4 mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.dashboard')}</h2>
                        <p className="text-gray-500 text-sm">{t('dashboard.welcomeAdmin')}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative w-96 hidden md:block">
                            <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${currentDir === 'rtl' ? 'left-4' : 'right-4'}`} size={20} />
                            <Input
                                placeholder={t('dashboard.searchAnything')}
                                className={`w-full bg-white border-none rounded-full py-6 shadow-sm focus-visible:ring-1 focus-visible:ring-orange-500 ${currentDir === 'rtl' ? 'pl-12 pr-6' : 'pr-12 pl-6'}`}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Quick Chat Button */}


                            {/* Quick Helpdesk Button */}
                            <button
                                onClick={() => navigate('/admin/support')}
                                className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                title={t('dashboard.helpdesk') || 'مركز الدعم'}
                            >
                                <Headphones size={20} className="text-white" />
                            </button>

                            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors relative">
                                <Bell size={20} className="text-gray-600" />

                            </button>

                            <div className={`flex items-center gap-3 ${currentDir === 'rtl' ? 'pr-4 border-r' : 'pl-4 border-l'} border-gray-200`}>
                                <Avatar className="w-12 h-12 border-2 border-white shadow-sm cursor-pointer">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>AD</AvatarFallback>
                                </Avatar>
                                <div className="hidden lg:block text-right">
                                    <p className="text-sm font-bold text-gray-900">Alex Meian</p>
                                    <p className="text-xs text-gray-500">Product Manager</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">

                    {/* Stats Row */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-800">{t('dashboard.overview')}</h3>
                                <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50">
                                    {t('dashboard.last30Days')}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card
                                    className="p-6 border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-[24px] flex flex-col justify-between h-[160px]"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-purple-50 mb-4`}>
                                        {iconMap["dollar-sign"]}
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">{t('dashboard.totalRevenue')}</p>
                                        <h3 className="text-2xl font-bold text-gray-900">${dashboardStats?.finances?.platformTotal?.toFixed(2) || totalRevenue.toFixed(2)}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-xs font-bold text-green-500`}>
                                            Admin: ${dashboardStats?.finances?.adminBalance?.toFixed(2) || 0}
                                        </span>
                                        <span className="text-xs text-gray-400">Designer: ${dashboardStats?.finances?.designerBalance?.toFixed(2) || 0}</span>
                                    </div>
                                </Card>

                                <Card
                                    className="p-6 border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-[24px] flex flex-col justify-between h-[160px]"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-orange-50 mb-4`}>
                                        {iconMap["box"]}
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">{t('dashboard.projects')}</p>
                                        <h3 className="text-2xl font-bold text-gray-900">{totalProducts}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-xs font-bold text-red-500`}>
                                            -10%
                                        </span>
                                        <span className="text-xs text-gray-400">{t('dashboard.increaseFromLastMonth')}</span>
                                    </div>
                                </Card>

                                <Card
                                    className="p-6 border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-[24px] flex flex-col justify-between h-[160px]"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 mb-4`}>
                                        {iconMap["shopping-cart"]}
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">{t('dashboard.orders')}</p>
                                        <h3 className="text-2xl font-bold text-gray-900">{totalOrders}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-xs font-bold text-green-500`}>
                                            +8%
                                        </span>
                                        <span className="text-xs text-gray-400">{t('dashboard.increaseFromLastMonth')}</span>
                                    </div>
                                </Card>

                                <Card
                                    className="p-6 border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-[24px] flex flex-col justify-between h-[160px]"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-yellow-50 mb-4`}>
                                        {iconMap["user"]}
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">{t('dashboard.resources')}</p>
                                        <h3 className="text-2xl font-bold text-gray-900">{totalUsers}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-xs font-bold text-green-500`}>
                                            +2%
                                        </span>
                                        <span className="text-xs text-gray-400">{t('dashboard.increaseFromLastMonth')}</span>
                                    </div>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <Card className="lg:col-span-2 p-8 border-none shadow-sm rounded-[30px]">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-lg font-bold text-gray-900">{t('dashboard.platformStats')}</h3>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">All</span>
                                        </div>
                                    </div>
                                    <PlatformStats stats={dashboardStats} loading={loadingStats} />
                                </Card>

                                <Card className="p-8 border-none shadow-sm rounded-[30px] bg-[#fdfdfd]">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-lg font-bold text-gray-900">{t('dashboard.overallProgress')}</h3>
                                    </div>
                                    <div className="flex items-center justify-center h-[250px]">
                                        <div className="relative w-48 h-48 rounded-full border-[12px] border-orange-100 flex items-center justify-center">
                                            <div className="absolute inset-0 border-[12px] border-orange-500 rounded-full border-l-transparent border-b-transparent rotate-45"></div>
                                            <div className="text-center">
                                                <span className="text-3xl font-bold text-gray-900">72%</span>
                                                <p className="text-xs text-gray-400">{t('dashboard.completed')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Other Tabs Content */}
                    <div className="mt-6">
                        {/* Instructor Requests */}
                        {activeTab === "requests" && <InstructorRequestsComponent token={token || ""} />}
                        {activeTab === "orders" && <OrdersComponent orders={orders} token={token || ""} fetchOrders={fetchOrders} searchQuery="" />}
                        {activeTab === "products" && <ProductsComponent products={products} token={token || ""} fetchProducts={fetchProducts} searchQuery="" />}
                        {activeTab === "training-centers" && <TrainingCentersComponent token={token || ""} />}
                        {activeTab === "users" && (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                            <Users className="h-6 w-6 text-blue-600" />
                                            {t('dashboard.usersDirectory') || 'Users Directory'}
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">Manage students, instructors, and admins from one place.</p>
                                    </div>

                                    {/* Sub-tabs / Filter */}
                                    <div className="flex p-1 bg-gray-100 rounded-xl self-start md:self-auto">
                                        <button
                                            onClick={() => setUserFilter('student')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${userFilter === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            Students
                                        </button>
                                        <button
                                            onClick={() => setUserFilter('instructor')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${userFilter === 'instructor' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            Instructors
                                        </button>
                                        <button
                                            onClick={() => setUserFilter('all')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${userFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            All Users
                                        </button>
                                    </div>
                                </div>

                                {selectedUser ? (
                                    <UserProfileDetail
                                        user={selectedUser}
                                        currentUserRole="admin"
                                        onBack={() => setSelectedUser(null)}
                                        onChat={() => {
                                            setChatRecipient(selectedUser._id);
                                            setActiveTab('chat');
                                        }}
                                        onDelete={handleDeleteUser}
                                    />
                                ) : (
                                    <>
                                        {/* Content based on filter */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {/* Students Logic */}
                                            {(userFilter === 'student' || userFilter === 'all') && allStudents.map((student: any) => (
                                                <UserCard
                                                    key={`student-${student._id}`}
                                                    user={{ ...student, role: 'Student' }}
                                                    onClick={handleCardClick}
                                                />
                                            ))}

                                            {/* Instructors/Admins Logic */}
                                            {(userFilter === 'instructor' || userFilter === 'all') && users
                                                .filter((u: any) => userFilter === 'instructor' ? (u.role === 'manager' || u.role === 'instructor') : true)
                                                // Avoid duplicates if 'all' is selected and students are also in 'users' array
                                                .filter((u: any) => userFilter === 'all' ? u.role !== 'student' : true)
                                                .map((user: any) => (
                                                    <UserCard
                                                        key={`user-${user._id}`}
                                                        user={{ ...user, role: user.role === 'manager' ? 'Instructor' : (user.role || 'User') }}
                                                        onClick={handleCardClick}
                                                    />
                                                ))}
                                        </div>

                                        {/* Empty State */}
                                        {((userFilter === 'student' && allStudents.length === 0) ||
                                            (userFilter === 'instructor' && users.filter((u: any) => u.role === 'instructor' || u.role === 'manager').length === 0)) && (
                                                <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200 col-span-full">
                                                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                                                    <p className="text-gray-500 font-medium">No users found for this category.</p>
                                                </div>
                                            )}

                                        {/* Pagination for Students (only show when students are primary view) */}
                                        {userFilter === 'student' && (
                                            <div className="mt-6 flex justify-center">
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => {
                                                            const newPage = Math.max(1, currentPage - 1);
                                                            setCurrentPage(newPage);
                                                            fetchAllStudents(newPage);
                                                        }}
                                                        disabled={currentPage === 1}
                                                        variant="outline"
                                                    >
                                                        Previous
                                                    </Button>
                                                    <span className="flex items-center px-4 font-medium">
                                                        Page {currentPage} of {totalPages}
                                                    </span>
                                                    <Button
                                                        onClick={() => {
                                                            const newPage = Math.min(totalPages, currentPage + 1);
                                                            setCurrentPage(newPage);
                                                            fetchAllStudents(newPage);
                                                        }}
                                                        disabled={currentPage === totalPages}
                                                        variant="outline"
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        {activeTab === "categories" && <CategoriesComponent token={token || ""} searchQuery="" />}
                        {activeTab === "subcategories" && <SubCategoriesComponent token={token || ""} searchQuery="" />}
                        {activeTab === "coupons" && <CouponsComponent token={token || ""} searchQuery="" />}
                        {activeTab === "gamification" && <GamificationManager token={token || ""} />}
                        {activeTab === "notifications" && <NotificationManager token={token || ""} />}
                        {activeTab === "allCourses" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">{t('dashboard.allCourses')}</h2>
                                    <span className="text-sm text-gray-500">{allCourses.length} {t('dashboard.courses')}</span>
                                </div>
                                <AllCoursesTable courses={allCourses} loading={loadingCourses} />
                            </div>
                        )}
                        {activeTab === "withdrawals" && (
                            <WithdrawalsManager token={token || ""} />
                        )}
                        {activeTab === "chat" && (
                            <div className="h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-2xl">
                                <ChatDashboardWidget variant="full" targetUserId={chatRecipient} />
                            </div>
                        )}

                        {activeTab === "settings" && currentUser && (
                            <ProfileSettings
                                user={currentUser}
                                token={token || ''}
                                onUpdate={(updated) => {
                                    setCurrentUser(updated);
                                    toast({ title: "Profile Updated" });
                                }}
                            />
                        )}

                        {activeTab === "chat-admin" && <AdminChatPanel />}
                        {activeTab === "hero-banners" && <HeroBannerManager token={token || ""} />}
                        {activeTab === "course-management-ai" && (
                            <div className="h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-2xl bg-white">
                                <CourseManagementAI
                                    courses={allCourses}
                                    students={allStudents}
                                    token={token}
                                    onAction={(action, data) => {
                                        if (action === 'refresh') {
                                            fetchAllCourses();
                                            fetchAllStudents();
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showAddProductModal && (
                <AddProductModal
                    show={showAddProductModal}
                    onClose={() => setShowAddProductModal(false)}
                    token={token || ''}
                    fetchProducts={fetchProducts}
                />
            )}
        </div>
    );
};

// ---------------- Small Components ----------------

const Loading = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600 text-sm">{text}</p>
    </div>
);

const ErrorBox = ({ message }: { message: string }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700 text-sm font-medium">{message}</p>
    </div>
);

export default AdminDashboard;
