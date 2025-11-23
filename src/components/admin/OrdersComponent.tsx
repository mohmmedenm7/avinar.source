import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

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

  const handleConfirmPayment = async (orderId: string) => {
    try {
      await axios.put(
        `http://localhost:8000/api/v1/orders/${orderId}/pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "✓ تم تأكيد الدفع" });
      fetchOrders();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "فشل تأكيد الدفع";
      toast({ title: errMsg, variant: "destructive" });
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">📦 لا توجد طلبات</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
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
                  className={`inline-block px-3 py-1 text-xs font-medium rounded ${
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
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3"
                  onClick={() => handleConfirmPayment(order._id)}
                >
                  تأكيد
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