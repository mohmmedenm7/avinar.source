import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { communityService } from "@/services/communityService";
import { useToast } from "@/components/ui/use-toast";

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: () => void;
}

const CreatePostModal = ({ isOpen, onClose, onPostCreated }: CreatePostModalProps) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("Programming");
    const [tags, setTags] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const categories = ["Programming", "Design", "Business", "Other"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            toast({
                title: "تنبيه",
                description: "الرجاء إدخال العنوان والمحتوى",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const tagsArray = tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag);

            await communityService.createPost({
                title,
                content,
                category,
                tags: tagsArray,
            });

            toast({
                title: "تم بنجاح",
                description: "تم إنشاء المنشور بنجاح",
            });

            // Reset form
            setTitle("");
            setContent("");
            setCategory("Programming");
            setTags("");
            onPostCreated();
        } catch (error) {
            console.error("Error creating post:", error);
            toast({
                title: "خطأ",
                description: "فشل إنشاء المنشور",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" dir="rtl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">منشور جديد</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            العنوان
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="أدخل عنوان المنشور"
                            className="w-full"
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            المحتوى
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="اكتب محتوى المنشور..."
                            rows={8}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            التصنيف
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الوسوم (مفصولة بفاصلة)
                        </label>
                        <Input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="مثال: javascript, react, frontend"
                            className="w-full"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? "جاري النشر..." : "نشر"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            إلغاء
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;
