import { motion } from "framer-motion";
import { Zap, Shield, BarChart, Globe, Cpu, Users } from "lucide-react";

const FeaturesSection = () => {
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

    const features = [
        { icon: Zap, title: "سريع كالبرق", desc: "محسّن للسرعة والأداء." },
        { icon: Shield, title: "آمن وخاص", desc: "بياناتك محمية بأمان على مستوى المؤسسات." },
        { icon: BarChart, title: "تتبع التقدم", desc: "تحليلات مفصلة لمراقبة نموك." },
        { icon: Globe, title: "مجتمع عالمي", desc: "تواصل مع متعلمين من جميع أنحاء العالم." },
        { icon: Cpu, title: "مدعوم بالذكاء الاصطناعي", desc: "توصيات مخصصة مدعومة بالذكاء الاصطناعي." },
        { icon: Users, title: "مرشدون خبراء", desc: "تعلم مباشرة من قادة الصناعة." }
    ];

    return (
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
                    {features.map((feature, idx) => (
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
    );
};

export default FeaturesSection;
