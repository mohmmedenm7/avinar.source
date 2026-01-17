import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, Sparkles, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface StudyAssistantProps {
    courseId: string;
    lectureId?: string;
    lectureTitle?: string;
}

const StudyAssistant: React.FC<StudyAssistantProps> = ({ courseId, lectureId, lectureTitle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "أهلاً بك! أنا رفيق المذاكرة الذكي. كيف يمكنني مساعدتك في فهم هذا الدرس اليوم؟",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/student/ai/study-companion`,
                {
                    courseId,
                    lectureId,
                    message: userMessage,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const aiReply = response.data.data.message;
            setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);
        } catch (error) {
            console.error("Study Assistant Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "عذراً، حدث خطأ أثناء الاتصال بالخادم. حاول مرة أخرى لاحقاً." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            {/* Floating Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl z-50 transition-all active:scale-95 ${isOpen ? "bg-red-500 hover:bg-red-600" : "bg-[#00b8a3] hover:bg-[#00a693]"
                    }`}
            >
                {isOpen ? <X size={28} /> : <div className="relative">
                    <Bot size={28} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                </div>}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-28 right-8 w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#00b8a3] to-[#00d1b8] p-6 text-white shrink-0">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Sparkles size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">رفيق المذاكرة</h3>
                                        <p className="text-white/80 text-xs">مدعوم بالذكاء الاصطناعي</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            {lectureTitle && (
                                <div className="bg-black/10 rounded-lg p-2 flex items-center gap-2 text-xs">
                                    <Clock size={14} className="opacity-70" />
                                    <span className="truncate opacity-90">نحن الآن في درس: {lectureTitle}</span>
                                </div>
                            )}
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === "user"
                                                ? "bg-[#00b8a3] text-white rounded-tr-none"
                                                : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                                            }`}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Prompts */}
                        <div className="px-4 py-2 border-t border-gray-50 bg-white flex gap-2 overflow-x-auto scrollbar-none">
                            <button
                                onClick={() => setInput("ما هو ملخص هذا الدرس؟")}
                                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 transition-colors"
                            >
                                📝 ملخص الدرس
                            </button>
                            <button
                                onClick={() => setInput("في أي دقيقة تم شرح أهم نقطة؟")}
                                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 transition-colors"
                            >
                                ⏰ توقيت الشرح
                            </button>
                            <button
                                onClick={() => setInput("اعطني سؤالاً لاختبار فهمي")}
                                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 transition-colors"
                            >
                                ❓ اختبرني
                            </button>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="relative flex items-center">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                    placeholder="اسأل رفيق المذاكرة..."
                                    className="pr-12 pl-4 py-6 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all shadow-inner"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={loading || !input.trim()}
                                    className="absolute right-1 w-10 h-10 rounded-xl bg-[#00b8a3] hover:bg-[#00a693] text-white p-0 transition-all active:scale-90"
                                >
                                    <Send size={18} />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudyAssistant;
