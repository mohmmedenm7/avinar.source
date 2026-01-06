import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { API_BASE_URL } from "@/config/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const StudentAiChat = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "مرحباً بك! أنا مساعدك التعليمي الذكي في أفينار. 🎉\n\nكيف يمكنني مساعدتك اليوم؟ أستطيع:\n- اقتراح كورسات تناسب اهتماماتك.\n- مساعدتك في وضع خطة دراسية.\n- الإجابة على استفساراتك حول الكورسات.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);
        console.log("Sending AI Request:", { message: userMsg.content });

        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/v1/student/ai/chat`,
                { message: userMsg.content },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const aiMsg: Message = {
                role: "assistant",
                content: res.data?.data?.message || "عذراً، حدث خطأ في النظام.",
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "عذراً، لا أستطيع الرد حالياً. يرجى المحاولة لاحقاً." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Card className="h-[calc(100vh-140px)] flex flex-col bg-white/40 backdrop-blur-md border border-white/50 shadow-xl overflow-hidden rounded-[32px]">
            {/* Header */}
            <div className="p-4 border-b border-white/30 bg-white/30 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Bot className="text-white" size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">مساعد أفينار الذكي</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Sparkles size={10} className="text-yellow-500" />
                        يعمل بالذكاء الاصطناعي
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="flex flex-col gap-6" ref={scrollRef}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"
                                }`}
                        >
                            <Avatar className="w-8 h-8 mt-1 border border-white/50 shadow-sm">
                                {msg.role === "user" ? (
                                    <>
                                        <AvatarImage src="" />
                                        <AvatarFallback className="bg-blue-600 text-white"><User size={14} /></AvatarFallback>
                                    </>
                                ) : (
                                    <AvatarFallback className="bg-indigo-600 text-white"><Bot size={14} /></AvatarFallback>
                                )}
                            </Avatar>

                            <div
                                className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : "bg-white/80 text-gray-800 rounded-tl-none border border-white/50"
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-3 self-start max-w-[85%]">
                            <Avatar className="w-8 h-8 mt-1 border border-white/50">
                                <AvatarFallback className="bg-indigo-600 text-white"><Bot size={14} /></AvatarFallback>
                            </Avatar>
                            <div className="bg-white/80 p-4 rounded-2xl rounded-tl-none border border-white/50 shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-white/30 bg-white/30 backdrop-blur-md">
                <div className="flex gap-2 relative">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="اكتب رسالتك هنا..."
                        className="pr-12 bg-white/60 border-white/50 focus:bg-white transition-all h-12 rounded-xl shadow-inner"
                        disabled={loading}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="absolute left-1 top-1 h-10 w-10 p-0 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-95"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                    </Button>
                </div>
                <p className="text-[10px] text-center text-gray-400 mt-2">
                    يمكن للذكاء الاصطناعي ارتكاب الأخطاء. يرجى التحقق من المعلومات المهمة.
                </p>
            </div>
        </Card>
    );
};

export default StudentAiChat;
