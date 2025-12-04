import { Float } from "@react-three/drei";
import { ReactNode } from "react";

interface FloatingCanProps {
    children: ReactNode;
    speed?: number; // Animation speed
    rotationIntensity?: number; // XYZ rotation intensity
    floatIntensity?: number; // Up/down float intensity
    floatingRange?: [number, number]; // Range of y-axis values the object will float within
}

const FloatingCan = ({
    children,
    speed = 1.5,
    rotationIntensity = 1,
    floatIntensity = 1,
    floatingRange = [-0.1, 0.1],
}: FloatingCanProps) => {
    return (
        <Float
            speed={speed}
            rotationIntensity={rotationIntensity}
            floatIntensity={floatIntensity}
            floatingRange={floatingRange}
        >
            {children}
        </Float>
    );
};

export default FloatingCan;
