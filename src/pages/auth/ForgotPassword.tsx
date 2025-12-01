import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال البريد الإلكتروني",
                variant: "destructive",
            });
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال بريد إلكتروني صحيح",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/api/v1/auth/forgotPassword`, {
                email: email.trim(),
            });

            // Store email in localStorage for next steps
            localStorage.setItem("resetEmail", email.trim());

            toast({
                title: "✓ تم الإرسال",
                description: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
            });

            // Navigate to verify code page
            navigate("/verify-reset-code");
        } catch (err: any) {
            toast({
                title: "خطأ",
                description: err.response?.data?.message || "فشل إرسال رمز التحقق",
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
                    <CardTitle className="text-2xl text-center">نسيت كلمة المرور</CardTitle>
                    <p className="text-sm text-gray-600 text-center mt-2">
                        أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                البريد الإلكتروني
                            </label>
                            <Input
                                type="email"
                                placeholder="example@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                className="text-right"
                                dir="ltr"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
                        </Button>

                        <div className="text-center">
                            <Button
                                type="button"
                                variant="link"
                                onClick={() => navigate("/login")}
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

export default ForgotPassword;
