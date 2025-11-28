import { motion, MotionProps } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface MicroInteractionProps extends Omit<MotionProps, "children"> {
    children: ReactNode;
    scaleDown?: number;
    translateY?: number;
    duration?: number;
    easing?: string | number[];
    disabled?: boolean;
    className?: string;
}

/**
 * MicroInteraction - Subtle hover and press animations for interactive elements
 * 
 * @param children - React children to wrap
 * @param scaleDown - Scale factor on press (default: 0.96)
 * @param translateY - Vertical translation on hover in px (default: -2)
 * @param duration - Animation duration in seconds (default: 0.12)
 * @param easing - Easing function (default: "easeInOut")
 * @param disabled - Disable animations (default: false)
 * @param className - Additional CSS classes
 */
export const MicroInteraction = ({
    children,
    scaleDown = 0.96,
    translateY = -2,
    duration = 0.12,
    easing = "easeInOut",
    disabled = false,
    className = "",
    ...motionProps
}: MicroInteractionProps) => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    const shouldAnimate = !prefersReducedMotion && !disabled;

    return (
        <motion.div
            className={className}
            whileHover={
                shouldAnimate
                    ? {
                        y: translateY,
                        transition: { duration, ease: easing },
                    }
                    : undefined
            }
            whileTap={
                shouldAnimate
                    ? {
                        scale: scaleDown,
                        transition: { duration: duration * 0.5, ease: easing },
                    }
                    : undefined
            }
            {...motionProps}
        >
            {children}
        </motion.div>
    );
};

/**
 * ButtonPress - Specialized micro-interaction for buttons
 */
export const ButtonPress = ({
    children,
    className = "",
    ...props
}: Omit<MicroInteractionProps, "scaleDown" | "translateY">) => {
    return (
        <MicroInteraction
            scaleDown={0.96}
            translateY={0}
            duration={0.12}
            className={className}
            {...props}
        >
            {children}
        </MicroInteraction>
    );
};

/**
 * CardLift - Specialized micro-interaction for cards
 */
export const CardLift = ({
    children,
    className = "",
    ...props
}: Omit<MicroInteractionProps, "scaleDown" | "translateY">) => {
    return (
        <MicroInteraction
            scaleDown={1}
            translateY={-4}
            duration={0.2}
            className={className}
            {...props}
        >
            {children}
        </MicroInteraction>
    );
};

export default MicroInteraction;
