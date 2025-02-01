import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { User, Menu, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const email = localStorage.getItem('email');
    setIsLoggedIn(!!email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('email');
    setIsLoggedIn(false);
    toast({
      title: "تم تسجيل الخروج بنجاح",
    });
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              منصة التعلم
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <Link to="/courses" className="text-gray-700 hover:text-blue-600">
              الدورات
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-blue-600">
              الأسعار
            </Link>
            {isLoggedIn ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 ml-2" />
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">إنشاء حساب</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;