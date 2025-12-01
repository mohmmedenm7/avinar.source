import { useState } from "react";
import { Button } from "@/components/ui/button";
import { communityService } from "@/services/communityService";
import { useToast } from "@/components/ui/use-toast";

interface ReplyFormProps {
    postId: string;
    onReplyAdded: () => void;
}

const ReplyForm = ({ postId, onReplyAdded }: ReplyFormProps) => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            toast({
                title: "تنبيه",
                description: "الرجاء إدخال محتوى الرد",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            await communityService.addReply(postId, { content });
            toast({
                title: "تم بنجاح",
                description: "تم إضافة الرد بنجاح",
            });
            setContent("");
            onReplyAdded();
        } catch (error) {
            console.error("Error adding reply:", error);
            toast({
                title: "خطأ",
                description: "فشل إضافة الرد",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    أضف رداً
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="اكتب ردك هنا..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
            </div>
            <Button type="submit" disabled={loading}>
                {loading ? "جاري الإرسال..." : "إرسال الرد"}
            </Button>
        </form>
    );
};

export default ReplyForm;
