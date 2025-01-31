import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const { toast } = useToast();

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "تم إضافة الكورس بنجاح",
      description: "يمكن للمستخدمين الآن رؤية الكورس",
    });

    // إعادة تعيين النموذج
    setCourseTitle("");
    setCourseDescription("");
    setCoursePrice("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-right mb-8">لوحة تحكم المشرف</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-right">إضافة كورس جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div className="space-y-2">
                <label className="text-right block">عنوان الكورس</label>
                <Input
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-right block">وصف الكورس</label>
                <Textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  required
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-right block">السعر</label>
                <Input
                  type="number"
                  value={coursePrice}
                  onChange={(e) => setCoursePrice(e.target.value)}
                  required
                  dir="rtl"
                />
              </div>
              <Button type="submit" className="w-full">إضافة الكورس</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;