import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface PageTransitionProps {
    children: ReactNode;
    mode?: "fade" | "slide" | "fadeSlide" | "scale";
    duration?: number;
    translateY?: number;
    easing?: number[];
    className?: string;
}

/**
 * PageTransition - Smooth page transitions with multiple animation modes
 * 
 * @param children - Page content to animate
 * @param mode - Animation type: "fade", "slide", "fadeSlide", "scale" (default: "fadeSlide")
 * @param duration - Animation duration in seconds (default: 0.45)
 * @param translateY - Vertical slide distance in px (default: 24)
 * @param easing - Cubic bezier easing (default: [0.22, 1, 0.36, 1])
 * @param className - Additional CSS classes
 */
export const PageTransition = ({
    children,
    mode = "fadeSlide",
    duration = 0.45,
    translateY = 24,
    easing = [0.22, 1, 0.36, 1],
    className = "",
}: PageTransitionProps) => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    const variants = {
        fade: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
        },
        slide: {
            initial: { x: translateY },
            animate: { x: 0 },
            exit: { x: -translateY },
        },
        fadeSlide: {
            initial: { opacity: 0, y: translateY },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -translateY },
        },
        scale: {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 1.05 },
        },
    };

    const selectedVariant = variants[mode];
    const transitionConfig = {
        duration: prefersReducedMotion ? 0.1 : duration,
        ease: easing,
    };

    return (
        <motion.div
            initial={selectedVariant.initial}
            animate={selectedVariant.animate}
            exit={selectedVariant.exit}
            transition={transitionConfig}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * AnimatedRoutes - Wrapper for React Router routes with page transitions
 * 
 * Usage with React Router:
 * ```tsx
 * <AnimatedRoutes>
 *   <Routes location={location} key={location.pathname}>
 *     <Route path="/" element={<Home />} />
 *     <Route path="/about" element={<About />} />
 *   </Routes>
 * </AnimatedRoutes>
 * ```
 */
export const AnimatedRoutes = ({
    children,
    mode = "fadeSlide",
    duration = 0.45,
}: {
    children: ReactNode;
    mode?: PageTransitionProps["mode"];
    duration?: number;
}) => {
    return (
        <AnimatePresence mode="wait">
            <PageTransition mode={mode} duration={duration}>
                {children}
            </PageTransition>
        </AnimatePresence>
    );
};

export default PageTransition;
