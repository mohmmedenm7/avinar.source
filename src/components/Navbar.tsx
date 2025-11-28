import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from '@/config/env';

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [role, setRole] = useState("");
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

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

    const fetchCartCount = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setCartItemsCount(0);
            return;
        }

        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/cart`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const items = res.data?.data?.cartItems || [];
            setCartItemsCount(items.length);
        } catch (error) {
            console.error("Error fetching cart:", error);
            setCartItemsCount(0);
        }
    };

    useEffect(() => {
        updateAuthStatus();
        fetchCartCount();
        window.addEventListener("authChanged", updateAuthStatus);
        window.addEventListener("authChanged", fetchCartCount);
        window.addEventListener("cartUpdated", fetchCartCount);

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("authChanged", updateAuthStatus);
            window.removeEventListener("authChanged", fetchCartCount);
            window.removeEventListener("cartUpdated", fetchCartCount);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        updateAuthStatus();
        navigate("/login");
    };

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Courses", path: "/courses" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 shadow-sm"
                : "bg-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                        A
                    </div>
                    <span className={`text-2xl font-bold tracking-tight ${isScrolled ? "text-gray-900" : "text-gray-900"}`}>
                        AVinar<span className="text-blue-600">.</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-sm font-medium transition-colors hover:text-blue-600 ${location.pathname === link.path ? "text-blue-600" : "text-gray-600"
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    {isLoggedIn && (
                        <Link
                            to="/cart"
                            className="relative p-2 text-gray-600 hover:text-sky-600 transition-colors"
                        >
                            <ShoppingCart size={24} />
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-sky-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Link>
                    )}
                    {isLoggedIn ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 hidden lg:inline">
                                {userEmail.split('@')[0]}
                            </span>

                            {(role === "admin" || role === "manager") && (
                                <Button
                                    variant="ghost"
                                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    onClick={() => navigate(role === "admin" ? "/AdminDashboard" : "/InstructorDashboard")}
                                >
                                    Dashboard
                                </Button>
                            )}

                            <Button
                                variant="destructive"
                                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                Log in
                            </Link>
                            <Button
                                className="bg-black text-white hover:bg-gray-800 rounded-full px-6 font-semibold"
                                onClick={() => navigate("/register")}
                            >
                                Sign Up
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={`md:hidden ${isScrolled ? "text-gray-900" : "text-gray-900"}`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 p-6 space-y-4 animate-in slide-in-from-top-5 shadow-lg">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="block text-lg font-medium text-gray-600 hover:text-blue-600"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="pt-4 border-t border-gray-200 flex flex-col gap-3">
                        {isLoggedIn ? (
                            <>
                                {(role === "admin" || role === "manager") && (
                                    <Button onClick={() => navigate(role === "admin" ? "/AdminDashboard" : "/InstructorDashboard")}>
                                        Dashboard
                                    </Button>
                                )}
                                <Button variant="destructive" onClick={handleLogout}>Logout</Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" className="w-full justify-center" onClick={() => navigate("/login")}>
                                    Log in
                                </Button>
                                <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate("/register")}>
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
