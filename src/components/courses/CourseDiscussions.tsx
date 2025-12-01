import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { MessageCircle, MessageSquare, CheckCircle, User, Send, Plus } from "lucide-react";

interface Reply {
    _id: string;
    user: {
        name: string;
        profileImg?: string;
    };
    content: string;
    isInstructorReply: boolean;
    createdAt: string;
}

interface Discussion {
    _id: string;
    product: string;
    user: {
        name: string;
        profileImg?: string;
    };
    title: string;
    content: string;
    type: "question" | "discussion";
    isAnswered: boolean;
    replies: Reply[];
    createdAt: string;
    updatedAt: string;
}

interface CourseDiscussionsProps {
    productId: string;
}

const CourseDiscussions = ({ productId }: CourseDiscussionsProps) => {
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [loading, setLoading] = useState(false);
    const [showNewForm, setShowNewForm] = useState(false);
    const [filterType, setFilterType] = useState<"all" | "question" | "discussion">("all");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const { toast } = useToast();
    const token = localStorage.getItem("token");

    // New discussion form state
    const [newDiscussion, setNewDiscussion] = useState({
        title: "",
        content: "",
        type: "question" as "question" | "discussion",
    });

    // Reply form state
    const [replyContent, setReplyContent] = useState("");

    // Fetch discussions
    const fetchDiscussions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/products/${productId}/discussions`);
            setDiscussions(res.data?.data || []);
        } catch (error) {
            console.error("Error fetching discussions:", error);
            toast({
                title: "خطأ في جلب المناقشات",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscussions();
    }, [productId]);

    // Create new discussion
    const handleCreateDiscussion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast({ title: "يرجى تسجيل الدخول أولاً", variant: "destructive" });
            return;
        }

        if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
            toast({ title: "يرجى ملء جميع الحقول", variant: "destructive" });
            return;
        }

        try {
            await axios.post(
                `${API_BASE_URL}/api/v1/products/${productId}/discussions`,
                newDiscussion,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast({ title: "✓ تم إضافة السؤال بنجاح" });
            setNewDiscussion({ title: "", content: "", type: "question" });
            setShowNewForm(false);
            fetchDiscussions();
        } catch (error: any) {
            toast({
                title: error.response?.data?.message || "حدث خطأ",
                variant: "destructive",
            });
        }
    };

    // Add reply
    const handleAddReply = async (discussionId: string) => {
        if (!token) {
            toast({ title: "يرجى تسجيل الدخول أولاً", variant: "destructive" });
            return;
        }

        if (!replyContent.trim()) {
            toast({ title: "يرجى كتابة رد", variant: "destructive" });
            return;
        }

        try {
            await axios.post(
                `${API_BASE_URL}/api/v1/discussions/${discussionId}/replies`,
                { content: replyContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast({ title: "✓ تم إضافة الرد بنجاح" });
            setReplyContent("");
            setReplyingTo(null);
            fetchDiscussions();
        } catch (error: any) {
            toast({
                title: error.response?.data?.message || "حدث خطأ",
                variant: "destructive",
            });
        }
    };

    // Filter discussions
    const filteredDiscussions = discussions.filter((d) =>
        filterType === "all" ? true : d.type === filterType
    );

    // Format date
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">المناقشات والأسئلة</h2>
                <Button
                    onClick={() => setShowNewForm(!showNewForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Plus size={20} className="ml-2" />
                    سؤال جديد
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setFilterType("all")}
                    className={`px-4 py-2 font-medium transition-colors ${filterType === "all"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                >
                    الكل ({discussions.length})
                </button>
                <button
                    onClick={() => setFilterType("question")}
                    className={`px-4 py-2 font-medium transition-colors ${filterType === "question"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                >
                    الأسئلة ({discussions.filter((d) => d.type === "question").length})
                </button>
                <button
                    onClick={() => setFilterType("discussion")}
                    className={`px-4 py-2 font-medium transition-colors ${filterType === "discussion"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                >
                    المناقشات ({discussions.filter((d) => d.type === "discussion").length})
                </button>
            </div>

            {/* New Discussion Form */}
            {showNewForm && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-right">سؤال أو مناقشة جديدة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateDiscussion} className="space-y-4">
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={newDiscussion.type === "question" ? "default" : "outline"}
                                    onClick={() => setNewDiscussion({ ...newDiscussion, type: "question" })}
                                    className="flex-1"
                                >
                                    <MessageCircle size={16} className="ml-2" />
                                    سؤال
                                </Button>
                                <Button
                                    type="button"
                                    variant={newDiscussion.type === "discussion" ? "default" : "outline"}
                                    onClick={() => setNewDiscussion({ ...newDiscussion, type: "discussion" })}
                                    className="flex-1"
                                >
                                    <MessageSquare size={16} className="ml-2" />
                                    مناقشة
                                </Button>
                            </div>

                            <Input
                                placeholder="عنوان السؤال أو المناقشة"
                                value={newDiscussion.title}
                                onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                                className="text-right"
                            />

                            <Textarea
                                placeholder="اكتب سؤالك أو موضوع المناقشة بالتفصيل..."
                                value={newDiscussion.content}
                                onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                                rows={4}
                                className="text-right"
                            />

                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setShowNewForm(false)}>
                                    إلغاء
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    نشر
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Discussions List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredDiscussions.length > 0 ? (
                <div className="space-y-4">
                    {filteredDiscussions.map((discussion) => (
                        <Card key={discussion._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                {/* Discussion Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User size={20} className="text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900">{discussion.user.name}</span>
                                                <span className="text-sm text-gray-500">{formatDate(discussion.createdAt)}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">{discussion.title}</h3>
                                            <p className="text-gray-700 whitespace-pre-wrap">{discussion.content}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {discussion.type === "question" && discussion.isAnswered && (
                                            <span className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                                                <CheckCircle size={16} />
                                                مُجاب
                                            </span>
                                        )}
                                        <span
                                            className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${discussion.type === "question"
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {discussion.type === "question" ? (
                                                <>
                                                    <MessageCircle size={16} />
                                                    سؤال
                                                </>
                                            ) : (
                                                <>
                                                    <MessageSquare size={16} />
                                                    مناقشة
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Replies */}
                                {discussion.replies.length > 0 && (
                                    <div className="mr-12 space-y-3 mb-4 border-r-2 border-gray-200 pr-4">
                                        {discussion.replies.map((reply) => (
                                            <div key={reply._id} className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-start gap-2 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <User size={16} className="text-gray-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-900">{reply.user.name}</span>
                                                            {reply.isInstructorReply && (
                                                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                                                                    👨‍🏫 المدرب
                                                                </span>
                                                            )}
                                                            <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                                                        </div>
                                                        <p className="text-gray-700 mt-1 whitespace-pre-wrap">{reply.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Reply Form */}
                                {replyingTo === discussion._id ? (
                                    <div className="mr-12 mt-4">
                                        <Textarea
                                            placeholder="اكتب ردك..."
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            rows={3}
                                            className="text-right mb-2"
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="outline" onClick={() => setReplyingTo(null)}>
                                                إلغاء
                                            </Button>
                                            <Button
                                                onClick={() => handleAddReply(discussion._id)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Send size={16} className="ml-2" />
                                                إرسال
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mr-12 mt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setReplyingTo(discussion._id)}
                                            className="text-blue-600 hover:bg-blue-50"
                                        >
                                            <MessageCircle size={16} className="ml-2" />
                                            رد على {discussion.type === "question" ? "السؤال" : "المناقشة"}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-20 text-center">
                        <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 text-lg mb-2">لا توجد {filterType === "all" ? "مناقشات" : filterType === "question" ? "أسئلة" : "مناقشات"} بعد</p>
                        <p className="text-gray-400 text-sm">كن أول من يبدأ المناقشة!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CourseDiscussions;
