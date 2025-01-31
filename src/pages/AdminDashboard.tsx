import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const { toast } = useToast();

  // بيانات تجريبية للطلاب
  const students = [
    { id: 1, name: "أحمد محمد", email: "ahmed@example.com", courses: 3 },
    { id: 2, name: "سارة علي", email: "sara@example.com", courses: 2 },
    { id: 3, name: "محمد خالد", email: "mohamed@example.com", courses: 1 },
  ];

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "تم إضافة الكورس بنجاح",
      description: "يمكن للمستخدمين الآن رؤية الكورس",
    });
    setCourseTitle("");
    setCourseDescription("");
    setCoursePrice("");
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "تم إضافة المعلم بنجاح",
      description: "تم إرسال دعوة للمعلم عبر البريد الإلكتروني",
    });
    setTeacherEmail("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-right mb-8">لوحة تحكم المشرف</h1>
        
        <Tabs defaultValue="courses" dir="rtl" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">الكورسات</TabsTrigger>
            <TabsTrigger value="students">الطلاب</TabsTrigger>
            <TabsTrigger value="teachers">المعلمين</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
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
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">قائمة الطلاب</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right">عدد الكورسات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="text-right">{student.name}</TableCell>
                        <TableCell className="text-right">{student.email}</TableCell>
                        <TableCell className="text-right">{student.courses}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">إضافة معلم جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTeacher} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-right block">البريد الإلكتروني للمعلم</label>
                    <Input
                      type="email"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      required
                      dir="rtl"
                      placeholder="أدخل البريد الإلكتروني للمعلم"
                    />
                  </div>
                  <Button type="submit" className="w-full">دعوة معلم جديد</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;