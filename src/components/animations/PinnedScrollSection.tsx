import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

interface PinnedScrollSectionProps {
    children?: React.ReactNode;
    className?: string;
}

/**
 * PinnedScrollSection Component
 * 
 * Creates a scroll-triggered animation where an element is pinned (fixed) 
 * while the user scrolls. The element transforms smoothly based on scroll progress.
 * 
 * Features:
 * - Pin element during scroll
 * - Scale animation (0.8x to 1.2x)
 * - Vertical translation
 * - Fade in/out effects
 * - Rotation based on scroll
 * - Smooth 60fps performance
 * - Responsive on all screen sizes
 */
export default function PinnedScrollSection({ children, className = '' }: PinnedScrollSectionProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const pinnedElementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !pinnedElementRef.current) return;

        const section = sectionRef.current;
        const pinnedElement = pinnedElementRef.current;

        // Create GSAP timeline with ScrollTrigger
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top', // Pin starts when section top hits viewport top
                end: '+=200%', // Pin for 200% of viewport height
                pin: pinnedElement, // Pin this element
                scrub: 1, // Smooth scrubbing (1 second delay for smoothness)
                anticipatePin: 1, // Prevent jump when pinning starts
                markers: false, // Set to true for debugging
                invalidateOnRefresh: true, // Recalculate on window resize
            }
        });

        // Animation sequence
        tl
            // Phase 1: Fade in and scale up (0% - 25% scroll)
            .fromTo(
                pinnedElement,
                {
                    opacity: 0.3,
                    scale: 0.8,
                    y: 100,
                    rotation: -5,
                },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotation: 0,
                    duration: 0.25,
                    ease: 'power2.out',
                }
            )
            // Phase 2: Hold at full size (25% - 50% scroll)
            .to(pinnedElement, {
                scale: 1,
                rotation: 0,
                duration: 0.25,
                ease: 'none',
            })
            // Phase 3: Scale up and rotate (50% - 75% scroll)
            .to(pinnedElement, {
                scale: 1.2,
                rotation: 5,
                y: -50,
                duration: 0.25,
                ease: 'power1.inOut',
            })
            // Phase 4: Fade out and scale down (75% - 100% scroll)
            .to(pinnedElement, {
                opacity: 0.3,
                scale: 0.9,
                y: -100,
                rotation: 10,
                duration: 0.25,
                ease: 'power2.in',
            });

        // Cleanup
        return () => {
            tl.kill();
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <div
            ref={sectionRef}
            className={`relative min-h-[300vh] ${className}`}
            style={{ willChange: 'transform' }}
        >
            {/* Pinned Element */}
            <div
                ref={pinnedElementRef}
                className="h-screen flex items-center justify-center"
                style={{ willChange: 'transform, opacity' }}
            >
                {children}
            </div>
        </div>
    );
}
