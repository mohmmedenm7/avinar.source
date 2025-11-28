import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
    size?: number;
    color?: string;
    speed?: number;
    loop?: boolean;
    reducedMotionFallback?: boolean;
}

/**
 * LoadingSpinner - Professional loading indicator with accessibility support
 * 
 * @param size - Size in pixels (default: 48)
 * @param color - Color using CSS variable or hex (default: var(--primary))
 * @param speed - Animation duration in seconds (default: 1.2)
 * @param loop - Whether to loop infinitely (default: true)
 * @param reducedMotionFallback - Show static version for reduced motion (default: true)
 */
export const LoadingSpinner = ({
    size = 48,
    color = "var(--primary, #2563EB)",
    speed = 1.2,
    loop = true,
    reducedMotionFallback = true,
}: LoadingSpinnerProps) => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    const shouldAnimate = !prefersReducedMotion || !reducedMotionFallback;

    return (
        <div
            role="status"
            aria-live="polite"
            aria-label="Loading"
            style={{
                width: size,
                height: size,
                position: "relative",
            }}
        >
            <motion.svg
                width={size}
                height={size}
                viewBox="0 0 50 50"
                style={{
                    display: "block",
                }}
                animate={shouldAnimate ? { rotate: 360 } : {}}
                transition={{
                    duration: speed,
                    repeat: loop ? Infinity : 0,
                    ease: "linear",
                }}
            >
                <motion.circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0.3 }}
                    animate={
                        shouldAnimate
                            ? {
                                pathLength: [0, 0.8, 0],
                                opacity: [0.3, 1, 0.3],
                            }
                            : { pathLength: 0.5, opacity: 0.5 }
                    }
                    transition={{
                        duration: speed,
                        repeat: loop ? Infinity : 0,
                        ease: "easeInOut",
                    }}
                />
            </motion.svg>
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default LoadingSpinner;
