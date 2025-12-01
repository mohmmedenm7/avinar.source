import { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { communityService } from "@/services/communityService";
import { Post } from "@/types/community";
import PostCard from "@/components/community/PostCard";
import CreatePostModal from "@/components/community/CreatePostModal";
import { useToast } from "@/components/ui/use-toast";

const CommunityPage = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { toast } = useToast();

    const categories = ["all", "Programming", "Design", "Business", "Other"];

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        filterPosts();
    }, [searchQuery, selectedCategory, posts]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await communityService.getAllPosts();
            setPosts(data);
        } catch (error) {
            console.error("Error fetching posts:", error);
            toast({
                title: "خطأ",
                description: "فشل تحميل المنشورات",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filterPosts = () => {
        let filtered = posts;

        if (selectedCategory !== "all") {
            filtered = filtered.filter((post) => post.category === selectedCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter(
                (post) =>
                    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    post.tags.some((tag) =>
                        tag.toLowerCase().includes(searchQuery.toLowerCase())
                    )
            );
        }

        setFilteredPosts(filtered);
    };

    const handlePostCreated = () => {
        fetchPosts();
        setIsCreateModalOpen(false);
    };

    const handlePostDeleted = () => {
        fetchPosts();
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12" dir="rtl">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">المجتمع</h1>
                    <p className="text-gray-600">شارك أفكارك واطرح أسئلتك مع المجتمع</p>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={20}
                            />
                            <Input
                                placeholder="ابحث في المنشورات..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pr-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat === "all" ? "جميع التصنيفات" : cat}
                                    </option>
                                ))}
                            </select>
                            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                                <Plus size={20} />
                                منشور جديد
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Posts List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <p className="text-gray-500 text-lg">لا توجد منشورات</p>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-4 gap-2"
                        >
                            <Plus size={20} />
                            إنشاء أول منشور
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredPosts.map((post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                onDelete={handlePostDeleted}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onPostCreated={handlePostCreated}
            />
        </div>
    );
};

export default CommunityPage;
