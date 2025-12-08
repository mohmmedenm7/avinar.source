import { motion } from "framer-motion";
import { Shield, FileText, Lock, Users } from "lucide-react";
import SEO from "@/components/SEO";

const Terms = () => {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    const sections = [
        {
            title: "1. مقدمة",
            content: "مرحباً بك في منصة Avinar. باستخدامه لهذه المنصة، فإنك توافق على الالتزام بشروط وأحكام الاستخدام هذه ، وجميع القوانين واللوائح المعمول بها، وتقر بأنك مسؤول عن الامتثال لأي قوانين محلية سارية.",
            icon: <FileText className="w-6 h-6 text-sky-500" />
        },
        {
            title: "2. حقوق الملكية الفكرية",
            content: "جميع المحتويات الموجودة على هذه المنصة (النصوص، الصور، الفيديوهات، الشعارات) محمية بموجب قوانين حقوق النشر والعلامات التجارية. لا يجوز نسخ أو توزيع أو تعديل أي جزء من المحتوى بدون إذن كتابي مسبق.",
            icon: <Shield className="w-6 h-6 text-sky-500" />
        },
        {
            title: "3. ترخيص الاستخدام",
            content: "يتم منحك ترخيصاً مؤقتاً لتنزيل نسخة واحدة من المواد (المعلومات أو البرامج) على منصة Avinar للعرض الشخصي وغير التجاري العابر فقط. هذا هو منح للترخيص، وليس نقلاً للملكية.",
            icon: <Lock className="w-6 h-6 text-sky-500" />
        },
        {
            title: "4. حساب المستخدم",
            content: "أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور الخاصة بك وتقييد الوصول إلى جهاز الكمبيوتر الخاص بك، وتوافق على قبول المسؤولية عن جميع الأنشطة التي تحدث تحت حسابك أو كلمة المرور الخاصة بك.",
            icon: <Users className="w-6 h-6 text-sky-500" />
        }
    ];

    return (
        <>
            <SEO title="الشروط والأحكام" description="الشروط والأحكام الخاصة بمنصة Avinar" />
            <div className="min-h-screen bg-[#F3F4F6] py-20 px-4 md:px-8">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">الشروط والأحكام</h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            يرجى قراءة هذه الشروط بعناية قبل استخدام منصة Avinar
                        </p>
                    </motion.div>

                    <div className="space-y-6">
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                {...fadeInUp}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-sky-50 rounded-xl">
                                        {section.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
                                        <p className="text-gray-600 leading-relaxed">
                                            {section.content}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-12 text-center text-gray-500 text-sm">
                        آخر تحديث: 7 ديسمبر 2025
                    </div>
                </div>
            </div>
        </>
    );
};

export default Terms;
