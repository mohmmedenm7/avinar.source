import { useEffect, useState } from "react";
import { BookOpen, LogOut, Plus, Edit2, Trash2, Users, DollarSign } from "lucide-react";
import { API_BASE_URL } from '@/config/env';

interface Course {
  _id: string;
  title: string;
  description: string;
  price?: number;
  imageCover?: string;
  video?: string;
  category?: { _id: string; name: string };
  studentsCount?: number;
  createdAt?: string;
}

interface StatCard {
  label: string;
  value: number | string;
  icon: "book-open" | "users" | "dollar-sign";
  color: string;
}

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("courses");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    imageCover: null as File | null,
    video: null as File | null,
  });

  const token = localStorage.getItem("token");

  // Show Toast
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch Courses
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCourses(data?.data || []);
    } catch (err: any) {
      const msg = "فشل تحميل الكورسات";
      setError(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      showToast("يرجى تسجيل الدخول أولاً");
      return;
    }
    fetchCourses();
  }, [token]);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category || !formData.price) {
      showToast("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (formData.description.length < 20) {
      showToast("الوصف يجب أن يكون 20 حرف على الأقل");
      return;
    }

    const fd = new FormData();
    fd.append("title", formData.title.trim());
    fd.append("slug", formData.title.toLowerCase().trim().replace(/\s+/g, "-"));
    fd.append("description", formData.description.trim());
    fd.append("price", formData.price);
    fd.append("quantity", "1");
    fd.append("category", formData.category);

    if (formData.imageCover) {
      fd.append("imageCover", formData.imageCover);
    }

    if (formData.video) {
      fd.append("videos", formData.video);
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) throw new Error("فشل إضافة الكورس");

      showToast("✅ تم إضافة الكورس بنجاح");
      setFormData({ title: "", description: "", price: "", category: "", imageCover: null, video: null });
      setActiveTab("courses");
      fetchCourses();
    } catch (err: any) {
      showToast(err.message || "فشل إضافة الكورس");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const fd = new FormData();
    fd.append("title", formData.title.trim());
    fd.append("description", formData.description.trim());
    fd.append("price", formData.price);

    if (formData.imageCover instanceof File) {
      fd.append("imageCover", formData.imageCover);
    }

    if (formData.video instanceof File) {
      fd.append("videos", formData.video);
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/products/${editingCourse._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) throw new Error("فشل تعديل الكورس");

      showToast("✅ تم تعديل الكورس بنجاح");
      setEditingCourse(null);
      setFormData({ title: "", description: "", price: "", category: "", imageCover: null, video: null });
      fetchCourses();
    } catch (err: any) {
      showToast(err.message || "فشل تعديل الكورس");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الكورس؟")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/products/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("فشل حذف الكورس");

      showToast("✅ تم حذف الكورس بنجاح");
      fetchCourses();
    } catch (err: any) {
      showToast(err.message || "فشل حذف الكورس");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price?.toString() || "",
      category: course.category?._id || "",
      imageCover: null,
      video: null,
    });
    setActiveTab("edit");
  };

  const totalCourses = courses.length;
  const totalStudents = courses.reduce((sum, course) => sum + (course.studentsCount || 0), 0);
  const totalRevenue = courses.reduce((sum, course) => sum + (course.price || 0) * (course.studentsCount || 0), 0);

  const iconMap: Record<string, React.ReactNode> = {
    "book-open": <BookOpen size={24} />,
    "users": <Users size={24} />,
    "dollar-sign": <DollarSign size={24} />,
  };

  const statsCards: StatCard[] = [
    { label: "إجمالي الكورسات", value: totalCourses, icon: "book-open", color: "#3B82F6" },
    { label: "إجمالي الطلاب", value: totalStudents, icon: "users", color: "#10B981" },
    { label: "الإيرادات", value: `$${totalRevenue.toFixed(2)}`, icon: "dollar-sign", color: "#F59E0B" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">تسجيل خروج</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم المدرب</h1>

          <div className="text-right">
            <p className="text-sm text-gray-600">مرحباً بك في إدارة كورساتك</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsCards.map((stat, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-300 ${
                stat.icon === "dollar-sign"
                  ? "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300 hover:border-slate-400 hover:shadow-xl"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-2 ${
                      stat.icon === "dollar-sign" ? "text-slate-500" : "text-gray-500"
                    }`}>
                      {stat.label}
                    </p>
                    <p className="text-4xl font-bold text-slate-700 mb-1">
                      {stat.value}
                    </p>
                  </div>
                  {stat.icon === "dollar-sign" ? (
                    <div className="text-4xl ml-4 opacity-30">💳</div>
                  ) : (
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl ml-4 bg-slate-100">
                      <div className="text-slate-400">{iconMap[stat.icon]}</div>
                    </div>
                  )}
                </div>
                <div className="h-1 rounded-full bg-gradient-to-r from-slate-300 to-slate-200"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Tab Buttons */}
          <div className="grid grid-cols-3 gap-0 bg-white border-b border-gray-200">
            {[
              { id: "courses", label: `كورساتي (${totalCourses})` },
              { id: "add", label: "إضافة كورس" },
              { id: "edit", label: "تعديل الكورس" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium text-base transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? "text-gray-900 border-gray-900"
                    : "text-gray-700 border-transparent hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.id === "add" && <Plus size={18} className="inline mr-2" />}
                {tab.id === "edit" && <Edit2 size={18} className="inline mr-2" />}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Courses List */}
            {activeTab === "courses" && (
              <div>
                {loading && courses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-gray-600">جاري تحميل الكورسات...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-700">{error}</p>
                  </div>
                ) : courses.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <div key={course._id} className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                        {course.imageCover && (
                          <img src={course.imageCover} alt={course.title} className="w-full h-40 object-cover" />
                        )}
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                          <div className="space-y-2 mb-4 text-sm text-gray-700">
                            <p>💰 السعر: <span className="font-bold">${course.price}</span></p>
                            <p>👥 الطلاب: <span className="font-bold">{course.studentsCount || 0}</span></p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(course)}
                              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded text-sm font-medium transition"
                            >
                              <Edit2 size={14} className="inline mr-1" /> تعديل
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course._id)}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded text-sm font-medium transition"
                            >
                              <Trash2 size={14} className="inline mr-1" /> حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 text-lg">لا توجد كورسات حتى الآن</p>
                  </div>
                )}
              </div>
            )}

            {/* Add Course Form */}
            {activeTab === "add" && (
              <div className="max-w-2xl mx-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">العنوان *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل عنوان الكورس"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف *</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                      placeholder="أدخل وصف الكورس (20 حرف على الأقل)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">السعر *</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">معرف الفئة *</label>
                      <input
                        type="text"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="691f6bd063a0a3709983d118"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">صورة الغلاف</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, imageCover: e.target.files?.[0] || null })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الفيديو</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setFormData({ ...formData, video: e.target.files?.[0] || null })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <button
                    onClick={handleAddCourse}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:bg-blue-400"
                  >
                    {loading ? "جاري الإضافة..." : "إضافة الكورس"}
                  </button>
                </div>
              </div>
            )}

            {/* Edit Course Form */}
            {activeTab === "edit" && (
              <div className="max-w-2xl mx-auto">
                {editingCourse ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">العنوان *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف *</label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">السعر *</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">صورة الغلاف</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({ ...formData, imageCover: e.target.files?.[0] || null })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">الفيديو</label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setFormData({ ...formData, video: e.target.files?.[0] || null })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleEditCourse}
                        disabled={loading}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold transition disabled:bg-yellow-400"
                      >
                        {loading ? "جاري التعديل..." : "تحديث الكورس"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingCourse(null);
                          setActiveTab("courses");
                        }}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-lg font-semibold transition"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Edit2 size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 text-lg">اختر كورس من القائمة للتعديل عليه</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}