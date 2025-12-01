import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Heart, User, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { communityService } from "@/services/communityService";
import { Post } from "@/types/community";
import { useToast } from "@/components/ui/use-toast";
import ReplyCard from "@/components/community/ReplyCard";
import ReplyForm from "@/components/community/ReplyForm";
import EditPostModal from "@/components/community/EditPostModal";

const PostDetail = () => {
    const { postId } = useParams<{ postId: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const currentUserEmail = localStorage.getItem("email");

    useEffect(() => {
        if (postId) {
            fetchPost();
        }
    }, [postId]);

    const fetchPost = async () => {
        if (!postId) return;

        setLoading(true);
        try {
            const data = await communityService.getPostById(postId);
            setPost(data);
            setLikeCount(data.likes?.length || 0);
        } catch (error) {
            console.error("Error fetching post:", error);
            toast({
                title: "خطأ",
                description: "فشل تحميل المنشور",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!postId) return;

        try {
            await communityService.toggleLike(postId);
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        } catch (error) {
            console.error("Error toggling like:", error);
            toast({
                title: "خطأ",
                description: "فشل تحديث الإعجاب",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        if (!postId || !confirm("هل أنت متأكد من حذف هذا المنشور؟")) return;

        try {
            await communityService.deletePost(postId);
            toast({
                title: "تم الحذف",
                description: "تم حذف المنشور بنجاح",
            });
            navigate("/community");
        } catch (error) {
            console.error("Error deleting post:", error);
            toast({
                title: "خطأ",
                description: "فشل حذف المنشور",
                variant: "destructive",
            });
        }
    };

    const handleReplyAdded = () => {
        fetchPost();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 text-lg mb-4">المنشور غير موجود</p>
                    <Button onClick={() => navigate("/community")}>العودة للمجتمع</Button>
                </div>
            </div>
        );
    }

    const isOwner = post.author?.email === currentUserEmail;

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12" dir="rtl">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate("/community")}
                    className="mb-6 gap-2"
                >
                    <ArrowRight size={20} />
                    العودة للمجتمع
                </Button>

                {/* Post Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <User size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{post.author?.name || "مستخدم"}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(post.createdAt).toLocaleDateString("ar-EG")}
                                </p>
                            </div>
                        </div>
                        {isOwner && (
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    <Edit size={16} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDelete}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

                    {/* Tags and Category */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                            {post.category}
                        </Badge>
                        {post.tags?.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-gray-600">
                                #{tag}
                            </Badge>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="prose max-w-none mb-6">
                        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {/* Like Button */}
                    <div className="pt-6 border-t border-gray-100">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 transition-colors ${isLiked ? "text-red-600" : "text-gray-500 hover:text-red-600"
                                }`}
                        >
                            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                            <span>{likeCount} إعجاب</span>
                        </button>
                    </div>
                </div>

                {/* Replies Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        الردود ({post.replies?.length || 0})
                    </h2>

                    {/* Reply Form */}
                    <ReplyForm postId={post._id} onReplyAdded={handleReplyAdded} />

                    {/* Replies List */}
                    <div className="space-y-4 mt-6">
                        {post.replies?.map((reply) => (
                            <ReplyCard key={reply._id} reply={reply} />
                        ))}
                        {(!post.replies || post.replies.length === 0) && (
                            <p className="text-gray-500 text-center py-8">لا توجد ردود بعد</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditPostModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                post={post}
                onPostUpdated={fetchPost}
            />
        </div>
    );
};

export default PostDetail;
