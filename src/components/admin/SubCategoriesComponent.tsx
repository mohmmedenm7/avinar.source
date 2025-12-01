import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/config/env";
import { Plus, Edit2, Trash2, X } from "lucide-react";

interface Category {
    _id: string;
    name: string;
}

interface SubCategory {
    _id: string;
    name: string;
    category: string | Category;
    slug?: string;
}

interface SubCategoriesComponentProps {
    token: string;
    searchQuery: string;
}

export const SubCategoriesComponent = ({ token, searchQuery }: SubCategoriesComponentProps) => {
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
    const [formData, setFormData] = useState({ name: "", category: "" });
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("");
    const { toast } = useToast();

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/categories`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(res.data?.data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchSubCategories = async () => {
        setLoading(true);
        try {
            const url = selectedCategoryFilter
                ? `${API_BASE_URL}/api/v1/categories/${selectedCategoryFilter}/subcategories`
                : `${API_BASE_URL}/api/v1/subcategories`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSubCategories(res.data?.data || []);
        } catch (error: any) {
            toast({
                title: "خطأ في جلب الفئات الفرعية",
                description: error.response?.data?.message || "حدث خطأ",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [token]);

    useEffect(() => {
        fetchSubCategories();
    }, [token, selectedCategoryFilter]);

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.category) {
            toast({ title: "يرجى إدخال جميع البيانات", variant: "destructive" });
            return;
        }

        try {
            if (editingSubCategory) {
                await axios.put(
                    `${API_BASE_URL}/api/v1/subcategories/${editingSubCategory._id}`,
                    { name: formData.name, category: formData.category },
                    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
                );
                toast({ title: "✓ تم تعديل الفئة الفرعية بنجاح" });
            } else {
                await axios.post(
                    `${API_BASE_URL}/api/v1/subcategories`,
                    { name: formData.name, category: formData.category },
                    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
                );
                toast({ title: "✓ تم إضافة الفئة الفرعية بنجاح" });
            }

            setShowModal(false);
            setEditingSubCategory(null);
            setFormData({ name: "", category: "" });
            fetchSubCategories();
        } catch (error: any) {
            toast({
                title: editingSubCategory ? "فشل تعديل الفئة الفرعية" : "فشل إضافة الفئة الفرعية",
                description: error.response?.data?.message || "حدث خطأ",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه الفئة الفرعية؟")) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/v1/subcategories/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast({ title: "✓ تم حذف الفئة الفرعية بنجاح" });
            fetchSubCategories();
        } catch (error: any) {
            toast({
                title: "فشل حذف الفئة الفرعية",
                description: error.response?.data?.message || "حدث خطأ",
                variant: "destructive",
            });
        }
    };

    const openEditModal = (subCategory: SubCategory) => {
        setEditingSubCategory(subCategory);
        setFormData({
            name: subCategory.name,
            category: typeof subCategory.category === "string" ? subCategory.category : subCategory.category._id,
        });
        setShowModal(true);
    };

    const openAddModal = () => {
        setEditingSubCategory(null);
        setFormData({ name: "", category: "" });
        setShowModal(true);
    };

    const getCategoryName = (category: string | Category): string => {
        if (typeof category === "string") {
            const cat = categories.find((c) => c._id === category);
            return cat?.name || "غير معروف";
        }
        return category.name;
    };

    const filteredSubCategories = subCategories.filter((subCat) =>
        subCat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
                    <Plus size={20} className="ml-2" />
                    إضافة فئة فرعية
                </Button>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">تصفية حسب الفئة:</label>
                    <select
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">جميع الفئات</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">جاري التحميل...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700 border-b">الاسم</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700 border-b">الفئة الرئيسية</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700 border-b">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubCategories.length > 0 ? (
                                filteredSubCategories.map((subCategory) => (
                                    <tr key={subCategory._id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{subCategory.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{getCategoryName(subCategory.category)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditModal(subCategory)}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(subCategory._id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                        لا توجد فئات فرعية
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md p-6 bg-white">
                        <div className="flex justify-between items-center mb-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </Button>
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingSubCategory ? "تعديل الفئة الفرعية" : "إضافة فئة فرعية جديدة"}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                    اسم الفئة الفرعية
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="مثال: تطوير الويب"
                                    className="text-right"
                                    dir="rtl"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                    الفئة الرئيسية
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right"
                                    dir="rtl"
                                >
                                    <option value="">اختر الفئة</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={() => setShowModal(false)}
                                variant="outline"
                                className="flex-1"
                            >
                                إلغاء
                            </Button>
                            <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">
                                {editingSubCategory ? "حفظ التعديلات" : "إضافة"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
