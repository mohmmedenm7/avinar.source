import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from '@/config/env';

interface CartItem {
  _id: string;
  product?: {
    _id: string;
    title: string;
    price: number;
    imageCover?: string;
  };
  quantity?: number;
}

interface Cart {
  _id: string;
  cartItems?: CartItem[];
  totalCartPrice?: number;
  totalPriceAfterDiscount?: number;
}

const CheckoutPage = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [coupon, setCoupon] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "stripe">("cash");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { toast } = useToast();

  const safeCartId = cart?._id;
  const safeCartItems = cart?.cartItems || [];
  const finalPrice = cart?.totalPriceAfterDiscount ?? cart?.totalCartPrice ?? 0;

  /** Fetch Cart */
  useEffect(() => {
    if (!token) {
      toast({ title: "يرجى تسجيل الدخول أولاً" });
      navigate("/login");
      return;
    }
    fetchCart();
  }, [token]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cartData = res.data?.data;

      if (!cartData?._id || !cartData?.cartItems?.length) {
        throw new Error("السلة فارغة");
      }

      setCart(cartData);
    } catch (err: any) {
      toast({ title: err.message || "خطأ في جلب السلة" });
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  /** Apply Coupon */
  const handleApplyCoupon = async () => {
    if (!coupon.trim()) {
      toast({ title: "يرجى إدخال كود الكوبون" });
      return;
    }

    setApplyingCoupon(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/cart/applyCoupon`,
        { coupon },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({ title: "تم تطبيق الكوبون بنجاح" });
      setCart(res.data?.data);
    } catch (err: any) {
      toast({
        title: err.response?.data?.message || "تعذر تطبيق الكوبون",
        variant: "destructive",
      });
    } finally {
      setApplyingCoupon(false);
    }
  };

  /** File for cash payment */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentReceipt(e.target.files[0]);
    }
  };

  /** Checkout */
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safeCartId) return;

    setSubmitting(true);

    try {
      if (paymentMethod === "stripe") {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/orders/checkout-session/${safeCartId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.session?.url) {
          window.location.href = res.data.session.url;
        } else {
          toast({ title: "فشل إنشاء جلسة الدفع", variant: "destructive" });
        }

      } else {
        // Cash order
        const formData = new FormData();
        if (paymentReceipt) formData.append("paymentReceipt", paymentReceipt);
        if (coupon) formData.append("coupon", coupon);

        const res = await axios.post(
          `${API_BASE_URL}/api/v1/orders/${safeCartId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const orderId = res.data?.data?._id;
        toast({ title: "✓ تم إنشاء الطلب بنجاح" });
        navigate(`/order/${orderId}`);
      }
    } catch (err: any) {
      toast({
        title: err.response?.data?.message || "فشل إكمال الطلب",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /** UI */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!cart || safeCartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>السلة فارغة</p>
        <Button onClick={() => navigate("/courses")}>رجوع</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">

        {/* Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-right">ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="text-right space-y-4">

              {/* Cart Items */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {safeCartItems.map((item) => (
                  <div key={item._id} className="pb-2 border-b">
                    <p className="font-semibold">{item.product?.title}</p>
                    <p className="text-gray-600">
                      {item.quantity} × ${item.product?.price}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    ${finalPrice.toFixed(2)}
                  </span>
                  <span className="font-semibold">المجموع:</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">الدفع</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleCheckout}>

                {/* Coupon */}
                <div>
                  <label className="block mb-2 font-semibold text-right">كود الخصم</label>
                  <div className="flex gap-2">
                    <Input
                      dir="rtl"
                      placeholder="EXTRA10"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                    <Button type="button" onClick={handleApplyCoupon} disabled={applyingCoupon}>
                      تطبيق
                    </Button>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-right">
                    طريقة الدفع
                  </label>
                  <div className="flex gap-4 mb-4">
                    <Button
                      type="button"
                      variant={paymentMethod === "cash" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("cash")}
                      className="flex-1"
                    >
                      تحويل بنكي / كاش
                    </Button>

                    <Button
                      type="button"
                      variant={paymentMethod === "stripe" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("stripe")}
                      className="flex-1"
                    >
                      Stripe
                    </Button>
                  </div>

                  {paymentMethod === "cash" && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <label className="block text-sm font-semibold mb-2">
                        صورة إيصال التحويل *
                      </label>
                      <Input type="file" accept="image/*" onChange={handleFileChange} />
                      <p className="text-xs text-blue-600 mt-2">
                        قم برفع إيصال الدفع لإتمام الطلب للمدفوعات اليدوية.
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-green-600 text-white py-6 text-lg"
                >
                  {submitting
                    ? "جاري..."
                    : paymentMethod === "stripe"
                      ? "الذهاب للدفع"
                      : `تأكيد الطلب (${finalPrice.toFixed(2)}$)`
                  }
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
