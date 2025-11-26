import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config/env";

interface LoginResponse {
  token?: string;
  accessToken?: string;
  user?: {
    email?: string;
    role?: string;
  };
  email?: string;
  role?: string;
  message?: string;
  data?: {
    email?: string;
    role?: string;
  };
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // إذا المستخدم مسجل أصلاً → يحول حسب الدور
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    console.log("Login useEffect:", { token: !!token, role });

    if (token && role) {
      console.log("Login: Token found, redirecting to dashboard");
      if (role === "admin") navigate("/AdminDashboard", { replace: true });
      else if (role === "manager") navigate("/InstructorDashboard", { replace: true });
      else navigate("/UserDashboard", { replace: true });
    }
  }, []); // لا شيء في dependencies


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await res.json().catch(() => ({}));
      console.log("Login response:", data);

      if (!res.ok) {
        alert(data.message || `خطأ أثناء تسجيل الدخول (رمز ${res.status})`);
        return;
      }

      const token = data.token;
      const userEmail = data.data?.email;
      const role = data.data?.role ?? "user";

      if (!token || !userEmail) {
        alert("استجابة غير صحيحة من السيرفر.");
        return;
      }

      // حفظ البيانات
      // حفظ البيانات
      localStorage.setItem("token", token);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("role", role);

      // إرسال حدث لتحديث Navbar
      window.dispatchEvent(new Event("authChanged"));

      // التحويل حسب الدور مباشرة
      if (role === "admin") navigate("/AdminDashboard", { replace: true });
      else if (role === "manager") navigate("/InstructorDashboard", { replace: true });
      else navigate("/UserDashboard", { replace: true });

    } catch (err) {
      console.error(err);
      alert("خطأ في الاتصال بالسيرفر.");
    } finally {
      setLoading(false);
    }
  };

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
          padding: 20,
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>تسجيل الدخول</h2>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 12 }}>
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 10,
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 4,
            }}
          >
            {loading ? "جاري تسجيل الدخول..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
