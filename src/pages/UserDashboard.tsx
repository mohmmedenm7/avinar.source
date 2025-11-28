import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { LogOut, Library, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/utils/imageUtils";

const UserDashboard = () => {
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("my");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Note: This still uses localStorage as per original file. 
    // In a real app, this should fetch from API.
    const storedEnrolled = JSON.parse(localStorage.getItem("myCourses") || "[]");
    setMyCourses(storedEnrolled);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-20" dir="rtl">
      <div className="flex">
        {/* Sidebar (Right) */}
        <aside className="w-64 bg-white border-l border-gray-200 min-h-[calc(100vh-80px)] fixed right-0 top-20 hidden md:block">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">لوحة المستخدم</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("my")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "my"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Library size={20} />
                كورساتي
              </button>
              <button
                onClick={() => setActiveTab("progress")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "progress"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <TrendingUp size={20} />
                التقدم
              </button>
            </nav>
          </div>

          <div className="absolute bottom-0 w-full p-6 border-t border-gray-100">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 gap-3"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              تسجيل خروج
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:mr-64 p-8">
          {/* Mobile Header */}
          <div className="md:hidden mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">لوحة المستخدم</h1>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] p-6">
            {activeTab === "my" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">كورساتي المسجلة</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCourses.length > 0 ? (
                    myCourses.map((course) => (
                      <Card key={course.id || course._id} className="flex flex-col hover:shadow-md transition-shadow">
                        <CardHeader className="p-0">
                          <img
                            src={getImageUrl(course.imageCover || course.imageUrl)}
                            alt={course.title}
                            className="w-full h-48 object-cover rounded-t-xl"
                          />
                        </CardHeader>

                        <CardContent className="flex flex-col flex-grow p-6">
                          <CardTitle className="text-right text-lg mb-2">{course.title}</CardTitle>
                          <p className="text-right text-gray-600 mb-4 text-sm line-clamp-2">
                            {course.description}
                          </p>
                          <div className="mt-auto">
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => navigate(`/course/${course.id || course._id}`)}
                            >
                              تم الدفع - عرض الكورس
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      <Library size={48} className="mx-auto mb-4 opacity-20" />
                      <p>لم تسجل في أي كورس بعد</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "progress" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">تقدمي في الكورسات</h2>
                </div>

                <div className="text-center py-12 text-gray-500">
                  <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
                  <p>لا توجد بيانات تقدم حالياً</p>
                  <p className="text-sm mt-2">ابدأ بمشاهدة الكورسات لتتبع تقدمك هنا</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
