import { motion } from "framer-motion";
import { ArrowRight, Play, Users, Volume2, VolumeX, Gift } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/utils/imageUtils";
import { useState, useRef } from "react";

interface Course {
    _id: string;
    title: string;
    description: string;
    price: number;
    isFree?: boolean;
    imageCover?: string;
    previewVideo?: string;
    previewVideoUrl?: string;
    category?: { name: string };
}

interface FeaturedCoursesProps {
    courses: Course[];
    loading: boolean;
}

// Helper to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
        ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${match[2]}`
        : null;
};

const CourseCard = ({ course }: { course: Course }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const hasPreviewVideo = course.previewVideo || course.previewVideoUrl;
    const youtubeEmbedUrl = course.previewVideoUrl ? getYouTubeEmbedUrl(course.previewVideoUrl) : null;

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current) {
            videoRef.current.play().catch(() => { });
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-sky-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {/* Show video on hover if available */}
                {isHovered && hasPreviewVideo ? (
                    <>
                        {youtubeEmbedUrl ? (
                            <iframe
                                src={youtubeEmbedUrl}
                                className="w-full h-full"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                title="Preview Video"
                            />
                        ) : course.previewVideo ? (
                            <video
                                ref={videoRef}
                                src={course.previewVideo}
                                className="w-full h-full object-cover"
                                muted={isMuted}
                                loop
                                playsInline
                            />
                        ) : null}

                        {/* Mute toggle for uploaded videos */}
                        {course.previewVideo && !youtubeEmbedUrl && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                                className="absolute bottom-3 left-3 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                            >
                                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            </button>
                        )}
                    </>
                ) : (
                    <>
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

                        {/* Play icon indicator if preview video exists */}
                        {hasPreviewVideo && (
                            <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                <Play size={12} fill="white" /> معاينة
                            </div>
                        )}
                    </>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <Button
                        size="sm"
                        className="w-full bg-white text-black hover:bg-gray-100 font-bold"
                        onClick={() => navigate(`/course-details/${course._id}`)}
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
                    {course.isFree || course.price === 0 ? (
                        <span className="text-white font-bold bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <Gift size={14} /> مجاني
                        </span>
                    ) : (
                        <span className="text-gray-900 font-bold bg-gray-100 px-2 py-1 rounded">${course.price}</span>
                    )}
                </div>
                <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-sky-500 transition-colors text-gray-900">{course.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{course.description}</p>

                <div className="flex items-center gap-2 text-sm text-gray-400 border-t border-gray-100 pt-4">
                    <Users size={14} />
                    <span>1.2k طالب</span>
                </div>
            </div>
        </motion.div>
    );
};

const FeaturedCoursesSection = ({ courses, loading }: FeaturedCoursesProps) => {
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
        <section className="py-24 px-6 relative overflow-hidden bg-[#F3F4F6]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

            <div className="container mx-auto max-w-6xl">
                <motion.div
                    {...fadeInUp}
                    className="flex justify-between items-end mb-12"
                >
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">أحدث الدورات</h2>
                        <p className="text-gray-500">استكشف أحدث الدورات المضافة لدينا.</p>
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
                            <CourseCard key={course._id} course={course} />
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
    );
};

export default FeaturedCoursesSection;
