import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { Clip } from './PropertiesPanel';

interface ColorGradingControlsProps {
    selectedClip: Clip | null;
    onUpdate: (id: string, updates: Partial<Clip>) => void;
}

const ColorGradingControls = ({ selectedClip, onUpdate }: ColorGradingControlsProps) => {
    const defaultColor = { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0, vignette: 0, temperature: 0 };
    const color = selectedClip?.color || defaultColor;
    const isDisabled = !selectedClip;

    const updateColor = (key: keyof typeof color, value: number) => {
        if (!selectedClip) return;
        onUpdate(selectedClip.id, { color: { ...color, [key]: value } });
    };

    /**
     * Professional Wheel Control using Portal for robust Dragging
     */
    const WheelControl = ({
        label,
        valueX, valueY,
        minX, maxX, minY, maxY,
        onChange,
        mode = 'cartesian'
    }: any) => {
        const ref = useRef<HTMLDivElement>(null);
        const [isDragging, setIsDragging] = useState(false);

        // --- Calculations ---
        const norm = (val: number, min: number, max: number) => (val - min) / (max - min);
        const lerp = (n: number, min: number, max: number) => min + n * (max - min);

        let pctX = 50, pctY = 50;
        if (mode === 'polar') {
            const rad = valueX * (Math.PI / 180);
            const radiusNorm = Math.min(1, valueY / 100);
            const offsetX = Math.cos(rad) * (radiusNorm * 0.5);
            const offsetY = Math.sin(rad) * (radiusNorm * 0.5);
            pctX = (0.5 + offsetX) * 100;
            pctY = (0.5 + offsetY) * 100;
        } else {
            pctX = norm(valueX, minX, maxX) * 100;
            pctY = (1 - norm(valueY, minY, maxY)) * 100;
        }

        const handleInteraction = (clientX: number, clientY: number) => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const dx = (clientX - rect.left) - centerX;
            const dy = (clientY - rect.top) - centerY;

            let finalX = valueX;
            let finalY = valueY;

            if (mode === 'polar') {
                const angleRad = Math.atan2(dy, dx);
                let angleDeg = angleRad * (180 / Math.PI);
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = rect.width / 2;
                const distNorm = Math.min(1, dist / maxDist);
                const saturation = distNorm * 100;
                finalX = angleDeg;
                finalY = saturation;
            } else {
                let nx = Math.max(0, Math.min(1, (dx + centerX) / rect.width));
                let ny = Math.max(0, Math.min(1, (dy + centerY) / rect.height)); // top is 0
                finalX = lerp(nx, minX, maxX);
                finalY = lerp(1 - ny, minY, maxY);
            }

            onChange(finalX, finalY);
        };

        const onMouseDown = (e: React.MouseEvent) => {
            if (isDisabled) return;
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
            handleInteraction(e.clientX, e.clientY);
        };

        // Determine Background Style
        let bgStyle = { background: 'linear-gradient(135deg, #2a2d33 0%, #1a1d21 100%)' };
        if (mode === 'polar') {
            bgStyle = { background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' };
        }

        return (
            <div className={`flex flex-col items-center gap-2 group ${isDisabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <div
                    ref={ref}
                    className="w-20 h-20 rounded-full relative cursor-crosshair shadow-inner ring-2 ring-[#0f1012] overflow-hidden bg-[#1f2228] select-none touch-none"
                    onMouseDown={onMouseDown}
                    onDoubleClick={() => !isDisabled && (mode === 'polar' ? onChange(0, 0) : onChange((minX + maxX) / 2, (minY + maxY) / 2))}
                    style={{ touchAction: 'none' }}
                >
                    {/* Visual Background */}
                    <div className="absolute inset-0 opacity-80 pointer-events-none" style={bgStyle}>
                        {mode === 'polar' && <div className="absolute inset-0 bg-[radial-gradient(circle,white_0%,transparent_70%)] opacity-50 mix-blend-overlay"></div>}
                    </div>

                    {/* Inner Shadow */}
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] pointer-events-none" />
                    {/* Crosshairs */}
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 pointer-events-none" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10 pointer-events-none" />
                    {/* The Handle */}
                    <div
                        className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] border border-[#0f1012] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ left: `${pctX}%`, top: `${pctY}%` }}
                    />
                </div>

                {/* --- THE PORTAL OVERLAY --- */}
                {isDragging && createPortal(
                    <div
                        className="fixed inset-0 z-[99999] cursor-crosshair select-none"
                        style={{ touchAction: 'none' }}
                        onMouseMove={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleInteraction(e.clientX, e.clientY);
                        }}
                        onMouseUp={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDragging(false);
                        }}
                        onMouseLeave={() => setIsDragging(false)}
                    />,
                    document.body
                )}

                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pointer-events-none">{label}</div>
            </div>
        );
    };

    return (
        <div className="flex flex-col shrink-0 relative transition-all w-full select-none">
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-0 mb-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Grading</span>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={isDisabled}
                    onClick={() => selectedClip && onUpdate(selectedClip.id, { color: { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0, vignette: 0, temperature: 0 } })}
                    className="h-5 w-5 hover:bg-white/10 hover:text-white text-gray-500 rounded-full"
                    title="Reset All"
                >
                    <RotateCcw size={10} />
                </Button>
            </div>

            {/* Wheels Container */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                {isDisabled && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        <div className="bg-[#1f2228]/80 px-2 py-1 rounded text-[10px] text-gray-400 border border-gray-700">Select Clip</div>
                    </div>
                )}
                <WheelControl
                    label="Color"
                    mode="polar"
                    valueX={color.hue}
                    valueY={color.saturation}
                    onChange={(h: number, s: number) => { updateColor('hue', h); updateColor('saturation', s); }}
                />
                <WheelControl
                    label="Light"
                    mode="cartesian"
                    valueX={color.contrast} minX={0} maxX={200}
                    valueY={color.brightness} minY={0} maxY={200}
                    onChange={(c: number, b: number) => { updateColor('contrast', c); updateColor('brightness', b); }}
                />
                <WheelControl
                    label="Balance"
                    mode="cartesian"
                    valueX={color.temperature} minX={-100} maxX={100}
                    valueY={color.vignette} minY={0} maxY={100}
                    onChange={(t: number, v: number) => { updateColor('temperature', t); updateColor('vignette', v); }}
                />
            </div>
        </div>
    );
};

export default ColorGradingControls;
