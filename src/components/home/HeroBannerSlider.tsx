import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config/env';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, ExternalLink } from 'lucide-react';

interface HeroBanner {
    _id: string;
    title?: string;
    description?: string;
    type: 'image' | 'video';
    mediaUrl: string;
    mediaFile?: string;
    linkUrl?: string;
    linkText?: string;
    duration: number;
    overlayColor?: string;
    textColor?: string;
    textPosition?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface HeroBannerSliderProps {
    defaultImage?: string;
    className?: string;
    mousePosition?: { x: number; y: number };
}

const HeroBannerSlider = ({
    defaultImage = '/images/background.png.jpg',
    className = '',
    mousePosition = { x: 0, y: 0 }
}: HeroBannerSliderProps) => {
    const [banners, setBanners] = useState<HeroBanner[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    // Fetch active banners
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/v1/banners/active`);
                if (res.data?.data && res.data.data.length > 0) {
                    setBanners(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch banners:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    // Auto-rotate banners
    useEffect(() => {
        if (banners.length <= 1 || isPaused || isVideoPlaying) return;

        const currentBanner = banners[currentIndex];
        const duration = currentBanner?.duration || 5000;

        const timer = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [currentIndex, banners, isPaused, isVideoPlaying]);

    // Record view when banner changes
    useEffect(() => {
        if (banners.length > 0 && banners[currentIndex]) {
            axios.post(`${API_BASE_URL}/api/v1/banners/${banners[currentIndex]._id}/view`).catch(() => { });
        }
    }, [currentIndex, banners]);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }, [banners.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, [banners.length]);

    const handleBannerClick = (banner: HeroBanner) => {
        if (banner.linkUrl) {
            // Record click
            axios.post(`${API_BASE_URL}/api/v1/banners/${banner._id}/click`).catch(() => { });
            window.open(banner.linkUrl, '_blank');
        }
    };

    const getMediaUrl = (banner: HeroBanner) => {
        if (banner.mediaFile) {
            return `${API_BASE_URL}/uploads/banners/${banner.mediaFile}`;
        }
        // Check if it's a full URL or relative path
        if (banner.mediaUrl.startsWith('http')) {
            return banner.mediaUrl;
        }
        return `${API_BASE_URL}/${banner.mediaUrl}`;
    };

    const getTextPositionClasses = (position?: string) => {
        switch (position) {
            case 'top-left':
                return 'items-start justify-start text-left pt-12 pl-12';
            case 'top-right':
                return 'items-start justify-end text-right pt-12 pr-12';
            case 'bottom-left':
                return 'items-end justify-start text-left pb-12 pl-12';
            case 'bottom-right':
                return 'items-end justify-end text-right pb-12 pr-12';
            default:
                return 'items-center justify-center text-center';
        }
    };

    // If no banners, show default image
    if (loading) {
        return (
            <div className={`mt-20 relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl mx-auto max-w-4xl ${className}`}>
                <div className="w-full rounded-xl shadow-inner bg-gray-100 animate-pulse" style={{ minHeight: '400px' }} />
            </div>
        );
    }

    if (banners.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 40, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className={`mt-20 relative mx-auto max-w-4xl perspective-1000 ${className}`}
                style={{
                    transform: `rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`
                }}
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl blur opacity-20 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl transform transition-transform duration-200">
                    <img
                        src={defaultImage}
                        alt="Platform Preview"
                        className="w-full rounded-xl shadow-inner"
                        style={{ minHeight: '400px', objectFit: 'cover' }}
                    />
                </div>
            </motion.div>
        );
    }

    const currentBanner = banners[currentIndex];

    return (
        <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className={`mt-20 relative mx-auto max-w-4xl perspective-1000 ${className}`}
            style={{
                transform: `rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl blur opacity-20 animate-pulse"></div>

            {/* Main Container */}
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl transform transition-transform duration-200 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="relative w-full rounded-xl overflow-hidden"
                        style={{ minHeight: '400px' }}
                    >
                        {currentBanner.type === 'video' ? (
                            <video
                                src={getMediaUrl(currentBanner)}
                                className="w-full h-full object-cover rounded-xl"
                                style={{ minHeight: '400px' }}
                                autoPlay
                                muted
                                loop
                                playsInline
                                onPlay={() => setIsVideoPlaying(true)}
                                onPause={() => setIsVideoPlaying(false)}
                                onEnded={() => {
                                    setIsVideoPlaying(false);
                                    goToNext();
                                }}
                            />
                        ) : (
                            <img
                                src={getMediaUrl(currentBanner)}
                                alt={currentBanner.title || 'Banner'}
                                className="w-full h-full object-cover rounded-xl"
                                style={{ minHeight: '400px' }}
                            />
                        )}

                        {/* Overlay */}
                        {(currentBanner.title || currentBanner.description || currentBanner.linkUrl) && (
                            <div
                                className={`absolute inset-0 flex flex-col ${getTextPositionClasses(currentBanner.textPosition)} p-8 rounded-xl`}
                                style={{ backgroundColor: currentBanner.overlayColor || 'rgba(0,0,0,0.3)' }}
                            >
                                <div className="max-w-lg">
                                    {currentBanner.title && (
                                        <h3
                                            className="text-3xl md:text-4xl font-bold mb-4"
                                            style={{ color: currentBanner.textColor || '#ffffff' }}
                                        >
                                            {currentBanner.title}
                                        </h3>
                                    )}
                                    {currentBanner.description && (
                                        <p
                                            className="text-lg mb-6 opacity-90"
                                            style={{ color: currentBanner.textColor || '#ffffff' }}
                                        >
                                            {currentBanner.description}
                                        </p>
                                    )}
                                    {currentBanner.linkUrl && (
                                        <button
                                            onClick={() => handleBannerClick(currentBanner)}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full font-semibold transition-all hover:scale-105"
                                            style={{ color: currentBanner.textColor || '#ffffff' }}
                                        >
                                            {currentBanner.linkText || 'اعرف المزيد'}
                                            <ExternalLink size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Controls */}
                {banners.length > 1 && (
                    <>
                        {/* Arrows */}
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
                            aria-label="Previous"
                        >
                            <ChevronLeft size={24} className="text-gray-800" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
                            aria-label="Next"
                        >
                            <ChevronRight size={24} className="text-gray-800" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`transition-all duration-300 rounded-full ${index === currentIndex
                                        ? 'w-8 h-2 bg-sky-500'
                                        : 'w-2 h-2 bg-white/60 hover:bg-white/80'
                                        }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Pause/Play Button */}
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="absolute bottom-6 right-6 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
                            aria-label={isPaused ? 'Play' : 'Pause'}
                        >
                            {isPaused ? (
                                <Play size={16} className="text-gray-800 ml-0.5" />
                            ) : (
                                <Pause size={16} className="text-gray-800" />
                            )}
                        </button>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default HeroBannerSlider;
