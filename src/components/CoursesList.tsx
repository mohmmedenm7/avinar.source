import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CourseFormModal from "./CourseFormModal";

interface Course {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  quantity?: number;
}

interface CoursesListProps {
  courses: Course[];
  fetchCourses: () => void;
  onDeleteCourse?: (courseId: string) => void; // لتمرير الدالة من الأب
}

const CoursesList = ({ courses, fetchCourses, onDeleteCourse }: CoursesListProps) => {
  const [editCourse, setEditCourse] = useState<Course | null>(null);

  const handleEdit = (course: Course) => setEditCourse(course);

  const handleDelete = (courseId: string | undefined) => {
    if (!courseId || !onDeleteCourse) return;
    if (window.confirm("هل أنت متأكد من حذف هذا الكورس؟")) {
      onDeleteCourse(courseId);
    }
  };

  return (
    <>
      {courses.length === 0 ? (
        <p className="text-center text-gray-500">لا توجد كورسات</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {courses.map((course) => {
            const courseId = course._id || course.id;
            return (
              <Card key={courseId} className="bg-white">
                <CardHeader>
                  <CardTitle className="text-right">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-right">
                  <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                  <p className="mb-2 text-lg font-bold">السعر: ${course.price}</p>
                  <p className="text-sm mb-4">الكمية: {course.quantity || 1}</p>
                  <div className="flex gap-2 justify-end">
                    <Button
                      className="bg-yellow-500 text-white text-xs"
                      onClick={() => handleEdit(course)}
                    >
                      تعديل
                    </Button>
                    <Button
                      className="bg-red-500 text-white text-xs"
                      onClick={() => handleDelete(courseId)}
                    >
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* مودال التعديل */}
      {editCourse && (
        <CourseFormModal
          course={editCourse}
          closeModal={() => setEditCourse(null)}
          fetchCourses={fetchCourses}
        />
      )}
    </>
  );
};

export default CoursesList;
