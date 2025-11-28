import { useEffect, useState } from "react";
import { BookOpen, LogOut, Users, DollarSign, Search, LayoutDashboard, GraduationCap } from "lucide-react";
import { API_BASE_URL } from '@/config/env';
import { ProductsComponent } from "@/components/admin/ProductsComponent";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

interface Course {
  _id: string;
  title: string;
  price: number;
  studentsCount?: number;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  courseTitle: string;
  joinedAt: string;
}

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  // Fetch Courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const url = userId
        ? `${API_BASE_URL}/api/v1/products?instructor=${userId}`
        : `${API_BASE_URL}/api/v1/products`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch courses", err);
      toast({
        title: "خطأ",
        description: "فشل تحميل الكورسات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Students (Derived from Orders)
  const fetchStudents = async () => {
    try {
      // Note: In a real app, there should be a dedicated endpoint for instructor students.
      // Here we fetch all orders and filter them client-side as a workaround.
      const res = await axios.get(`${API_BASE_URL}/api/v1/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orders = res.data?.data || [];
      const myStudents: Student[] = [];
      const myCourseIds = new Set(courses.map(c => c._id));

      orders.forEach((order: any) => {
        if (!order.isPaid) return;

        order.cartItems.forEach((item: any) => {
          if (myCourseIds.has(item.product?._id)) {
            myStudents.push({
              _id: order.user?._id || Math.random().toString(),
              name: order.user?.name || "Unknown",
              email: order.user?.email || "Unknown",
              courseTitle: item.product?.title || "Unknown Course",
              joinedAt: order.createdAt || new Date().toISOString(),
            });
          }
        });
      });

      // Remove duplicates (same student in same course)
      const uniqueStudents = myStudents.filter((student, index, self) =>
        index === self.findIndex((t) => (
          t.email === student.email && t.courseTitle === student.courseTitle
        ))
      );

      setStudents(uniqueStudents);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCourses();
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "students" && courses.length > 0) {
      fetchStudents();
    }
  }, [activeTab, courses]);

  const totalCourses = courses.length;
  // Calculate total students from course stats if available, otherwise fallback to 0
  const totalStudentsCount = courses.reduce((sum, course) => sum + (course.studentsCount || 0), 0);
  const totalRevenue = courses.reduce((sum, course) => sum + (course.price || 0) * (course.studentsCount || 0), 0);

  const stats = [
    { label: "إجمالي الكورسات", value: totalCourses, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "إجمالي الطلاب", value: totalStudentsCount, icon: Users, color: "text-green-600", bg: "bg-green-100" },
    { label: "الإيرادات المقدرة", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-yellow-600", bg: "bg-yellow-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-20" dir="rtl">
      <div className="flex">
        {/* Sidebar (Right) */}
        <aside className="w-64 bg-white border-l border-gray-200 min-h-[calc(100vh-80px)] fixed right-0 top-20 hidden md:block">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">لوحة التحكم</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("courses")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "courses"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <LayoutDashboard size={20} />
                إدارة الكورسات
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "students"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <GraduationCap size={20} />
                الطلاب المسجلين
              </button>
            </nav>
          </div>

          <div className="absolute bottom-0 w-full p-6 border-t border-gray-100">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 gap-3"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
            >
              <LogOut size={20} />
              تسجيل خروج
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:mr-64 p-8">
          {/* Mobile Header (Visible only on small screens) */}
          <div className="md:hidden mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم المدرب</h1>
            {/* Mobile Menu Trigger could go here if needed */}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <Card key={idx} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] p-6">
            {activeTab === "courses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">إدارة الكورسات</h2>
                  <div className="relative w-64">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="بحث..."
                      className="pr-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <ProductsComponent
                  products={courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))}
                  token={token}
                  fetchProducts={fetchCourses}
                  searchQuery={searchQuery}
                />
              </div>
            )}

            {activeTab === "students" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">قائمة الطلاب</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{students.length} طالب</span>
                </div>

                {students.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>لا يوجد طلاب مسجلين حتى الآن</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                        <tr>
                          <th className="px-6 py-3 rounded-r-lg">الاسم</th>
                          <th className="px-6 py-3">البريد الإلكتروني</th>
                          <th className="px-6 py-3">الكورس</th>
                          <th className="px-6 py-3 rounded-l-lg">تاريخ التسجيل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((student, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                            <td className="px-6 py-4 text-gray-600">{student.email}</td>
                            <td className="px-6 py-4 text-blue-600 font-medium">{student.courseTitle}</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">
                              {new Date(student.joinedAt).toLocaleDateString('ar-EG')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}