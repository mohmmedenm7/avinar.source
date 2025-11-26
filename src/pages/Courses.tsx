import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from '@/config/env';



interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageCover?: string;
  quantity?: number;
  isPaid?: boolean; // حالة الدفع من الباك اند
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  // دالة لجلب حالة الدفع لكورس معين
  const fetchPaymentStatus = async (productId: string): Promise<boolean> => {
    if (!email || !token) return false;
 
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/cart/status/${email}/product/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // التحقق من الاستجابة
      if (res.data?.status === "success" && res.data?.data) {
        return res.data.data.isPaid || false;
      }
      return false;
    } catch (error) {
      console.error(`خطأ في جلب حالة الدفع للمنتج ${productId}:`, error);
      return false;
    }
  };

  useEffect(() => {
    const fetchCoursesWithPaymentStatus = async () => {
      setLoading(true);
      try {
        // جلب الكورسات
        const res = await axios.get(`${API_BASE_URL}/api/v1/products`, {
          headers: { Authorization: `Bearer ${token || ""}` },
        });
        const coursesData = res.data?.data || [];

        // جلب حالة الدفع لكل كورس
        if (email && token) {
          const coursesWithStatus = await Promise.all(
            coursesData.map(async (course: Course) => {
              const isPaid = await fetchPaymentStatus(course._id);
              return { ...course, isPaid };
            })
          );
          setCourses(coursesWithStatus);
        } else {
          setCourses(coursesData);
        }
      } catch {
        toast({ title: "خطأ في جلب الكورسات", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCoursesWithPaymentStatus();
  }, [token, email]);

  const handleAddToCart = async (courseId: string) => {
    if (!token) {
      toast({ title: "يرجى تسجيل الدخول أولاً" });
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/cart`,
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
  const isPaid = course.isPaid === true;

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

     {isPaid ? (
  <Button
    onClick={() => navigate(`/course/${course._id}`)}
    className="w-full bg-green-600 hover:bg-green-700"
  >
    تم الدفع - عرض الكورس
  </Button>
) : (
  <Button
    onClick={() => handleAddToCart(course._id)}
    className="w-full bg-blue-600 hover:bg-blue-700"
  >
    أضف للسلة
  </Button>
)}

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
