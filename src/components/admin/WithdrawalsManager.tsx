import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, Clock, Image as ImageIcon, DollarSign, Wallet, User as UserIcon, Building, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function WithdrawalsManager({ token }: { token: string }) {
    const [requests, setRequests] = useState<any[]>([]);
    const [platformStats, setPlatformStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [receipt, setReceipt] = useState<File | null>(null);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    // Platform Withdraw State
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawMethod, setWithdrawMethod] = useState("visa");
    const [withdrawDetails, setWithdrawDetails] = useState("");

    // Bonus State
    const [bonusOpen, setBonusOpen] = useState(false);
    const [bonusAmount, setBonusAmount] = useState("");
    const [bonusReason, setBonusReason] = useState("");
    const [bonusInstructor, setBonusInstructor] = useState("");
    const [instructors, setInstructors] = useState<any[]>([]);

    const [actionLoading, setActionLoading] = useState(false);
    const { toast } = useToast();

    const fetchData = async () => {
        try {
            const [reqsRes, statsRes, instructorsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/v1/withdraw`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/v1/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/v1/users?role=manager`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setRequests(reqsRes.data?.data || []);
            setPlatformStats(statsRes.data?.data?.finances || null);
            setInstructors(instructorsRes.data?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchData(); }, [token]);

    const handleApprove = async (id: string) => {
        if (!receipt) {
            toast({ title: "يرجى اختيار صورة الوصل أولاً", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("paymentReceipt", receipt);
            formData.append("adminMessage", "تم التحويل بنجاح");

            await axios.put(`${API_BASE_URL}/api/v1/withdraw/${id}/approve`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast({ title: "تم تأكيد عملية السحب بنجاح" });
            setApprovingId(null);
            setReceipt(null);
            fetchData();
        } catch (err: any) {
            toast({ title: "فشل تأكيد العملية", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handlePlatformWithdraw = async () => {
        setActionLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/v1/platform-wallet/withdraw`, {
                amount: parseFloat(withdrawAmount),
                method: withdrawMethod,
                details: withdrawDetails
            }, { headers: { Authorization: `Bearer ${token}` } });

            toast({ title: "تم سحب الأموال من المنصة بنجاح" });
            setWithdrawOpen(false);
            setWithdrawAmount("");
            fetchData();
        } catch (err: any) {
            toast({ title: err.response?.data?.message || "فشل عملية السحب", variant: "destructive" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendBonus = async () => {
        setActionLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/v1/platform-wallet/send-bonus`, {
                userId: bonusInstructor,
                amount: parseFloat(bonusAmount),
                reason: bonusReason
            }, { headers: { Authorization: `Bearer ${token}` } });

            toast({ title: "تم إرسال المكافأة بنجاح" });
            setBonusOpen(false);
            setBonusAmount("");
            setBonusReason("");
            setBonusInstructor("");
            fetchData(); // Refresh to update wallet balance
        } catch (err: any) {
            toast({ title: err.response?.data?.message || "فشل إرسال المكافأة", variant: "destructive" });
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Platform Finances */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">إجمالي محفظة المنصة</p>
                            <h3 className="text-2xl font-bold">${platformStats?.platformTotal?.toFixed(2) || 0}</h3>
                            <Button variant="link" className="p-0 h-auto text-blue-600 text-xs" onClick={() => setWithdrawOpen(true)}>
                                سحب أرباح المنصة
                            </Button>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">الإيرادات الكلية</p>
                            <h3 className="text-2xl font-bold">${platformStats?.totalRevenue?.toFixed(2) || 0}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-sm bg-white border-s-4 border-s-orange-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                            <UserIcon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">مكافآت المدربين</p>
                            <Button size="sm" className="mt-1 bg-orange-600 hover:bg-orange-700 text-white" onClick={() => setBonusOpen(true)}>
                                إرسال مكافأة
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold">طلبات سحب الأموال</h3>
                <div className="grid grid-cols-1 gap-4">
                    {requests.map((req) => (
                        <Card key={req._id} className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-14 h-14 border-2 border-gray-100">
                                        <AvatarImage src={req.user?.profileImg?.startsWith('http') ? req.user.profileImg : `${API_BASE_URL}/users/${req.user?.profileImg}`} />
                                        <AvatarFallback>{req.user?.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">{req.user?.name}</h4>
                                        <p className="text-sm text-gray-500">{req.user?.email}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${req.method === 'bank_transfer' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {req.method === 'bank_transfer' ? 'تحويل بنكي' : 'فيزا'}
                                            </span>
                                            <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleString('ar-EG')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center md:items-end gap-2">
                                    <div className="text-3xl font-black text-gray-900">${req.amount.toFixed(2)}</div>
                                    <div className="flex items-center gap-2">
                                        {req.status === 'pending' ? (
                                            <div className="flex items-center gap-2">
                                                {approvingId === req._id ? (
                                                    <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
                                                        <Input
                                                            type="file"
                                                            onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                                                            className="w-48 h-9 text-xs"
                                                            accept="image/*"
                                                        />
                                                        <Button size="sm" onClick={() => handleApprove(req._id)} disabled={loading}>
                                                            {loading ? "جاري الحفظ..." : "تأكيد"}
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setApprovingId(null)}>إلغاء</Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        className="bg-green-600 hover:bg-green-700 gap-2"
                                                        onClick={() => setApprovingId(req._id)}
                                                    >
                                                        <CheckCircle size={18} />
                                                        موافقة ورفع الوصل
                                                    </Button>
                                                )}
                                                <Button variant="outline" className="text-red-500 border-red-100 hover:bg-red-50">
                                                    <XCircle size={18} />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {req.paymentReceipt && (
                                                    <Button variant="ghost" className="text-blue-600 gap-2" onClick={() => window.open(req.paymentReceipt, '_blank')}>
                                                        <ImageIcon size={18} />
                                                        عرض الوصل
                                                    </Button>
                                                )}
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {req.status === 'approved' ? 'تم الدفع' : 'مرفوض'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {req.method === 'bank_transfer' && req.status === 'pending' && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">اسم البنك</p>
                                        <p className="text-sm font-bold text-gray-700">{req.bankDetails?.bankName || req.user?.bankAccount?.bankName || 'غير متوفر'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">IBAN / رقم الحساب</p>
                                        <p className="text-sm font-bold text-gray-700">{req.bankDetails?.iban || req.user?.bankAccount?.iban || 'غير متوفر'}</p>
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">اسم صاحب الحساب</p>
                                        <p className="text-sm font-bold text-gray-700">{req.bankDetails?.accountHolderName || req.user?.bankAccount?.accountHolderName || 'غير متوفر'}</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                    {requests.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                            <div className="text-gray-400 mb-2">لا توجد طلبات سحب حالياً</div>
                            <p className="text-xs text-gray-300">عندما يقوم المدربون بطلب سحب أرباحهم، ستظهر هنا.</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Platform Withdraw Dialog */}
            <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>سحب أرباح المنصة</DialogTitle>
                        <DialogDescription>
                            سيتم خصم المبلغ من رصيد المنصة وتحويله للحساب المحدد.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>المبلغ ($)</Label>
                            <Input
                                type="number"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>طريقة السحب</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant={withdrawMethod === 'visa' ? 'default' : 'outline'}
                                    className="flex-1 gap-2"
                                    onClick={() => setWithdrawMethod('visa')}
                                >
                                    <CreditCard size={16} /> فيزا
                                </Button>
                                <Button
                                    variant={withdrawMethod === 'bank_transfer' ? 'default' : 'outline'}
                                    className="flex-1 gap-2"
                                    onClick={() => setWithdrawMethod('bank_transfer')}
                                >
                                    <Building size={16} /> تحويل بنكي
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{withdrawMethod === 'visa' ? 'رقم البطاقة' : 'بيانات الحساب البنكي'}</Label>
                            <Input
                                value={withdrawDetails}
                                onChange={(e) => setWithdrawDetails(e.target.value)}
                                placeholder={withdrawMethod === 'visa' ? "xxxx xxxx xxxx xxxx" : "اسم البنك - الايبان"}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setWithdrawOpen(false)}>إلغاء</Button>
                        <Button onClick={handlePlatformWithdraw} disabled={actionLoading}>
                            {actionLoading ? "جاري المعالجة..." : "تأكيد السحب"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Send Bonus Dialog */}
            <Dialog open={bonusOpen} onOpenChange={setBonusOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>إرسال مكافأة لمدرب</DialogTitle>
                        <DialogDescription>
                            سيتم إضافة المبلغ لمحفظة المدرب وخصمه من رصيد المنصة.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>اختر المدرب</Label>
                            <Select onValueChange={setBonusInstructor} value={bonusInstructor}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر مدرباً من القائمة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {instructors.map((inst) => (
                                        <SelectItem key={inst._id} value={inst._id}>
                                            {inst.name} ({inst.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>المبلغ ($)</Label>
                            <Input
                                type="number"
                                value={bonusAmount}
                                onChange={(e) => setBonusAmount(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>سبب المكافأة</Label>
                            <Input
                                value={bonusReason}
                                onChange={(e) => setBonusReason(e.target.value)}
                                placeholder="مثال: مكافأة الأداء المتميز"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBonusOpen(false)}>إلغاء</Button>
                        <Button onClick={handleSendBonus} disabled={actionLoading}>
                            {actionLoading ? "جاري الإرسال..." : "إرسال المكافأة"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
