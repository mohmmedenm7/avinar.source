import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "تم إنشاء الحساب بنجاح",
      description: "يمكنك الآن تسجيل الدخول",
    });
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">إنشاء حساب جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-right block">الاسم الكامل</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-right block">البريد الإلكتروني</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-right block">كلمة المرور</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="rtl"
              />
            </div>
            <Button type="submit" className="w-full">إنشاء حساب</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;