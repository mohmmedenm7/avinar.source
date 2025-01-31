import { Link } from "react-router-dom";
import { Copyright } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-right">عن المنصة</h3>
            <p className="text-gray-600 text-right">
              منصة تعليمية متكاملة تقدم دورات في مختلف المجالات مع شهادات معتمدة
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-right">روابط سريعة</h3>
            <ul className="space-y-2 text-right">
              <li>
                <Link to="/courses" className="text-gray-600 hover:text-blue-600">
                  الدورات المتاحة
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-blue-600">
                  خطط الأسعار
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-blue-600">
                  التسجيل
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-right">تواصل معنا</h3>
            <ul className="space-y-2 text-right">
              <li className="text-gray-600">البريد الإلكتروني: info@example.com</li>
              <li className="text-gray-600">الهاتف: +123 456 789</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-gray-600 flex items-center justify-center">
            <Copyright className="h-4 w-4 ml-1" />
            جميع الحقوق محفوظة 2024
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;