import { useState, useRef, useEffect } from "react";
import { ArrowUp, Sparkles, X, Mic, Info, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
            content: `🎬 مرحباً! أنا مساعدك الذكي "Super AI" للمونتاج. يمكنني تعديل مشروعك فوراً، فقط أخبرني بما تراه مناسباً.`,
            timestamp: new Date()
        }
    ]);

    const [sessions, setSessions] = useState<any[]>([]);
    const [view, setView] = useState<'chat' | 'history'>('chat');
    const [currentSessionId, setCurrentSessionId] = useState<string>(Date.now().toString());

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Draggable Position State
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const windowRef = useRef<HTMLDivElement>(null);

    // Persistence & Sessions Management
    useEffect(() => {
        const savedSessions = localStorage.getItem('avinar_ai_video_sessions');
        if (savedSessions) {
            try {
                const parsed = JSON.parse(savedSessions);
                setSessions(parsed);
                if (parsed.length > 0) {
                    const last = parsed[0];
                    setCurrentSessionId(last.id);
                    setMessages(last.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
                }
            } catch (e) {
                console.error("Failed to load sessions", e);
            }
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            setSessions(prev => {
                const existingIdx = prev.findIndex(s => s.id === currentSessionId);
                const firstUserMsg = messages.find(m => m.role === 'user')?.content;
                const title = firstUserMsg ? (firstUserMsg.substring(0, 25) + (firstUserMsg.length > 25 ? '...' : '')) : 'محادثة جديدة';

                const updatedSession = {
                    id: currentSessionId,
                    title: title,
                    messages: messages,
                    timestamp: new Date()
                };

                let newSessions;
                if (existingIdx >= 0) {
                    newSessions = [...prev];
                    newSessions[existingIdx] = updatedSession;
                } else {
                    newSessions = [updatedSession, ...prev];
                }

                localStorage.setItem('avinar_ai_video_sessions', JSON.stringify(newSessions));
                return newSessions;
            });
        }
    }, [messages, currentSessionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, view]);

    useEffect(() => {
        if (isOpen) {
            setPosition({ x: window.innerWidth - 380, y: 80 });
        }
    }, [isOpen]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.drag-handle')) {
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

            // Prepare history (last 5 messages)
            const history = messages.slice(-5).map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await axios.post(
                `${API_BASE_URL}/api/v1/instructor/ai/video-assistant`,
                {
                    message: userMessage,
                    history: history
                },
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

    const quickPrompts = [
        { label: "إضافة نص ترحيبي", icon: "✨" },
        { label: "تقسيم الفيديو", icon: "🎬" }
    ];

    return (
        <div
            ref={windowRef}
            className="fixed z-[100] w-[350px] select-none pointer-events-auto"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transition: isDragging ? 'none' : 'all 0.15s cubic-bezier(0.2, 0, 0, 1)'
            }}
        >
            <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-none rounded-[32px] overflow-hidden bg-white ring-1 ring-black/[0.03]">
                {/* Header Section */}
                <div
                    onMouseDown={handleMouseDown}
                    className="drag-handle p-5 pb-3 flex flex-col gap-4 cursor-grab active:cursor-grabbing"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <Sparkles size={18} fill="currentColor" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-bold text-gray-900 text-[14px] leading-tight text-right">Ask Super AI</h3>
                                <div className="flex items-center gap-1.5 flex-row-reverse">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[11px] text-gray-500 font-medium">نشط الآن</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 rounded-full transition-colors ${view === 'history' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setView(view === 'chat' ? 'history' : 'chat');
                                }}
                                title="سجل المحادثات"
                            >
                                <History size={15} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newId = Date.now().toString();
                                    setCurrentSessionId(newId);
                                    setMessages([{
                                        id: '1',
                                        role: 'assistant',
                                        content: `🎬 محادثة جديدة. كيف يمكنني مساعدتك الآن؟`,
                                        timestamp: new Date()
                                    }]);
                                    setView('chat');
                                }}
                                title="محادثة جديدة"
                            >
                                <ArrowUp size={15} className="rotate-45" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-500"
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                            >
                                <X size={15} />
                            </Button>
                        </div>
                    </div>
                </div>

                <CardContent className="p-0 flex flex-col h-[480px]">
                    {view === 'history' ? (
                        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2 scrollbar-none">
                            <h4 className="text-[12px] font-bold text-gray-400 mb-4 text-right px-2 uppercase tracking-widest">تاريخ المحادثات</h4>
                            {sessions.length === 0 ? (
                                <div className="text-center py-10 opacity-50">لا يوجد سجلات حتى الآن</div>
                            ) : (
                                sessions.map((s) => (
                                    <div
                                        key={s.id}
                                        className={`group relative p-4 rounded-2xl border transition-all cursor-pointer text-right ${s.id === currentSessionId ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100 hover:border-blue-200'}`}
                                        onClick={() => {
                                            setCurrentSessionId(s.id);
                                            setMessages(s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
                                            setView('chat');
                                        }}
                                    >
                                        <div className="flex justify-between items-center flex-row-reverse mb-1">
                                            <span className="text-[13px] font-bold text-gray-800 line-clamp-1">{s.title}</span>
                                            <span className="text-[10px] text-gray-400">{new Date(s.timestamp).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 line-clamp-1 opacity-70">
                                            {s.messages[s.messages.length - 1]?.content}
                                        </p>
                                        <button
                                            className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-500 transition-all rounded-full hover:bg-red-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('هل تريد حذف هذه المحادثة؟')) {
                                                    const filtered = sessions.filter(sess => sess.id !== s.id);
                                                    setSessions(filtered);
                                                    localStorage.setItem('avinar_ai_video_sessions', JSON.stringify(filtered));
                                                    if (s.id === currentSessionId) {
                                                        setCurrentSessionId(Date.now().toString());
                                                        setMessages([{
                                                            id: '1',
                                                            role: 'assistant',
                                                            content: `🎬 تم الحذف. كيف يمكنني مساعدتك الآن؟`,
                                                            timestamp: new Date()
                                                        }]);
                                                    }
                                                }
                                            }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto px-5 space-y-6 scrollbar-none">
                                {messages.length === 1 && (
                                    <div className="pt-2 flex flex-col items-center gap-4 text-center">
                                        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100/50">
                                            <p className="text-[12px] text-blue-700 font-medium max-w-[200px]">
                                                أنا هنا لمساعدتك في المونتاج والتحرير الذكي. جرب سؤالي عن أي شيء!
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 w-full">
                                            {quickPrompts.map((p, i) => (
                                                <button
                                                    key={i}
                                                    className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-2xl text-[11px] text-gray-600 transition-all text-right flex items-center gap-2 flex-row-reverse justify-start"
                                                    onClick={() => processMessage(p.label)}
                                                >
                                                    <span className="text-[14px]">{p.icon}</span>
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {messages.map((m) => (
                                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {m.role === 'assistant' && (
                                                <Avatar className="h-7 w-7 mt-0.5 border border-blue-100 shadow-sm">
                                                    <AvatarImage src="/ai-avatar.png" />
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px] font-bold">AI</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={`px-4 py-3 rounded-[22px] text-[12px] leading-[1.6] shadow-sm tracking-wide ${m.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-gray-100 text-gray-800 rounded-tl-none font-medium'
                                                }`}>
                                                {m.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 pt-2">
                                <div className="relative flex items-center gap-2 items-end">
                                    <div className="relative flex-1 group">
                                        <Input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && processMessage(input)}
                                            placeholder="كيف يمكنني مساعدتك؟"
                                            className="pr-4 pl-12 py-6 bg-gray-50/50 border-gray-100 rounded-[24px] text-[13px] focus-visible:ring-blue-400 focus-visible:bg-white transition-all shadow-inner text-right"
                                            disabled={loading}
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 rounded-full">
                                                <Mic size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        className={`h-12 w-12 rounded-full shadow-lg transition-all active:scale-90 ${input.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30' : 'bg-gray-100 text-gray-400 pointer-events-none'
                                            }`}
                                        onClick={() => processMessage(input)}
                                        disabled={loading}
                                    >
                                        {loading ? <Sparkles size={18} className="animate-spin" /> : <ArrowUp size={20} />}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default VideoEditorAI;
