import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  shippingAddress: {
    details: string;
    phone: string;
    city: string;
    postalCode: string;
    country: string;
  };
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  paymentMethod?: string;
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast({ title: "يرجى تسجيل الدخول أولاً" });
      navigate("/login");
      return;
    }
    fetchMyOrders();
  }, [token]);

  const fetchMyOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // GET /api/v1/orders - gets current user's orders
      const res = await axios.get("http://localhost:8000/api/v1/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data?.data || []);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "خطأ أثناء جلب الطلبات";
      setError(errorMsg);
      toast({ title: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isPaid: boolean, isDelivered: boolean) => {
    if (isDelivered) return "bg-blue-100 text-blue-800";
    if (isPaid) return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusLabel = (isPaid: boolean, isDelivered: boolean) => {
    if (isDelivered) return "تم التسليم";
    if (isPaid) return "مدفوع";
    return "قيد الانتظار";
  };

  const getStatusIcon = (isPaid: boolean, isDelivered: boolean) => {
    if (isDelivered) return "📦";
    if (isPaid) return "✅";
    return "⏳";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 mt-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                className="bg-blue-500 text-white"
                onClick={() => navigate("/")}
              >
                العودة للرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-right mb-2">طلباتي</h1>
          <p className="text-gray-600 text-right">
            {orders.length} طلب
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-xl mb-4">لا توجد طلبات حالياً</p>
              <Button
                className="bg-blue-500 text-white"
                onClick={() => navigate("/courses")}
              >
                استكشف الكورسات
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="text-right flex-grow">
                      <CardTitle className="text-lg mb-2">
                        الطلب: {order._id.slice(-8)}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        التاريخ:{" "}
                        {new Date(order.createdAt).toLocaleDateString(
                          "ar-SA"
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.isPaid,
                          order.isDelivered
                        )}`}
                      >
                        {getStatusIcon(order.isPaid, order.isDelivered)}{" "}
                        {getStatusLabel(order.isPaid, order.isDelivered)}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3 text-right">المنتجات:</h3>
                    <div className="space-y-2">
                      {order.orderItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded text-right"
                        >
                          <div className="flex-grow">
                            <p className="font-semibold text-sm">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              الكمية: {item.qty}
                            </p>
                          </div>
                          <p className="text-blue-600 font-bold">
                            ${(item.price * item.qty).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2 text-right">عنوان الشحن:</h3>
                    <div className="bg-gray-50 p-3 rounded text-right text-sm">
                      <p>{order.shippingAddress.details}</p>
                      <p>
                        {order.shippingAddress.city} -{" "}
                        {order.shippingAddress.country}
                      </p>
                      <p>الهاتف: {order.shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Total and Actions */}
                  <div className="border-t pt-4 flex justify-between items-center">
                    <Button
                      className="bg-blue-500 text-white hover:bg-blue-600"
                      onClick={() => navigate(`/order/${order._id}`)}
                    >
                      عرض التفاصيل
                    </Button>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">المجموع:</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;