import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";

const VerifySignupOTP = () => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if email exists in localStorage
        const signupEmail = localStorage.getItem("signupEmail");
        if (!signupEmail) {
            toast({
                title: "خطأ",
                description: "يرجى التسجيل أولاً",
                variant: "destructive",
            });
            navigate("/register");
        } else {
            setEmail(signupEmail);
        }
    }, [navigate, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp.trim()) {
            toast({
                title: "خطأ",
                description: "يرجى إدخال رمز التحقق",
                variant: "destructive",
            });
            return;
        }

        // Validate OTP is 6 digits
        if (!/^\d{6}$/.test(otp.trim())) {
            toast({
                title: "خطأ",
                description: "رمز التحقق يجب أن يكون 6 أرقام",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/api/v1/auth/verifySignupOTP`, {
                email: email,
                otp: otp.trim(),
            });

            // Clear email from localStorage
            localStorage.removeItem("signupEmail");

            toast({
                title: "✓ تم التفعيل",
                description: "تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول",
            });

            // Navigate to login page
            setTimeout(() => {
                navigate("/login");
            }, 1500);
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

    const handleResendOTP = () => {
        localStorage.removeItem("signupEmail");
        navigate("/register");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">تفعيل الحساب</CardTitle>
                    <p className="text-sm text-gray-600 text-center mt-2">
                        أدخل رمز التحقق المكون من 6 أرقام المرسل إلى
                    </p>
                    <p className="text-sm text-blue-600 text-center font-medium">
                        {email}
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                رمز التحقق (OTP)
                            </label>
                            <Input
                                type="text"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
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
                            {loading ? "جاري التحقق..." : "تفعيل الحساب"}
                        </Button>

                        <div className="text-center space-y-2">
                            <Button
                                type="button"
                                variant="link"
                                onClick={handleResendOTP}
                                className="text-sm"
                            >
                                لم يصلك الرمز؟ إعادة التسجيل
                            </Button>
                            <br />
                            <Button
                                type="button"
                                variant="link"
                                onClick={() => {
                                    localStorage.removeItem("signupEmail");
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

export default VerifySignupOTP;
