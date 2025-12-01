import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/config/env";
import { getImageUrl } from "@/utils/imageUtils";
import { Plus, Edit2, Trash2, Upload, X } from "lucide-react";

interface Category {
    _id: string;
    name: string;
    image?: string;
    slug?: string;
    createdAt?: string;
}

interface CategoriesComponentProps {
    token: string;
    searchQuery: string;
}

export const CategoriesComponent = ({ token, searchQuery }: CategoriesComponentProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: "", image: null as File | null });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/categories`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(res.data?.data || []);
        } catch (error: any) {
            toast({
                title: "خطأ في جلب الفئات",
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, image: file });

            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast({ title: "يرجى إدخال اسم الفئة", variant: "destructive" });
            return;
        }

        const fd = new FormData();
        fd.append("name", formData.name);
        if (formData.image) {
            fd.append("image", formData.image);
        }

        try {
            if (editingCategory) {
                await axios.put(`${API_BASE_URL}/api/v1/categories/${editingCategory._id}`, fd, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast({ title: "✓ تم تعديل الفئة بنجاح" });
            } else {
                await axios.post(`${API_BASE_URL}/api/v1/categories`, fd, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast({ title: "✓ تم إضافة الفئة بنجاح" });
            }

            setShowModal(false);
            setEditingCategory(null);
            setFormData({ name: "", image: null });
            setImagePreview(null);
            fetchCategories();
        } catch (error: any) {
            toast({
                title: editingCategory ? "فشل تعديل الفئة" : "فشل إضافة الفئة",
                description: error.response?.data?.message || "حدث خطأ",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه الفئة؟")) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/v1/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast({ title: "✓ تم حذف الفئة بنجاح" });
            fetchCategories();
        } catch (error: any) {
            toast({
                title: "فشل حذف الفئة",
                description: error.response?.data?.message || "حدث خطأ",
                variant: "destructive",
            });
        }
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, image: null });
        setImagePreview(category.image ? getImageUrl(category.image) : null);
        setShowModal(true);
    };

    const openAddModal = () => {
        setEditingCategory(null);
        setFormData({ name: "", image: null });
        setImagePreview(null);
        setShowModal(true);
    };

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
                    <Plus size={20} className="ml-2" />
                    إضافة فئة جديدة
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-12">جاري التحميل...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700 border-b">الصورة</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700 border-b">الاسم</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-700 border-b">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((category) => (
                                    <tr key={category._id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            {category.image ? (
                                                <img
                                                    src={getImageUrl(category.image)}
                                                    alt={category.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">لا صورة</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditModal(category)}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(category._id)}
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
                                        لا توجد فئات
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
                                {editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                    اسم الفئة
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="مثال: البرمجة"
                                    className="text-right"
                                    dir="rtl"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                    صورة الفئة
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="category-image"
                                    />
                                    <label htmlFor="category-image" className="cursor-pointer block">
                                        {imagePreview ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={imagePreview}
                                                    alt="preview"
                                                    className="w-32 h-32 mx-auto object-cover rounded-lg"
                                                />
                                                <p className="text-xs text-green-600 mt-2">✓ تم اختيار الصورة</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                                                <p className="text-sm text-gray-600">اضغط لاختيار صورة</p>
                                            </>
                                        )}
                                    </label>
                                </div>
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
                                {editingCategory ? "حفظ التعديلات" : "إضافة"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
