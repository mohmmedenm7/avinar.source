import { motion } from "framer-motion";
import { Users, Target, Heart, Award } from "lucide-react";

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6"
                    >
                        من نحن
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-blue-100 max-w-2xl mx-auto"
                    >
                        نحن منصة تعليمية رائدة تهدف إلى تمكين المتعلمين من خلال توفير محتوى تعليمي عالي الجودة في مجالات التكنولوجيا والبرمجة.
                    </motion.p>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="container mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="flex gap-4">
                            <div className="bg-blue-100 p-3 rounded-lg h-fit">
                                <Target className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">رؤيتنا</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    أن نكون المصدر الأول للتعليم التقني في المنطقة، ونبني مجتمعاً من المبدعين والمطورين القادرين على تشكيل المستقبل.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-blue-100 p-3 rounded-lg h-fit">
                                <Award className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">رسالتنا</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    تقديم دورات تدريبية شاملة وعملية، مصممة من قبل خبراء الصناعة، لتزويد الطلاب بالمهارات اللازمة للنجاح في سوق العمل.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-blue-100 p-3 rounded-lg h-fit">
                                <Heart className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">قيمنا</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    التميز، الابتكار، والتعلم المستمر. نحن نؤمن بأن التعليم هو رحلة مستمرة لا تتوقف.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl opacity-20 blur-2xl"></div>
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                            alt="Team working"
                            className="relative rounded-2xl shadow-2xl w-full object-cover h-[400px]"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-blue-900 py-20 text-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { number: "+10K", label: "طالب نشط" },
                            { number: "+50", label: "دورة تدريبية" },
                            { number: "+20", label: "مدرب خبير" },
                            { number: "+5K", label: "تقييم 5 نجوم" },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">{stat.number}</div>
                                <div className="text-blue-100">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Section Placeholder */}
            <div className="container mx-auto px-6 py-20 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">فريق العمل</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                                <Users className="w-full h-full p-6 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">عضو فريق {item}</h3>
                            <p className="text-blue-600 mb-2">المسمى الوظيفي</p>
                            <p className="text-gray-500 text-sm">
                                نبذة مختصرة عن عضو الفريق وخبراته في المجال.
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;
