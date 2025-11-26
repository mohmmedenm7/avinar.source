import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Book, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/config/env";
import './styles.css';

const Index = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [shapes, setShapes] = useState([]);
  const [visitorCount, setVisitorCount] = useState(0); // ← عدد الزوار

  // متابعة حركة الماوس
  const handleMouseMove = (event) => {
    setPosition({ x: event.clientX, y: event.clientY });
    setShapes(shapes.map(shape => {
      const distance = Math.sqrt(Math.pow(event.clientX - shape.x, 2) + Math.pow(event.clientY - shape.y, 2));
      return { ...shape, visible: distance < 100 };
    }));
  };

  // effect لتسجيل الزوار وجلب العدد
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    // تسجيل الزائر مرة واحدة
    axios.post(`${API_BASE_URL}/api/visitors/add`)
      .then(res => console.log("Visitor added:", res.data))
      .catch(err => console.error(err));

    // جلب عدد الزوار مرة واحدة
    axios.get(`${API_BASE_URL}/api/visitors/count`)
      .then(res => setVisitorCount(res.data.count))
      .catch(err => console.error(err));

    // Geolocation logging
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("Latitude:", pos.coords.latitude);
          console.log("Longitude:", pos.coords.longitude);
          console.log("Accuracy:", pos.coords.accuracy + " meters");
        },
        (err) => {
          console.error("User denied location:", err);
        }
      );
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []); // ← مصفوفة فارغة لتجنب التكرار

  const backgroundStyle: React.CSSProperties = {
    background: `radial-gradient(circle 500px at ${position.x}px ${position.y}px, #EFDECD, #5D8AA8)`,
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div className="min-h-screen flex flex-col" style={backgroundStyle}>
      <main className="flex-grow relative background">
        <div className="custom-cursor" style={{ left: `${position.x}px`, top: `${position.y}px`, zIndex: 2 }} />
        {shapes.map(shape => (
          shape.visible && (
            <svg key={shape.id} className="scientific-shape" width="100" height="100" fill="none" stroke="#FFFFFF" strokeWidth="2" style={{ left: shape.x, top: shape.y }}>
              <circle cx="50" cy="50" r="40" />
              <line x1="50" y1="10" x2="50" y2="90" />
              <line x1="10" y1="50" x2="90" y2="50" />
              <path d="M50,10 L30,50 L50,90 L70,50 Z" />
            </svg>
          )
        ))}

        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AVinar</h1>
            <p className="mb-2">عدد زوار الموقع: {visitorCount}</p> {/* ← عرض عدد الزوار */}
            <Link to="/courses">
              <Button className="bg-blue-600 hover:bg-blue-700 custom-button">
                ابدأ التعلم الآن <ArrowRight className="mr-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="text-right card">
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

            <Card className="text-right card">
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

            <Card className="text-right card">
              <CardHeader>
                <CardTitle className="flex items-center justify-end">
                  <span className="mr-2">التكنولوجيا والتعلم الإلكتروني</span>
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">احصل على شهادات معتمدة بعد إكمال الدورات</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
