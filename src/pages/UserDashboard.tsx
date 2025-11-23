import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const UserDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem("courses")) || [];
    setCourses(storedCourses);

    const storedEnrolled = JSON.parse(localStorage.getItem("myCourses")) || [];
    setMyCourses(storedEnrolled);
  }, []);

  const handleEnroll = (course) => {
    const alreadyEnrolled = myCourses.some((c) => c.id === course.id);

    if (alreadyEnrolled) {
      toast({ title: "أنت مسجل في هذا الكورس بالفعل" });
      return;
    }

    const updated = [...myCourses, course];
    setMyCourses(updated);
    localStorage.setItem("myCourses", JSON.stringify(updated));

    toast({ title: "تم التسجيل في الكورس بنجاح" });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-right mb-8">لوحة المستخدم</h1>

        <Tabs defaultValue="all" dir="rtl" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="all">جميع الكورسات</TabsTrigger>
            <TabsTrigger value="my">كورساتي</TabsTrigger>
          </TabsList>

          {/* جميع الكورسات */}
          <TabsContent value="all">
            <div className="grid md:grid-cols-3 gap-8">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <Card key={course.id} className="bg-white">
                    <CardHeader>
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-48 object-cover mb-4"
                      />
                      <CardTitle className="text-right">{course.title}</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <p className="text-right text-gray-600 mb-4">
                        {course.description}
                      </p>
                      <p className="text-right mb-2">المدرب: {course.instructor}</p>
                      <p className="text-right text-xl font-bold mb-4">
                        ${course.price}
                      </p>

                      <Button
                        onClick={() => handleEnroll(course)}
                        className="w-full bg-blue-600 text-white"
                      >
                        التسجيل في الكورس
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-gray-500">لا توجد كورسات متاحة</p>
              )}
            </div>
          </TabsContent>

          {/* كورساتي */}
          <TabsContent value="my">
            <div className="grid md:grid-cols-3 gap-8">
              {myCourses.length > 0 ? (
                myCourses.map((course) => (
                  <Card key={course.id} className="bg-white">
                    <CardHeader>
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-48 object-cover mb-4"
                      />
                      <CardTitle className="text-right">{course.title}</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <p className="text-right text-gray-600 mb-4">
                        {course.description}
                      </p>
                      <p className="text-right">المدرب: {course.instructor}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-gray-500">لم تسجل في أي كورس بعد</p>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
