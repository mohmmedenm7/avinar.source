import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "@/config/env";

const MicrosoftCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("جاري المعالجة...");

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get("code");
            const error = searchParams.get("error");

            if (error) {
                setStatus("حدث خطأ في المصادقة");
                setTimeout(() => navigate("/login"), 2000);
                return;
            }

            if (!code) {
                setStatus("رمز المصادقة مفقود");
                setTimeout(() => navigate("/login"), 2000);
                return;
            }

            try {
                setStatus("جاري التحقق من البيانات...");
                const res = await fetch(`${API_BASE_URL}/api/v1/auth/microsoft/callback`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setStatus(data.message || "فشل في المصادقة");
                    setTimeout(() => navigate("/login"), 2000);
                    return;
                }

                const token = data.token;
                const userEmail = data.data?.email;
                const role = data.data?.role ?? "user";
                const userId = data.data?._id;

                if (!token || !userEmail) {
                    setStatus("استجابة غير صحيحة من السيرفر");
                    setTimeout(() => navigate("/login"), 2000);
                    return;
                }

                // Save authentication data
                localStorage.setItem("token", token);
                localStorage.setItem("email", userEmail);
                localStorage.setItem("role", role);
                if (userId) {
                    localStorage.setItem("userId", userId);
                }

                // Dispatch auth changed event
                window.dispatchEvent(new Event("authChanged"));

                setStatus("تم تسجيل الدخول بنجاح!");

                // Redirect based on role
                setTimeout(() => {
                    if (role === "admin") navigate("/AdminDashboard", { replace: true });
                    else if (role === "manager") navigate("/InstructorDashboard", { replace: true });
                    else navigate("/UserDashboard", { replace: true });
                }, 1000);
            } catch (err) {
                console.error(err);
                setStatus("خطأ في الاتصال بالسيرفر");
                setTimeout(() => navigate("/login"), 2000);
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f3f4f6",
            }}
        >
            <div
                style={{
                    width: 400,
                    padding: 40,
                    background: "#fff",
                    borderRadius: 8,
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        width: 60,
                        height: 60,
                        margin: "0 auto 20px",
                        border: "4px solid #f35325",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                    }}
                ></div>
                <h2 style={{ marginBottom: 10, color: "#374151" }}>Microsoft Login</h2>
                <p style={{ color: "#6b7280" }}>{status}</p>
                <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        </div>
    );
};

export default MicrosoftCallback;
