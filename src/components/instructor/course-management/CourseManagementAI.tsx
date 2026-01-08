import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User, Trash2, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { API_BASE_URL } from '@/config/env';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    intent?: string;
    timestamp: Date;
}

interface CourseManagementAIProps {
    courses: any[];
    students: any[];
    token?: string;
    onAction?: (action: string, data: any) => void;
}

const CourseManagementAI = ({
    courses,
    students,
    token,
    onAction
}: CourseManagementAIProps) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: `🤖 مرحباً! أنا مساعدك الذكي لإدارة الكورسات والطلاب.

يمكنك أن تطلب مني:
📋 معلومات عن أي طالب
📊 عدد طلاب الكورس
📚 عرض كل الكورسات
❌ حذف كورس أو طالب
✏️ تعديل معلومات الكورس
📈 احصائيات الأداء
🎯 تقدم الطلاب

مثال: "أخبرني عن الطالب محمد" أو "كم عدد طلاب كورس React؟"`,
            timestamp: new Date()
        }
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [pendingConfirmation, setPendingConfirmation] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /**
     * Process user message with local AI
     */
    const processMessage = async (userMessage: string) => {
        if (!userMessage.trim()) return;

        setLoading(true);
        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInput("");

        try {
            // If confirmation pending, handle it
            if (pendingConfirmation) {
                const confirmationResponse = userMessage.toLowerCase().trim();
                const isConfirmed = [
                    'نعم', 'أكيد', 'اكيد', 'اجل', 'أجل', 'موافق', 'طبعا', 'طبعاً', 'ok', 'yes', 'confirm', 'تم', 'ماشي', 'تأكيد', 'تاكيد', 'أكد', 'اكد'
                ].some(word => confirmationResponse.includes(word));

                if (isConfirmed) {
                    // Execute the action
                    await executeAction(pendingConfirmation);
                    setPendingConfirmation(null);
                } else if (confirmationResponse.includes('لا') || confirmationResponse.includes('إلغاء')) {
                    const cancelMessage: Message = {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: '✅ تم إلغاء الحذف. كيف يمكنني مساعدتك بخلاف ذلك؟',
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, cancelMessage]);
                    setPendingConfirmation(null);
                }
                setLoading(false);
                return;
            }

            // Send to backend AI service
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/instructor/ai/course-assistant`,
                {
                    message: userMessage,
                    courses: courses,
                    students: students
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const { response: aiResponse, intent, requiresAction, entities } = response.data.data;

            const newAssistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponse,
                intent: intent,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, newAssistantMessage]);

            // If action required (delete, edit), ask for confirmation
            if (requiresAction) {
                setPendingConfirmation({
                    intent: intent,
                    entities: entities,
                    data: { userMessage, courses, students }
                });
            }

            // Trigger callback if provided
            if (onAction && requiresAction) {
                onAction(intent, entities);
            }

        } catch (error: any) {
            console.error('AI Error:', error);
            const errorMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `❌ حدث خطأ: ${error.response?.data?.message || error.message || 'خطأ غير معروف'}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            toast({
                title: 'خطأ',
                description: 'فشل الاتصال مع مساعد الذكاء الاصطناعي',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Execute action (delete, edit, etc.)
     */
    const executeAction = async (confirmation: any) => {
        try {
            const { intent, entities } = confirmation;

            // Send action to backend
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/instructor/ai/course-action`,
                {
                    action: intent,
                    entities: entities
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const successMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `✅ ${response.data.data.message}`,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, successMessage]);
            toast({
                title: 'نجح',
                description: response.data.data.message
            });

            // Refresh data
            if (onAction) {
                onAction('refresh', null);
            }

        } catch (error: any) {
            const errorMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `❌ فشل الإجراء: ${error.response?.data?.message || 'حدث خطأ'}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    /**
     * Copy message to clipboard
     */
    const copyMessage = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'تم النسخ' });
    };

    /**
     * Download conversation
     */
    const downloadConversation = () => {
        const content = messages
            .map(m => `${m.role === 'user' ? 'أنت' : 'المساعد'}: ${m.content}`)
            .join('\n\n---\n\n');

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', `conversation-${new Date().getTime()}.txt`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        toast({ title: 'تم تحميل المحادثة' });
    };

    /**
     * Clear conversation
     */
    const clearConversation = () => {
        setMessages([
            {
                id: '1',
                role: 'assistant',
                content: `🤖 تم مسح المحادثة. كيف يمكنني مساعدتك؟`,
                timestamp: new Date()
            }
        ]);
        setPendingConfirmation(null);
        toast({ title: 'تم مسح المحادثة' });
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">مساعد إدارة الكورسات</h3>
                        <p className="text-xs text-gray-500">ذكاء اصطناعي محلي - بدون API خارجي</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={downloadConversation}
                        title="تحميل المحادثة"
                    >
                        <Download size={16} />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={clearConversation}
                        title="مسح المحادثة"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <Card className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                <CardContent className="p-4 h-full overflow-y-auto space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                    }`}>
                                    {message.role === 'user' ? (
                                        <User size={16} />
                                    ) : (
                                        <Bot size={16} />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div className={`p-3 rounded-lg ${message.role === 'user'
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-gray-200 text-gray-900 rounded-bl-none'
                                    }`}>
                                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                    <p className="text-xs mt-1 opacity-70">
                                        {message.timestamp.toLocaleTimeString('ar-EG')}
                                    </p>
                                </div>

                                {/* Copy Button */}
                                {message.role === 'assistant' && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                        onClick={() => copyMessage(message.content)}
                                    >
                                        <Copy size={14} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </CardContent>
            </Card>

            {/* Input Area */}
            <div className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            processMessage(input);
                        }
                    }}
                    placeholder={pendingConfirmation ? "أكتب 'نعم' لتأكيد أو 'لا' للإلغاء..." : "أكتب طلبك هنا..."}
                    disabled={loading}
                    className="flex-1"
                    dir="rtl"
                />
                <Button
                    onClick={() => processMessage(input)}
                    disabled={loading || !input.trim()}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                    <Send size={18} className="text-white" />
                </Button>
            </div>

            {/* Status */}
            {pendingConfirmation && (
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
                    ⚠️ بانتظار تأكيدك...
                </div>
            )}
        </div>
    );
};

export default CourseManagementAI;
