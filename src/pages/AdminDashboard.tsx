import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { OrdersComponent } from "@/components/admin/OrdersComponent";
import { ProductsComponent } from "@/components/admin/ProductsComponent";
import { UsersComponent } from "@/components/admin/UsersComponent";
import { LogOut, Users, Box, ShoppingCart, DollarSign, LayoutDashboard, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '@/config/env';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface User {
  _id: string;
  name: string;
  email: string;
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
}

interface StatCard {
  label: string;
  value: number | string;
  icon: "user" | "box" | "shopping-cart" | "dollar-sign";
  color: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

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

  // -------------------- Fetch Data --------------------
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

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setErrorOrders(null);
    try {
      console.log("Fetching orders from:", `${API_BASE_URL}/api/v1/orders`);
      const res = await axios.get(`${API_BASE_URL}/api/v1/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data?.data || []);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      const msg = err.response?.data?.message || "فشل تحميل الطلبات";
      setErrorOrders(msg);
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    console.log("AdminDashboard useEffect:", { token: !!token });
    if (!token) {
      console.log("AdminDashboard: No token, redirecting to login");
      navigate("/login");
      return;
    }
    fetchUsers();
    fetchProducts();
    fetchOrders();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast({ title: "تم تسجيل الخروج بنجاح" });
    navigate("/login");
  };

  // إحصائيات
  const totalUsers = users.length;
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalOrderPrice || 0), 0);

  // Map for icons
  const iconMap: Record<string, React.ReactNode> = {
    user: <Users size={24} />,
    box: <Box size={24} />,
    "shopping-cart": <ShoppingCart size={24} />,
    "dollar-sign": <DollarSign size={24} />,
  };

  // Statistics Cards Data
  const statsCards: StatCard[] = [
    {
      label: "إجمالي المستخدمين",
      value: totalUsers,
      icon: "user",
      color: "text-blue-600",
    },
    {
      label: "إجمالي المنتجات",
      value: totalProducts,
      icon: "box",
      color: "text-purple-600",
    },
    {
      label: "إجمالي الطلبات",
      value: totalOrders,
      icon: "shopping-cart",
      color: "text-green-600",
    },
    {
      label: "الإيرادات",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: "dollar-sign",
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-20" dir="rtl">
      <div className="flex">
        {/* Sidebar (Right) */}
        <aside className="w-64 bg-white border-l border-gray-200 min-h-[calc(100vh-80px)] fixed right-0 top-20 hidden md:block">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">لوحة التحكم</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "orders"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <ShoppingBag size={20} />
                الطلبات
                <span className="mr-auto bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">{totalOrders}</span>
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "products"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Box size={20} />
                المنتجات
                <span className="mr-auto bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{totalProducts}</span>
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "users"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Users size={20} />
                المستخدمين
                <span className="mr-auto bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{totalUsers}</span>
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
              تسجيل خروج
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:mr-64 p-8">
          {/* Mobile Header */}
          <div className="md:hidden mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, idx) => (
              <Card key={idx} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl bg-gray-50`}>
                    <div className={stat.color}>
                      {iconMap[stat.icon]}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] p-6">
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">إدارة الطلبات</h2>
                </div>
                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-gray-600 text-sm">جاري تحميل الطلبات...</p>
                  </div>
                ) : errorOrders ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-700 text-sm font-medium">{errorOrders}</p>
                  </div>
                ) : (
                  <OrdersComponent
                    orders={orders}
                    token={token || ""}
                    fetchOrders={fetchOrders}
                    searchQuery=""
                  />
                )}
              </div>
            )}

            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">إدارة المنتجات</h2>
                </div>
                {loadingProducts ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-gray-600 text-sm">جاري تحميل المنتجات...</p>
                  </div>
                ) : errorProducts ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-700 text-sm font-medium">{errorProducts}</p>
                  </div>
                ) : (
                  <ProductsComponent
                    products={products}
                    token={token || ""}
                    fetchProducts={fetchProducts}
                    searchQuery=""
                  />
                )}
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">إدارة المستخدمين</h2>
                </div>
                {loadingUsers ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-gray-600 text-sm">جاري تحميل المستخدمين...</p>
                  </div>
                ) : errorUsers ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-700 text-sm font-medium">{errorUsers}</p>
                  </div>
                ) : (
                  <UsersComponent
                    users={users}
                    token={token || ""}
                    fetchUsers={fetchUsers}
                    searchQuery=""
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CSS Minimal Animations */}
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;