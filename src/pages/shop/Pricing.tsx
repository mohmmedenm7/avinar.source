import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">خطط الاشتراك</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* الخطة الأساسية */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">الخطة الأساسية</CardTitle>
              <p className="text-3xl font-bold text-center">$99</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-right">
                <li className="flex items-center justify-end">
                  <span className="mr-2">الوصول لـ 5 كورسات</span>
                  <Check className="h-5 w-5 text-green-500" />
                </li>
                <li className="flex items-center justify-end">
                  <span className="mr-2">دعم بالبريد الإلكتروني</span>
                  <Check className="h-5 w-5 text-green-500" />
                </li>
              </ul>
              <Button className="w-full mt-6">اشترك الآن</Button>
            </CardContent>
          </Card>

          {/* الخطة المتقدمة */}
          <Card className="border-blue-500">
            <CardHeader>
              <CardTitle className="text-center">الخطة المتقدمة</CardTitle>
              <p className="text-3xl font-bold text-center">$199</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-right">
                <li className="flex items-center justify-end">
                  <span className="mr-2">الوصول لـ 15 كورس</span>
                  <Check className="h-5 w-5 text-green-500" />
                </li>
                <li className="flex items-center justify-end">
                  <span className="mr-2">دعم مباشر</span>
                  <Check className="h-5 w-5 text-green-500" />
                </li>
                <li className="flex items-center justify-end">
                  <span className="mr-2">شهادات معتمدة</span>
                  <Check className="h-5 w-5 text-green-500" />
                </li>
              </ul>
              <Button className="w-full mt-6">اشترك الآن</Button>
            </CardContent>
          </Card>

          {/* الخطة الاحترافية */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">الخطة الاحترافية</CardTitle>
              <p className="text-3xl font-bold text-center">$299</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-right">
                <li className="flex items-center justify-end">
                  <span className="mr-2">وصول غير محدود</span>
                  <Check className="h-5 w-5 text-green-500" />
                </li>
                <li className="flex items-center justify-end">
                  <span className="mr-2">دعم على مدار الساعة</span>
                  <Check className="h-5 w-5 text-green-500" />
                </li>
                <li className="flex items-center justify-end">
                  <span className="mr-2">تدريب شخصي</span>
                  <Check className="h-5 w-5 text-green-500" />
                </li>
              </ul>
              <Button className="w-full mt-6">اشترك الآن</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pricing;