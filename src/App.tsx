import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Index from "./pages/general/Index";
import NotFound from "./pages/general/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import UserDashboard from "./pages/dashboard/UserDashboard";
import InstructorDashboard from "./pages/dashboard/mangerDashboard";
import Courses from "./pages/courses/Courses";
import OrdersList from "./pages/shop/OrdersList";
import OrderDetails from "./pages/shop/OrderDetails";
import Checkout from "./pages/shop/Checkout";
import MyOrders from "./pages/dashboard/MyOrders";
import CartPage from "./pages/shop/CartPage"; // ✅ إضافة صفحة السلة
import WishlistPage from "./pages/dashboard/WishlistPage";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import CourseViewPage from "./pages/courses/CourseViewPage";
import CourseDetailsPage from "./pages/courses/CourseDetailsPage";
import About from "./pages/general/About";
import CommunityPage from "./pages/CommunityPage";
import PostDetail from "./pages/PostDetail";
import Contact from "./pages/general/Contact";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyResetCode from "./pages/auth/VerifyResetCode";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifySignupOTP from "./pages/auth/VerifySignupOTP";

const queryClient = new QueryClient();

const ProtectedAdminRoute = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  console.log("ProtectedAdminRoute:", { token: !!token, role });
  return token && role === "admin" ? (
    <AdminDashboard />
  ) : (
    <Navigate to="/login" />
  );
};

const ProtectedInstructorRoute = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  console.log("ProtectedInstructorRoute:", { token: !!token, role });
  return token && (role === "manager" || role === "instructor") ? (
    <InstructorDashboard />
  ) : (
    <Navigate to="/login" />
  );
};

const ProtectedUserRoute = () => {
  const token = localStorage.getItem("token");
  console.log("ProtectedUserRoute:", { token: !!token });
  return token ? <UserDashboard /> : <Navigate to="/login" />;
};

const ProtectedOrdersRoute = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return token && role === "admin" ? <OrdersList /> : <Navigate to="/login" />;
};

const ProtectedCheckoutRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <Checkout /> : <Navigate to="/login" />;
};

const ProtectedMyOrdersRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <MyOrders /> : <Navigate to="/login" />;
};

const ProtectedOrderDetailsRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <OrderDetails /> : <Navigate to="/login" />;
};

// ✅ حماية صفحة Cart
const ProtectedCartRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <CartPage /> : <Navigate to="/login" />;
};

// حماية صفحة Wishlist
const ProtectedWishlistRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <WishlistPage /> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-reset-code" element={<VerifyResetCode />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-signup-otp" element={<VerifySignupOTP />} />
                <Route path="/AdminDashboard" element={<ProtectedAdminRoute />} />
                <Route path="/instructordashboard" element={<ProtectedInstructorRoute />} />
                <Route path="/userdashboard" element={<ProtectedUserRoute />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/cart" element={<ProtectedCartRoute />} /> {/* ✅ السلة */}
                <Route path="/wishlist" element={<ProtectedWishlistRoute />} /> {/* قائمة الأمنيات */}
                <Route path="/orders" element={<ProtectedOrdersRoute />} />
                <Route path="/admin/order/:id" element={<AdminOrderDetails />} />
                <Route path="/checkout" element={<ProtectedCheckoutRoute />} />
                <Route path="/my-orders" element={<ProtectedMyOrdersRoute />} />
                <Route path="/order/:orderId" element={<ProtectedOrderDetailsRoute />} />
                <Route path="/course-details/:courseId" element={<CourseDetailsPage />} />
                <Route path="/course/:courseId" element={<CourseViewPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/community/:postId" element={<PostDetail />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
