import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import './CardStyles.css'; // افتراض أن ملف CSS يسمى CardStyles.css

const Courses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem("courses")) || [];
    setCourses(storedCourses);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">الكورسات المتاحة</h1>
        
        {courses.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card key={course.id} style={{ backgroundColor: 'white' }}>
                <CardHeader>
                  <img src={course.imageUrl} alt={course.title} className="w-full h-48 object-cover mb-4" />
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
        ) : (
          <p className="text-center text-gray-500">لا يوجد كورسات متاحة</p>
        )}
      </div>
    </div>
  );
};

export default Courses;
