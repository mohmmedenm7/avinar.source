import { useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

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
        const loginRes = await fetch("http://localhost:8000/api/v1/auth/login", {
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
        const registerRes = await fetch("http://localhost:8000/api/v1/users", {
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
        console.log("Register errors:", registerData.errors); // اطبع الأخطاء

        if (!registerRes.ok) {
          const errorMsg = registerData.errors?.[0]?.msg || registerData.message || "فشل إنشاء الحساب";
          showToast(errorMsg, "error");
          setProgress("");
          setLoading(false);
          return;
        }

        showToast("✅ تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول", "success");
        setProgress("✨ جاري التحويل إلى صفحة الدخول...");
      } else {
        // للمستخدمين العاديين - استخدم signup العادي
        setProgress("📝 جاري إنشاء الحساب...");
        const signupRes = await fetch("http://localhost:8000/api/v1/auth/signup", {
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

        showToast("✅ تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول", "success");
        setProgress("✨ جاري التحويل إلى صفحة الدخول...");
      }

      // مسح النموذج
      setName("");
      setEmail("");
      setPassword("");
      setPasswordConfirm("");

      // إعادة توجيه بعد ثانيتين
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      console.error(err);
      showToast("خطأ في الاتصال بالسيرفر", "error");
      setProgress("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 transition-all ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
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

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white text-center">إنشاء حساب جديد</h1>
            <p className="text-blue-100 text-center mt-2">
              {loading ? progress || "جاري المعالجة..." : "انضم إلينا اليوم"}
            </p>
          </div>

          {/* Form */}
          <div className="p-8 space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسمك"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نوع الحساب
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
              >
                <option value="user">مستخدم عادي</option>
                <option value="manager">مدرب/معلم</option>
              </select>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  disabled={loading}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {loading && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full animate-pulse"></div>
              </div>
            )}

            {/* Register Button */}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  جاري المعالجة...
                </>
              ) : (
                "إنشاء الحساب"
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                هل لديك حساب بالفعل؟{" "}
                <a
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition"
                >
                  سجل دخول
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>بإنشاء حساب، فإنك توافق على شروط الخدمة</p>
        </div>
      </div>
    </div>
  );
}