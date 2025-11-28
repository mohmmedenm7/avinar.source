import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface ScrollTriggered3DProps {
    className?: string;
    autoRotate?: boolean;
}

export default function ScrollTriggered3D({ className = '', autoRotate = true }: ScrollTriggered3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Create TorusKnot geometry
        const geometry = new THREE.TorusKnotGeometry(1, 0.4, 128, 32, 1, 3);

        // Create material with glass-like appearance
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x2563EB,
            metalness: 0.1,
            roughness: 0.2,
            transmission: 0.95,
            thickness: 1.5,
            transparent: true,
            opacity: 0.9,
            envMapIntensity: 1,
            clearcoat: 1,
            clearcoatRoughness: 0.1,
        });

        const torusMesh = new THREE.Mesh(geometry, material);
        scene.add(torusMesh);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(10, 10, 10);
        spotLight.castShadow = true;
        scene.add(spotLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-10, -10, -10);
        scene.add(pointLight);

        // Animation variables
        let animationFrameId: number;
        let currentScrollProgress = 0;
        let currentMouseX = 0;
        let currentMouseY = 0;

        // Animation loop
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            // Auto-rotation
            if (autoRotate) {
                torusMesh.rotation.y += 0.005;
                torusMesh.rotation.x += 0.002;
            }

            // Scroll-based transformations
            const scrollRotation = currentScrollProgress * Math.PI * 2;
            torusMesh.rotation.z = scrollRotation * 0.5;

            // Scale based on scroll
            const scale = 1 + Math.sin(currentScrollProgress * Math.PI) * 0.3;
            torusMesh.scale.setScalar(scale);

            // Mouse parallax effect
            torusMesh.position.x = currentMouseX * 0.5;
            torusMesh.position.y = currentMouseY * 0.5;

            renderer.render(scene, camera);
        };

        animate();

        // Scroll handler
        const handleScroll = () => {
            const rect = container.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const elementTop = rect.top;
            const elementHeight = rect.height;

            const progress = Math.max(0, Math.min(1,
                (windowHeight - elementTop) / (windowHeight + elementHeight)
            ));

            currentScrollProgress = progress;
            setScrollProgress(progress);
        };

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            currentMouseX = x;
            currentMouseY = y;
            setMousePosition({ x, y });
        };

        // Resize handler
        const handleResize = () => {
            if (!container) return;

            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };

        // Add event listeners
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('resize', handleResize);

        handleScroll(); // Initial calculation

        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);

            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }

            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }

            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, [autoRotate]);

    return (
        <div
            ref={containerRef}
            className={`w-full h-full ${className}`}
            style={{ touchAction: 'pan-y' }}
        />
    );
}
