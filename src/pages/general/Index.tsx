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
import { motion } from "framer-motion";

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
  const [visitorCount, setVisitorCount] = useState(0);
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/products`);
        setCourses(res.data?.data?.slice(0, 6) || []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchVisitors = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/visitors/all`);
        setVisitorCount(res.data?.data?.length || 0);
      } catch (error) {
        console.error("Failed to fetch visitors:", error);
      }
    };

    fetchCourses();
    fetchVisitors();

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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-900 font-sans selection:bg-sky-500/30 overflow-x-hidden">

      {/* Hero Section */}
      <header
        ref={heroRef}
        className="relative pt-32 pb-20 px-6 text-center overflow-hidden min-h-[90vh] flex flex-col justify-center"
      >
        {/* Interactive Glow Effects (Light Mode) */}
        <div
          className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-sky-200/40 rounded-full blur-[120px] -z-10 pointer-events-none transition-transform duration-100 ease-out will-change-transform"
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 mb-8 shadow-sm hover:shadow-md transition-all cursor-default"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-gray-600">دورات الذكاء الاصطناعي الجديدة متاحة الآن</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tight mb-8 text-gray-900"
            style={{
              transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`
            }}
          >
            فكر بشكل أسرع مع <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-600">AVinar.source</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="max-w-2xl mx-auto text-gray-600 text-lg md:text-xl mb-12 leading-relaxed"
          >
            أتقن مهارات المستقبل مع منصتنا التعليمية المتقدمة.
            انضم إلى آلاف الطلاب الذين يحولون مساراتهم المهنية من خلال التعليم المدعوم بالذكاء الاصطناعي.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-sky-500 text-white hover:bg-sky-600 rounded-full px-8 h-14 text-lg font-semibold hover:scale-105 transition-transform shadow-lg shadow-sky-500/20"
              onClick={() => navigate("/register")}
            >
              ابدأ مجاناً
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-8 h-14 text-lg hover:scale-105 transition-transform bg-white"
              onClick={() => navigate("/courses")}
            >
              تصفح الدورات
            </Button>
          </motion.div>

          {/* Hero Image / Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-20 relative mx-auto max-w-4xl perspective-1000"
            style={{
              transform: `rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`
            }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl blur opacity-20 animate-pulse"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl transform transition-transform duration-200">
              <img
                src="https://ui-avatars.com/api/?name=Dashboard&background=f3f4f6&color=333&size=800&length=1&font-size=0.1"
                alt="Platform Preview"
                className="w-full rounded-xl shadow-inner"
                style={{ minHeight: '400px', objectFit: 'cover' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-400 font-mono">بيئة تعليمية تفاعلية</p>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">مصممة للمستقبل</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              اختبر منصة تعليمية مصممة لتتكيف مع احتياجاتك ووتيرتك.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: Zap, title: "سريع كالبرق", desc: "محسّن للسرعة والأداء." },
              { icon: Shield, title: "آمن وخاص", desc: "بياناتك محمية بأمان على مستوى المؤسسات." },
              { icon: BarChart, title: "تتبع التقدم", desc: "تحليلات مفصلة لمراقبة نموك." },
              { icon: Globe, title: "مجتمع عالمي", desc: "تواصل مع متعلمين من جميع أنحاء العالم." },
              { icon: Cpu, title: "مدعوم بالذكاء الاصطناعي", desc: "توصيات مخصصة مدعومة بالذكاء الاصطناعي." },
              { icon: Users, title: "مرشدون خبراء", desc: "تعلم مباشرة من قادة الصناعة." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-sky-200 transition-all duration-300 group hover:-translate-y-2 hover:bg-white hover:shadow-xl"
              >
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="text-sky-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-24 px-6 relative overflow-hidden bg-[#F3F4F6]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="container mx-auto max-w-6xl">
          <motion.div
            {...fadeInUp}
            className="flex justify-between items-end mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">الدورات المميزة</h2>
              <p className="text-gray-500">استكشف مساراتنا التعليمية الأكثر شعبية.</p>
            </div>
            <Link to="/courses" className="hidden md:flex items-center gap-2 text-sky-500 hover:text-sky-600 transition-colors group font-medium">
              عرض جميع الدورات <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {courses.map((course) => (
                <motion.div
                  key={course._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-sky-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
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
                        عرض الدورة
                      </Button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-2 py-1 rounded border border-sky-100">
                        {course.category?.name || "دورة"}
                      </span>
                      <span className="text-gray-900 font-bold bg-gray-100 px-2 py-1 rounded">${course.price}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-sky-500 transition-colors text-gray-900">{course.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{course.description}</p>

                    <div className="flex items-center gap-2 text-sm text-gray-400 border-t border-gray-100 pt-4">
                      <Users size={14} />
                      <span>1.2k طالب</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link to="/courses" className="inline-flex items-center gap-2 text-sky-500 hover:text-sky-600 transition-colors font-medium">
              عرض جميع الدورات <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Partner Companies Section */}
      <section className="py-20 px-6 bg-white border-y border-gray-200 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            {...fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              شركاؤنا في النجاح
            </h2>
            <p className="text-gray-600 text-lg">
              نفخر بالتعاون مع أفضل الشركات والمؤسسات التعليمية
            </p>
          </motion.div>

          {/* Animated Partner Logos Carousel */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="flex gap-8 animate-scroll">
              {/* Duplicate partners for seamless loop */}
              {[
                ...[
                  { name: "Microsoft" },
                  { name: "Google" },
                  { name: "Amazon" },
                  { name: "Meta" },
                  { name: "Apple" },
                  { name: "IBM" },
                  { name: "Netflix" },
                  { name: "Tesla" },
                ],
                ...[
                  { name: "Microsoft" },
                  { name: "Google" },
                  { name: "Amazon" },
                  { name: "Meta" },
                  { name: "Apple" },
                  { name: "IBM" },
                  { name: "Netflix" },
                  { name: "Tesla" },
                ],
              ].map((partner, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-48 bg-gray-50 rounded-2xl p-8 hover:bg-white transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-gray-300"
                >
                  <div className="flex items-center justify-center h-16">
                    <div className="text-2xl font-bold text-gray-600 hover:text-gray-900 transition-colors duration-300">
                      {partner.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats Below Partners */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-gray-200"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="text-center">
              <div className="text-4xl font-bold text-sky-600 mb-2">50+</div>
              <div className="text-gray-600">شريك تعليمي</div>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="text-center">
              <div className="text-4xl font-bold text-sky-600 mb-2">{visitorCount > 0 ? visitorCount.toLocaleString() : '10K+'}</div>
              <div className="text-gray-600">طالب نشط</div>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="text-center">
              <div className="text-4xl font-bold text-sky-600 mb-2">95%</div>
              <div className="text-gray-600">نسبة الرضا</div>
            </motion.div>
          </motion.div>
        </div>

        {/* CSS Animation */}
        <style>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
          
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center relative overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-sky-900/20 pointer-events-none"></div>
        <div className="container mx-auto max-w-3xl relative z-10">
          <motion.h2
            {...fadeInUp}
            className="text-4xl md:text-6xl font-bold mb-8"
          >
            هل أنت مستعد لبدء رحلتك؟
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-400 mb-10"
          >
            انضم إلى الآلاف ممن يبنون المستقبل مع AVinar.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              size="lg"
              className="bg-sky-500 text-white hover:bg-sky-600 rounded-full px-10 h-16 text-xl font-bold shadow-lg shadow-sky-500/30 transition-all hover:scale-105"
              onClick={() => navigate("/register")}
            >
              ابدأ الآن
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 bg-white">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center text-white font-bold text-xs">A</div>
            <span className="font-bold text-xl text-gray-900">AVinar.source</span>
          </div>

          <div className="flex gap-8 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-sky-500 transition-colors">الخصوصية</Link>
            <Link to="/terms" className="hover:text-sky-500 transition-colors">الشروط</Link>
            <Link to="/contact" className="hover:text-sky-500 transition-colors">اتصل بنا</Link>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Index;
