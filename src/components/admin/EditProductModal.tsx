import React, { useState, useEffect } from "react";
import { Upload, X, Play, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from '@/config/env';
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { getImageUrl } from "@/utils/imageUtils";
import { CurriculumEditor, Section } from "./CurriculumEditor";

const FIXED_QUANTITY = "1";
const FIXED_CATEGORY = "691f6bd063a0a3709983d118";

export const EditProductModal = ({ product, formData, setFormData, setEditingProduct, fetchProducts, token }) => {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState(null);
  const [videoName, setVideoName] = useState(null);
  const [saving, setSaving] = useState(false);

  // Curriculum State
  const [whatWillYouLearn, setWhatWillYouLearn] = useState<string[]>([]);
  const [curriculum, setCurriculum] = useState<Section[]>([]);

  useEffect(() => {
    if (product) {
      if (product.imageCover) {
        setImagePreview(getImageUrl(product.imageCover));
      }

      // Initialize Curriculum
      if (product.curriculum) {
        setCurriculum(product.curriculum);
      }

      // Initialize What Will You Learn
      if (product.whatWillYouLearn) {
        setWhatWillYouLearn(product.whatWillYouLearn);
      }
    }
  }, [product]);

  const renderText = (value) => {
    if (!value) return "";
    if (typeof value === "string" || typeof value === "number") return value;
    if (typeof value === "object" && "name" in value) return value.name;
    return "";
  };

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      handleInputChange("imageCover", file);

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      handleInputChange("vedios", [file]);
      setVideoName(file.name);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append("title", renderText(formData.title));
    fd.append("description", renderText(formData.description));
    fd.append("quantity", FIXED_QUANTITY);
    fd.append("price", String(formData.price ?? 0));
    fd.append("category", FIXED_CATEGORY);

    // Append Image if it's a File (newly selected)
    if (formData.imageCover instanceof File) {
      fd.append("imageCover", formData.imageCover);
    }

    // Append Video if it's selected
    if (formData.vedios && formData.vedios.length > 0 && formData.vedios[0] instanceof File) {
      fd.append("vedios", formData.vedios[0]);
    }

    // Append What Will You Learn
    if (whatWillYouLearn.length > 0) {
      const validItems = whatWillYouLearn.filter(item => item.trim() !== "");
      validItems.forEach(item => fd.append("whatWillYouLearn", item));
    }

    // Append Curriculum
    if (curriculum.length > 0) {
      curriculum.forEach((section, sIndex) => {
        fd.append(`curriculum[${sIndex}][title]`, section.title);
        section.lectures.forEach((lecture, lIndex) => {
          fd.append(`curriculum[${sIndex}][lectures][${lIndex}][title]`, lecture.title);
          fd.append(`curriculum[${sIndex}][lectures][${lIndex}][video]`, lecture.video);
          fd.append(`curriculum[${sIndex}][lectures][${lIndex}][description]`, lecture.description);
          fd.append(`curriculum[${sIndex}][lectures][${lIndex}][duration]`, lecture.duration.toString());
        });
      });
    }

    try {
      await axios.put(`${API_BASE_URL}/api/v1/products/${product._id}`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "✓ تم تعديل الكورس بنجاح" });
      setEditingProduct(null);
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      toast({ title: err.response?.data?.message || "فشل تعديل الكورس", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto bg-white rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setEditingProduct(null)}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
          <h2 className="text-xl font-bold text-gray-900 text-right">تعديل الكورس</h2>
        </div>

        <div className="space-y-4 text-right">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان الكورس</label>
            <input
              value={renderText(formData.title)}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف</label>
            <textarea
              value={renderText(formData.description)}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-right text-sm resize-none focus:border-blue-500 focus:outline-none"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">السعر</label>
            <input
              type="number"
              value={formData.price || 0}
              onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">صورة الغلاف</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="edit-image-input"
              />
              <label htmlFor="edit-image-input" className="cursor-pointer block">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-32 h-32 mx-auto object-cover rounded-lg border-2 border-gray-200"
                    />
                    <p className="text-xs text-green-600 mt-2 font-medium">✓ تم اختيار الصورة</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-600">اضغط لتغيير الصورة</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الفيديو</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
                id="edit-video-input"
              />
              <label htmlFor="edit-video-input" className="cursor-pointer block">
                {videoName ? (
                  <div>
                    <Play className="mx-auto text-green-600 mb-2" size={32} />
                    <p className="text-sm text-green-600 font-medium">✓ {videoName}</p>
                  </div>
                ) : (
                  <>
                    <Play className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-600">اضغط لتغيير الفيديو</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Curriculum Editor */}
          <div className="pt-4 border-t">
            <CurriculumEditor
              whatWillYouLearn={whatWillYouLearn}
              setWhatWillYouLearn={setWhatWillYouLearn}
              curriculum={curriculum}
              setCurriculum={setCurriculum}
            />
          </div>

        </div>

        <div className="flex justify-start gap-3 mt-6 border-t pt-4">
          <button
            onClick={() => setEditingProduct(null)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
            disabled={saving}
          >
            إلغاء
          </button>
          <button
            onClick={handleSaveEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:bg-blue-400"
            disabled={saving}
          >
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </div>
    </div>
  );
};
