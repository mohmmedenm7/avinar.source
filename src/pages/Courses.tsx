import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Courses = () => {
  const courses = [
    {
      id: 1,
      title: "مقدمة في البرمجة",
      description: "تعلم أساسيات البرمجة من الصفر",
      price: "99",
      instructor: "أحمد محمد"
    },
    {
      id: 2,
      title: "تطوير تطبيقات الويب",
      description: "دورة شاملة في تطوير الويب",
      price: "199",
      instructor: "محمد علي"
    },
    {
      id: 3,
      title: "تصميم واجهات المستخدم",
      description: "تعلم تصميم واجهات مستخدم جذابة",
      price: "149",
      instructor: "سارة أحمد"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">الكورسات المتاحة</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle className="text-right">{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-right mb-4">{course.description}</p>
                <p className="text-right mb-2">المدرب: {course.instructor}</p>
                <p className="text-right mb-4 text-2xl font-bold">${course.price}</p>
                <Button className="w-full">اشترك الآن</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;