import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface CartItem {
  _id: string;
  product?: {
    _id: string;
    title: string;
    price: number;
    imageCover?: string;
  };
  quantity?: number;
  color?: string;
}

interface Cart {
  _id: string;
  cartItems?: CartItem[];
  totalCartPrice?: number;
  totalPriceAfterDiscount?: number;
}

const CartPage = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Safe extraction
  const safeCartItems = cart?.cartItems || [];
  const safeTotalPrice = cart?.totalCartPrice ?? 0;
  const safeTotalAfterDiscount = cart?.totalPriceAfterDiscount ?? null;
  const safeCartId = cart?._id;

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
    setError(null);
    try {
      const res = await axios.get("http://localhost:8000/api/v1/cart", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      const cartData = res.data?.data || null;
      
      if (!cartData || !cartData._id) {
        setCart(null);
        setError("السلة فارغة أو غير صحيحة");
        return;
      }

      setCart(cartData);
    } catch (err: any) {
      console.error("Fetch Cart Error:", err);
      const errorMsg =
        err.response?.data?.message || "خطأ في جلب السلة";
      setError(errorMsg);
      toast({ title: errorMsg, variant: "destructive" });
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!itemId) {
      toast({ title: "معرف العنصر غير صحيح" });
      return;
    }

    setRemovingId(itemId);
    try {
      await axios.delete(
        `http://localhost:8000/api/v1/cart/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      // ✅ حل آمن: إعادة تحميل السلة كاملة بدلاً من التعديل اليدوي
      await fetchCart();
      toast({ title: "✓ تم حذف الكورس من السلة" });
    } catch (err: any) {
      console.error("Remove Item Error:", err);
      const errorMsg =
        err.response?.data?.message || "فشل حذف الكورس";
      toast({ title: errorMsg, variant: "destructive" });
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = () => {
    if (!safeCartId) {
      toast({ title: "السلة فارغة أو غير صحيحة", variant: "destructive" });
      return;
    }

    if (safeCartItems.length === 0) {
      toast({ title: "لا يوجد منتجات في السلة" });
      return;
    }

    navigate("/checkout");
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

  if (error || !cart || safeCartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-500 text-xl mb-4">
            {error || "السلة فارغة"}
          </p>
          <Button
            className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => navigate("/courses")}
          >
            العودة للكورسات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          className="mb-6 bg-gray-500 text-white hover:bg-gray-600"
          onClick={() => navigate("/courses")}
        >
          ← العودة للكورسات
        </Button>

        <h1 className="text-4xl font-bold text-right mb-8">سلة المشتريات</h1>

        <div className="space-y-4">
          {/* Cart Items */}
          {safeCartItems.map((item) => {
            const product = item?.product;
            const productTitle = product?.title || "منتج بدون اسم";
            const productPrice = product?.price ?? 0;
            const quantity = item?.quantity ?? 1;
            const itemTotal = productPrice * quantity;

            return (
              <Card key={item._id} className="p-4">
                <div className="flex justify-between items-center">
                  <Button
                    onClick={() => handleRemove(item._id)}
                    disabled={removingId === item._id}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    {removingId === item._id ? "جاري الحذف..." : "حذف"}
                  </Button>

                  <div className="text-right flex-grow pr-4">
                    <p className="font-semibold text-lg">{productTitle}</p>
                    <p className="text-sm text-gray-600">
                      الكمية: {quantity} × ${productPrice.toFixed(2)}
                    </p>
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      ${itemTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Summary */}
          <Card className="bg-blue-50 p-6 mt-8">
            <div className="space-y-3 text-right">
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-blue-600">
                  ${safeTotalPrice.toFixed(2)}
                </span>
                <span className="font-semibold text-gray-900">المجموع:</span>
              </div>

              {safeTotalAfterDiscount && (
                <div className="flex justify-between items-center text-lg border-t pt-3">
                  <span className="font-bold text-green-600">
                    ${safeTotalAfterDiscount.toFixed(2)}
                  </span>
                  <span className="font-semibold text-gray-900">
                    بعد الخصم:
                  </span>
                </div>
              )}

              <p className="text-xs text-gray-600 mt-4">
                {safeCartItems.length} منتجات
              </p>
            </div>
          </Card>

          {/* Checkout Button */}
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg py-6 font-semibold rounded-lg mt-6"
            onClick={handleCheckout}
            disabled={safeCartItems.length === 0}
          >
            ✓ متابعة للدفع (${safeTotalPrice.toFixed(2)})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;