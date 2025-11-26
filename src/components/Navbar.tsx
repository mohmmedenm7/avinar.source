import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  // تابع تحديث الحالة عند تغير auth
  const updateAuthStatus = () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");

    if (token && email && storedRole) {
      setIsLoggedIn(true);
      setUserEmail(email);
      setRole(storedRole);
    } else {
      setIsLoggedIn(false);
      setUserEmail("");
      setRole("");
    }
  };

  useEffect(() => {
    // تحديث الحالة عند أول تحميل
    updateAuthStatus();

    // الاستماع لحدث authChanged من أي مكان
    window.addEventListener("authChanged", updateAuthStatus);

    // تنظيف الاستماع عند إزالة المكون
    return () => window.removeEventListener("authChanged", updateAuthStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    // تحديث الحالة مباشرة
    updateAuthStatus();

    navigate("/login");
  };

  return (
    <nav className="bg-gray-50 p-4 shadow-2xl">
      <div className="container mx-auto flex justify-between items-center">
        {/* الشعار */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-800 text-2xl hover:underline">
            AVinar
          </Link>
        </div>

        {/* الأزرار على اليمين */}
        <div>
          {isLoggedIn ? (
            <>
              <span className="text-gray-800 mr-4">مرحباً، {userEmail}</span>

              {(role === "admin" || role === "manager") && (
                <Button
                  className="mr-4 bg-gray hover:bg-gray-200 text-gray-800 shadow-md"
                  onClick={() =>
                    role === "admin"
                      ? navigate("/AdminDashboard")
                      : navigate("/InstructorDashboard")
                  }
                >
                  لوحة التحكم
                </Button>
              )}

              <Button
                className="bg-red-500 hover:bg-red-700 text-white"
                onClick={handleLogout}
              >
                تسجيل الخروج
              </Button>
            </>
          ) : (
            <>
              <Button
                className="mr-4 bg-white hover:bg-gray-200 text-gray-800 shadow-md"
                onClick={() => navigate("/login")}
              >
                تسجيل الدخول
              </Button>

              <Button
                className="bg-white hover:bg-gray-200 text-gray-800 shadow-md"
                onClick={() => navigate("/register")}
              >
                إنشاء حساب
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
