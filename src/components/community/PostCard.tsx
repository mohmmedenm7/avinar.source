import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Edit, Trash2, User } from "lucide-react";
import { Post } from "@/types/community";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { communityService } from "@/services/communityService";
import { useToast } from "@/components/ui/use-toast";
import EditPostModal from "./EditPostModal";

interface PostCardProps {
    post: Post;
    onDelete: () => void;
}

const PostCard = ({ post, onDelete }: PostCardProps) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const currentUserEmail = localStorage.getItem("email");
    const isOwner = post.author?.email === currentUserEmail;

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await communityService.toggleLike(post._id);
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

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("هل أنت متأكد من حذف هذا المنشور؟")) return;

        try {
            await communityService.deletePost(post._id);
            toast({
                title: "تم الحذف",
                description: "تم حذف المنشور بنجاح",
            });
            onDelete();
        } catch (error) {
            console.error("Error deleting post:", error);
            toast({
                title: "خطأ",
                description: "فشل حذف المنشور",
                variant: "destructive",
            });
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditModalOpen(true);
    };

    return (
        <>
            <div
                onClick={() => navigate(`/community/${post._id}`)}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User size={20} className="text-blue-600" />
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
                                onClick={handleEdit}
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

                {/* Content */}
                <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>

                {/* Tags and Category */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        {post.category}
                    </Badge>
                    {post.tags?.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-gray-600">
                            #{tag}
                        </Badge>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 transition-colors ${isLiked ? "text-red-600" : "text-gray-500 hover:text-red-600"
                            }`}
                    >
                        <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                        <span className="text-sm">{likeCount}</span>
                    </button>
                    <div className="flex items-center gap-2 text-gray-500">
                        <MessageCircle size={18} />
                        <span className="text-sm">{post.replies?.length || 0} رد</span>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditPostModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                post={post}
                onPostUpdated={onDelete}
            />
        </>
    );
};

export default PostCard;
