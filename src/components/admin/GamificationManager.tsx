import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Edit, Award, Target } from "lucide-react";

interface Badge {
    _id: string;
    name: string;
    description: string;
    icon?: string;
    type: string;
    points: number;
}

interface Challenge {
    _id: string;
    title: string;
    description: string;
    type: string;
    target: number;
    xpReward: number;
    badgeReward?: string | { _id: string, name: string };
    category: string;
    isActive: boolean;
    triviaData?: {
        question: string;
        options: string[];
        correctAnswer: number;
    };
}

// ----------------------------------------------------------------------------
// Challenges Tab Component
// ----------------------------------------------------------------------------
const ChallengesTab = ({ challenges, badges, token, onUpdate }: { challenges: Challenge[], badges: Badge[], token: string, onUpdate: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { toast } = useToast();

    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        type: string;
        target: number;
        xpReward: number;
        badgeReward: string;
        category: string;
        isActive: boolean;
        triviaData?: {
            question: string;
            options: string[];
            correctAnswer: number;
        }
    }>({
        title: '',
        description: '',
        type: 'watch_video',
        target: 1,
        xpReward: 50,
        badgeReward: '',
        category: 'General',
        isActive: true,
        triviaData: {
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0
        }
    });

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'watch_video',
            target: 1,
            xpReward: 50,
            badgeReward: '',
            category: 'General',
            isActive: true,
            triviaData: {
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0
            }
        });
        setEditingId(null);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...formData,
                badgeReward: formData.badgeReward === 'none' ? undefined : formData.badgeReward,
                triviaData: formData.type === 'trivia' ? formData.triviaData : undefined
            };

            if (editingId) {
                await axios.put(`${API_BASE_URL}/api/v1/daily-challenges/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast({ title: "تم تحديث التحدي بنجاح" });
            } else {
                await axios.post(`${API_BASE_URL}/api/v1/daily-challenges`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast({ title: "تم إنشاء التحدي بنجاح" });
            }
            setIsOpen(false);
            resetForm();
            onUpdate();
        } catch (error: any) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "حدث خطأ ما",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من الحذف؟")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/v1/daily-challenges/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: "تم الحذف بنجاح" });
            onUpdate();
        } catch (error) {
            console.error(error);
            toast({
                title: "خطأ",
                description: "حدث خطأ أثناء الحذف",
                variant: "destructive"
            });
        }
    };

    const handleEdit = (challenge: Challenge) => {
        setEditingId(challenge._id);
        setFormData({
            title: challenge.title,
            description: challenge.description || '',
            type: challenge.type,
            target: challenge.target,
            xpReward: challenge.xpReward || 50,
            badgeReward: typeof challenge.badgeReward === 'object' ? challenge.badgeReward?._id || '' : challenge.badgeReward || '',
            category: challenge.category || 'General',
            isActive: challenge.isActive,
            triviaData: challenge.triviaData || {
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0
            }
        });
        setIsOpen(true);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>قائمة التحديات</CardTitle>
                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><PlusCircle size={16} /> إضافة تحدي</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-xl font-bold text-right">{editingId ? 'تعديل التحدي' : 'إضافة تحدي جديد'}</DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 pt-2">
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-right">عنوان التحدي</label>
                                    <Input
                                        className="text-right"
                                        placeholder="مثال: شاهد فيديو تعليمي"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-right">الوصف</label>
                                    <Textarea
                                        className="text-right min-h-[100px]"
                                        placeholder="تفاصيل التحدي..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-right">نوع التحدي</label>
                                        <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                            <SelectTrigger className="flex-row-reverse"><SelectValue /></SelectTrigger>
                                            <SelectContent className="text-right">
                                                <SelectItem value="watch_video" className="justify-end">مشاهدة فيديو (Watch Video)</SelectItem>
                                                <SelectItem value="complete_quiz" className="justify-end">إكمال اختبار (Complete Quiz)</SelectItem>
                                                <SelectItem value="assignment_submit" className="justify-end">تسليم واجب (Assignment)</SelectItem>
                                                <SelectItem value="login" className="justify-end">تسجيل دخول (Login)</SelectItem>
                                                <SelectItem value="discussion_post" className="justify-end">مشاركة نقاش (Discussion)</SelectItem>
                                                <SelectItem value="trivia" className="justify-end">سؤال عام (Trivia)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-right">الفئة</label>
                                        <Input
                                            className="text-right"
                                            placeholder="General, Learning..."
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {formData.type === 'trivia' && (
                                    <div className="border border-purple-200 bg-purple-50/50 p-5 rounded-xl space-y-5">
                                        <div className="flex items-center gap-2 justify-end text-purple-800">
                                            <h4 className="font-bold text-sm">إعدادات السؤال (Trivia)</h4>
                                            <Target size={18} />
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium text-right">نص السؤال</label>
                                            <Input
                                                className="text-right bg-white"
                                                placeholder="اكتب السؤال هنا..."
                                                value={formData.triviaData?.question || ''}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    triviaData: { ...formData.triviaData, question: e.target.value }
                                                })}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-right block">الخيارات</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {[0, 1, 2, 3].map((idx) => (
                                                    <div key={idx} className="relative">
                                                        <span className="absolute left-3 top-2.5 text-xs text-gray-400">#{idx + 1}</span>
                                                        <Input
                                                            className="text-right pr-4 bg-white"
                                                            placeholder={`الخيار ${idx + 1}`}
                                                            value={formData.triviaData?.options?.[idx] || ''}
                                                            onChange={e => {
                                                                const newOptions = [...(formData.triviaData?.options || ['', '', '', ''])];
                                                                newOptions[idx] = e.target.value;
                                                                setFormData({
                                                                    ...formData,
                                                                    triviaData: { ...formData.triviaData, options: newOptions }
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium text-right">الإجابة الصحيحة</label>
                                            <Select
                                                value={formData.triviaData?.correctAnswer?.toString()}
                                                onValueChange={v => setFormData({
                                                    ...formData,
                                                    triviaData: { ...formData.triviaData, correctAnswer: parseInt(v) }
                                                })}
                                            >
                                                <SelectTrigger className="flex-row-reverse bg-white"><SelectValue placeholder="اختر الإجابة الصحيحة" /></SelectTrigger>
                                                <SelectContent className="text-right">
                                                    <SelectItem value="0" className="justify-end text-right">الخيار 1</SelectItem>
                                                    <SelectItem value="1" className="justify-end text-right">الخيار 2</SelectItem>
                                                    <SelectItem value="2" className="justify-end text-right">الخيار 3</SelectItem>
                                                    <SelectItem value="3" className="justify-end text-right">الخيار 4</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-right">القيمة المستهدفة (Target)</label>
                                        <Input type="number" className="text-right" value={formData.target} onChange={e => setFormData({ ...formData, target: +e.target.value })} />
                                        <p className="text-[10px] text-gray-400 text-right">عدد تكرار النشاط لإكمال التحدي</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-right">مكافأة الخبرة (XP)</label>
                                        <Input type="number" className="text-right" value={formData.xpReward} onChange={e => setFormData({ ...formData, xpReward: +e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-right">الوسام (اختياري)</label>
                                        <Select value={formData.badgeReward} onValueChange={v => setFormData({ ...formData, badgeReward: v })}>
                                            <SelectTrigger className="flex-row-reverse"><SelectValue placeholder="اختر وسام..." /></SelectTrigger>
                                            <SelectContent className="text-right">
                                                <SelectItem value="none" className="justify-end">بدون وسام</SelectItem>
                                                {badges.map((b: Badge) => (
                                                    <SelectItem key={b._id} value={b._id} className="justify-end">{b.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 pt-2 border-t mt-auto">
                            <Button className="w-full" onClick={handleSubmit}>{editingId ? 'حفظ التعديلات' : 'إضافة التحدي'}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>التحدي</TableHead>
                            <TableHead>النوع</TableHead>
                            <TableHead>XP</TableHead>
                            <TableHead>الوسام</TableHead>
                            <TableHead className="text-right">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {challenges.map((challenge: Challenge) => (
                            <TableRow key={challenge._id}>
                                <TableCell>
                                    <div className="font-medium">{challenge.title}</div>
                                    <div className="text-xs text-gray-500">{challenge.category} | Target: {challenge.target}</div>
                                </TableCell>
                                <TableCell>{challenge.type}</TableCell>
                                <TableCell>{challenge.xpReward}</TableCell>
                                <TableCell>
                                    {challenge.badgeReward ? (
                                        <span className="inline-flex items-center gap-1 rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                            <Award size={12} />
                                            {(challenge.badgeReward as { name: string }).name || 'Badge'}
                                        </span>
                                    ) : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(challenge)}><Edit size={16} /></Button>
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(challenge._id)}><Trash2 size={16} /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export const GamificationManager = ({ token }: { token: string }) => {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const { toast } = useToast();

    const fetchBadges = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/badges?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBadges(res.data.data);
        } catch (error) {
            console.error(error);
            toast({
                title: "خطأ",
                description: "فشل في جلب الأوسمة",
                variant: "destructive"
            });
        }
    };

    const fetchChallenges = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/daily-challenges?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChallenges(res.data.data);
        } catch (error) {
            console.error(error);
            toast({
                title: "خطأ",
                description: "فشل في جلب التحديات",
                variant: "destructive"
            });
        }
    };

    useEffect(() => {
        fetchBadges();
        fetchChallenges();
    }, [token]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">نظام الألعاب (Gamification)</h2>
            </div>

            <Tabs defaultValue="challenges" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="challenges" className="gap-2"><Target size={16} /> التحديات اليومية</TabsTrigger>
                    <TabsTrigger value="badges" className="gap-2"><Award size={16} /> الأوسمة والجوائز</TabsTrigger>
                </TabsList>

                <TabsContent value="challenges" className="mt-6">
                    <ChallengesTab
                        challenges={challenges}
                        badges={badges}
                        token={token}
                        onUpdate={fetchChallenges}
                    />
                </TabsContent>

                <TabsContent value="badges" className="mt-6">
                    <BadgesTab
                        badges={badges}
                        token={token}
                        onUpdate={fetchBadges}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

// ----------------------------------------------------------------------------
// Badges Tab Component
// ----------------------------------------------------------------------------
const BadgesTab = ({ badges, token, onUpdate }: { badges: Badge[], token: string, onUpdate: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'course_completion',
        points: 10,
        icon: '',
        rarity: 'common'
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            type: 'course_completion',
            points: 10,
            icon: '',
            rarity: 'common'
        });
        setEditingId(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingId) {
                await axios.put(`${API_BASE_URL}/api/v1/badges/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast({ title: "تم تحديث الوسام بنجاح" });
            } else {
                await axios.post(`${API_BASE_URL}/api/v1/badges`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast({ title: "تم إنشاء الوسام بنجاح" });
            }
            setIsOpen(false);
            resetForm();
            onUpdate();
        } catch (error: any) {
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "حدث خطأ ما",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من الحذف؟")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/v1/badges/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: "تم الحذف بنجاح" });
            onUpdate();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (badge: any) => {
        setEditingId(badge._id);
        setFormData({
            name: badge.name,
            description: badge.description || '',
            type: badge.type,
            points: badge.points,
            icon: badge.icon || '',
            rarity: badge.rarity || 'common'
        });
        setIsOpen(true);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>قائمة الأوسمة</CardTitle>
                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><PlusCircle size={16} /> إضافة وسام</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'تعديل الوسام' : 'إضافة وسام جديد'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label>اسم الوسام</label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <label>الوصف</label>
                                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label>النوع</label>
                                    <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="course_completion">Course Completion</SelectItem>
                                            <SelectItem value="quiz_mastery">Quiz Mastery</SelectItem>
                                            <SelectItem value="streak">Streak</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <label>الندرة</label>
                                    <Select value={formData.rarity} onValueChange={v => setFormData({ ...formData, rarity: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="common">Common (عادِي)</SelectItem>
                                            <SelectItem value="rare">Rare (نادر)</SelectItem>
                                            <SelectItem value="epic">Epic (أسطوري)</SelectItem>
                                            <SelectItem value="legendary">Legendary (خرافي)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label>نقاط إضافية (Points)</label>
                                <Input type="number" value={formData.points} onChange={e => setFormData({ ...formData, points: +e.target.value })} />
                            </div>
                            <Button onClick={handleSubmit}>{editingId ? 'تحديث' : 'إنشاء'}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>الاسم</TableHead>
                            <TableHead>النوع</TableHead>
                            <TableHead>الندرة</TableHead>
                            <TableHead>النقاط</TableHead>
                            <TableHead className="text-right">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {badges.map((badge: any) => (
                            <TableRow key={badge._id}>
                                <TableCell>
                                    <div className="font-medium">{badge.name}</div>
                                    <div className="text-xs text-gray-500">{badge.description}</div>
                                </TableCell>
                                <TableCell>{badge.type}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold 
                        ${badge.rarity === 'legendary' ? 'bg-orange-100 text-orange-800' :
                                            badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                                                badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {badge.rarity}
                                    </span>
                                </TableCell>
                                <TableCell>{badge.points}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(badge)}><Edit size={16} /></Button>
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(badge._id)}><Trash2 size={16} /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
