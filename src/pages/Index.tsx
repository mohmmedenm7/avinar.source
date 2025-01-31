import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Book, Users, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">منصة التعلم الإلكتروني</h1>
          <p className="text-xl text-gray-600 mb-8">تعلم مهارات جديدة وطور نفسك مع أفضل المدربين</p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            ابدأ التعلم الآن
            <ArrowRight className="mr-2 h-4 w-4" />
          </Button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="text-right">
            <CardHeader>
              <CardTitle className="flex items-center justify-end">
                <span className="mr-2">دورات متنوعة</span>
                <Book className="h-6 w-6 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">مجموعة متنوعة من الدورات في مختلف المجالات</p>
            </CardContent>
          </Card>

          <Card className="text-right">
            <CardHeader>
              <CardTitle className="flex items-center justify-end">
                <span className="mr-2">مدربون محترفون</span>
                <Users className="h-6 w-6 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">تعلم على يد أفضل المدربين المتخصصين</p>
            </CardContent>
          </Card>

          <Card className="text-right">
            <CardHeader>
              <CardTitle className="flex items-center justify-end">
                <span className="mr-2">شهادات معتمدة</span>
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">احصل على شهادات معتمدة بعد إكمال الدورات</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;