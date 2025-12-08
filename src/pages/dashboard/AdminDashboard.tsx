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
    PlusCircle
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
    icon: "user" | "box" | "shopping-cart" | "dollar-sign";
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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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

    const iconMap: Record<string, React.ReactNode> = {
        user: <Users size={20} className="text-purple-600" />,
        box: <Box size={20} className="text-orange-600" />,
        "shopping-cart": <ShoppingCart size={20} className="text-blue-600" />,
        "dollar-sign": <DollarSign size={20} className="text-green-600" />,
    };

    const statsCards: StatCard[] = [
        { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: "dollar-sign", color: "bg-purple-50", trend: "+12%" },
        { label: "Projects (Products)", value: totalProducts, icon: "box", color: "bg-orange-50", trend: "-10%" },
        { label: "Orders", value: totalOrders, icon: "shopping-cart", color: "bg-blue-50", trend: "+8%" },
        { label: "Resources (Users)", value: totalUsers, icon: "user", color: "bg-yellow-50", trend: "+2%" }
    ];

    const menuItems = [
        { id: "analytics", label: t('dashboard.analytics'), icon: <BarChart size={20} /> },
        { id: "requests", label: t('dashboard.instructorRequests'), icon: <GraduationCap size={20} /> },
        { id: "orders", label: t('dashboard.orders'), icon: <ShoppingBag size={20} /> },
        { id: "products", label: t('dashboard.products'), icon: <Box size={20} /> },
        { id: "users", label: t('dashboard.users'), icon: <Users size={20} /> },
        { id: "categories", label: t('dashboard.categories'), icon: <Folder size={20} /> },
        { id: "subcategories", label: t('dashboard.subCategories'), icon: <FolderTree size={20} /> },
        { id: "coupons", label: t('dashboard.coupons'), icon: <Ticket size={20} /> },
        { id: "allStudents", label: t('dashboard.allStudents'), icon: <Users size={20} /> },
        { id: "allCourses", label: t('dashboard.allCourses'), icon: <Database size={20} /> },
    ];

    const currentDir = i18n.language === "ar" ? "rtl" : "ltr";

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

                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full py-3 px-6 flex items-center justify-center gap-2 font-medium transition-transform active:scale-95 shadow-lg shadow-orange-500/30 mb-8">
                        <PlusCircle size={20} />
                        <span>{t('dashboard.createProject')}</span>
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
                                <span className={activeTab === item.id ? "text-orange-500" : ""}>{item.icon}</span>
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
                            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors relative">
                                <Bell size={20} className="text-gray-600" />
                                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
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
                                        <h3 className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-xs font-bold text-green-500`}>
                                            +12%
                                        </span>
                                        <span className="text-xs text-gray-400">{t('dashboard.increaseFromLastMonth')}</span>
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
                        {activeTab === "users" && <UsersComponent users={users} token={token || ""} fetchUsers={fetchUsers} searchQuery="" />}
                        {activeTab === "categories" && <CategoriesComponent token={token || ""} searchQuery="" />}
                        {activeTab === "subcategories" && <SubCategoriesComponent token={token || ""} searchQuery="" />}
                        {activeTab === "coupons" && <CouponsComponent token={token || ""} searchQuery="" />}
                        {activeTab === "allStudents" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">{t('dashboard.allStudents')}</h2>
                                    <span className="text-sm text-gray-500">{allStudents.length} {t('dashboard.students')}</span>
                                </div>
                                <AllStudentsTable
                                    students={allStudents}
                                    loading={loadingStudents}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => {
                                        setCurrentPage(page);
                                        fetchAllStudents(page);
                                    }}
                                />
                            </div>
                        )}
                        {activeTab === "allCourses" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">{t('dashboard.allCourses')}</h2>
                                    <span className="text-sm text-gray-500">{allCourses.length} {t('dashboard.courses')}</span>
                                </div>
                                <AllCoursesTable courses={allCourses} loading={loadingCourses} />
                            </div>
                        )}
                    </div>
                </div>
            </main>
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
