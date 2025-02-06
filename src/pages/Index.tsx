import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Book, Users, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import './styles.css';
import { Link } from "react-router-dom";

const Index = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [shapes, setShapes] = useState([]);

  const handleMouseMove = (event) => {
    setPosition({ x: event.clientX, y: event.clientY });
    setShapes(shapes.map(shape => {
      const distance = Math.sqrt(Math.pow(event.clientX - shape.x, 2) + Math.pow(event.clientY - shape.y, 2));
      return { ...shape, visible: distance < 100 };
    }));
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [shapes]);

  const backgroundStyle = {
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
            <Link to="/courses">
              <Button className="bg-blue-600 hover:bg-blue-700 custom-button"> ابدأ التعلم الآن <ArrowRight className="mr-2 h-4 w-4" /> </Button>
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
