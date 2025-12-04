import { motion } from "framer-motion";

interface PartnersProps {
    visitorCount: number;
}

const PartnersSection = ({ visitorCount }: PartnersProps) => {
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

    const partners = [
        { name: "Microsoft" },
        { name: "Google" },
        { name: "Amazon" },
        { name: "Meta" },
        { name: "Apple" },
        { name: "IBM" },
        { name: "Netflix" },
        { name: "Tesla" },
    ];

    return (
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
                        {[...partners, ...partners].map((partner, index) => (
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
    );
};

export default PartnersSection;
