import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { API_BASE_URL } from '@/config/env';
import { CurriculumEditor, Section } from "@/components/admin/CurriculumEditor";
import { Video, Link as LinkIcon, Upload, Gift } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Course {
  _id?: string;
  title: string;
  description: string;
  price: number;
  isFree?: boolean;
  quantity?: number;
  category?: string;
  imageCover?: File | string | null;
  images?: File[] | string[];
  whatWillYouLearn?: string[];
  curriculum?: Section[];
  previewVideo?: File | string | null;
  previewVideoUrl?: string;
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
    isFree: false,
    quantity: 1,
    category: "",
    imageCover: null,
    images: [],
    whatWillYouLearn: [],
    curriculum: [],
    previewVideo: null,
    previewVideoUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [videoInputType, setVideoInputType] = useState<'file' | 'url'>('url');
  const { toast } = useToast();
  const token = localStorage.getItem("token");
  const instructorId = localStorage.getItem("instructorId");

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        price: course.price,
        isFree: course.isFree || false,
        quantity: course.quantity || 1,
        category: course.category as string || "",
        imageCover: course.imageCover || null,
        images: course.images || [],
        whatWillYouLearn: course.whatWillYouLearn || [],
        curriculum: course.curriculum || [],
        previewVideo: course.previewVideo || null,
        previewVideoUrl: course.previewVideoUrl || "",
      });
      // Set input type based on existing data
      if (course.previewVideoUrl) setVideoInputType('url');
      else if (course.previewVideo) setVideoInputType('file');
    }
  }, [course]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "imageCover" | "images" | "previewVideo"
  ) => {
    if (field === "imageCover") {
      setFormData({ ...formData, imageCover: e.target.files?.[0] || null });
    } else if (field === "previewVideo") {
      setFormData({ ...formData, previewVideo: e.target.files?.[0] || null });
    } else {
      setFormData({
        ...formData,
        images: e.target.files ? Array.from(e.target.files) : [],
      });
    }
  };

  const handleSubmit = async () => {
    // Validation - price not required for free courses
    if (!formData.title || !formData.description || !formData.category) {
      toast({ title: "يرجى ملء جميع الحقول المطلوبة" });
      return;
    }

    if (!formData.isFree && (!formData.price || formData.price <= 0)) {
      toast({ title: "يرجى تحديد سعر الكورس أو اختيار كورس مجاني" });
      return;
    }

    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("price", (formData.isFree ? 0 : formData.price).toString());
    fd.append("isFree", formData.isFree ? "true" : "false");
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

    // Preview Video - either file or URL
    if (formData.previewVideo instanceof File) {
      fd.append("previewVideo", formData.previewVideo);
    }
    if (formData.previewVideoUrl && formData.previewVideoUrl.trim()) {
      fd.append("previewVideoUrl", formData.previewVideoUrl.trim());
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
              {/* Free Course Toggle */}
              <div className="md:col-span-2 flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-green-600" />
                  <div>
                    <Label htmlFor="isFree" className="text-sm font-bold text-green-800">كورس مجاني</Label>
                    <p className="text-xs text-green-600">تفعيل هذا الخيار يجعل الكورس متاحاً مجاناً للجميع</p>
                  </div>
                </div>
                <Switch
                  id="isFree"
                  checked={formData.isFree || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked, price: checked ? 0 : formData.price })}
                />
              </div>

              <div className={formData.isFree ? "opacity-50 pointer-events-none" : ""}>
                <label className="text-sm font-medium mb-1 block">السعر {formData.isFree && <span className="text-green-600 text-xs">(مجاني)</span>}</label>
                <Input
                  name="price"
                  type="number"
                  placeholder="السعر"
                  value={formData.isFree ? 0 : formData.price}
                  onChange={handleChange}
                  disabled={formData.isFree}
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

          {/* Preview Video Section */}
          <div className="space-y-4 border p-4 rounded-lg bg-purple-50/50">
            <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-600" />
              فيديو التشويق (اختياري)
            </h3>
            <p className="text-sm text-gray-500">
              هذا الفيديو يظهر عند مرور الماوس على بطاقة الكورس لجذب انتباه الطلاب.
            </p>

            {/* Toggle between file and URL */}
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={videoInputType === 'url' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVideoInputType('url')}
                className="flex items-center gap-2"
              >
                <LinkIcon size={16} /> رابط خارجي (YouTube)
              </Button>
              <Button
                type="button"
                variant={videoInputType === 'file' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVideoInputType('file')}
                className="flex items-center gap-2"
              >
                <Upload size={16} /> رفع ملف
              </Button>
            </div>

            {videoInputType === 'url' ? (
              <div>
                <label className="text-sm font-medium mb-1 block">رابط الفيديو (YouTube, Vimeo, إلخ)</label>
                <Input
                  name="previewVideoUrl"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.previewVideoUrl || ""}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium mb-1 block">رفع ملف فيديو</label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, "previewVideo")}
                />
                {formData.previewVideo && typeof formData.previewVideo === 'string' && (
                  <p className="text-xs text-green-600 mt-1">فيديو حالي: {formData.previewVideo}</p>
                )}
              </div>
            )}
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
