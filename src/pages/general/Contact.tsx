import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const Contact = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "تم إرسال رسالتك بنجاح",
                description: "سنقوم بالرد عليك في أقرب وقت ممكن.",
            });
            (e.target as HTMLFormElement).reset();
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Hero Section */}
            <div className="bg-blue-900 py-20 text-center text-white">
                <div className="container mx-auto px-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        تواصل معنا
                    </motion.h1>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                        نحن هنا لمساعدتك. إذا كان لديك أي استفسار أو اقتراح، لا تتردد في التواصل معنا.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">معلومات الاتصال</h2>
                            <p className="text-gray-600 mb-8">
                                يمكنك التواصل معنا عبر القنوات التالية أو زيارة مقرنا الرئيسي.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Mail className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">البريد الإلكتروني</h3>
                                    <p className="text-gray-600">support@avinar.source</p>
                                    <p className="text-gray-600">info@avinar.source</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Phone className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">الهاتف</h3>
                                    <p className="text-gray-600" dir="ltr">+249 912 345 678</p>
                                    <p className="text-gray-600" dir="ltr">+249 123 456 789</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <MapPin className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">العنوان</h3>
                                    <p className="text-gray-600">الخرطوم، السودان</p>
                                    <p className="text-gray-600">شارع الستين، برج النيل</p>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="bg-gray-200 h-64 rounded-2xl w-full overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                <MapPin className="w-8 h-8 mb-2" />
                                <span>خريطة الموقع</span>
                            </div>
                            {/* Add Google Maps iframe here if needed */}
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">أرسل لنا رسالة</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                                    <Input placeholder="اسمك الكامل" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                                    <Input type="email" placeholder="example@mail.com" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الموضوع</label>
                                <Input placeholder="كيف يمكننا مساعدتك؟" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الرسالة</label>
                                <Textarea placeholder="اكتب رسالتك هنا..." className="min-h-[150px]" required />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg"
                                disabled={loading}
                            >
                                {loading ? "جاري الإرسال..." : (
                                    <span className="flex items-center gap-2">
                                        إرسال الرسالة <Send size={18} />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
