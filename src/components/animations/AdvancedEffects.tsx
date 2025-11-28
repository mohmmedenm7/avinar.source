import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FloatingElementProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    yOffset?: number;
    className?: string;
}

/**
 * FloatingElement - Creates a subtle floating animation
 * Similar to ChainGPT Labs floating cards
 */
export const FloatingElement = ({
    children,
    delay = 0,
    duration = 3,
    yOffset = 20,
    className = '',
}: FloatingElementProps) => {
    return (
        <motion.div
            className={className}
            animate={{
                y: [0, -yOffset, 0],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay,
            }}
        >
            {children}
        </motion.div>
    );
};

interface ScrollRevealProps {
    children: ReactNode;
    direction?: 'up' | 'down' | 'left' | 'right';
    delay?: number;
    className?: string;
}

/**
 * ScrollReveal - Reveals elements on scroll
 */
export const ScrollReveal = ({
    children,
    direction = 'up',
    delay = 0,
    className = '',
}: ScrollRevealProps) => {
    const directions = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { y: 0, x: 40 },
        right: { y: 0, x: -40 },
    };

    return (
        <motion.div
            className={className}
            initial={{
                opacity: 0,
                ...directions[direction],
            }}
            whileInView={{
                opacity: 1,
                x: 0,
                y: 0,
            }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {children}
        </motion.div>
    );
};

interface Card3DProps {
    children: ReactNode;
    className?: string;
}

/**
 * Card3D - 3D card effect on hover
 * Similar to ChainGPT Labs portfolio cards
 */
export const Card3D = ({ children, className = '' }: Card3DProps) => {
    return (
        <motion.div
            className={className}
            whileHover={{
                scale: 1.02,
                rotateX: 5,
                rotateY: 5,
                transition: { duration: 0.3 },
            }}
            style={{
                transformStyle: 'preserve-3d',
                perspective: 1000,
            }}
        >
            {children}
        </motion.div>
    );
};

interface GradientTextProps {
    children: ReactNode;
    className?: string;
    colors?: string[];
}

/**
 * GradientText - Animated gradient text
 */
export const GradientText = ({
    children,
    className = '',
    colors = ['#2563EB', '#7C3AED', '#2563EB'],
}: GradientTextProps) => {
    return (
        <motion.span
            className={`text-transparent bg-clip-text bg-gradient-to-r ${className}`}
            style={{
                backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
                backgroundSize: '200% 100%',
            }}
            animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
            }}
        >
            {children}
        </motion.span>
    );
};

export default FloatingElement;
