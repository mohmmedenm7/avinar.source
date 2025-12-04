import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";
import SodaCan from "./SodaCan";
import FloatingCan from "./FloatingCan";
import Bubbles from "./Bubbles";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HeroScene = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
                <Suspense fallback={null}>
                    <Environment preset="city" />

                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

                    {/* Main Hero Can - Black Cherry */}
                    <FloatingCan speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
                        <SodaCan
                            color="#4A0404"
                            flavor="Black Cherry"
                            position={[0, 0, 0]}
                            rotation={[0.2, 0.5, 0]}
                            scale={1.2}
                        />
                    </FloatingCan>

                    {/* Background Cans - Lemon Lime */}
                    <FloatingCan speed={1.5} rotationIntensity={1} floatIntensity={1} floatingRange={[-0.2, 0.2]}>
                        <SodaCan
                            color="#D9F99D"
                            flavor="Lemon Lime"
                            position={[-2.5, 1, -2]}
                            rotation={[-0.2, -0.5, 0.2]}
                        />
                    </FloatingCan>

                    {/* Background Cans - Grapefruit */}
                    <FloatingCan speed={1.8} rotationIntensity={1.2} floatIntensity={1.2} floatingRange={[-0.15, 0.15]}>
                        <SodaCan
                            color="#FCA5A5"
                            flavor="Grapefruit"
                            position={[2.5, -0.5, -2]}
                            rotation={[0.1, -0.3, -0.1]}
                        />
                    </FloatingCan>

                    {/* Bubbles Effect */}
                    <Bubbles count={30} />

                    <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default HeroScene;
