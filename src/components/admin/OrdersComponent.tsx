import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { API_BASE_URL } from '@/config/env';

interface OrderItem {
  product?: {
    title?: string;
    price?: number;
    imageCover?: string;
  };
  quantity: number;
}

interface Order {
  _id: string;
  totalOrderPrice?: number;
  cartItems: OrderItem[];
  user?: {
    name?: string;
    email?: string;
  };
  isPaid?: boolean;
}

interface Props {
  orders: Order[];
  token: string | null;
  fetchOrders: () => void;
  searchQuery: string;
}

export const OrdersComponent = ({
  orders,
  token,
  fetchOrders,
  searchQuery,
}: Props) => {
  const { toast } = useToast();
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);

  React.useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const handleConfirmPayment = async (orderId: string) => {
    if (!token) {
      toast({ 
        title: "خطأ", 
        description: "لم يتم العثور على التوكن",
        variant: "destructive" 
      });
      return;
    }

    setLoadingOrderId(orderId);

    try {
      console.log("Sending payment confirmation for order:", orderId);
      
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/orders/${orderId}/pay`,

        { status: "paid" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✓ Payment confirmed:", response.data);

      // Check if response contains updated order data
      const updatedOrderFromServer = response.data?.data || response.data;
      console.log("Server response data:", updatedOrderFromServer);

      // تحديث الحالة المحلية فوراً
      const updatedOrders = localOrders.map((order) =>
        order._id === orderId 
          ? { 
              ...order, 
              isPaid: updatedOrderFromServer?.isPaid ?? true,
              ...updatedOrderFromServer
            } 
          : order
      );
      setLocalOrders(updatedOrders);

      toast({
        title: "✓ تم تأكيد الدفع",
        description: "تم تحديث حالة الطلب بنجاح",
      });
      
      // استدعاء fetchOrders للتأكد من التزامن مع الـ Backend
      setTimeout(() => {
        fetchOrders();
      }, 500);

    } catch (err: any) {
      console.error("❌ Payment error details:", {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data,
      });
      
      let errMsg = "فشل تأكيد الدفع";
      
      if (err.response?.status === 403) {
        errMsg = "ليس لديك الصلاحيات لتحديث حالة الطلب. يجب أن تكون admin أو manager";
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.response?.status) {
        errMsg = `خطأ من الخادم: ${err.response.status}`;
      }
      
      toast({
        title: "خطأ",
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      setLoadingOrderId(null);
    }
  };

  // Filter orders based on searchQuery
  const filteredOrders = localOrders.filter((order) =>
    order._id.includes(searchQuery) ||
    order.user?.name?.includes(searchQuery) ||
    order.user?.email?.includes(searchQuery)
  );

  if (filteredOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          🔦 {localOrders.length === 0 ? "لا توجد طلبات" : "لا توجد نتائج للبحث"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredOrders.map((order) => (
        <Card
          key={order._id}
          className="p-5 border border-gray-200 hover:shadow-md transition-all"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Order ID */}
            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">رقم الطلب</p>
              <p className="text-sm font-semibold text-gray-900 break-all">
                {order._id.slice(0, 8)}...
              </p>
            </div>

            {/* Customer */}
            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">العميل</p>
              <p className="text-sm font-semibold text-gray-900">
                {order.user?.name ?? "غير معروف"}
              </p>
              <p className="text-xs text-gray-500">{order.user?.email}</p>
            </div>

            {/* Total Price */}
            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">الإجمالي</p>
              <p className="text-lg font-bold text-green-600">
                ${order.totalOrderPrice?.toFixed(2) ?? "0.00"}
              </p>
            </div>

            {/* Status & Action */}
            <div className="flex items-end justify-between md:justify-end gap-2">
              <div className="text-right">
                <p className="text-xs text-gray-600 font-medium mb-1">الحالة</p>
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded transition-colors ${
                    order.isPaid
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.isPaid ? "✓ مدفوع" : "⏳ قيد الانتظار"}
                </span>
              </div>

              {!order.isPaid && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  onClick={() => handleConfirmPayment(order._id)}
                  disabled={loadingOrderId === order._id}
                >
                  {loadingOrderId === order._id ? "جاري..." : "تأكيد"}
                </Button>
              )}
            </div>
          </div>

          {/* Items Preview */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 font-medium mb-2">المنتجات:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {order.cartItems.map((item, idx) => (
                <div key={idx} className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                  <p className="font-medium truncate">
                    {item.product?.title ?? "منتج غير معروف"}
                  </p>
                  <p className="text-gray-600">
                    {item.quantity} × ${item.product?.price?.toFixed(2) ?? "0.00"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};