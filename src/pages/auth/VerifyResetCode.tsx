import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";

const VerifyResetCode = () => {
    const [resetCode, setResetCode] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if email exists in localStorage
        const email = localStorage.getItem("resetEmail");
        if (!email) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال البريد الإلكتروني أولاً",
                variant: "destructive",
            });
            navigate("/forgot-password");
        }
    }, [navigate, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resetCode.trim()) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال رمز التحقق",
                variant: "destructive",
            });
            return;
        }

        // Validate code is 6 digits
        if (!/^\d{6}$/.test(resetCode.trim())) {
            toast({
                title: "خطأ",
                description: "رمز التحقق يجب أن يكون 6 أرقام",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/api/v1/auth/verifyResetCode`, {
                resetCode: resetCode.trim(),
            });

            toast({
                title: "✓ تم التحقق",
                description: "تم التحقق من الرمز بنجاح",
            });

            // Navigate to reset password page
            navigate("/reset-password");
        } catch (err: any) {
            toast({
                title: "خطأ",
                description: err.response?.data?.message || "رمز التحقق غير صحيح",
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
                    <CardTitle className="text-2xl text-center">التحقق من الرمز</CardTitle>
                    <p className="text-sm text-gray-600 text-center mt-2">
                        أدخل رمز التحقق المكون من 6 أرقام المرسل إلى بريدك
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                رمز التحقق
                            </label>
                            <Input
                                type="text"
                                placeholder="123456"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                                disabled={loading}
                                maxLength={6}
                                className="text-center text-2xl tracking-widest"
                                dir="ltr"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "جاري التحقق..." : "تحقق من الرمز"}
                        </Button>

                        <div className="text-center space-y-2">
                            <Button
                                type="button"
                                variant="link"
                                onClick={() => navigate("/forgot-password")}
                                className="text-sm"
                            >
                                إعادة إرسال الرمز
                            </Button>
                            <br />
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

export default VerifyResetCode;
