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
    Database
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config/env";
import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

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
}

// =====================================================
//                     Dashboard
// =====================================================

const AdminDashboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const { t } = useTranslation();

    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);

    const [errorUsers, setErrorUsers] = useState<string | null>(null);
    const [errorProducts, setErrorProducts] = useState<string | null>(null);
    const [errorOrders, setErrorOrders] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState("orders");

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
        user: <Users size={24} />,
        box: <Box size={24} />,
        "shopping-cart": <ShoppingCart size={24} />,
        "dollar-sign": <DollarSign size={24} />,
    };

    const statsCards: StatCard[] = [
        { label: "إجمالي المستخدمين", value: totalUsers, icon: "user", color: "text-gray-700" },
        { label: "إجمالي المنتجات", value: totalProducts, icon: "box", color: "text-gray-800" },
        { label: "إجمالي الطلبات", value: totalOrders, icon: "shopping-cart", color: "text-gray-900" },
        { label: "الإيرادات", value: `$${totalRevenue.toFixed(2)}`, icon: "dollar-sign", color: "text-black" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans pt-20" dir="rtl">
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-l border-gray-200 min-h-[calc(100vh-80px)] fixed right-0 top-20 hidden md:block">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">لوحة التحكم</h2>

                        <nav className="space-y-2">

                            {/* Orders */}
                            <button
                                onClick={() => setActiveTab("orders")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "orders"
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <ShoppingBag size={20} />
                                الطلبات
                            </button>

                            {/* Products */}
                            <button
                                onClick={() => setActiveTab("products")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "products"
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Box size={20} />
                                {t('dashboard.products')}
                            </button>

                            {/* Users */}
                            <button
                                onClick={() => setActiveTab("users")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "users"
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Users size={20} />
                                {t('dashboard.users')}
                            </button>

                            {/* Categories */}
                            <button
                                onClick={() => setActiveTab("categories")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "categories"
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Folder size={20} />
                                {t('dashboard.categories')}
                            </button>

                            {/* Subcategories */}
                            <button
                                onClick={() => setActiveTab("subcategories")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "subcategories"
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <FolderTree size={20} />
                                {t('dashboard.subCategories')}
                            </button>

                            {/* Coupons */}
                            <button
                                onClick={() => setActiveTab("coupons")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "coupons"
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Ticket size={20} />
                                {t('dashboard.coupons')}
                            </button>

                            {/* Analytics */}
                            <button
                                onClick={() => setActiveTab("analytics")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "analytics"
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <BarChart size={20} />
                                {t('dashboard.analytics')}
                            </button>

                            {/* All Students */}
                            <button
                                onClick={() => setActiveTab("allStudents")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "allStudents"
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Users size={20} />
                                {t('dashboard.allStudents')}
                            </button>

                            {/* All Courses */}
                            <button
                                onClick={() => setActiveTab("allCourses")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "allCourses"
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Database size={20} />
                                {t('dashboard.allCourses')}
                            </button>

                            {/* Wishlist Navigate */}
                            <button
                                onClick={() => navigate("/wishlist")}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
                            >
                                <Heart size={20} />
                                {t('nav.wishlist')}
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
                            {t('nav.logout')}
                        </Button>
                    </div>
                </aside>

                {/* Main Section */}
                <main className="flex-1 md:mr-64 p-8">

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statsCards.map((stat, idx) => (
                            <Card
                                key={idx}
                                className="p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                                        <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                                    </div>

                                    <div className="p-3 rounded-xl bg-gray-100 shadow-inner">
                                        <div className={stat.color}>{iconMap[stat.icon]}</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] p-6">

                        {/* Orders */}
                        {activeTab === "orders" &&
                            (loadingOrders ? (
                                <Loading text={t('common.loading')} />
                            ) : errorOrders ? (
                                <ErrorBox message={errorOrders} />
                            ) : (
                                <OrdersComponent
                                    orders={orders}
                                    token={token || ""}
                                    fetchOrders={fetchOrders}
                                    searchQuery=""
                                />
                            ))}

                        {/* Products */}
                        {activeTab === "products" &&
                            (loadingProducts ? (
                                <Loading text="جاري تحميل المنتجات..." />
                            ) : errorProducts ? (
                                <ErrorBox message={errorProducts} />
                            ) : (
                                <ProductsComponent
                                    products={products}
                                    token={token || ""}
                                    fetchProducts={fetchProducts}
                                    searchQuery=""
                                />
                            ))}

                        {/* Users */}
                        {activeTab === "users" &&
                            (loadingUsers ? (
                                <Loading text="جاري تحميل المستخدمين..." />
                            ) : errorUsers ? (
                                <ErrorBox message={errorUsers} />
                            ) : (
                                <UsersComponent
                                    users={users}
                                    token={token || ""}
                                    fetchUsers={fetchUsers}
                                    searchQuery=""
                                />
                            ))}

                        {/* Categories */}
                        {activeTab === "categories" && (
                            <CategoriesComponent token={token || ""} searchQuery="" />
                        )}

                        {/* Subcategories */}
                        {activeTab === "subcategories" && (
                            <SubCategoriesComponent token={token || ""} searchQuery="" />
                        )}

                        {/* Coupons */}
                        {activeTab === "coupons" && (
                            <CouponsComponent token={token || ""} searchQuery="" />
                        )}

                        {/* Analytics Tab */}
                        {activeTab === "analytics" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">تحليلات المنصة</h2>
                                </div>
                                <PlatformStats stats={dashboardStats} loading={loadingStats} />
                            </div>
                        )}

                        {/* All Students Tab */}
                        {activeTab === "allStudents" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">جميع الطلاب</h2>
                                    <span className="text-sm text-gray-500">
                                        {allStudents.length} طالب
                                    </span>
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

                        {/* All Courses Tab */}
                        {activeTab === "allCourses" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">جميع الكورسات</h2>
                                    <span className="text-sm text-gray-500">
                                        {allCourses.length} كورس
                                    </span>
                                </div>
                                <AllCoursesTable courses={allCourses} loading={loadingCourses} />
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
};

// ---------------- Small Components ----------------

const Loading = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600 text-sm">{text}</p>
    </div>
);

const ErrorBox = ({ message }: { message: string }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700 text-sm font-medium">{message}</p>
    </div>
);

export default AdminDashboard;
