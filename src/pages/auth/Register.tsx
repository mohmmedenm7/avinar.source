import { useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from '@/config/env';
import SEO from "@/components/SEO";

interface RegisterResponse {
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

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [role, setRole] = useState("manager");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [progress, setProgress] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/";
    }
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const validateForm = () => {
    if (!name.trim()) {
      showToast("يرجى إدخال الاسم", "error");
      return false;
    }
    if (name.trim().length < 3) {
      showToast("الاسم يجب أن يكون 3 أحرف على الأقل", "error");
      return false;
    }
    if (!email.trim()) {
      showToast("يرجى إدخال البريد الإلكتروني", "error");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("البريد الإلكتروني غير صحيح", "error");
      return false;
    }
    if (!password) {
      showToast("يرجى إدخال كلمة المرور", "error");
      return false;
    }
    if (password.length < 6) {
      showToast("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "error");
      return false;
    }
    if (password !== passwordConfirm) {
      showToast("كلمات المرور غير متطابقة", "error");
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // إذا كان المستخدم "مدرب" - استخدم العملية المتقدمة
      if (role === "manager") {
        // الخطوة 1: تسجيل دخول الأدمن
        setProgress("🔐 جاري التحقق من بيانات الأدمن...");
        const loginRes = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "admin0@admin.com",
            password: "123456",
          }),
        });

        const loginData = await loginRes.json();
        console.log("Login response:", loginData);

        if (!loginRes.ok) {
          showToast("فشل تسجيل دخول الأدمن", "error");
          setProgress("");
          setLoading(false);
          return;
        }

        const adminToken = loginData.token;
        if (!adminToken) {
          showToast("لم يتم استقبال التوكن من الأدمن", "error");
          setProgress("");
          setLoading(false);
          return;
        }

        console.log("Admin token received:", adminToken);

        // الخطوة 2: إنشاء حساب المدرب باستخدام التوكن
        setProgress("👨‍🏫 جاري إنشاء حساب المدرب...");
        const registerRes = await fetch(`${API_BASE_URL}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password,
            passwordConfirm: password,
            role: "manager",
          }),
        });

        const registerData = await registerRes.json();
        console.log("Register response:", registerData);
        console.log("Register errors:", registerData.errors);

        if (!registerRes.ok) {
          const errorMsg = registerData.errors?.[0]?.msg || registerData.message || "فشل إنشاء الحساب";
          showToast(errorMsg, "error");
          setProgress("");
          setLoading(false);
          return;
        }

        showToast("✅ تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول", "success");
        setProgress("✨ جاري التحويل إلى صفحة الدخول...");

        // مسح النموذج
        setName("");
        setEmail("");
        setPassword("");
        setPasswordConfirm("");

        // إعادة توجيه بعد ثانيتين
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        // للمستخدمين العاديين - إرسال OTP
        setProgress("📧 جاري إرسال رمز التحقق...");
        const signupRes = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            passwordConfirm,
            role: "user",
          }),
        });

        const signupData = await signupRes.json();
        console.log("Signup response:", signupData);

        if (!signupRes.ok) {
          showToast(signupData.message || "فشل التسجيل", "error");
          setProgress("");
          setLoading(false);
          return;
        }

        // حفظ البريد الإلكتروني في localStorage للخطوة التالية
        console.log("✅ Signup successful. Setting localStorage email:", email.trim());
        localStorage.setItem("signupEmail", email.trim());

        showToast("✅ تم إرسال رمز التحقق إلى بريدك الإلكتروني", "success");
        setProgress("✨ جاري التحويل إلى صفحة التحقق...");

        console.log("⏳ Setting timeout for redirection...");
        // التحويل إلى صفحة التحقق من OTP
        setTimeout(() => {
          console.log("🚀 Redirecting to /verify-signup-otp now...");
          window.location.href = "/verify-signup-otp";
        }, 1500);
        return;
      }
    } catch (err) {
      console.error(err);
      showToast("خطأ في الاتصال بالسيرفر", "error");
      setProgress("");
    } finally {
      setLoading(false);
    }
  };

  const handleWorkOSRegister = async () => {
    try {
      setLoading(true);
      setProgress("🔐 جاري التحويل إلى WorkOS...");
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/workos/authorize`);
      const data = await res.json();

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        showToast("فشل في الحصول على رابط المصادقة", "error");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      showToast("خطأ في الاتصال بالسيرفر", "error");
      setLoading(false);
      setProgress("");
    }
  };

  const handleMicrosoftRegister = async () => {
    try {
      setLoading(true);
      setProgress("🔐 جاري التحويل إلى Microsoft...");
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/microsoft/authorize`);
      const data = await res.json();

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        showToast("فشل في الحصول على رابط المصادقة", "error");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      showToast("خطأ في الاتصال بالسيرفر", "error");
      setLoading(false);
      setProgress("");
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      setProgress("🔐 جاري التحويل إلى Google...");
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/google/authorize`);
      const data = await res.json();

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        showToast("فشل في الحصول على رابط المصادقة", "error");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      showToast("خطأ في الاتصال بالسيرفر", "error");
      setLoading(false);
      setProgress("");
    }
  };

  const handleAppleRegister = async () => {
    try {
      setLoading(true);
      setProgress("🔐 جاري التحويل إلى Apple...");
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/apple/authorize`);
      const data = await res.json();

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        showToast("فشل في الحصول على رابط المصادقة", "error");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      showToast("خطأ في الاتصال بالسيرفر", "error");
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <>
      <SEO title="Create Account" description="Join Avinar to start your learning journey" />
      <div className="min-h-screen relative flex items-center justify-center p-4 pt-24 md:pt-28">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/placeholder-course.png"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 transition-all ${toast.type === "success"
              ? "bg-[#10b981] text-white"
              : "bg-[#ef4444] text-white"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="w-full max-w-5xl bg-white rounded-[30px] shadow-2xl overflow-hidden flex min-h-[700px] m-4 relative z-10">

          {/* Left Side - Form */}
          <div className="w-full lg:w-[45%] p-10 md:p-14 flex flex-col justify-center overflow-y-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account ✨</h1>
              <p className="text-gray-500 text-sm">
                {loading ? progress || "Processing..." : "Join us today and start your journey."}
              </p>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                >
                  <option value="user">Student / User</option>
                  <option value="manager">Instructor / Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPasswordConfirm ? "text" : "password"}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Repeat password"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {loading && (
                <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
                  <div className="bg-blue-600 h-1 rounded-full animate-pulse transition-all"></div>
                </div>
              )}

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center mt-6"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : "Sign Up"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-xs font-medium uppercase">Or join with</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoogleRegister}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-sm font-medium text-gray-600">Google</span>
              </button>

              <button
                onClick={handleMicrosoftRegister}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M0 0h11v11H0z" />
                  <path fill="#81bc06" d="M12 0h11v11H12z" />
                  <path fill="#05a6f0" d="M0 12h11v11H0z" />
                  <path fill="#ffba08" d="M12 12h11v11H12z" />
                </svg>
                <span className="text-sm font-medium text-gray-600">Microsoft</span>
              </button>

              <button
                onClick={handleAppleRegister}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.415-2.376-2.007-.156-3.682 1.09-4.585 1.09zM15.52 3.83c.844-1.026 1.402-2.428 1.246-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="#000" />
                </svg>
                <span className="text-sm font-medium text-gray-600">Apple</span>
              </button>

              <button
                onClick={handleWorkOSRegister}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#6366f1" />
                  <path d="M2 17L12 22L22 17" stroke="#6366f1" strokeWidth="2" />
                </svg>
                <span className="text-sm font-medium text-gray-600">WorkOS</span>
              </button>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Log In
                </a>
              </p>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="hidden lg:block w-[55%] relative overflow-hidden bg-gray-100">
            <img
              src="/placeholder-course.png"
              alt="Register Cover"
              className="absolute inset-0 w-full h-full object-cover animate-fade-in"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        </div>
      </div>
    </>
  );
}