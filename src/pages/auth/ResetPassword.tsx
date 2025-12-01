import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if email exists in localStorage
        const email = localStorage.getItem("resetEmail");
        if (!email) {
            toast({
                title: "خطأ",
                description: "يرجى إكمال خطوات استرجاع كلمة المرور أولاً",
                variant: "destructive",
            });
            navigate("/forgot-password");
        }
    }, [navigate, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword.trim() || !confirmPassword.trim()) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال كلمة المرور وتأكيدها",
                variant: "destructive",
            });
            return;
        }

        // Validate password length
        if (newPassword.length < 6) {
            toast({
                title: "خطأ",
                description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
                variant: "destructive",
            });
            return;
        }

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            toast({
                title: "خطأ",
                description: "كلمات المرور غير متطابقة",
                variant: "destructive",
            });
            return;
        }

        const email = localStorage.getItem("resetEmail");
        if (!email) {
            toast({
                title: "خطأ",
                description: "حدث خطأ، يرجى المحاولة مرة أخرى",
                variant: "destructive",
            });
            navigate("/forgot-password");
            return;
        }

        setLoading(true);

        try {
            await axios.put(`${API_BASE_URL}/api/v1/auth/resetPassword`, {
                email: email,
                newPassword: newPassword.trim(),
            });

            // Clear email from localStorage
            localStorage.removeItem("resetEmail");

            toast({
                title: "✓ تم التحديث",
                description: "تم تحديث كلمة المرور بنجاح",
            });

            // Navigate to login page
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err: any) {
            toast({
                title: "خطأ",
                description: err.response?.data?.message || "فشل تحديث كلمة المرور",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">تعيين كلمة مرور جديدة</CardTitle>
                    <p className="text-sm text-gray-600 text-center mt-2">
                        أدخل كلمة المرور الجديدة الخاصة بك
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                كلمة المرور الجديدة
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={loading}
                                className="text-right"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                تأكيد كلمة المرور
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                className="text-right"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
                        </Button>

                        <div className="text-center">
                            <Button
                                type="button"
                                variant="link"
                                onClick={() => {
                                    localStorage.removeItem("resetEmail");
                                    navigate("/login");
                                }}
                                className="text-sm"
                            >
                                العودة لتسجيل الدخول
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPassword;
