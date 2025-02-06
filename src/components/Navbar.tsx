import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInEmail = localStorage.getItem("email");
    if (loggedInEmail) {
      setIsLoggedIn(true);
      setUserEmail(loggedInEmail);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    setUserEmail("");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-50 p-4 shadow-2xl">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-800 text-2xl hover:underline">
           AVinar
          </Link>
        </div>
        <div>
          {isLoggedIn ? (
            <>
              <span className="text-gray-800 mr-4">مرحباً، {userEmail}</span>
              {(userEmail === "admin@gmail.com" || userEmail === "mohmedenym@gmail.com") && (
                <Button className="mr-4 bg-gray hover:bg-gray-200 text-gray-800 shadow-md" onClick={() => navigate("/AdminDashboard")}>
                  لوحة التحكم
                </Button>
              )}
              <Button className="bg-red-500 hover:bg-red-700 text-white" onClick={handleLogout}>تسجيل الخروج</Button>
            </>
          ) : (
            <>
              <Button className="mr-4 bg-white hover:bg-gray-200 text-gray-800 shadow-md" onClick={() => navigate("/login")}>تسجيل الدخول</Button>
              <Button className="bg-white hover:bg-gray-200 text-gray-800 shadow-md" onClick={() => navigate("/register")}>إنشاء حساب</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
