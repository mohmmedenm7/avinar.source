import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import InstructorDashboard from "./pages/mangerDashboard";
import Courses from "./pages/Courses";
import OrdersList from "./pages/OrdersList";
import OrderDetails from "./pages/OrderDetails";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import CartPage from "./pages/CartPage"; // ✅ إضافة صفحة السلة
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import CourseViewPage from "./pages/CourseViewPage";

const queryClient = new QueryClient();

const ProtectedAdminRoute = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");
  return isLoggedIn && role === "admin" ? (
    <AdminDashboard />
  ) : (
    <Navigate to="/login" />
  );
};

const ProtectedInstructorRoute = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");
  return isLoggedIn && (role === "manager" || role === "instructor") ? (
    <InstructorDashboard />
  ) : (
    <Navigate to="/login" />
  );
};

const ProtectedUserRoute = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  return isLoggedIn ? <UserDashboard /> : <Navigate to="/login" />;
};

const ProtectedOrdersRoute = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");
  return isLoggedIn && role === "admin" ? <OrdersList /> : <Navigate to="/login" />;
};

const ProtectedCheckoutRoute = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  return isLoggedIn ? <Checkout /> : <Navigate to="/login" />;
};

const ProtectedMyOrdersRoute = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  return isLoggedIn ? <MyOrders /> : <Navigate to="/login" />;
};

const ProtectedOrderDetailsRoute = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  return isLoggedIn ? <OrderDetails /> : <Navigate to="/login" />;
};

// ✅ حماية صفحة Cart
const ProtectedCartRoute = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  return isLoggedIn ? <CartPage /> : <Navigate to="/login" />;
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
               <Route path="/AdminDashboard" element={<ProtectedAdminRoute />} />
                <Route path="/instructordashboard" element={<ProtectedInstructorRoute />} />
                <Route path="/userdashboard" element={<ProtectedUserRoute />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/cart" element={<ProtectedCartRoute />} /> {/* ✅ السلة */}
                <Route path="/orders" element={<ProtectedOrdersRoute />} />
                <Route path="/admin/order/:id" element={<AdminOrderDetails />} />
                <Route path="/checkout" element={<ProtectedCheckoutRoute />} />
                <Route path="/my-orders" element={<ProtectedMyOrdersRoute />} />
                <Route path="/order/:orderId" element={<ProtectedOrderDetailsRoute />} />
                 <Route path="/course/:courseId" element={<CourseViewPage />} />

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
