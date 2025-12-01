import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from '@/config/env';

interface OrderProduct {
  _id?: string;
  id?: string;
  title: string;
  price: number;
  quantity?: number;
  description?: string;
  imageCover?: string;
}

interface Order {
  _id: string;
  product?: OrderProduct | {
    _id: string;
    title: string;
    price: number;
    description?: string;
    imageCover?: string;
  };
  products?: OrderProduct[];
  totalPrice: number;
  status: "pending" | "paid" | "delivered" | "cancelled";
  createdAt: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!orderId) {
      setError("معرّف الطلب غير صحيح");
      setLoading(false);
      return;
    }

    if (!token) {
      toast({ title: "يرجى تسجيل الدخول أولاً" });
      navigate("/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        // GET http://localhost:8000/api/v1/orders/:orderId
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/orders/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000,
          }
        );

        const orderData = res.data?.data || res.data;
        setOrder(orderData);
      } catch (err) {
        const axiosError = err as AxiosError;
        console.error("Fetch Order Error:", err);

        if (axiosError.response?.status === 404) {
          setError("الطلب غير موجود.");
        } else if (axiosError.response?.status === 401) {
          setError("جلسة انتهت. يرجى تسجيل الدخول مرة أخرى.");
          navigate("/login");
        } else {
          setError(
            axiosError.message || "حدث خطأ أثناء جلب بيانات الطلب."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token, navigate, toast]);

  const handleStripeCheckout = async () => {
    if (!orderId) {
      toast({ title: "خطأ: معرف الطلب غير صحيح" });
      return;
    }

    setStripeLoading(true);
    try {
      // GET http://localhost:8000/api/v1/orders/checkout-session/:orderId
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/orders/checkout-session/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        }
      );

      const checkoutUrl = res.data?.url || res.data?.data?.url;
      
      if (!checkoutUrl) {
        toast({ title: "فشل الحصول على رابط الدفع. حاول مرة أخرى." });
        setStripeLoading(false);
        return;
      }

      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setStripeLoading(false);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "فشل إنشاء جلسة الدفع عبر Stripe";
      console.error("Stripe Checkout Error:", err);
      toast({ title: errorMsg, variant: "destructive" });
    }
  };

  const handlePaymentConfirmation = async () => {
    if (!orderId) {
      toast({ title: "خطأ: معرف الطلب غير صحيح" });
      return;
    }

    setPaymentLoading(true);
    try {
      // PUT http://localhost:8000/api/v1/orders/:orderId/pay
      const res = await axios.put(
        `${API_BASE_URL}/api/v1/orders/${orderId}/pay`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        }
      );

      const updatedOrder = res.data?.data || res.data;
      setOrder(updatedOrder);
      toast({ title: "تم تأكيد الدفع بنجاح!" });
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "فشل تأكيد الدفع";
      console.error("Payment Confirmation Error:", err);
      toast({ title: errorMsg, variant: "destructive" });
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      paid: "bg-green-100 text-green-800 border border-green-300",
      delivered: "bg-blue-100 text-blue-800 border border-blue-300",
      cancelled: "bg-red-100 text-red-800 border border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "قيد الانتظار",
      paid: "مدفوع",
      delivered: "تم التسليم",
      cancelled: "ملغي",
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: "⏳",
      paid: "✅",
      delivered: "📦",
      cancelled: "❌",
    };
    return icons[status] || "ℹ️";
  };

  const getProductImage = (product: any) => {
    return product?.imageCover || "/placeholder-course.png";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-red-600 mb-4 text-lg font-semibold">{error}</p>
              <Button
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => navigate("/courses")}
              >
                العودة للكورسات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const product = order.product;
  const isArray = Array.isArray(order.products);
  const items = isArray ? order.products : product ? [product] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button
          className="mb-6 bg-gray-500 text-white hover:bg-gray-600 transition-all"
          onClick={() => navigate("/courses")}
        >
          ← العودة للكورسات
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-right bg-gradient-to-l from-blue-50 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{getStatusIcon(order.status)}</div>
              <CardTitle className="text-3xl">تفاصيل الطلب</CardTitle>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">رقم الطلب</p>
                <p className="text-lg font-semibold font-mono">{order._id.slice(-8)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">حالة الطلب</p>
                <span
                  className={`inline-block px-3 py-1 rounded text-sm font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="text-right space-y-6">
            {/* Products Section */}
            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">📚 المنتجات:</h2>
              <div className="space-y-4">
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      className="flex flex-col sm:flex-row gap-4 p-4 bg-gradient-to-l from-blue-50 to-transparent rounded-lg border border-blue-100 hover:shadow-md transition-shadow"
                    >
                      <img
                        src={getProductImage(item)}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-course.png";
                        }}
                      />
                      <div className="flex-grow text-right">
                        <h3 className="text-lg font-semibold mb-1 text-gray-900">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        <div className="flex justify-end gap-6">
                          {item.quantity && (
                            <div className="text-center">
                              <p className="text-xs text-gray-600">الكمية</p>
                              <p className="font-bold text-lg">{item.quantity}</p>
                            </div>
                          )}
                          <div className="text-center border-r border-gray-300 pr-6">
                            <p className="text-xs text-gray-600">السعر</p>
                            <p className="text-xl font-bold text-blue-600">
                              ${item.price}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    لا توجد منتجات في هذا الطلب
                  </p>
                )}
              </div>
            </div>

            {/* Total Section */}
            <div className="border-t pt-6 bg-gradient-to-l from-green-50 to-transparent rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">
                  ${order.totalPrice}
                </span>
                <span className="text-xl font-bold text-gray-900">
                  المجموع الكلي:
                </span>
              </div>
            </div>

            {/* Order Info Section */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">تاريخ الطلب</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {order.user && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">المستخدم</p>
                    <p className="font-semibold text-gray-900">{order.user.name}</p>
                    <p className="text-xs text-gray-500">{order.user.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Section */}
            {order.status === "pending" && (
              <div className="border-t pt-6 space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm font-semibold">
                    ⏳ هذا الطلب في انتظار الدفع
                  </p>
                  <p className="text-yellow-700 text-xs mt-1">
                    اختر طريقة الدفع المناسبة لك أدناه
                  </p>
                </div>

                {/* Stripe Payment Button */}
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-lg py-6 font-semibold rounded-lg transition-all"
                  onClick={handleStripeCheckout}
                  disabled={stripeLoading || paymentLoading}
                >
                  {stripeLoading ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      جاري التحويل إلى Stripe...
                    </>
                  ) : (
                    "💳 الدفع عبر Stripe"
                  )}
                </Button>

                {/* Manual Payment Confirmation Button */}
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg py-6 font-semibold rounded-lg transition-all"
                  onClick={handlePaymentConfirmation}
                  disabled={paymentLoading || stripeLoading}
                >
                  {paymentLoading ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      جاري تأكيد الدفع...
                    </>
                  ) : (
                    "✓ تأكيد الدفع يدوياً"
                  )}
                </Button>
              </div>
            )}

            {/* Success Message for Paid Orders */}
            {order.status === "paid" && (
              <div className="border-t pt-6">
                <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-6 text-center">
                  <p className="text-4xl mb-2">✅</p>
                  <p className="text-green-800 font-bold text-lg">
                    تم استقبال الدفع بنجاح!
                  </p>
                  <p className="text-green-700 text-sm mt-2">
                    شكراً لك على شرائك. سيتم تفعيل الكورس قريباً.
                  </p>
                </div>
              </div>
            )}

            {/* Delivered Status */}
            {order.status === "delivered" && (
              <div className="border-t pt-6">
                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-6 text-center">
                  <p className="text-4xl mb-2">📦</p>
                  <p className="text-blue-800 font-bold text-lg">
                    تم تسليم الطلب
                  </p>
                  <p className="text-blue-700 text-sm mt-2">
                    يمكنك الآن الوصول إلى الكورس والبدء في التعلم.
                  </p>
                  <Button
                    className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => navigate("/courses")}
                  >
                    الذهاب للكورسات
                  </Button>
                </div>
              </div>
            )}

            {/* Cancelled Status */}
            {order.status === "cancelled" && (
              <div className="border-t pt-6">
                <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6 text-center">
                  <p className="text-4xl mb-2">❌</p>
                  <p className="text-red-800 font-bold text-lg">
                    تم إلغاء الطلب
                  </p>
                  <p className="text-red-700 text-sm mt-2">
                    إذا كان لديك أي أسئلة، يرجى التواصل معنا.
                  </p>
                  <Button
                    className="w-full bg-blue-500 text-white mt-4 hover:bg-blue-600"
                    onClick={() => navigate("/courses")}
                  >
                    العودة للكورسات والمحاولة مرة أخرى
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetails;