import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageCover?: string;
  quantity?: number;
  status?: string; // "paid" أو "pending"
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8000/api/v1/products", {
          headers: { Authorization: `Bearer ${token || ""}` },
        });
        setCourses(res.data?.data || []);
      } catch {
        toast({ title: "خطأ في جلب الكورسات", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [token]);

  const handleAddToCart = async (courseId: string) => {
    if (!token) {
      toast({ title: "يرجى تسجيل الدخول أولاً" });
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/api/v1/cart",
        { productId: courseId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "تمت إضافة الكورس للسلة بنجاح" });
    } catch (err: any) {
      console.error(err.response || err);
      toast({ title: err.response?.data?.message || "فشل إضافة الكورس للسلة", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <h1 className="text-4xl font-bold text-center mb-12">الكورسات المتاحة</h1>

      {loading && <p className="text-center">جاري التحميل...</p>}

      <div className="grid md:grid-cols-3 gap-8">
        {courses.map((course) => {
          const isPaid = course.status === "paid";

          return (
            <Card key={course._id} className="flex flex-col">
              <CardHeader className="p-0">
                <img
                  src={course.imageCover || "/placeholder-course.png"}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <CardTitle className="text-right">{course.title}</CardTitle>
                <p className="text-right text-gray-600 mb-4 text-sm">{course.description}</p>
                <p className="text-right font-bold text-gray-600 mb-2">${course.price}</p>

                <Button
                  onClick={() => !isPaid && handleAddToCart(course._id)}
                  disabled={isPaid}
                  className={`w-full ${
                    isPaid ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isPaid ? "تم الدفع" : "أضف للسلة"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <Button onClick={() => navigate("/cart")}>عرض السلة</Button>
      </div>
    </div>
  );
};

export default CoursesPage;
