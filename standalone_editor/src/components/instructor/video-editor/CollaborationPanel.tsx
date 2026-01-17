import React from 'react';
import {
    Users, Mic, MonitorPlay, Maximize2, MessageSquare,
    MessageCircle, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CollaborationPanelProps {
    currentTeam: any;
    teamNameInput: string;
    setTeamNameInput: (val: string) => void;
    handleCreateTeam: () => void;
    inviteCodeInput: string;
    setInviteCodeInput: (val: string) => void;
    handleJoinTeam: () => void;
    isMicEnabled: boolean;
    setIsMicEnabled: (val: boolean) => void;
    isScreenSharing: boolean;
    setIsScreenSharing: (val: boolean) => void;
    collaborators: any[];
    comments: any[];
    currentTime: number;
    setCurrentTime: (val: number) => void;
    newComment: string;
    setNewComment: (val: string) => void;
    addComment: () => void;
    toast: any;
}

const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
};

const CollaborationPanel = React.memo(({
    currentTeam,
    teamNameInput,
    setTeamNameInput,
    handleCreateTeam,
    inviteCodeInput,
    setInviteCodeInput,
    handleJoinTeam,
    isMicEnabled,
    setIsMicEnabled,
    isScreenSharing,
    setIsScreenSharing,
    collaborators,
    comments,
    currentTime,
    setCurrentTime,
    newComment,
    setNewComment,
    addComment,
    toast
}: CollaborationPanelProps) => {
    // Add a local loading state for better UX
    const [isProcessing, setIsProcessing] = React.useState(false);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const onAction = async (fn: () => void) => {
        setIsProcessing(true);
        // Simulate a small delay for "Realism" and to prevent double clicks
        setTimeout(() => {
            fn();
            setIsProcessing(false);
        }, 600);
    };

    return (
        <div
            ref={scrollContainerRef}
            className="flex-1 flex flex-col min-h-0 bg-[#0f1012] overflow-hidden"
            id="collaboration-panel-root"
        >
            {!currentTeam ? (
                /* Join/Create View */
                <div className="flex-1 flex flex-col p-6 space-y-8 overflow-y-auto">
                    <div className="text-center space-y-4 pt-4">
                        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto ring-1 ring-blue-500/20">
                            <Users size={32} className="text-blue-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white font-arabic text-right">التعاون المباشر</h2>
                        <p className="text-sm text-gray-400 leading-relaxed font-arabic text-right">اعمل مع فريقك في تيار واحد. أنشئ فريقاً وادعُ زملائك للمونتاج الجماعي.</p>
                    </div>

                    <div className="space-y-6">
                        {/* Create Team Section */}
                        <Card className="bg-white/5 border-gray-800 p-5 space-y-4 hover:bg-white/[0.07] transition-all">
                            <div className="space-y-1 text-right">
                                <h3 className="text-sm font-bold text-blue-400">بدء فريق جديد</h3>
                                <p className="text-[10px] text-gray-500">ستكون أنت مدير الفريق وتتحكم في الصلاحيات.</p>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="اسم الفريق (مثلاً: فريق كورس البرمجة)"
                                    className="bg-black/40 border-gray-800 h-9 text-xs text-right font-arabic"
                                    value={teamNameInput}
                                    onChange={(e) => setTeamNameInput(e.target.value)}
                                    data-no-shortcuts="true"
                                />
                                <Button
                                    type="button"
                                    disabled={isProcessing}
                                    className="bg-blue-600 hover:bg-blue-700 h-9 transition-all active:scale-95 px-6 font-arabic min-w-[100px]"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onAction(handleCreateTeam);
                                    }}
                                >
                                    {isProcessing ? 'جاري الإنشاء...' : 'إنشاء'}
                                </Button>
                            </div>
                        </Card>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-800" /></div>
                            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#0f1012] px-3 text-gray-600 font-bold tracking-widest font-arabic">أو</span></div>
                        </div>

                        {/* Join Team Section */}
                        <Card className="bg-white/5 border-gray-800 p-5 space-y-4 hover:bg-white/[0.07] transition-all">
                            <div className="space-y-1 text-right">
                                <h3 className="text-sm font-bold text-green-400">انضمام لفريق موجود</h3>
                                <p className="text-[10px] text-gray-500">أدخل كود الدعوة المرسل إليك.</p>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="أدخل كود الدعوة..."
                                    className="bg-black/40 border-gray-800 h-9 text-xs font-mono uppercase text-center"
                                    value={inviteCodeInput}
                                    onChange={(e) => setInviteCodeInput(e.target.value)}
                                    data-no-shortcuts="true"
                                />
                                <Button
                                    type="button"
                                    disabled={isProcessing}
                                    className="bg-green-600 hover:bg-green-700 h-9 transition-all active:scale-95 px-6 font-arabic min-w-[100px]"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onAction(handleJoinTeam);
                                    }}
                                >
                                    {isProcessing ? 'جاري الانضمام...' : 'انضمام'}
                                </Button>
                            </div>
                        </Card>
                    </div>

                    <div className="pt-4 flex flex-col gap-3 font-arabic">
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 opacity-60 flex-row-reverse">
                            <Mic size={16} className="text-pink-400" />
                            <span className="text-[10px] text-gray-400 text-right">تحدث مع فريقك مباشرة أثناء المونتاج.</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 opacity-60 flex-row-reverse">
                            <MonitorPlay size={16} className="text-yellow-400" />
                            <span className="text-[10px] text-gray-400 text-right">شارك شاشتك واعرض تعديلاتك للبقية لحظياً.</span>
                        </div>
                    </div>
                </div>
            ) : (
                /* Dashboard View */
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Team Header with Controls */}
                    <div className="p-4 border-b border-gray-800 space-y-4 bg-gradient-to-b from-blue-600/5 to-transparent">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">المشروع المشترك: {currentTeam.name}</span>
                                <span className="text-[9px] text-blue-400 font-medium text-right">كود الدعوة: <span className="font-mono">{currentTeam.inviteCode}</span></span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant={isMicEnabled ? "default" : "outline"}
                                    size="icon"
                                    className={`h-7 w-7 rounded-full ${isMicEnabled ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'border-gray-700'}`}
                                    onClick={() => {
                                        setIsMicEnabled(!isMicEnabled);
                                        toast({ title: !isMicEnabled ? 'تم تفعيل الميكرفون' : 'تم كتم الصوت', description: 'الصوت مسموع لجميع أعضاء الفريق.' });
                                    }}
                                >
                                    <Mic size={14} className={isMicEnabled ? 'text-white' : 'text-gray-400'} />
                                </Button>
                                <Button
                                    variant={isScreenSharing ? "default" : "outline"}
                                    size="icon"
                                    className={`h-7 w-7 rounded-full ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-700'}`}
                                    onClick={() => {
                                        setIsScreenSharing(!isScreenSharing);
                                        toast({ title: !isScreenSharing ? 'بدء مشاركة الشاشة' : 'توقف مشاركة الشاشة' });
                                    }}
                                >
                                    <MonitorPlay size={14} className={isScreenSharing ? 'text-white' : 'text-gray-400'} />
                                </Button>
                            </div>
                        </div>

                        <div className="flex -space-x-2 overflow-hidden hover:space-x-1 transition-all px-1 pb-2">
                            {collaborators.map((c: any) => (
                                <div key={c.id} className="relative group cursor-pointer transition-all">
                                    <Avatar className={`h-8 w-8 ring-2 ${c.status === 'online' ? 'ring-green-500' : 'ring-gray-700'} shadow-xl`}>
                                        <AvatarImage src={c.avatar} />
                                        <AvatarFallback>{c.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity text-[8px] text-white font-bold">{c.name.split(' ')[0]}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-6">
                            {/* Live Screen Previews */}
                            <div className="space-y-3">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1 font-arabic">شاشات الفريق (مباشر)</span>
                                <div className="grid grid-cols-1 gap-3">
                                    {collaborators.filter((c: any) => c.screen).map((c: any) => (
                                        <div key={c.id} className="relative group rounded-xl overflow-hidden border border-white/5 bg-black/40 shadow-2xl">
                                            <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                                                <img src={c.screen!} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Preview" />
                                                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-md backdrop-blur-md">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Live: {c.name}</span>
                                                </div>
                                                <Button variant="ghost" size="icon" className="absolute bottom-2 right-2 h-6 w-6 bg-white/10 hover:bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Maximize2 size={12} className="text-white" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {collaborators.filter((c: any) => !c.screen && c.status === 'online').length > 0 && (
                                        <div className="p-4 border border-dashed border-gray-800 rounded-xl flex flex-col items-center justify-center gap-2 opacity-40">
                                            <MonitorPlay size={20} className="text-gray-600" />
                                            <span className="text-[10px] text-gray-600 italic font-arabic">باقي الفريق يشاهدون حالياً</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Review Comments */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2 flex-row-reverse">
                                        <MessageSquare size={12} className="text-blue-500" />
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-arabic">ملاحظات الفريق</span>
                                    </div>
                                    <span className="text-[9px] text-gray-600 px-1.5 py-0.5 bg-gray-900 rounded-full">{comments.length}</span>
                                </div>
                                <div className="space-y-3">
                                    {comments.sort((a: any, b: any) => {
                                        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                                        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                                        return dateB - dateA;
                                    }).map((c: any) => (
                                        <div key={c._id || c.id}
                                            className={`p-3 rounded-xl border border-white/5 space-y-2 cursor-pointer transition-all hover:bg-white/5 group ${Math.abs(currentTime - c.timestamp) < 0.5 ? 'bg-blue-600/10 border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-black/40'}`}
                                            onClick={() => setCurrentTime(c.timestamp)}>
                                            <div className="flex items-center justify-between flex-row-reverse">
                                                <div className="flex items-center gap-2 flex-row-reverse">
                                                    <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_4px_currentColor] bg-blue-500" />
                                                    <span className="text-[10px] font-bold text-white">{c.user?.name || c.userName || (c.user === currentTeam.admin ? 'المدير' : 'عضو')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] text-gray-600">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <Badge variant="secondary" className="text-[8px] font-mono bg-blue-500/10 text-blue-400 h-4 border-none">{formatTime(c.timestamp)}</Badge>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-gray-400 leading-relaxed font-arabic text-right">{c.content || c.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Float Input Bar */}
                    <div className="p-4 bg-[#1a1d21] border-t border-gray-800 space-y-3 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-[10px] text-gray-500 px-1 flex-row-reverse">
                                <span className="flex items-center gap-1.5 font-arabic"><MessageCircle size={10} /> إضافة تعليق للفريق</span>
                                <span className="font-mono text-blue-400 bg-blue-500/10 px-1.5 rounded">{formatTime(currentTime)}</span>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="اكتب ملاحظة ذكية..."
                                    className="bg-black/40 border-gray-700 h-9 text-xs focus:ring-1 focus:ring-blue-500 rounded-lg placeholder:text-gray-600 text-right font-arabic"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            addComment();
                                        }
                                    }}
                                    data-no-shortcuts="true"
                                />
                                <Button
                                    size="icon"
                                    className="h-9 w-9 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95 rounded-lg"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        addComment();
                                    }}
                                >
                                    <Send size={14} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default CollaborationPanel;
