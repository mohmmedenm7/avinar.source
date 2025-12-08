import { motion } from "framer-motion";
import { Eye, Lock, Database, UserCheck } from "lucide-react";
import SEO from "@/components/SEO";

const Privacy = () => {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    const sections = [
        {
            title: "جمع المعلومات",
            content: "نقوم بجمع معلومات منك عندما تقوم بالتسجيل في موقعنا، أو الاشتراك في نشرتنا الإخبارية، أو ملء نموذج. قد يطلب منك إدخال اسمك، عنوان بريدك الإلكتروني، رقم هاتفك أو معلومات أخرى.",
            icon: <Database className="w-6 h-6 text-sky-500" />
        },
        {
            title: "استخدام المعلومات",
            content: "قد نستخدم المعلومات التي نجمعها منك لتخصيص تجربتك وتحسين موقعنا لخدمتك بشكل أفضل، ولإرسال رسائل بريد إلكتروني دورية بخصوص طلبك أو منتجاتنا وخدماتنا الأخرى.",
            icon: <UserCheck className="w-6 h-6 text-sky-500" />
        },
        {
            title: "حماية المعلومات",
            content: "نقوم بتطبيق مجموعة من الإجراءات الأمنية للحفاظ على سلامة معلوماتك الشخصية. نستخدم تشفيراً متقدماً لحماية المعلومات الحساسة التي تنتقل عبر الإنترنت.",
            icon: <Lock className="w-6 h-6 text-sky-500" />
        },
        {
            title: "ملفات تعريف الارتباط (Cookies)",
            content: "نحن نستخدم ملفات تعريف الارتباط لفهم وحفظ تفضيلاتك للزيارات المستقبلية ولتجميع البيانات المجمعة حول حركة المرور في الموقع والتفاعل معه لتقديم تجارب وأدوات أفضل في المستقبل.",
            icon: <Eye className="w-6 h-6 text-sky-500" />
        }
    ];

    return (
        <>
            <SEO title="سياسة الخصوصية" description="سياسة الخصوصية لمنصة Avinar" />
            <div className="min-h-screen bg-[#F3F4F6] py-20 px-4 md:px-8">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">سياسة الخصوصية</h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            خصوصيتك هي أولويتنا. تعرف على كيفية تعاملنا مع بياناتك.
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

export default Privacy;
