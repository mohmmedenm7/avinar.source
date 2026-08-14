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
import CourseManagementAI from "@/components/instructor/course-management/CourseManagementAI";
import { NotificationManager } from "@/components/admin/NotificationManager";

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
    Sparkles,
    ChevronDown,
    ChevronRight,
    Menu,
    TrendingUp,
    TrendingDown,
    ArrowRight
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

    // Amazon-style sidebar states
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        dashboard: true,
        finance: true,
        catalog: true,
        operations: true,
        people: true,
        communication: false,
        tools: false,
    });

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

    // =============== Sidebar Groups (Amazon-style) ===============
    const sidebarGroups = [
        {
            id: 'dashboard',
            title: t('dashboard.dashboard') || 'Dashboard',
            items: [
                { id: "analytics", label: t('dashboard.analytics'), icon: <BarChart size={18} /> },
            ]
        },
        {
            id: 'finance',
            title: t('dashboard.finance') || 'Finance',
            items: [
                { id: "withdrawals", label: t('dashboard.wallet') || 'المحفظة المالية', icon: <DollarSign size={18} /> },
            ]
        },
        {
            id: 'catalog',
            title: t('dashboard.catalog') || 'Catalog',
            items: [
                { id: "products", label: t('dashboard.products'), icon: <Box size={18} /> },
                { id: "categories", label: t('dashboard.categories'), icon: <Folder size={18} /> },
                { id: "subcategories", label: t('dashboard.subCategories'), icon: <FolderTree size={18} /> },
                { id: "coupons", label: t('dashboard.coupons'), icon: <Ticket size={18} /> },
            ]
        },
        {
            id: 'operations',
            title: t('dashboard.operations') || 'Operations',
            items: [
                { id: "orders", label: t('dashboard.orders'), icon: <ShoppingBag size={18} /> },
                { id: "training-centers", label: "Training Centers", icon: <Building size={18} /> },
                { id: "livestreams", label: 'إدارة البث المباشر', icon: <Video size={18} /> },
                { id: "hero-banners", label: 'إعلانات الصفحة الرئيسية', icon: <Image size={18} /> },
            ]
        },
        {
            id: 'people',
            title: t('dashboard.people') || 'People',
            items: [
                { id: "users", label: t('dashboard.users'), icon: <Users size={18} /> },
                { id: "allStudents", label: t('dashboard.allStudents'), icon: <Users size={18} /> },
                { id: "allCourses", label: t('dashboard.allCourses'), icon: <Database size={18} /> },
                { id: "requests", label: t('dashboard.instructorRequests'), icon: <GraduationCap size={18} /> },
            ]
        },
        {
            id: 'communication',
            title: t('dashboard.communication') || 'Communication',
            items: [
                { id: "chat", label: t('dashboard.chat') || 'الرسائل والدعم', icon: <MessageCircle size={18} /> },
                { id: "chat-admin", label: t('dashboard.chatAdmin') || 'إدارة الدردشة', icon: <Settings size={18} /> },
                { id: "notifications", label: t('dashboard.notifications') || 'إدارة الإشعارات', icon: <Bell size={18} /> },
                { id: "helpdesk", label: t('dashboard.helpdesk') || 'مركز الدعم الفني', icon: <Headphones size={18} />, isLink: true, href: '/admin/support' },
            ]
        },
        {
            id: 'tools',
            title: t('dashboard.tools') || 'Tools',
            items: [
                { id: "gamification", label: t('dashboard.gamification') || "نظام الألعاب", icon: <Trophy size={18} /> },
                { id: "course-management-ai", label: 'مساعد الكورسات AI', icon: <Sparkles size={18} /> },
                { id: "settings", label: t('dashboard.profile') || 'الإعدادات', icon: <Settings size={18} /> },
            ]
        },
    ];

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
    };

    const getCurrentTabLabel = () => {
        for (const group of sidebarGroups) {
            const item = group.items.find((i: any) => i.id === activeTab);
            if (item) return item.label;
        }
        return activeTab;
    };

    const currentDir = i18n.language.startsWith("ar") ? "rtl" : "ltr";
    const isRtl = currentDir === 'rtl';

    return (
        <div className="flex h-screen bg-[#EAEDED] font-sans overflow-hidden pt-24" dir={currentDir}>

            {/* =================== SIDEBAR (Amazon Style) =================== */}
            <aside
                className={`${sidebarCollapsed ? 'w-[64px]' : 'w-[250px]'} bg-white ${isRtl ? 'border-l' : 'border-r'} border-gray-200 flex flex-col h-full transition-all duration-300 shrink-0 z-10`}
                style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.04)' }}
            >
                {/* Brand */}
                <div className={`p-4 border-b border-gray-200 shrink-0 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                        <div className="w-9 h-9 bg-gradient-to-br from-[#FF9900] to-[#FF6600] rounded-lg flex items-center justify-center shadow-sm shrink-0">
                            <span className="text-white font-bold text-base">A</span>
                        </div>
                        {!sidebarCollapsed && (
                            <div className="min-w-0">
                                <h1 className="text-sm font-bold text-[#0F1111] truncate">{t('app.title')}</h1>
                                <p className="text-[10px] text-gray-400 font-medium">Seller Central</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Groups */}
                <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                    {sidebarGroups.map((group) => (
                        <div key={group.id} className="mb-0.5">
                            {/* Group Header */}
                            {!sidebarCollapsed && (
                                <button
                                    onClick={() => toggleGroup(group.id)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                                >
                                    <span>{group.title}</span>
                                    {expandedGroups[group.id]
                                        ? <ChevronDown size={13} className="text-gray-300" />
                                        : (isRtl ? <ChevronRight size={13} className="text-gray-300 rotate-180" /> : <ChevronRight size={13} className="text-gray-300" />)
                                    }
                                </button>
                            )}

                            {/* Group Items */}
                            {(sidebarCollapsed || expandedGroups[group.id]) && (
                                <div className={`${!sidebarCollapsed ? 'pb-2' : ''}`}>
                                    {group.items.map((item: any) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                if (item.isLink && item.href) {
                                                    navigate(item.href);
                                                } else {
                                                    setActiveTab(item.id);
                                                }
                                            }}
                                            className={`w-full flex items-center gap-3 text-[13px] transition-all duration-150 ${
                                                sidebarCollapsed
                                                    ? 'justify-center px-2 py-3'
                                                    : `${isRtl ? 'pr-5 pl-4' : 'pl-5 pr-4'} py-2.5`
                                            } ${
                                                activeTab === item.id
                                                    ? `bg-[#FFF4E6] text-[#C45500] font-semibold ${isRtl ? 'border-r-[3px] border-[#FF9900]' : 'border-l-[3px] border-[#FF9900]'}`
                                                    : `text-gray-600 hover:bg-[#F7F7F7] hover:text-[#0F1111] ${isRtl ? 'border-r-[3px] border-transparent' : 'border-l-[3px] border-transparent'}`
                                            }`}
                                            title={sidebarCollapsed ? item.label : undefined}
                                        >
                                            <span className={`shrink-0 ${activeTab === item.id ? 'text-[#FF9900]' : 'text-gray-400'}`}>
                                                {item.icon}
                                            </span>
                                            {!sidebarCollapsed && (
                                                <>
                                                    <span className="truncate flex-1 text-start">{item.label}</span>
                                                    {item.isLink && (
                                                        <ExternalLink size={12} className="text-gray-300 shrink-0" />
                                                    )}
                                                    {item.id === 'chat-admin' && (
                                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Divider between groups */}
                            {!sidebarCollapsed && <div className="mx-4 border-b border-gray-100" />}
                        </div>
                    ))}
                </nav>

                {/* Logout */}
                <div className="border-t border-gray-200 p-3 shrink-0">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 ${
                            sidebarCollapsed ? 'justify-center' : ''
                        }`}
                    >
                        <LogOut size={18} />
                        {!sidebarCollapsed && <span className="font-medium">{t('nav.logout')}</span>}
                    </button>
                </div>
            </aside>

            {/* =================== MAIN CONTENT AREA =================== */}
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">

                {/* -------- Top Header Bar (Amazon Dark Navy) -------- */}
                <header className="bg-[#232F3E] shrink-0 px-5 flex items-center justify-between h-[52px]">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Sidebar Toggle */}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10"
                        >
                            <Menu size={20} />
                        </button>

                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 min-w-0">
                            <h2 className="text-white font-semibold text-sm whitespace-nowrap">{t('dashboard.dashboard')}</h2>
                            <ArrowRight size={14} className={`text-gray-500 shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
                            <span className="text-[#FF9900] text-sm font-medium truncate">{getCurrentTabLabel()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative w-72 hidden lg:block">
                            <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRtl ? 'left-3' : 'right-3'}`} size={16} />
                            <Input
                                placeholder={t('dashboard.searchAnything')}
                                className={`w-full bg-[#37475A] border-[#485769] text-white placeholder:text-gray-400 rounded-md h-9 text-sm focus-visible:ring-1 focus-visible:ring-[#FF9900] focus-visible:border-[#FF9900] ${isRtl ? 'pl-9 pr-3' : 'pr-9 pl-3'}`}
                            />
                        </div>

                        {/* Helpdesk */}
                        <button
                            onClick={() => navigate('/admin/support')}
                            className="text-gray-400 hover:text-[#FF9900] transition-colors p-1.5 rounded-md hover:bg-white/10"
                            title={t('dashboard.helpdesk') || 'مركز الدعم'}
                        >
                            <Headphones size={19} />
                        </button>

                        {/* Notifications */}
                        <button className="relative text-gray-400 hover:text-[#FF9900] transition-colors p-1.5 rounded-md hover:bg-white/10">
                            <Bell size={19} />
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF9900] rounded-full text-[9px] flex items-center justify-center text-white font-bold border border-[#232F3E]">
                                3
                            </span>
                        </button>

                        {/* Divider + Avatar */}
                        <div className={`flex items-center gap-2.5 ${isRtl ? 'pr-3 border-r' : 'pl-3 border-l'} border-gray-600`}>
                            <Avatar className="w-8 h-8 border-2 border-[#37475A]">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback className="bg-[#37475A] text-white text-xs">AD</AvatarFallback>
                            </Avatar>
                            <div className="hidden xl:block">
                                <p className="text-xs font-medium text-gray-200 leading-tight">Admin</p>
                                <p className="text-[10px] text-gray-500 leading-tight">Manager</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* -------- Secondary Metrics Bar -------- */}
                <div className="bg-[#37475A] shrink-0 px-5 flex items-center justify-between h-[38px] border-t border-[#485769]">
                    <div className="flex items-center gap-1 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${activeTab === 'analytics' ? 'bg-[#FF9900] text-[#232F3E]' : 'text-gray-300 hover:text-[#FF9900]'}`}
                        >
                            <DollarSign size={13} />
                            <span>${totalRevenue.toFixed(0)}</span>
                        </button>
                        <span className="w-px h-4 bg-gray-500 shrink-0 mx-1" />
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${activeTab === 'orders' ? 'bg-[#FF9900] text-[#232F3E]' : 'text-gray-300 hover:text-[#FF9900]'}`}
                        >
                            <ShoppingBag size={13} />
                            <span>{totalOrders} {t('dashboard.orders')}</span>
                        </button>
                        <span className="w-px h-4 bg-gray-500 shrink-0 mx-1" />
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${activeTab === 'users' ? 'bg-[#FF9900] text-[#232F3E]' : 'text-gray-300 hover:text-[#FF9900]'}`}
                        >
                            <Users size={13} />
                            <span>{totalUsers} {t('dashboard.users')}</span>
                        </button>
                        <span className="w-px h-4 bg-gray-500 shrink-0 mx-1" />
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${activeTab === 'products' ? 'bg-[#FF9900] text-[#232F3E]' : 'text-gray-300 hover:text-[#FF9900]'}`}
                        >
                            <Box size={13} />
                            <span>{totalProducts} {t('dashboard.projects')}</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setShowAddProductModal(true)}
                        className="flex items-center gap-1.5 bg-[#FF9900] hover:bg-[#E88B00] text-[#232F3E] rounded px-3 py-1.5 text-xs font-bold transition-colors shrink-0 shadow-sm"
                    >
                        <PlusCircle size={14} />
                        <span className="hidden sm:inline">{t('dashboard.createProject')}</span>
                    </button>
                </div>

                {/* -------- Scrollable Content Area -------- */}
                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                    {/* =================== ANALYTICS TAB =================== */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            {/* Section Title */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-[#0F1111]">{t('dashboard.overview')}</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{t('dashboard.welcomeAdmin')}</p>
                                </div>
                                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
                                    {t('dashboard.last30Days')}
                                </button>
                            </div>

                            {/* KPI Cards - Amazon Style */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Revenue */}
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group cursor-pointer" onClick={() => setActiveTab('withdrawals')}>
                                    <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-gray-500">{t('dashboard.totalRevenue')}</span>
                                            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                                <DollarSign size={18} className="text-emerald-600" />
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-[#0F1111]">
                                            ${dashboardStats?.finances?.platformTotal?.toFixed(2) || totalRevenue.toFixed(2)}
                                        </p>
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-1">
                                                <TrendingUp size={13} className="text-emerald-600" />
                                                <span className="text-[11px] font-bold text-emerald-600">Admin: ${dashboardStats?.finances?.adminBalance?.toFixed(2) || 0}</span>
                                            </div>
                                            <span className="text-[11px] text-gray-400">| Designer: ${dashboardStats?.finances?.designerBalance?.toFixed(2) || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Products */}
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group cursor-pointer" onClick={() => setActiveTab('products')}>
                                    <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-gray-500">{t('dashboard.projects')}</span>
                                            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                                <Box size={18} className="text-orange-600" />
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-[#0F1111]">{totalProducts}</p>
                                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
                                            <TrendingDown size={13} className="text-[#CC0C39]" />
                                            <span className="text-[11px] font-bold text-[#CC0C39]">-10%</span>
                                            <span className="text-[11px] text-gray-400">{t('dashboard.increaseFromLastMonth')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Orders */}
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group cursor-pointer" onClick={() => setActiveTab('orders')}>
                                    <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-gray-500">{t('dashboard.orders')}</span>
                                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                                <ShoppingCart size={18} className="text-blue-600" />
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-[#0F1111]">{totalOrders}</p>
                                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
                                            <TrendingUp size={13} className="text-[#067D62]" />
                                            <span className="text-[11px] font-bold text-[#067D62]">+8%</span>
                                            <span className="text-[11px] text-gray-400">{t('dashboard.increaseFromLastMonth')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Users */}
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group cursor-pointer" onClick={() => setActiveTab('users')}>
                                    <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-gray-500">{t('dashboard.resources')}</span>
                                            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                                <Users size={18} className="text-purple-600" />
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-[#0F1111]">{totalUsers}</p>
                                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
                                            <TrendingUp size={13} className="text-[#067D62]" />
                                            <span className="text-[11px] font-bold text-[#067D62]">+2%</span>
                                            <span className="text-[11px] text-gray-400">{t('dashboard.increaseFromLastMonth')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions Bar */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-bold text-[#0F1111]">Quick Actions</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setShowAddProductModal(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-[#FFD814] to-[#F7CA00] hover:from-[#F7CA00] hover:to-[#E8B800] text-[#0F1111] rounded-lg text-sm font-medium transition-all shadow-sm border border-[#FCD200]"
                                    >
                                        <PlusCircle size={16} />
                                        Add Product
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                    >
                                        <ShoppingBag size={16} />
                                        View Orders
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('requests')}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                    >
                                        <GraduationCap size={16} />
                                        Instructor Requests
                                    </button>
                                    <button
                                        onClick={() => navigate('/admin/support')}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                    >
                                        <Headphones size={16} />
                                        Support Center
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('chat')}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                    >
                                        <MessageCircle size={16} />
                                        Messages
                                    </button>
                                </div>
                            </div>

                            {/* Platform Stats + Progress Ring */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Platform Stats */}
                                <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-base font-bold text-[#0F1111]">{t('dashboard.platformStats')}</h3>
                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-500">All</span>
                                    </div>
                                    <PlatformStats stats={dashboardStats} loading={loadingStats} />
                                </div>

                                {/* Progress Ring (SVG Donut) */}
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-base font-bold text-[#0F1111] mb-6">{t('dashboard.overallProgress')}</h3>
                                    <div className="flex items-center justify-center h-[250px]">
                                        <div className="relative w-44 h-44">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <path
                                                    d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="#F3F4F6"
                                                    strokeWidth="3"
                                                />
                                                <path
                                                    d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="url(#progressGradient)"
                                                    strokeWidth="3"
                                                    strokeDasharray="72, 100"
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000"
                                                />
                                                <defs>
                                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#FF9900" />
                                                        <stop offset="100%" stopColor="#FF6600" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-bold text-[#0F1111]">72%</span>
                                                <span className="text-xs text-gray-400 mt-1">{t('dashboard.completed')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =================== OTHER TABS CONTENT =================== */}
                    <div className={activeTab !== 'analytics' ? '' : 'hidden'}>
                        {/* Instructor Requests */}
                        {activeTab === "requests" && <InstructorRequestsComponent token={token || ""} />}
                        {activeTab === "orders" && <OrdersComponent orders={orders} token={token || ""} fetchOrders={fetchOrders} searchQuery="" />}
                        {activeTab === "products" && <ProductsComponent products={products} token={token || ""} fetchProducts={fetchProducts} searchQuery="" />}
                        {activeTab === "training-centers" && <TrainingCentersComponent token={token || ""} />}
                        {activeTab === "users" && (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#0F1111] flex items-center gap-2">
                                            <Users className="h-6 w-6 text-[#FF9900]" />
                                            {t('dashboard.usersDirectory') || 'Users Directory'}
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">Manage students, instructors, and admins from one place.</p>
                                    </div>

                                    {/* Sub-tabs / Filter */}
                                    <div className="flex p-1 bg-gray-100 rounded-lg self-start md:self-auto border border-gray-200">
                                        <button
                                            onClick={() => setUserFilter('student')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${userFilter === 'student' ? 'bg-white text-[#C45500] shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            Students
                                        </button>
                                        <button
                                            onClick={() => setUserFilter('instructor')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${userFilter === 'instructor' ? 'bg-white text-[#C45500] shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            Instructors
                                        </button>
                                        <button
                                            onClick={() => setUserFilter('all')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${userFilter === 'all' ? 'bg-white text-[#C45500] shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
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
                                                <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-200 col-span-full">
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
                                    <h2 className="text-xl font-bold text-[#0F1111]">{t('dashboard.allCourses')}</h2>
                                    <span className="text-sm text-gray-500">{allCourses.length} {t('dashboard.courses')}</span>
                                </div>
                                <AllCoursesTable courses={allCourses} loading={loadingCourses} />
                            </div>
                        )}
                        {activeTab === "withdrawals" && (
                            <WithdrawalsManager token={token || ""} />
                        )}
                        {activeTab === "chat" && (
                            <div className="h-[calc(100vh-230px)] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
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
                            <div className="h-[calc(100vh-230px)] rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
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
                </main>
            </div>

            {/* Add Product Modal */}
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9900] mb-4"></div>
        <p className="text-gray-600 text-sm">{text}</p>
    </div>
);

const ErrorBox = ({ message }: { message: string }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700 text-sm font-medium">{message}</p>
    </div>
);

export default AdminDashboard;
