import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="py-32 px-6 text-center relative overflow-hidden bg-gray-900 text-white">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-sky-900/20 pointer-events-none"></div>
            <div className="container mx-auto max-w-3xl relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
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
    );
};

export default CTASection;
