import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { OrdersComponent } from "@/components/admin/OrdersComponent";
import { ProductsComponent } from "@/components/admin/ProductsComponent";
import { UsersComponent } from "@/components/admin/UsersComponent";
import { LogOut, Users, Box, ShoppingCart, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '@/config/env';

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

  useEffect(() => {
    if (!token) {
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
      color: "#6B7280",
    },
    {
      label: "إجمالي المنتجات",
      value: totalProducts,
      icon: "box",
      color: "#4B5563",
    },
    {
      label: "إجمالي الطلبات",
      value: totalOrders,
      icon: "shopping-cart",
      color: "#9CA3AF",
    },
    {
      label: "الإيرادات",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: "dollar-sign",
      color: "#374151",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">تسجيل خروج</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>

          <div className="text-right">
            <p className="text-sm text-gray-600">مرحباً بك في الإدارة</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {/* Left Content */}
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm font-medium mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>

                  {/* Icon Container */}
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-lg ml-4 transition-all duration-200 group-hover:scale-110"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <div style={{ color: stat.color }}>
                      {iconMap[stat.icon]}
                    </div>
                  </div>
                </div>

                {/* Bottom Line Accent */}
                <div
                  className="h-1 rounded-full transition-all duration-200 group-hover:h-1.5"
                  style={{ backgroundColor: stat.color }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Tab List - Minimal Style */}
            <TabsList className="grid w-full grid-cols-3 gap-0 bg-white border-b border-gray-200 p-0 rounded-none h-auto">
              <TabsTrigger
                value="orders"
                className="px-6 py-4 rounded-none font-medium text-base text-gray-700 border-b-2 border-transparent hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-white transition-all duration-200"
              >
                الطلبات ({totalOrders})
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="px-6 py-4 rounded-none font-medium text-base text-gray-700 border-b-2 border-transparent hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-white transition-all duration-200"
              >
                المنتجات ({totalProducts})
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="px-6 py-4 rounded-none font-medium text-base text-gray-700 border-b-2 border-transparent hover:text-gray-900 hover:bg-gray-50 data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-white transition-all duration-200"
              >
                المستخدمين ({totalUsers})
              </TabsTrigger>
            </TabsList>

            {/* Content */}
            <div className="p-6">
              <TabsContent value="orders" className="mt-0">
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
              </TabsContent>

              <TabsContent value="products" className="mt-0">
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
              </TabsContent>

              <TabsContent value="users" className="mt-0">
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
              </TabsContent>
            </div>
          </Tabs>
        </div>
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