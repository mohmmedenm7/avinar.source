import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { API_BASE_URL } from '@/config/env';
import { CurriculumEditor, Section } from "@/components/admin/CurriculumEditor";

interface Course {
  _id?: string;
  title: string;
  description: string;
  price: number;
  quantity?: number;
  category?: string;
  imageCover?: File | string | null;
  images?: File[] | string[];
  whatWillYouLearn?: string[];
  curriculum?: Section[];
}

interface Props {
  course?: Course | null; // موجود إذا للتعديل
  closeModal: () => void;
  fetchCourses: () => void;
}

const CourseFormModal = ({ course, closeModal, fetchCourses }: Props) => {
  const [formData, setFormData] = useState<Course>({
    title: "",
    description: "",
    price: 0,
    quantity: 1,
    category: "",
    imageCover: null,
    images: [],
    whatWillYouLearn: [],
    curriculum: [],
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const token = localStorage.getItem("token");
  const instructorId = localStorage.getItem("instructorId");

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        price: course.price,
        quantity: course.quantity || 1,
        category: course.category as string || "",
        imageCover: course.imageCover || null,
        images: course.images || [],
        whatWillYouLearn: course.whatWillYouLearn || [],
        curriculum: course.curriculum || [],
      });
    }
  }, [course]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "imageCover" | "images"
  ) => {
    if (field === "imageCover") {
      setFormData({ ...formData, imageCover: e.target.files?.[0] || null });
    } else {
      setFormData({
        ...formData,
        images: e.target.files ? Array.from(e.target.files) : [],
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      toast({ title: "يرجى ملء جميع الحقول المطلوبة" });
      return;
    }

    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("price", formData.price.toString());
    fd.append("quantity", (formData.quantity || 1).toString());
    fd.append("category", formData.category);
    fd.append("instructor", instructorId || "");

    // Append complex data
    if (formData.whatWillYouLearn && formData.whatWillYouLearn.length > 0) {
      const validItems = formData.whatWillYouLearn.filter(item => item.trim() !== "");
      validItems.forEach(item => fd.append("whatWillYouLearn", item));
    }

    if (formData.curriculum && formData.curriculum.length > 0) {
      fd.append("curriculum", JSON.stringify(formData.curriculum));
    }

    if (formData.imageCover instanceof File) fd.append("imageCover", formData.imageCover);
    if (Array.isArray(formData.images)) {
      formData.images.forEach((img) => {
        if (img instanceof File) fd.append("images", img);
      });
    }

    setLoading(true);
    try {
      let res;
      if (course?._id) {
        // تعديل
        res = await axios.put(`${API_BASE_URL}/api/v1/products/${course._id}`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({ title: "تم تعديل الكورس بنجاح" });
      } else {
        // إضافة
        res = await axios.post(`${API_BASE_URL}/api/v1/products`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({ title: "تم إضافة الكورس بنجاح" });
      }
      fetchCourses();
      closeModal();
    } catch (err: any) {
      console.error(err);
      toast({ title: err.response?.data?.message || "حدث خطأ" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md w-3/4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl mb-4 font-bold text-center">{course ? "تعديل الكورس" : "إضافة كورس جديد"}</h2>

        <div className="grid gap-6">
          {/* Basic Info Section */}
          <div className="space-y-4 border p-4 rounded-lg">
            <h3 className="font-semibold text-lg border-b pb-2">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">عنوان الكورس</label>
                <Input
                  name="title"
                  placeholder="عنوان الكورس"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">السعر</label>
                <Input
                  name="price"
                  type="number"
                  placeholder="السعر"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الكمية</label>
                <Input
                  name="quantity"
                  type="number"
                  placeholder="الكمية"
                  value={formData.quantity || 1}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الفئة (ID)</label>
                <Input
                  name="category"
                  placeholder="معرّف الفئة (ObjectId)"
                  value={formData.category || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">الوصف</label>
              <textarea
                name="description"
                placeholder="وصف الكورس"
                value={formData.description}
                onChange={handleChange}
                className="w-full border p-2 rounded min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">صورة الغلاف</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "imageCover")}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">صور إضافية</label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, "images")}
                />
              </div>
            </div>
          </div>

          {/* Curriculum Editor Section */}
          <CurriculumEditor
            whatWillYouLearn={formData.whatWillYouLearn || []}
            setWhatWillYouLearn={(items) => setFormData({ ...formData, whatWillYouLearn: items })}
            curriculum={formData.curriculum || []}
            setCurriculum={(sections) => setFormData({ ...formData, curriculum: sections })}
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4 sticky bottom-0 bg-white p-4 border-t">
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "جاري الحفظ..." : course ? "حفظ التعديلات" : "إضافة الكورس"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseFormModal;
