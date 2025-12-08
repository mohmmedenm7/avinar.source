import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AppleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("جاري المعالجة...");

    useEffect(() => {
        const handleCallback = async () => {
            // For Apple, backend redirects here with query params: token, email, role, userId, or error
            const token = searchParams.get("token");
            const error = searchParams.get("error");
            const email = searchParams.get("email");
            const role = searchParams.get("role");
            const userId = searchParams.get("userId");

            if (error) {
                setStatus(`حدث خطأ في المصادقة: ${error}`);
                setTimeout(() => navigate("/login"), 3000);
                return;
            }

            if (!token) {
                setStatus("لم يتم استلام رمز الدخول");
                setTimeout(() => navigate("/login"), 2000);
                return;
            }

            try {
                // Save authentication data
                localStorage.setItem("token", token);
                if (email) localStorage.setItem("email", email);
                if (role) localStorage.setItem("role", role);
                if (userId) localStorage.setItem("userId", userId);

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
                setStatus("خطأ غير متوقع");
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
                        // border: "4px solid #000",
                        // borderTopColor: "transparent",
                        // borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "40px"
                    }}
                >
                    🍎
                </div>
                <h2 style={{ marginBottom: 10, color: "#374151" }}>Apple Login</h2>
                <p style={{ color: "#6b7280" }}>{status}</p>
            </div>
        </div>
    );
};

export default AppleCallback;
