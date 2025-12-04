import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

interface SodaCanProps {
    color?: string;
    flavor?: string;
    scale?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
}

const SodaCan = ({ color = "#ff0000", flavor = "Cola", scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }: SodaCanProps) => {
    const meshRef = useRef<Mesh>(null);

    // Optional: Add some subtle rotation or interaction here if needed
    // useFrame((state, delta) => {
    //   if (meshRef.current) {
    //     meshRef.current.rotation.y += delta * 0.5;
    //   }
    // });

    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Can Body */}
            <mesh ref={meshRef} castShadow receiveShadow>
                <cylinderGeometry args={[0.5, 0.5, 1.5, 32]} />
                <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
            </mesh>

            {/* Can Top Rim */}
            <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.52, 0.5, 0.05, 32]} />
                <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.1} />
            </mesh>

            {/* Can Bottom Rim */}
            <mesh position={[0, -0.76, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.5, 0.52, 0.05, 32]} />
                <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.1} />
            </mesh>

            {/* Label/Text Placeholder (Simple ring for now) */}
            <mesh position={[0, 0, 0]} scale={[1.01, 0.8, 1.01]}>
                <cylinderGeometry args={[0.5, 0.5, 1.5, 32, 1, true]} />
                <meshStandardMaterial color={color} transparent opacity={0.5} side={2} />
            </mesh>
        </group>
    );
};

export default SodaCan;
