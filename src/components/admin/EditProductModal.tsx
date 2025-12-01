import React, { useState, useEffect } from "react";
import { Upload, X, Play, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from '@/config/env';
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { getImageUrl } from "@/utils/imageUtils";
import { CurriculumEditor, Section } from "./CurriculumEditor";
import { QuizEditor, QuizData } from "./QuizEditor";

const FIXED_QUANTITY = "1";

export const EditProductModal = ({ product, formData, setFormData, setEditingProduct, fetchProducts, token }) => {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState(null);
  const [videoName, setVideoName] = useState(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // Curriculum State
  const [whatWillYouLearn, setWhatWillYouLearn] = useState<string[]>([]);
  const [curriculum, setCurriculum] = useState<Section[]>([]);

  // Quiz State
  const [quizData, setQuizData] = useState<QuizData>({
    title: "",
    questions: [],
  });
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [existingQuizId, setExistingQuizId] = useState<string | null>(null);

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

      // Initialize Category
      if (product.category) {
        const categoryId = typeof product.category === 'object' ? product.category._id : product.category;
        setFormData(prev => ({ ...prev, category: categoryId }));
      }

      // Fetch Quiz
      fetchQuiz(product._id);
    }
    fetchCategories();
  }, [product]);

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

  const fetchQuiz = async (productId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/products/${productId}/quizzes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assuming the API returns an array of quizzes or a single quiz object
      // Based on typical REST patterns, it might be an array.
      // If it returns { data: [quiz1, quiz2] } or { data: quiz }
      const quizzes = res.data?.data;

      if (Array.isArray(quizzes) && quizzes.length > 0) {
        const quiz = quizzes[0]; // Take the first quiz for now
        setQuizData({
          title: quiz.title,
          questions: quiz.questions || [],
          duration: quiz.duration,
          difficulty: quiz.difficulty,
        });
        setExistingQuizId(quiz._id);
        setShowQuizEditor(true);
      } else if (quizzes && !Array.isArray(quizzes)) {
        // Single object case
        setQuizData({
          title: quizzes.title,
          questions: quizzes.questions || [],
          duration: quizzes.duration,
          difficulty: quizzes.difficulty,
        });
        setExistingQuizId(quizzes._id);
        setShowQuizEditor(true);
      } else {
        // No quiz found
        setQuizData({ title: "", questions: [] });
        setExistingQuizId(null);
        setShowQuizEditor(false);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      // Don't show error toast here as it might just mean no quiz exists
    }
  };

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
    console.log("Starting handleSaveEdit");
    console.log("Product ID:", product._id);
    console.log("Existing Quiz ID:", existingQuizId);
    console.log("Quiz Data:", quizData);

    // Validate Quiz if enabled
    if (showQuizEditor && quizData.title) {
      if (quizData.questions.length === 0) {
        toast({ title: "يرجى إضافة سؤال واحد على الأقل للاختبار", variant: "destructive" });
        setSaving(false);
        return;
      }
      for (const q of quizData.questions) {
        if (!q.question || q.correctAnswer === undefined || q.correctAnswer === null) {
          toast({ title: "يرجى إكمال جميع بيانات الأسئلة", variant: "destructive" });
          setSaving(false);
          return;
        }
      }
    }

    const fd = new FormData();
    fd.append("title", renderText(formData.title));
    fd.append("description", renderText(formData.description));
    fd.append("quantity", FIXED_QUANTITY);
    fd.append("price", String(formData.price ?? 0));

    if (formData.category) {
      fd.append("category", formData.category);
    }

    // Append instructor (preserve existing or use current user)
    const instructorId = product.instructor?._id || product.instructor || localStorage.getItem("userId");
    if (instructorId) {
      fd.append("instructor", instructorId);
    }

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
      // 1. Update Product
      console.log("Sending Product Update...");
      await axios.put(`${API_BASE_URL}/api/v1/products/${product._id}`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Product Update Success");

      // 2. Update or Create Quiz
      if (showQuizEditor && quizData.title) {
        const quizPayload = {
          title: quizData.title,
          product: product._id,
          questions: quizData.questions,
          duration: quizData.duration || 10, // Default to 10 if missing
          difficulty: quizData.difficulty || 'beginner',
          createdBy: localStorage.getItem("userId"),
        };
        console.log("Quiz Payload:", JSON.stringify(quizPayload, null, 2));

        if (existingQuizId) {
          // Update existing quiz
          console.log("Updating Existing Quiz:", existingQuizId);
          await axios.put(`${API_BASE_URL}/api/v1/quizzes/${existingQuizId}`, quizPayload, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
          });
          console.log("Quiz Update Success");
        } else {
          // Create new quiz
          console.log("Creating New Quiz");
          await axios.post(`${API_BASE_URL}/api/v1/quizzes`, quizPayload, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
          });
          console.log("Quiz Creation Success");
        }
      }

      toast({ title: "✓ تم تعديل الكورس والاختبار بنجاح" });
      setEditingProduct(null);
      fetchProducts();
    } catch (err: any) {
      console.error("Error in handleSaveEdit:", err);
      if (err.response) {
        console.error("Response Data:", JSON.stringify(err.response.data, null, 2));
        console.error("Response Status:", err.response.status);
      }
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة</label>
            <select
              value={formData.category || ""}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right focus:border-blue-500 focus:outline-none"
              dir="rtl"
            >
              <option value="">اختر الفئة</option>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
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

          {/* Quiz Editor */}
          <div className="pt-4 border-t">
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={showQuizEditor}
                onChange={(e) => setShowQuizEditor(e.target.checked)}
                className="w-5 h-5 rounded text-blue-600"
              />
              <span className="font-semibold text-gray-700">تعديل/إضافة اختبار</span>
            </label>

            {showQuizEditor && (
              <QuizEditor quizData={quizData} setQuizData={setQuizData} />
            )}
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
