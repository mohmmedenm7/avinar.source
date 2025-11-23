import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

interface Order {
  _id: string;
  product: { _id: string; title: string; price: number };
  user: { _id: string; name: string; email: string };
  status: "pending" | "paid" | "delivered" | "cancelled";
  createdAt: string;
  totalPrice: number;
}

const OrdersList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/v1/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data?.data || []);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "حدث خطأ أثناء جلب الطلبات";
      toast({ title: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const handlePayOrder = async (orderId: string) => {
    try {
      await axios.put(
        `http://localhost:8000/api/v1/orders/${orderId}/pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "تم تحديث حالة الدفع بنجاح" });
      fetchOrders();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "فشل تحديث الدفع";
      toast({ title: errorMsg });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      delivered: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: "مدفوع",
      pending: "قيد الانتظار",
      delivered: "تم التسليم",
      cancelled: "ملغي",
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-right mb-8">الطلبات</h1>

        {loading ? (
          <p className="text-center text-gray-500">جاري التحميل...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">لا توجد طلبات</p>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-right">قائمة الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-3">المنتج</th>
                      <th className="text-right p-3">المستخدم</th>
                      <th className="text-right p-3">البريد</th>
                      <th className="text-right p-3">الحالة</th>
                      <th className="text-right p-3">السعر</th>
                      <th className="text-right p-3">التاريخ</th>
                      <th className="text-right p-3">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b hover:bg-gray-100"
                      >
                        <td className="p-3">{order.product.title}</td>
                        <td className="p-3">{order.user.name}</td>
                        <td className="p-3 text-xs">{order.user.email}</td>
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="p-3">${order.totalPrice}</td>
                        <td className="p-3">
                          {new Date(order.createdAt).toLocaleDateString(
                            "ar-SA"
                          )}
                        </td>
                        <td className="p-3">
                          {order.status === "pending" ? (
                            <Button
                              className="bg-green-500 text-white text-xs"
                              onClick={() => handlePayOrder(order._id)}
                              disabled={loading}
                            >
                              تأكيد
                            </Button>
                          ) : (
                            <span className="text-gray-500 text-xs">معالج</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrdersList;