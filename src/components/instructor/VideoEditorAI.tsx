import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Zap, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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

interface VideoEditorAIProps {
    onAction: (intent: string, entities: any) => void;
    isOpen: boolean;
    onClose: () => void;
}

const VideoEditorAI = ({ onAction, isOpen, onClose }: VideoEditorAIProps) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: `🎬 مرحباً! أنا مساعدك الذكي للمونتاج. 
يمكنني تنفيذ الأوامر مباشرة، مثل:
• "أضف نص مكتوب عليه أهلاً بك"
• "قسم الفيديو عند هذه النقطة"
• "تسريع الكليب المحدد"
• "انتقل إلى الثانية 10"`,
            timestamp: new Date()
        }
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Draggable Position State
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const windowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize position when opened
    useEffect(() => {
        if (isOpen) {
            setPosition({ x: window.innerWidth - 340, y: 100 });
        }
    }, [isOpen]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (windowRef.current) {
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

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
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/instructor/ai/video-assistant`,
                { message: userMessage },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const { response: aiResponse, intent, entities, requiresAction } = response.data.data;

            const newAssistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponse,
                intent: intent,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, newAssistantMessage]);

            if (requiresAction && intent !== 'unknown') {
                onAction(intent, entities);
            }

        } catch (error: any) {
            console.error('AI Error:', error);
            const errorMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `❌ عذراً، حدث خطأ أثناء الاتصال بالمساعد.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={windowRef}
            className="fixed z-[100] w-80 select-none"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transition: isDragging ? 'none' : 'all 0.1s ease-out'
            }}
        >
            <Card className="shadow-2xl border-gray-300 dark:border-gray-700 overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md ring-1 ring-black/5">
                {/* Header - Drag Handle */}
                <div
                    onMouseDown={handleMouseDown}
                    className={`p-3 flex items-center justify-between transition-colors cursor-grab active:cursor-grabbing ${isDragging ? 'bg-gray-800' : 'bg-gray-700'
                        } text-white`}
                >
                    <div className="flex items-center gap-2">
                        <GripHorizontal size={14} className="text-gray-400" />
                        <Zap size={16} className="text-gray-300 fill-current" />
                        <span className="font-bold text-xs">مساعد المونتاج الذكي</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-300 hover:bg-white/10 hover:text-white"
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                    >
                        <X size={14} />
                    </Button>
                </div>

                <CardContent className="p-0 flex flex-col h-[380px]">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                        {messages.map((m) => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`p-2.5 rounded-2xl text-[11px] leading-relaxed shadow-sm ${m.role === 'user'
                                            ? 'bg-gray-800 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-700'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && processMessage(input)}
                            placeholder="اكتب طلبك هنا..."
                            className="bg-gray-50 dark:bg-gray-800 text-[11px] h-9 border-gray-200 dark:border-gray-700 focus-visible:ring-gray-400"
                            disabled={loading}
                        />
                        <Button
                            size="icon"
                            className="h-9 w-9 bg-gray-700 hover:bg-gray-800 text-white shadow-md transition-all active:scale-95"
                            onClick={() => processMessage(input)}
                            disabled={loading}
                        >
                            {loading ? <Sparkles size={14} className="animate-spin" /> : <Send size={14} />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default VideoEditorAI;
