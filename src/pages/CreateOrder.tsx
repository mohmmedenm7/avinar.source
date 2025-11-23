import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import StripeCheckout from "./StripeCheckout";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageCover?: string;
  instructor?: string | { name: string };
}

const CreateOrder = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
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

    fetchProduct();
  }, [courseId, token]);

  const fetchProduct = async () => {
    if (!courseId) {
      setError("معرّف الكورس غير صحيح");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/products/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data.data || res.data;
      setProduct(data);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "فشل جلب تفاصيل الكورس";
      setError(errorMsg);
      toast({ title: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/orders/${courseId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newOrderId = res.data.data?._id || res.data._id;
      setOrderId(newOrderId);
      toast({ title: "تم إنشاء الطلب بنجاح" });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "فشل إنشاء الطلب";
      toast({ title: errorMsg });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                className="bg-blue-500 text-white"
                onClick={() => navigate("/courses")}
              >
                العودة إلى الكورسات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          className="mb-4 bg-gray-500 text-white"
          onClick={() => navigate("/courses")}
        >
          ← العودة
        </Button>

        {product && (
          <Card>
            <CardHeader>
              <CardTitle className="text-right">تفاصيل الطلب</CardTitle>
            </CardHeader>
            <CardContent className="text-right">
              {product.imageCover && (
                <img
                  src={product.imageCover}
                  alt={product.title}
                  className="w-full h-64 object-cover rounded mb-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}

              <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
              <p className="text-gray-600 mb-4">{product.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-100 p-4 rounded">
                  <p className="text-sm text-gray-600">المدرب</p>
                  <p className="text-lg font-semibold">
                    {typeof product.instructor === "string"
                      ? product.instructor
                      : product.instructor?.name || "غير محدد"}
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <p className="text-sm text-gray-600">السعر</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${product.price}
                  </p>
                </div>
              </div>

              {!orderId ? (
                <Button
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleCreateOrder}
                  disabled={loading}
                >
                  {loading ? "جاري الإنشاء..." : "إنشاء الطلب"}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-100 p-4 rounded text-center">
                    <p className="text-green-800 font-semibold">
                      تم إنشاء الطلب بنجاح!
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      رقم الطلب: {orderId.slice(-6)}
                    </p>
                  </div>
                  <StripeCheckout orderId={orderId} />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateOrder;