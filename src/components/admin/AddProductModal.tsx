import React, { useState } from "react";
import { Upload, X, Play, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from '@/config/env';

export const AddProductModal = ({ 
  show = true, 
  onClose = () => {}, 
  token = "demo-token", 
  fetchProducts = () => {} 
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageCover, setImageCover] = useState(null);
  const [video, setVideo] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoName, setVideoName] = useState(null);
  const [toast, setToast] = useState(null);

  if (!show) return null;

  const showToast = (title, variant) => {
    setToast({ title, variant });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageCover(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    if (e.target.files?.[0]) {
      setVideo(e.target.files[0]);
      setVideoName(e.target.files[0].name);
    }
  };

  const handleAddProduct = async () => {
    if (!title || title.length < 3) {
      showToast("العنوان يجب أن يكون 3 أحرف على الأقل", "destructive");
      return;
    }
    
    if (!description || description.length < 20) {
      showToast("الوصف يجب أن يكون 20 حرف على الأقل", "destructive");
      return;
    }
    
    if (!price || parseFloat(price) <= 0) {
      showToast("أدخل سعر صحيح", "destructive");
      return;
    }
    
    if (!imageCover) {
      showToast("يرجى اختيار صورة الغلاف", "destructive");
      return;
    }
    
    if (!video) {
      showToast("يرجى اختيار فيديو", "destructive");
      return;
    }

    setAddingProduct(true);
    try {
      const slug = title.toLowerCase().trim().replace(/\s+/g, '-');
      
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("slug", slug);
      fd.append("description", description.trim());
      fd.append("quantity", "1");
      fd.append("price", price);
      fd.append("category", "691f6bd063a0a3709983d118");
      // جرّب أسماء مختلفة للملفات
      fd.append("imageCover", imageCover);
      fd.append("videos", video); // جرّب "videos" بدل "video"

      const response = await fetch(`${API_BASE_URL}/api/v1/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('Backend Error:', errorData);
          throw new Error(errorData.message || errorData.error || `خطأ: ${response.status}`);
        } catch (e) {
          const text = await response.text();
          console.error('Server Response:', text);
          throw new Error(`فشل إضافة الكورس: ${response.status}`);
        }
      }

      showToast("✅ تم إضافة الكورس بنجاح");
      
      setTitle("");
      setDescription("");
      setPrice("");
      setImageCover(null);
      setImagePreview(null);
      setVideo(null);
      setVideoName(null);
      
      fetchProducts();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      showToast(err.message || "فشل إضافة الكورس", "destructive");
    } finally {
      setAddingProduct(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto bg-white rounded-lg">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-[60] flex items-center gap-2 ${
            toast.variant === "destructive" ? "bg-red-500 text-white" : "bg-green-500 text-white"
          }`}>
            {toast.variant !== "destructive" && <CheckCircle2 size={20} />}
            <span className="font-medium">{toast.title}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition"
            type="button"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 text-right">إضافة كورس جديد</h2>
        </div>

        <div className="space-y-5 text-right">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              عنوان الكورس <span className="text-red-500">*</span>
            </label>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="أدخل عنوان الكورس" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل وصف الكورس" 
              className="w-full border border-gray-300 rounded-lg p-3 text-right text-sm resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" 
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              السعر <span className="text-red-500">*</span>
            </label>
            <input 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              placeholder="0.00" 
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              صورة الغلاف <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="hidden" 
                id="image-input"
              />
              <label htmlFor="image-input" className="cursor-pointer block">
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
                    <p className="text-sm text-gray-600">اضغط لاختيار صورة الغلاف</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              الفيديو <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition">
              <input 
                type="file" 
                accept="video/*" 
                onChange={handleVideoChange}
                className="hidden"
                id="video-input"
              />
              <label htmlFor="video-input" className="cursor-pointer block">
                {videoName ? (
                  <div>
                    <Play className="mx-auto text-green-600 mb-2" size={32} />
                    <p className="text-sm text-green-600 font-medium">✓ {videoName}</p>
                  </div>
                ) : (
                  <>
                    <Play className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-600">اضغط لاختيار فيديو الكورس</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex justify-start gap-3 pt-4 border-t border-gray-200">
            <button 
              onClick={onClose} 
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={addingProduct}
            >
              إلغاء
            </button>
            <button 
              onClick={handleAddProduct} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:bg-blue-400 disabled:cursor-not-allowed" 
              disabled={addingProduct}
            >
              {addingProduct ? "جاري الإضافة..." : "إضافة الكورس"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;