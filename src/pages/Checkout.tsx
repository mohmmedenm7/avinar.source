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

interface ShippingAddress {
  details: string;
  phone: string;
  city: string;
  postalCode?: string;
  country?: string;
}

const CheckoutPage = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    details: "",
    phone: "",
    city: "",
    postalCode: "",
    country: "Sudan",
  });
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "stripe">("cash");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ Safe extraction
  const safeCartId = cart?._id;
  const safeCartItems = cart?.cartItems || [];
  const safeTotalPrice = cart?.totalCartPrice ?? 0;

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
        timeout: 10000,
      });

      const cartData = res.data?.data;

      if (!cartData?._id || !cartData?.cartItems?.length) {
        throw new Error("السلة فارغة");
      }

      setCart(cartData);
    } catch (err: any) {
      const errorMsg = err.message || err.response?.data?.message || "خطأ في جلب السلة";
      toast({ title: errorMsg });
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentReceipt(e.target.files[0]);
    }
  };

  // ✅ Validation قبل الإرسال
  const validateForm = (): boolean => {
    if (!shippingAddress.details.trim()) {
      toast({ title: "يرجى إدخال تفاصيل العنوان" });
      return false;
    }
    if (!shippingAddress.phone.trim()) {
      toast({ title: "يرجى إدخال رقم الهاتف" });
      return false;
    }
    if (!shippingAddress.city.trim()) {
      toast({ title: "يرجى إدخال المدينة" });
      return false;
    }
    if (paymentMethod === "cash" && !paymentReceipt) {
      toast({ title: "يرجى إرفاق إشعار الدفع للطلب النقدي" });
      return false;
    }
    return true;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!safeCartId) {
      toast({ title: "خطأ: السلة غير صحيحة", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (paymentMethod === "stripe") {
        // Stripe Checkout
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
        // Cash Order with Receipt
        const formData = new FormData();
        formData.append("shippingAddress[details]", shippingAddress.details);
        formData.append("shippingAddress[phone]", shippingAddress.phone);
        formData.append("shippingAddress[city]", shippingAddress.city);
        formData.append("shippingAddress[postalCode]", shippingAddress.postalCode || "");
        formData.append("shippingAddress[country]", shippingAddress.country || "");
        if (paymentReceipt) {
          formData.append("paymentReceipt", paymentReceipt);
        }

        const res = await axios.post(
          `${API_BASE_URL}/api/v1/orders/${safeCartId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            timeout: 30000, // Increased timeout for file upload
          }
        );

        const orderId = res.data?.data?._id;
        if (!orderId) throw new Error("لم يتم استرجاع معرف الطلب");

        toast({ title: "✓ تم إنشاء الطلب بنجاح" });
        navigate(`/order/${orderId}`);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "فشل إنشاء الطلب";
      toast({ title: errorMsg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
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

  if (!cart || safeCartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-500 text-xl mb-4">السلة فارغة</p>
          <Button onClick={() => navigate("/courses")}>العودة للكورسات</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Button
          className="mb-6 bg-gray-500 text-white hover:bg-gray-600"
          onClick={() => navigate("/cart")}
        >
          ← العودة للسلة
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-right">ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="text-right space-y-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {safeCartItems.map((item, idx) => (
                    <div
                      key={item._id}
                      className="text-sm pb-2 border-b"
                    >
                      <p className="font-semibold">
                        {item.product?.title || "منتج"}
                      </p>
                      <p className="text-gray-600">
                        {item.quantity || 1} × ${(item.product?.price ?? 0).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      ${safeTotalPrice.toFixed(2)}
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
                <CardTitle className="text-right">عنوان الشحن</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-4 text-right">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      التفاصيل *
                    </label>
                    <Input
                      type="text"
                      name="details"
                      placeholder="الشارع والمنطقة..."
                      value={shippingAddress.details}
                      onChange={handleInputChange}
                      dir="rtl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      الهاتف *
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="0999999999"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      dir="rtl"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        المدينة *
                      </label>
                      <Input
                        type="text"
                        name="city"
                        placeholder="الخرطوم"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        dir="rtl"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        الرمز البريدي
                      </label>
                      <Input
                        type="text"
                        name="postalCode"
                        placeholder="11111"
                        value={shippingAddress.postalCode}
                        onChange={handleInputChange}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      الدولة
                    </label>
                    <Input
                      type="text"
                      name="country"
                      placeholder="Sudan"
                      value={shippingAddress.country}
                      onChange={handleInputChange}
                      dir="rtl"
                    />
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <label className="block text-sm font-semibold mb-2">
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
                        Stripe (بطاقة)
                      </Button>
                    </div>

                    {paymentMethod === "cash" && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                        <label className="block text-sm font-semibold mb-2 text-blue-800">
                          صورة إشعار التحويل *
                        </label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="bg-white"
                        />
                        <p className="text-xs text-blue-600 mt-2">
                          يرجى إرفاق صورة واضحة لإيصال التحويل البنكي لإتمام الطلب.
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white text-lg py-6 disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? "جاري..." : paymentMethod === "stripe" ? "الذهاب للدفع" : `✓ تأكيد الطلب (${safeTotalPrice.toFixed(2)}$)`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;