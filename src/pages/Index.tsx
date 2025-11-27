import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Play,
  Cpu,
  Globe,
  Users,
  MessageSquare,
  Zap,
  Shield,
  BarChart
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config/env";
import { getImageUrl } from "@/utils/imageUtils";
import axios from "axios";

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageCover?: string;
  category?: { name: string };
}

const Index = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/products`);
        setCourses(res.data?.data?.slice(0, 3) || []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();

    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const { left, top, width, height } = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-900 font-sans selection:bg-orange-500/30 overflow-x-hidden">

      {/* Hero Section */}
      <header
        ref={heroRef}
        className="relative pt-32 pb-20 px-6 text-center overflow-hidden min-h-[90vh] flex flex-col justify-center"
      >
        {/* Interactive Glow Effects (Light Mode) */}
        <div
          className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-orange-200/40 rounded-full blur-[120px] -z-10 pointer-events-none transition-transform duration-100 ease-out will-change-transform"
          style={{
            transform: `translate(calc(-50% + ${mousePosition.x * -50}px), ${mousePosition.y * -50}px)`
          }}
        ></div>
        <div
          className="absolute top-20 left-1/2 w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-[80px] -z-10 pointer-events-none transition-transform duration-100 ease-out will-change-transform"
          style={{
            transform: `translate(calc(-50% + ${mousePosition.x * 80}px), ${mousePosition.y * 80}px)`
          }}
        ></div>

        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm hover:shadow-md transition-all cursor-default">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-gray-600">New AI Courses Available</span>
          </div>

          <h1
            className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tight mb-8 text-gray-900 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both delay-100"
            style={{
              transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`
            }}
          >
            Think faster with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">AVinar Labs</span>
          </h1>

          <p className="max-w-2xl mx-auto text-gray-600 text-lg md:text-xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both delay-200">
            Master the skills of tomorrow with our advanced learning platform.
            Join thousands of students transforming their careers through AI-driven education.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both delay-300">
            <Button
              size="lg"
              className="bg-orange-500 text-white hover:bg-orange-600 rounded-full px-8 h-14 text-lg font-semibold hover:scale-105 transition-transform shadow-lg shadow-orange-500/20"
              onClick={() => navigate("/register")}
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-8 h-14 text-lg hover:scale-105 transition-transform bg-white"
              onClick={() => navigate("/courses")}
            >
              Browse Courses
            </Button>
          </div>

          {/* Hero Image / Dashboard Preview */}
          <div
            className="mt-20 relative mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both delay-500 perspective-1000"
            style={{
              transform: `rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`
            }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-blue-500 rounded-2xl blur opacity-20 animate-pulse"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl transform transition-transform duration-200">
              <img
                src="https://ui-avatars.com/api/?name=Dashboard&background=f3f4f6&color=333&size=800&length=1&font-size=0.1"
                alt="Platform Preview"
                className="w-full rounded-xl shadow-inner"
                style={{ minHeight: '400px', objectFit: 'cover' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-400 font-mono">Interactive Learning Environment</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 view-animate">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">Built for the future</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Experience a learning platform designed to adapt to your needs and pace.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed and performance." },
              { icon: Shield, title: "Secure & Private", desc: "Your data is protected with enterprise-grade security." },
              { icon: BarChart, title: "Track Progress", desc: "Detailed analytics to monitor your growth." },
              { icon: Globe, title: "Global Community", desc: "Connect with learners from around the world." },
              { icon: Cpu, title: "AI Powered", desc: "Personalized recommendations driven by AI." },
              { icon: Users, title: "Expert Mentors", desc: "Learn directly from industry leaders." }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-orange-200 transition-all duration-300 group hover:-translate-y-2 hover:bg-white hover:shadow-xl"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="text-orange-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-24 px-6 relative overflow-hidden bg-[#F3F4F6]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-end mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Featured Courses</h2>
              <p className="text-gray-500">Explore our most popular learning paths.</p>
            </div>
            <Link to="/courses" className="hidden md:flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors group font-medium">
              View All Courses <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {courses.map((course, idx) => (
                <div
                  key={course._id}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-orange-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {course.imageCover ? (
                      <img
                        src={getImageUrl(course.imageCover)}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Play className="text-gray-400" size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <Button
                        size="sm"
                        className="w-full bg-white text-black hover:bg-gray-100 font-bold"
                        onClick={() => navigate(`/course/${course._id}`)}
                      >
                        View Course
                      </Button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-2 py-1 rounded border border-orange-100">
                        {course.category?.name || "Course"}
                      </span>
                      <span className="text-gray-900 font-bold bg-gray-100 px-2 py-1 rounded">${course.price}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors text-gray-900">{course.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{course.description}</p>

                    <div className="flex items-center gap-2 text-sm text-gray-400 border-t border-gray-100 pt-4">
                      <Users size={14} />
                      <span>1.2k Students</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link to="/courses" className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors font-medium">
              View All Courses <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white border-y border-gray-200">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 text-gray-900">Loved by learners</h2>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 relative hover:border-orange-200 transition-colors group hover:shadow-lg hover:bg-white">
              <MessageSquare className="absolute -top-4 -right-4 text-orange-500 bg-white p-2 rounded-lg border border-gray-100 group-hover:scale-110 transition-transform shadow-sm" size={40} />
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">"The quality of content on AVinar is unmatched. I've learned more in 3 months here than I did in 2 years of traditional schooling."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full"></div>
                <div>
                  <h4 className="font-bold text-gray-900">Alex Morgan</h4>
                  <p className="text-sm text-gray-500">Software Engineer</p>
                </div>
              </div>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 relative hover:border-blue-200 transition-colors group hover:shadow-lg hover:bg-white">
              <MessageSquare className="absolute -top-4 -right-4 text-blue-500 bg-white p-2 rounded-lg border border-gray-100 group-hover:scale-110 transition-transform shadow-sm" size={40} />
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">"The platform is incredibly intuitive and the community is so supportive. Highly recommended for anyone looking to upskill."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full"></div>
                <div>
                  <h4 className="font-bold text-gray-900">Sarah Chen</h4>
                  <p className="text-sm text-gray-500">Product Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center relative overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-orange-900/20 pointer-events-none"></div>
        <div className="container mx-auto max-w-3xl relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">Ready to start your journey?</h2>
          <p className="text-xl text-gray-400 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">Join thousands of others building the future with AVinar.</p>
          <Button
            size="lg"
            className="bg-orange-500 text-white hover:bg-orange-600 rounded-full px-10 h-16 text-xl font-bold shadow-lg shadow-orange-500/30 transition-all hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200"
            onClick={() => navigate("/register")}
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 bg-white">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center text-white font-bold text-xs">A</div>
            <span className="font-bold text-xl text-gray-900">AVinar Labs</span>
          </div>

          <div className="flex gap-8 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-orange-500 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-orange-500 transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-orange-500 transition-colors">Contact</Link>
          </div>

          <p className="text-sm text-gray-500">© 2024 AVinar Center. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
