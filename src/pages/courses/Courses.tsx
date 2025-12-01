import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from '@/config/env';
import { getImageUrl } from "@/utils/imageUtils";
import { Heart } from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageCover?: string;
  quantity?: number;
  category?: any;
  isPaid?: boolean;
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  const fetchPaymentStatus = async (productId: string): Promise<boolean> => {
    if (!email || !token) return false;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/cart/status/${email}/product/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.status === "success" && res.data?.data) {
        return res.data.data.isPaid || false;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/categories`);
      setCategories(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch Wishlist
  const fetchWishlist = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const wishlistData = res.data?.data || [];
      setWishlistIds(wishlistData.map((item: any) => item._id));
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchWishlist();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/products`, {
          headers: { Authorization: `Bearer ${token || ""}` },
        });
        const coursesData = res.data?.data || [];

        if (email && token) {
          // Check payment status for all courses in parallel
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
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({ title: "خطأ في جلب الكورسات", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [token, email]);

  // Toggle Wishlist
  const toggleWishlist = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!token) {
      toast({ title: "يرجى تسجيل الدخول أولاً", variant: "destructive" });
      navigate("/login");
      return;
    }

    const isInWishlist = wishlistIds.includes(productId);

    try {
      if (isInWishlist) {
        await axios.delete(`${API_BASE_URL}/api/v1/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlistIds(wishlistIds.filter(id => id !== productId));
        toast({ title: "✓ تم الحذف من قائمة الأمنيات" });
      } else {
        await axios.post(
          `${API_BASE_URL}/api/v1/wishlist`,
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistIds([...wishlistIds, productId]);
        toast({ title: "✓ تمت الإضافة لقائمة الأمنيات" });
      }
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || "حدث خطأ",
        variant: "destructive",
      });
    }
  };

  // Filter Courses - Match by category name since API returns only name
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());

    // Find the selected category name from ID
    const selectedCategoryName = selectedCategory === "all"
      ? "all"
      : categories.find(cat => cat._id === selectedCategory)?.name || "";

    // Extract category name from course
    let courseCategoryName: string | null = null;
    if (course.category) {
      if (typeof course.category === 'string') {
        courseCategoryName = course.category;
      } else if (typeof course.category === 'object' && course.category.name) {
        courseCategoryName = course.category.name;
      }
    }

    const matchesCategory = selectedCategory === "all" ||
      (courseCategoryName && selectedCategoryName && courseCategoryName === selectedCategoryName);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4" dir="rtl">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">الكورسات المتاحة</h1>

      <div className="max-w-4xl mx-auto mb-12 space-y-6">
        <div className="max-w-md mx-auto">
          <Input
            type="text"
            placeholder="ابحث عن كورس..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right bg-white shadow-sm"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-6 ${selectedCategory === "all" ? "bg-blue-600 hover:bg-blue-700" : "bg-white hover:bg-gray-50"}`}
          >
            الكل
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat._id}
              variant={selectedCategory === cat._id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat._id)}
              className={`rounded-full px-6 ${selectedCategory === cat._id ? "bg-blue-600 hover:bg-blue-700" : "bg-white hover:bg-gray-50"}`}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => {
              const isPaid = course.isPaid === true;

              return (
                <Card key={course._id} className="flex flex-col hover:shadow-lg transition-shadow duration-300 border-gray-200 bg-white overflow-hidden group">
                  <CardHeader className="p-0 relative overflow-hidden">
                    <img
                      src={getImageUrl(course.imageCover)}
                      alt={course.title}
                      className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    {isPaid && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        مشترك
                      </div>
                    )}
                    <button
                      onClick={(e) => toggleWishlist(course._id, e)}
                      className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                    >
                      <Heart
                        size={20}
                        className={wishlistIds.includes(course._id) ? "fill-red-500 text-red-500" : "text-gray-400"}
                      />
                    </button>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-grow p-6">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1">{course.title}</CardTitle>
                      <span className="text-blue-600 font-bold text-lg">${course.price}</span>
                    </div>

                    <p className="text-gray-600 mb-6 text-sm line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      {isPaid ? (
                        <Button
                          onClick={() => navigate(`/course/${course._id}`)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg shadow-sm transition-all"
                        >
                          تفضل
                        </Button>
                      ) : (
                        <Button
                          onClick={() => navigate(`/course-details/${course._id}`)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm transition-all"
                        >
                          عرض التفاصيل
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-500 text-lg">لا توجد كورسات متاحة في هذا القسم حالياً.</p>
              <Button
                variant="link"
                onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                className="text-blue-600 mt-2"
              >
                عرض جميع الكورسات
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="text-center mt-16">
        <Button
          variant="outline"
          onClick={() => navigate("/cart")}
          className="border-blue-200 text-blue-700 hover:bg-blue-50 px-8"
        >
          الذهاب إلى السلة
        </Button>
      </div>
    </div>
  );
};

export default CoursesPage;
