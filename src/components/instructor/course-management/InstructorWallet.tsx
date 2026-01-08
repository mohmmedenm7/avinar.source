import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { DollarSign, Building, CreditCard, Clock, CheckCircle, XCircle, FileText, Landmark } from "lucide-react";

export default function InstructorWallet({ token }: { token: string }) {
    const { t } = useTranslation();
    const [balance, setBalance] = useState(0);
    const [earnings, setEarnings] = useState(0);
    const [requests, setRequests] = useState<any[]>([]);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState<"visa" | "bank_transfer">("visa");
    const [loading, setLoading] = useState(false);
    const [bankInfo, setBankInfo] = useState({
        bankName: "",
        iban: "",
        accountHolderName: ""
    });
    const [visaInfo, setVisaInfo] = useState({
        cardNumber: "",
    });
    const { toast } = useToast();

    const fetchData = async () => {
        if (!token) return;
        try {
            const statsRes = await axios.get(`${API_BASE_URL}/api/v1/instructor/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = statsRes.data?.data;
            setBalance(data?.instructor?.walletBalance || 0);
            setEarnings(data?.instructor?.totalEarnings || 0);

            const profileRes = await axios.get(`${API_BASE_URL}/api/v1/users/getMe`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const user = profileRes.data?.data;
            if (user?.bankAccount) {
                setBankInfo(user.bankAccount);
            }
            if (user?.visaCardNumber) {
                setVisaInfo({ cardNumber: user.visaCardNumber });
            }

            const requestsRes = await axios.get(`${API_BASE_URL}/api/v1/withdraw/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(requestsRes.data?.data || []);
        } catch (err) {
            console.error("Wallet Fetch Error:", err);
        }
    };

    useEffect(() => { fetchData(); }, [token]);

    const handleUpdateBankInfo = async () => {
        setLoading(true);
        try {
            await axios.put(`${API_BASE_URL}/api/v1/users/updateMe`,
                {
                    bankAccount: bankInfo,
                    visaCardNumber: visaInfo.cardNumber
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast({ title: t('common.success') || "تم تحديث بيانات الحساب بنجاح" });
        } catch (err) {
            toast({ title: t('common.error') || "فشل تحديث البيانات", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!amount || parseFloat(amount) <= 0) return;
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/v1/withdraw`,
                { amount: parseFloat(amount), method },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast({ title: t('common.success') || "تم إرسال طلب السحب بنجاح" });
            setAmount("");
            fetchData();
        } catch (err: any) {
            toast({
                title: err.response?.data?.message || t('common.error') || "فشل إرسال الطلب",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl transform hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium opacity-90">{t('dashboard.withdrawableBalance') || 'الرصيد القابل للسحب'}</h3>
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <div className="text-4xl font-black mb-2">${balance.toFixed(2)}</div>
                    <p className="text-sm opacity-75">{t('dashboard.readyToWithdraw') || 'جاهز للسحب في أي وقت'}</p>
                </Card>

                <Card className="p-8 bg-white border-none shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-600">{t('dashboard.totalEarnings') || 'إجمالي الأرباح'}</h3>
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                            <CreditCard size={24} className="text-green-600" />
                        </div>
                    </div>
                    <div className="text-4xl font-black text-gray-900 mb-2">${earnings.toFixed(2)}</div>
                    <p className="text-sm text-gray-400">{t('dashboard.totalEarningsDesc') || 'صافي أرباحك من جميع الكورسات'}</p>
                </Card>
            </div>

            {/* Withdraw Form */}
            <Card className="p-8 border-none shadow-lg bg-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    {t('dashboard.requestWithdrawal') || 'طلب سحب أموال'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">{t('common.amount') || 'المبلغ'}</label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-gray-50 border-gray-200 focus:ring-blue-500 h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">{t('dashboard.withdrawMethod') || 'طريقة السحب'}</label>
                        <div className="flex gap-2">
                            <Button
                                variant={method === "visa" ? "default" : "outline"}
                                onClick={() => setMethod("visa")}
                                className="flex-1 h-12 gap-2"
                            >
                                <CreditCard size={18} />
                                {t('dashboard.visa') || 'فيزا'}
                            </Button>
                            <Button
                                variant={method === "bank_transfer" ? "default" : "outline"}
                                onClick={() => setMethod("bank_transfer")}
                                className="flex-1 h-12 gap-2"
                            >
                                <Building size={18} />
                                {t('dashboard.bankTransfer') || 'تحويل بنكي'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={handleWithdraw}
                            disabled={loading || !amount}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                        >
                            {loading ? (t('common.processing') || "جاري المعالجة...") : (t('common.confirm') || "تأكيد الطلب")}
                        </Button>
                    </div>
                </div>

                {method === "bank_transfer" && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-700 text-sm flex items-center gap-2">
                        <Building size={16} />
                        {t('dashboard.bankDetailsRequired') || 'يجب توفر بيانات بنكية صالحة في الإعدادات أدناه لإتمام التحويل.'}
                    </div>
                )}
                {method === "visa" && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm flex items-center gap-2">
                        <CreditCard size={16} />
                        {t('dashboard.visaDetailsRequired') || 'سيتم التحويل إلى رقم البطاقة المحفوظ في الإعدادات.'}
                    </div>
                )}
            </Card>

            {/* Bank Account Settings */}
            <Card className="p-8 border-none shadow-lg bg-white">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Landmark className="text-gray-400" /> {t('dashboard.bankAccountSettings') || 'إعدادات الحساب البنكي'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">{t('dashboard.bankName') || 'اسم البنك'}</label>
                        <Input
                            value={bankInfo.bankName}
                            onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                            className="bg-gray-50 h-11"
                            placeholder={t('dashboard.bankNamePlaceholder') || "مثال: البنك الأهلي المصري"}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">{t('dashboard.iban') || 'IBAN / رقم الحساب'}</label>
                        <Input
                            value={bankInfo.iban}
                            onChange={(e) => setBankInfo({ ...bankInfo, iban: e.target.value })}
                            className="bg-gray-50 h-11"
                            placeholder="EG..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">{t('dashboard.accountHolder') || 'اسم صاحب الحساب'}</label>
                        <Input
                            value={bankInfo.accountHolderName}
                            onChange={(e) => setBankInfo({ ...bankInfo, accountHolderName: e.target.value })}
                            className="bg-gray-50 h-11"
                            placeholder={t('dashboard.accountHolderPlaceholder') || "الاسم الثلاثي كما هو في البنك"}
                        />
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-gray-700">
                        <CreditCard size={16} /> {t('dashboard.visaDetails') || "بيانات الفيزا (اختياري)"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">{t('dashboard.cardNumber') || 'رقم البطاقة (للاستقبال)'}</label>
                            <Input
                                value={visaInfo.cardNumber}
                                onChange={(e) => setVisaInfo({ ...visaInfo, cardNumber: e.target.value })}
                                className="bg-gray-50 h-11"
                                placeholder="xxxx xxxx xxxx xxxx"
                            />
                        </div>
                    </div>
                </div>
                <Button
                    variant="secondary"
                    className="mt-6 bg-gray-900 hover:bg-black text-white px-8"
                    onClick={handleUpdateBankInfo}
                    disabled={loading}
                >
                    {loading ? (t('common.saving') || "جاري الحفظ...") : (t('common.saveSettings') || "حفظ بيانات الحساب")}
                </Button>
            </Card>

            {/* History */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold">{t('dashboard.transactionHistory') || 'سجل العمليات'}</h3>
                <div className="grid grid-cols-1 gap-4">
                    {requests.map((req) => (
                        <Card key={req._id} className="p-6 border-none shadow-sm hover:shadow-md transition-shadow bg-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${req.status === 'approved' ? 'bg-green-100 text-green-600' :
                                        req.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {req.status === 'approved' ? <CheckCircle size={24} /> :
                                            req.status === 'pending' ? <Clock size={24} /> : <XCircle size={24} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">${req.amount.toFixed(2)}</div>
                                        <div className="text-sm text-gray-500">
                                            {req.method === 'visa' ? t('dashboard.visaWithdraw') || 'سحب عبر فيزا' : t('dashboard.bankTransferWithdraw') || 'تحويل بنكي'} • {new Date(req.createdAt).toLocaleDateString('ar-EG')}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {req.paymentReceipt && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => window.open(req.paymentReceipt, '_blank')}
                                        >
                                            <FileText size={16} />
                                            {t('dashboard.receipt') || 'وصل التحويل'}
                                        </Button>
                                    )}
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        req.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {req.status === 'approved' ? t('dashboard.completed') || 'مكتمل' : req.status === 'pending' ? t('dashboard.pending') || 'قيد الانتظار' : t('dashboard.rejected') || 'مرفوض'}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {requests.length === 0 && (
                        <div className="text-center py-12 text-gray-400">{t('dashboard.noTransactions') || 'لا توجد عمليات سحب سابقة'}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
