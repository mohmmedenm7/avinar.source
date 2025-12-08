import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config/env";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import SEO from "@/components/SEO";

interface LoginResponse {
  token?: string;
  user?: {
    email?: string;
    role?: string;
    _id?: string;
  };
  email?: string;
  role?: string;
  message?: string;
  data?: {
    email?: string;
    role?: string;
    _id?: string;
  };
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "admin") navigate("/AdminDashboard", { replace: true });
      else if (role === "manager" || role === "instructor") navigate("/InstructorDashboard", { replace: true });
      else navigate("/UserDashboard", { replace: true });
    }
  }, [navigate]);

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

      if (!res.ok) {
        alert(data.message || `خطأ أثناء تسجيل الدخول (رمز ${res.status})`);
        return;
      }

      const token = data.token;
      const userEmail = data.data?.email;
      const role = data.data?.role ?? "user";
      const userId = data.data?._id;

      if (!token || !userEmail) {
        alert("استجابة غير صحيحة من السيرفر.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("role", role);
      if (userId) localStorage.setItem("userId", userId);

      window.dispatchEvent(new Event("authChanged"));

      if (role === "admin") navigate("/AdminDashboard", { replace: true });
      else if (role === "manager" || role === "instructor") navigate("/InstructorDashboard", { replace: true });
      else navigate("/UserDashboard", { replace: true });

    } catch (err) {
      console.error(err);
      alert("خطأ في الاتصال بالسيرفر.");
    } finally {
      setLoading(false);
    }
  };

  const handleWorkOSLogin = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/workos/authorize`);
      const data = await res.json();
      if (data.authorizationUrl) window.location.href = data.authorizationUrl;
      else alert("فشل في الحصول على رابط المصادقة");
    } catch (err) {
      console.error(err);
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/microsoft/authorize`);
      const data = await res.json();
      if (data.authorizationUrl) window.location.href = data.authorizationUrl;
      else alert("فشل في الحصول على رابط المصادقة");
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/google/authorize`);
      const data = await res.json();
      if (data.authorizationUrl) window.location.href = data.authorizationUrl;
      else alert("فشل في الحصول على رابط المصادقة");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/apple/authorize`);
      const data = await res.json();
      if (data.authorizationUrl) window.location.href = data.authorizationUrl;
      else alert("فشل في الحصول على رابط المصادقة");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <SEO title="Login" description="Sign in to your Avinar account" />
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

        {/* Main Card */}
        <div className="w-full max-w-4xl bg-white rounded-[30px] shadow-2xl overflow-hidden flex min-h-[550px] m-4 relative z-10">

          {/* Left Side - Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back 👋</h1>
              <p className="text-gray-500 text-sm">
                Today is a new day. It's your day. You shape it.
                Sign in to start managing your projects.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="Example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <a href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Forgot Password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center mt-4"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : "Sign in"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-8">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-xs font-medium uppercase">Or sign in with</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Social Buttons Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoogleLogin}
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
                onClick={handleMicrosoftLogin}
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
                onClick={handleAppleLogin}
                className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.415-2.376-2.007-.156-3.682 1.09-4.585 1.09zM15.52 3.83c.844-1.026 1.402-2.428 1.246-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="#000" />
                </svg>
                <span className="text-sm font-medium text-gray-600">Apple</span>
              </button>

              <button
                onClick={handleWorkOSLogin}
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
                Don't you have an account?{" "}
                <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Sign up
                </a>
              </p>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="hidden md:block w-1/2 relative overflow-hidden bg-gray-100">
            <img
              src="/placeholder-course.png"
              alt="Authentication Cover"
              className="absolute inset-0 w-full h-full object-cover animate-fade-in"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
