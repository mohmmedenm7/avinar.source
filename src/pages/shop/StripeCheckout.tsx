import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { useState } from "react";
import { API_BASE_URL } from '@/config/env';

interface Props {
  orderId: string;
}

const StripeCheckout = ({ orderId }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/orders/checkout-session/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast({ title: "فشل الحصول على رابط الدفع" });
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "فشل إنشاء جلسة الدفع";
      toast({ title: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className="w-full bg-purple-500 hover:bg-purple-600 text-white"
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? "جاري التحضير..." : "الدفع عبر Stripe"}
    </Button>
  );
};

export default StripeCheckout;