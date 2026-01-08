import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from '@/config/env';
import axios from "axios";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    data?: any;
}

const AiCourseOutlineGenerator = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'مرحباً! أنا مساعدك الذكي لإنشاء مخططات الكورسات. 🎓\n\nيمكنني مساعدتك في:\n• توليد مخطط كورس كامل\n• تحسين الأفكار الموجودة\n• اقتراح محتوى تعليمي\n• تنظيم المنهج الدراسي\n\nما هو موضوع الكورس الذي تريد إنشاءه؟',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [conversationContext, setConversationContext] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const token = localStorage.getItem("token");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addMessage = (role: 'user' | 'assistant', content: string, data?: any) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            role,
            content,
            timestamp: new Date(),
            data
        };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput("");
        addMessage('user', userMessage);

        setLoading(true);

        try {
            // Prepare conversation history for API
            const conversationHistory = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Call intelligent chat API
            const res = await axios.post(
                `${API_BASE_URL}/api/v1/instructor/ai/chat`,
                {
                    message: userMessage,
                    conversationHistory: conversationHistory
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const aiResponse = res.data?.data;

            // Check if response contains course outline generation trigger
            if (aiResponse.intent === 'ready_to_generate' || userMessage.toLowerCase().includes('أنشئ المخطط')) {
                // Extract topic from conversation
                const topic = extractTopicFromConversation(conversationHistory);
                const level = extractLevelFromConversation(conversationHistory);
                const duration = extractDurationFromConversation(conversationHistory);

                // Generate course outline
                const outlineRes = await axios.post(
                    `${API_BASE_URL}/api/v1/instructor/ai/generate-outline`,
                    {
                        topic: topic || userMessage,
                        level: level || 'beginner',
                        duration: duration || 'medium',
                        language: 'ar'
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const courseData = outlineRes.data?.data;
                setConversationContext(prev => [...prev, { topic, courseData }]);

                const formattedResponse = formatCourseOutlineResponse(courseData);
                addMessage('assistant', formattedResponse, courseData);
            } else {
                // Regular chat response
                addMessage('assistant', aiResponse.message);
            }

        } catch (error: any) {
            console.error("Error:", error);
            addMessage('assistant', `عذراً، حدث خطأ: ${error.response?.data?.message || 'حاول مرة أخرى'}`);
        } finally {
            setLoading(false);
        }
    };

    const extractTopicFromConversation = (history: any[]): string => {
        for (let i = history.length - 1; i >= 0; i--) {
            const msg = history[i];
            if (msg.role === 'user' && (msg.content.includes('كورس') || msg.content.includes('دورة'))) {
                return msg.content.replace(/كورس|دورة|عن|في/g, '').trim();
            }
        }
        return 'موضوع عام';
    };

    const extractLevelFromConversation = (history: any[]): string => {
        for (let i = history.length - 1; i >= 0; i--) {
            const msg = history[i];
            if (msg.role === 'user') {
                if (msg.content.includes('متقدم')) return 'advanced';
                if (msg.content.includes('متوسط')) return 'intermediate';
                if (msg.content.includes('مبتدئ')) return 'beginner';
            }
        }
        return 'beginner';
    };

    const extractDurationFromConversation = (history: any[]): string => {
        for (let i = history.length - 1; i >= 0; i--) {
            const msg = history[i];
            if (msg.role === 'user') {
                if (msg.content.includes('طويل') || msg.content.includes('شامل')) return 'long';
                if (msg.content.includes('قصير') || msg.content.includes('سريع')) return 'short';
                if (msg.content.includes('متوسط')) return 'medium';
            }
        }
        return 'medium';
    };

    const detectIntent = (message: string): any => {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('عدل') || lowerMessage.includes('غير') || lowerMessage.includes('حسن')) {
            return { type: 'refine' };
        }
        if (lowerMessage.includes('كيف') || lowerMessage.includes('ماذا') || lowerMessage.includes('هل') || lowerMessage.includes('؟')) {
            return { type: 'question' };
        }
        let level = 'beginner';
        if (lowerMessage.includes('متقدم')) level = 'advanced';
        else if (lowerMessage.includes('متوسط')) level = 'intermediate';
        let duration = 'medium';
        if (lowerMessage.includes('قصير') || lowerMessage.includes('سريع')) duration = 'short';
        else if (lowerMessage.includes('طويل') || lowerMessage.includes('شامل')) duration = 'long';
        return { type: 'generate_outline', topic: message, level, duration };
    };

    const formatCourseOutlineResponse = (courseData: any): string => {
        if (!courseData) return 'تم إنشاء المخطط بنجاح!';
        let response = `✨ تم إنشاء مخطط الكورس بنجاح!\n\n📚 **${courseData.courseTitle}**\n\n📝 ${courseData.description}\n\n⏱️ المدة المقدرة: ${courseData.estimatedDuration}\n📊 المستوى: ${courseData.level === 'beginner' ? 'مبتدئ' : courseData.level === 'intermediate' ? 'متوسط' : 'متقدم'}\n\n🎯 **الأهداف التعليمية:**\n`;
        courseData.learningObjectives?.forEach((obj: string, i: number) => {
            response += `${i + 1}. ${obj}\n`;
        });
        response += `\n📖 **المحتوى (${courseData.sections?.length || 0} أقسام):**\n\n`;
        courseData.sections?.forEach((section: any, i: number) => {
            response += `**القسم ${i + 1}: ${section.sectionTitle}**\n${section.sectionDescription}\n⏰ ${section.estimatedDuration}\n📌 ${section.lessons?.length || 0} دروس\n\n`;
        });
        response += `\n💡 هل تريد:\n• رؤية تفاصيل أي قسم؟\n• تعديل المحتوى؟\n• تصدير المخطط؟`;
        return response;
    };

    const handleRefinement = (request: string, courseData: any): string => {
        return `فهمت طلبك! سأقوم بتحسين المخطط بناءً على ملاحظاتك.\n\nيمكنني:\n• إضافة المزيد من الدروس العملية\n• تعديل مستوى الصعوبة\n• إعادة ترتيب الأقسام\n• إضافة مشاريع عملية\n\nما التحسين المحدد الذي تريده؟`;
    };

    const handleQuestion = (question: string, context: any[]): string => {
        const lowerQuestion = question.toLowerCase();
        if (lowerQuestion.includes('كيف') && lowerQuestion.includes('استخدم')) {
            return 'يمكنك استخدامي بعدة طرق:\n\n1️⃣ اكتب موضوع الكورس مباشرة\n2️⃣ حدد المستوى (مبتدئ/متوسط/متقدم)\n3️⃣ اطلب تعديلات على المخطط\n4️⃣ اسأل عن أي جزء من المحتوى\n\nجرب الآن! 🚀';
        }
        if (lowerQuestion.includes('مستوى') || lowerQuestion.includes('صعوبة')) {
            return 'يمكنني إنشاء كورسات بثلاثة مستويات:\n\n🟢 **مبتدئ**: للمبتدئين تماماً\n🟡 **متوسط**: لمن لديهم خبرة أساسية\n🔴 **متقدم**: للمحترفين\n\nفقط اذكر المستوى في طلبك!';
        }
        return 'سؤال رائع! يمكنني مساعدتك في أي شيء يتعلق بإنشاء وتنظيم الكورسات. ما الذي تريد معرفته بالتحديد؟';
    };

    const handleClearChat = () => {
        setMessages([{ id: '1', role: 'assistant', content: 'تم مسح المحادثة. كيف يمكنني مساعدتك اليوم؟', timestamp: new Date() }]);
        setConversationContext([]);
        toast({ title: "تم مسح المحادثة" });
    };

    const handleExport = () => {
        const lastCourseData = conversationContext[conversationContext.length - 1]?.courseData;
        if (!lastCourseData) {
            toast({ title: "لا يوجد محتوى للتصدير", variant: "destructive" });
            return;
        }
        const dataStr = JSON.stringify(lastCourseData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `course-outline-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: "تم التصدير بنجاح" });
    };

    return (
        <div className="flex flex-col h-[600px] w-full" dir="rtl">
            <Card className="flex-1 flex flex-col border-purple-100 overflow-hidden shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50 flex-shrink-0 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-purple-700 text-lg">
                            <Sparkles className="h-5 w-5" />
                            مساعد الذكاء الاصطناعي
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 h-8 text-xs">
                                <Download className="h-3 w-3" />
                                تصدير
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleClearChat} className="gap-2 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-3 w-3" />
                                مسح
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-gray-50/30">
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${message.role === 'assistant' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                                    {message.role === 'assistant' ? <Bot className="h-5 w-5 text-purple-600" /> : <User className="h-5 w-5 text-blue-600" />}
                                </div>

                                <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${message.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed font-medium">
                                        {message.content.split('\n').map((line, i) => (
                                            <p key={i} className="mb-1 last:mb-0 min-h-[1.2em]">{line}</p>
                                        ))}
                                    </div>
                                    <div className={`text-[10px] mt-2 opacity-70 flex items-center gap-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {message.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Bot className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                                    <div className="flex gap-1.5 items-center h-full">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 relative">
                                <Input
                                    placeholder="اكتب رسالتك هنا..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                    className="pr-4 pl-10 py-6 bg-gray-50 border-gray-200 focus:bg-white transition-all resize-none"
                                    disabled={loading}
                                />
                            </div>
                            <Button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="h-12 w-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all hover:scale-105"
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {['كورس Python للمبتدئين', 'خطة تسويق رقمي', 'كيف أبدأ؟'].map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(suggestion)}
                                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-purple-50 hover:text-purple-700 text-gray-600 rounded-full transition-colors whitespace-nowrap"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AiCourseOutlineGenerator;
