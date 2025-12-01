import { useState } from "react";
import { Sparkles, BookOpen, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from '@/config/env';
import axios from "axios";

const AiCourseOutlineGenerator = () => {
    const [topic, setTopic] = useState("");
    const [loading, setLoading] = useState(false);
    const [outline, setOutline] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();
    const token = localStorage.getItem("token");

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast({
                title: "تنبيه",
                description: "الرجاء إدخال موضوع الكورس",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        setOutline(null);

        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/v1/instructor/ai/generate-outline`,
                { topic },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Assuming the API returns the outline in res.data.data or res.data.outline
            // Adjust based on actual API response structure
            const generatedOutline = res.data?.data?.outline || res.data?.outline || res.data?.data || JSON.stringify(res.data, null, 2);

            // If it's an object/array, format it nicely
            const formattedOutline = typeof generatedOutline === 'object'
                ? JSON.stringify(generatedOutline, null, 2)
                : generatedOutline;

            setOutline(formattedOutline);

            toast({
                title: "تم بنجاح",
                description: "تم إنشاء مخطط الكورس بنجاح",
            });
        } catch (error: any) {
            console.error("Error generating outline:", error);
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "فشل إنشاء المخطط",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (outline) {
            navigator.clipboard.writeText(outline);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({
                title: "تم النسخ",
                description: "تم نسخ المخطط إلى الحافظة",
            });
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-purple-100 bg-purple-50/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                        <Sparkles className="h-5 w-5" />
                        مساعد الذكاء الاصطناعي
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Input
                            placeholder="أدخل موضوع الكورس (مثال: React للمبتدئين)"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="flex-1 bg-white"
                            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                        />
                        <Button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    جاري التوليد...
                                </div>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    إنشاء مخطط
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {outline && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-gray-700">
                            <BookOpen className="h-5 w-5" />
                            المخطط المقترح
                        </CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="gap-2"
                        >
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            {copied ? "تم النسخ" : "نسخ المخطط"}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
                            {outline}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AiCourseOutlineGenerator;
