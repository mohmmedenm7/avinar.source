import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from '@/config/env';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/orders/${id}`
        );
        setOrder(res.data.data);
      } catch (err) {
        console.log("Error loading order:", err);
      }
    };

    loadOrder();
  }, [id]);

  if (!order) return <p className="text-center mt-10">جار التحميل...</p>;

  const items = order.orderItems || [];

  return (
    <div className="max-w-4xl mx-auto p-8 text-right">
      <h1 className="text-3xl font-bold mb-4">تفاصيل الطلب (Admin)</h1>

      <div className="bg-white p-6 shadow rounded mb-6">
        <p><strong>رقم الطلب:</strong> {order._id}</p>
        <p><strong>الإجمالي:</strong> ${order.totalOrderPrice}</p>
        <p><strong>الحالة:</strong> {order.status}</p>
        <p><strong>المستخدم:</strong> {order.user?.name}</p>
      </div>

      <h2 className="text-2xl font-semibold mb-3">المنتجات:</h2>

      {items.length === 0 ? (
        <p>لا توجد منتجات.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="p-4 bg-gray-100 rounded flex justify-between">
              <div>
                <p className="font-semibold">{item.productId?.title}</p>
                <p className="text-sm text-gray-600">
                  الكمية: {item.qty} × ${item.price}
                </p>
              </div>

              <strong>${item.qty * item.price}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetails;
