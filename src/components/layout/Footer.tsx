import { Link } from "react-router-dom";
import { Copyright, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-right">عن المنصة</h3>
            <p className="text-gray-600 text-right">
              منصة تعليمية متكاملة تقدم دورات في مختلف المجالات
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
                <Link to="/community" className="text-gray-600 hover:text-blue-600">
                  المجتمع
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
              <li className="text-gray-600">البريد الإلكتروني: contact@avinar.center</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center text-white font-bold text-xs">A</div>
              <span className="font-bold text-xl text-gray-900">AVinar.source</span>
            </div>

            <div className="flex gap-8 text-sm text-gray-500">
              <Link to="/privacy" className="hover:text-blue-600 transition-colors">الخصوصية</Link>
              <Link to="/terms" className="hover:text-blue-600 transition-colors">الشروط</Link>
              <Link to="/contact" className="hover:text-blue-600 transition-colors">اتصل بنا</Link>
            </div>

            <p className="text-gray-600 flex items-center text-sm">
              <Copyright className="h-4 w-4 ml-1" />
              Avinar.center 2025
            </p>
          </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-right">تابعونا على مواقع التواصل الاجتماعي</h3>
          <ul className="flex flex-row justify-end space-x-4 space-x-reverse">
            <li>
              <a
                href="https://www.facebook.com/yourpage"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600"
                aria-label="فيسبوك"
              >
                <Facebook className="w-6 h-6" />
              </a>
            </li>
            <li>
              <a
                href="https://www.twitter.com/yourpage"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600"
                aria-label="تويتر"
              >
                <Twitter className="w-6 h-6" />
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/yourpage"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600"
                aria-label="إنستغرام"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/yourpage"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600"
                aria-label="لينكدإن"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

