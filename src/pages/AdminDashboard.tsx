import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", instructor: "", price: "", imageUrl: "", videoUrl: "" });
  const [editCourse, setEditCourse] = useState(null);
  const [paymentConfirmations, setPaymentConfirmations] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem("courses")) || [];
    setCourses(storedCourses);

    const storedPayments = JSON.parse(localStorage.getItem("payments")) || [];
    setPaymentConfirmations(storedPayments);
  }, []);

  const handleAddCourse = () => {
    const updatedCourses = [...courses, { ...newCourse, id: Date.now() }];
    setCourses(updatedCourses);
    localStorage.setItem("courses", JSON.stringify(updatedCourses));
    setNewCourse({ title: "", description: "", instructor: "", price: "", imageUrl: "", videoUrl: "" });
    toast({ title: "تمت إضافة الكورس بنجاح" });
  };
  const handleDeleteCourse = (courseId) => {
    const updatedCourses = courses.filter((course) => course.id !== courseId);
    setCourses(updatedCourses);
    localStorage.setItem("courses", JSON.stringify(updatedCourses));
    toast({ title: "تم حذف الكورس بنجاح" });
  };
  
  const handleEditCourse = () => {
    const updatedCourses = courses.map(course => 
      course.id === editCourse.id ? editCourse : course
    );
    setCourses(updatedCourses);
    localStorage.setItem("courses", JSON.stringify(updatedCourses));
    setEditCourse(null);
    toast({ title: "تم تعديل الكورس بنجاح" });
  };

  const handleConfirmPayment = (paymentId) => {
    const updatedPayments = paymentConfirmations.map(payment => 
      payment.id === paymentId ? { ...payment, confirmed: true } : payment
    );
    setPaymentConfirmations(updatedPayments);
    localStorage.setItem("payments", JSON.stringify(updatedPayments));
    toast({ title: "تم تأكيد الدفع بنجاح" });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewCourse({ ...newCourse, imageUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewCourse({ ...newCourse, videoUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-right mb-8">لوحة تحكم المشرف</h1>

        <Tabs defaultValue="courses" dir="rtl" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="courses">الكورسات</TabsTrigger>
            <TabsTrigger value="add-course">إضافة كورس</TabsTrigger>
            <TabsTrigger value="edit-course">تعديل كورس</TabsTrigger>
            <TabsTrigger value="confirm-payment">تأكيد الدفع</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
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
            <p className="text-gray-600 text-right mb-4">{course.description}</p>
            <p className="text-right mb-2">المدرب: {course.instructor}</p>
            <p className="text-right mb-4 text-2xl font-bold">${course.price}</p>
            <Button
              onClick={() => setEditCourse(course)}
              className="w-full bg-yellow-500 text-white mb-2"
            >
              تعديل
            </Button>
            <Button
              onClick={() => handleDeleteCourse(course.id)}
              className="w-full bg-red-500 text-white"
            >
              حذف
            </Button>
          </CardContent>
        </Card>
      ))
    ) : (
      <p className="text-center text-gray-500">لا يوجد كورسات متاحة</p>
    )}
  </div>
</TabsContent>

          <TabsContent value="add-course">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-right">إضافة كورس جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Input placeholder="عنوان الكورس" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} />
                  <Input placeholder="وصف الكورس" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} />
                  <Input placeholder="المدرب" value={newCourse.instructor} onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })} />
                  <Input placeholder="السعر" type="number" value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })} />
                  <Input type="file" accept="image/*" onChange={handleImageUpload} />
                  <Input type="file" accept="video/*" onChange={handleVideoUpload} />
                  <Button onClick={handleAddCourse} className="bg-blue-500 text-white">إضافة</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit-course">
  <Card className="p-6">
    <CardHeader>
      <CardTitle className="text-right">تعديل كورس</CardTitle>
    </CardHeader>
    <CardContent>
      {editCourse ? (
        <div className="grid gap-4">
          <Input
            placeholder="عنوان الكورس"
            value={editCourse.title}
            onChange={(e) => setEditCourse({ ...editCourse, title: e.target.value })}
          />
          <Input
            placeholder="وصف الكورس"
            value={editCourse.description}
            onChange={(e) =>
              setEditCourse({ ...editCourse, description: e.target.value })
            }
          />
          <Input
            placeholder="المدرب"
            value={editCourse.instructor}
            onChange={(e) =>
              setEditCourse({ ...editCourse, instructor: e.target.value })
            }
          />
          <Input
            placeholder="السعر"
            type="number"
            value={editCourse.price}
            onChange={(e) => setEditCourse({ ...editCourse, price: e.target.value })}
          />
          <Input type="file" accept="image/*" onChange={handleImageUpload} />
          <Input type="file" accept="video/*" onChange={handleVideoUpload} />
          <Button onClick={handleEditCourse} className="bg-green-500 text-white">
            تعديل
          </Button>
          <Button
            onClick={() => handleDeleteCourse(editCourse.id)}
            className="bg-red-500 text-white"
          >
            حذف
          </Button>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          اختر كورس لتعديله من قائمة الكورسات
        </p>
      )}
    </CardContent>
  </Card>
</TabsContent>

          <TabsContent value="confirm-payment">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-right">تأكيد الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentConfirmations.length > 0 ? (
                  <div className="grid gap-4">
                    {paymentConfirmations.map((payment) => (
                      <Card key={payment.id} className="bg-white">
                        <CardContent className="flex justify-between items-center">
                          <div>
                            <p className="text-gray-600 text-right">رقم الدفع: {payment.id}</p>
                            <p className="text-gray-600 text-right">المبلغ: {payment.amount}</p>
                          </div>
                          <Button onClick={() => handleConfirmPayment(payment.id)} className={`bg-${payment.confirmed ? 'green' : 'red'}-500 text-white`}>
                            {payment.confirmed ? "تم التأكيد" : "تأكيد"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">لا توجد دفعات بانتظار التأكيد</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
