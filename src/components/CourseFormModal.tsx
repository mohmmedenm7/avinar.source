import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

interface Course {
  _id?: string;
  title: string;
  description: string;
  price: number;
  quantity?: number;
  category?: string;
  imageCover?: File | string | null;
  images?: File[] | string[];
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
        res = await axios.put(`http://localhost:8000/api/v1/products/${course._id}`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({ title: "تم تعديل الكورس بنجاح" });
      } else {
        // إضافة
        res = await axios.post("http://localhost:8000/api/v1/products", fd, {
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
      <div className="bg-white p-6 rounded-md w-1/2 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl mb-4">{course ? "تعديل الكورس" : "إضافة كورس جديد"}</h2>
        <div className="grid gap-4">
          <Input
            name="title"
            placeholder="عنوان الكورس"
            value={formData.title}
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="وصف الكورس"
            value={formData.description}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <Input
            name="price"
            type="number"
            placeholder="السعر"
            value={formData.price}
            onChange={handleChange}
          />
          <Input
            name="quantity"
            type="number"
            placeholder="الكمية"
            value={formData.quantity || 1}
            onChange={handleChange}
          />
          <Input
            name="category"
            placeholder="معرّف الفئة (ObjectId)"
            value={formData.category || ""}
            onChange={handleChange}
          />
          <label className="text-sm">صورة الغلاف</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "imageCover")}
          />
          <label className="text-sm">صور إضافية</label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileChange(e, "images")}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button
              className="bg-gray-500 text-white"
              onClick={closeModal}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              className="bg-green-500 text-white"
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
