import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { RotateCcw, Sparkles, BarChart3, Eye, Layers, Zap, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clip } from './PropertiesPanel';

interface ColorGradingControlsProps {
    selectedClip: Clip | null;
    onUpdate: (id: string, updates: Partial<Clip>) => void;
    getFrameStats?: () => { r: number, g: number, b: number } | null;
    getHistogramData?: () => { r: number[], g: number[], b: number[], luma: number[] } | null;
}

const HistogramScope = ({ getHistogramData }: { getHistogramData?: () => { r: number[], g: number[], b: number[], luma: number[] } | null }) => {
    const [data, setData] = useState<{ r: number[], g: number[], b: number[], luma: number[] }>({
        r: new Array(64).fill(0),
        g: new Array(64).fill(0),
        b: new Array(64).fill(0),
        luma: new Array(64).fill(0)
    });

    useEffect(() => {
        if (!getHistogramData) return;
        const interval = setInterval(() => {
            const newData = getHistogramData();
            if (newData) setData(newData);
        }, 100);
        return () => clearInterval(interval);
    }, [getHistogramData]);

    return (
        <div className="bg-black/40 rounded-xl p-3 border border-white/5 space-y-2 mb-4 group hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 size={12} className="text-blue-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time RGB Parade</span>
                </div>
            </div>
            <div className="h-20 relative flex items-end overflow-hidden rounded bg-black/20">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80" preserveAspectRatio="none">
                    {/* Red Channel */}
                    <path
                        d={`M 0 80 ${data.r.map((v, i) => `L ${i * (100 / 63)} ${80 - (v * 0.8)}`).join(' ')} L 100 80 Z`}
                        fill="rgba(239, 68, 68, 0.2)"
                        stroke="rgba(239, 68, 68, 0.5)"
                        strokeWidth="1"
                    />
                    {/* Green Channel */}
                    <path
                        d={`M 0 80 ${data.g.map((v, i) => `L ${i * (100 / 63)} ${80 - (v * 0.8)}`).join(' ')} L 100 80 Z`}
                        fill="rgba(34, 197, 94, 0.2)"
                        stroke="rgba(34, 197, 94, 0.5)"
                        strokeWidth="1"
                    />
                    {/* Blue Channel */}
                    <path
                        d={`M 0 80 ${data.b.map((v, i) => `L ${i * (100 / 63)} ${80 - (v * 0.8)}`).join(' ')} L 100 80 Z`}
                        fill="rgba(59, 130, 246, 0.2)"
                        stroke="rgba(59, 130, 246, 0.5)"
                        strokeWidth="1"
                    />
                    {/* Luma Channel */}
                    <path
                        d={`M 0 80 ${data.luma.map((v, i) => `L ${i * (100 / 63)} ${80 - (v * 0.8)}`).join(' ')} L 100 80 Z`}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.3)"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                    />
                </svg>
            </div>
            <div className="flex justify-between px-1">
                <span className="text-[8px] text-gray-600">SHADOWS</span>
                <span className="text-[8px] text-gray-600">MIDTONES</span>
                <span className="text-[8px] text-gray-600">HIGHLIGHTS</span>
            </div>
        </div>
    );
};

const ColorGradingControls = ({ selectedClip, onUpdate, getFrameStats, getHistogramData }: ColorGradingControlsProps) => {
    const defaultColor = {
        brightness: 100, contrast: 100, saturation: 100, hue: 0,
        blur: 0, vignette: 0, temperature: 0,
        lift: { r: 0, g: 0, b: 0 },
        gamma: { r: 1, g: 1, b: 1 },
        gain: { r: 1, g: 1, b: 1 },
        curves: {
            master: [0, 25, 50, 75, 100],
            red: [0, 25, 50, 75, 100],
            green: [0, 25, 50, 75, 100],
            blue: [0, 25, 50, 75, 100]
        }
    };
    const color = selectedClip?.color || (defaultColor as any);
    const isDisabled = !selectedClip;
    const [activeCurveChannel, setActiveCurveChannel] = useState<'master' | 'red' | 'green' | 'blue'>('master');
    const [activeTab, setActiveTab] = useState<'wheels' | 'curves' | 'presets' | 'match'>('wheels');
    const [referenceStats, setReferenceStats] = useState<{ r: number, g: number, b: number } | null>(null);

    const presets = [
        { name: 'Default', values: defaultColor, accent: 'bg-gray-500' },
        { name: 'Cinematic Blue', values: { ...defaultColor, temperature: -20, contrast: 120, lift: { r: -10, g: 0, b: 10 } }, accent: 'bg-blue-600' },
        { name: 'Warm Sunset', values: { ...defaultColor, temperature: 30, saturation: 125, gain: { r: 1.2, g: 1, b: 0.8 } }, accent: 'bg-orange-500' },
        { name: 'Noir BW', values: { ...defaultColor, saturation: 0, contrast: 140, brightness: 110 }, accent: 'bg-white' },
        { name: 'Cyberpunk', values: { ...defaultColor, hue: -20, saturation: 150, contrast: 110, lift: { r: 20, g: -10, b: 20 } }, accent: 'bg-fuchsia-600' }
    ];

    const updateColor = (key: string, value: any) => {
        if (!selectedClip) return;
        onUpdate(selectedClip.id, { color: { ...color, [key]: value } });
    };

    const WheelControl = ({
        label,
        valueX, valueY,
        minX, maxX, minY, maxY,
        onChange,
        mode = 'cartesian'
    }: any) => {
        const ref = useRef<HTMLDivElement>(null);
        const [isDragging, setIsDragging] = useState(false);

        const norm = (val: number, min: number, max: number) => (val - min) / (max - min);
        const lerp = (n: number, min: number, max: number) => min + n * (max - min);

        let pctX = 50, pctY = 50;
        if (mode === 'polar') {
            const angleRad = (valueX - 90) * (Math.PI / 180);
            const radiusNorm = Math.min(1, valueY / 100);
            const offsetX = Math.cos(angleRad) * (radiusNorm * 0.5);
            const offsetY = Math.sin(angleRad) * (radiusNorm * 0.5);
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
                let angleDeg = angleRad * (180 / Math.PI) + 90;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = rect.width / 2;
                const distNorm = Math.min(1, dist / maxDist);
                finalX = angleDeg;
                finalY = distNorm * 100;
            } else {
                let nx = Math.max(0, Math.min(1, (dx + centerX) / rect.width));
                let ny = Math.max(0, Math.min(1, (dy + centerY) / rect.height));
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

        let bgStyle: any = { background: 'linear-gradient(135deg, #2a2d33 0%, #1a1d21 100%)' };
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
                >
                    <div className="absolute inset-0 opacity-80 pointer-events-none" style={bgStyle}>
                        {mode === 'polar' && <div className="absolute inset-0 bg-[radial-gradient(circle,white_0%,transparent_70%)] opacity-50 mix-blend-overlay"></div>}
                    </div>
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] pointer-events-none" />
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 pointer-events-none" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10 pointer-events-none" />
                    <div
                        className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] border border-[#0f1012] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ left: `${pctX}%`, top: `${pctY}%` }}
                    />
                </div>
                {isDragging && createPortal(
                    <div
                        className="fixed inset-0 z-[99999] cursor-crosshair"
                        onMouseMove={(e) => handleInteraction(e.clientX, e.clientY)}
                        onMouseUp={() => setIsDragging(false)}
                    />,
                    document.body
                )}
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pointer-events-none">{label}</div>
            </div>
        );
    };

    const polarToRGB = (h: number, s: number, type: 'offset' | 'multiplier') => {
        const hRad = (h - 90) * (Math.PI / 180);
        const intensity = s / 100;
        const r = Math.cos(hRad) * intensity;
        const g = Math.cos(hRad - (2 * Math.PI / 3)) * intensity;
        const b = Math.cos(hRad - (4 * Math.PI / 3)) * intensity;
        return type === 'offset' ? { r: r * 50, g: g * 50, b: b * 50 } : { r: 1 + r * 0.5, g: 1 + g * 0.5, b: 1 + b * 0.5 };
    };

    const rgbToPolar = (rgb: { r: number; g: number; b: number } | undefined, type: 'offset' | 'multiplier') => {
        if (!rgb) return { h: 0, s: 0 };
        let r = rgb.r, g = rgb.g, b = rgb.b;
        if (type === 'multiplier') { r -= 1; g -= 1; b -= 1; } else { r /= 50; g /= 50; b /= 50; }
        const hRad = Math.atan2(b - g, (2 * r - g - b) * 0.866);
        const h = hRad * (180 / Math.PI) + 90;
        const s = Math.min(1, Math.sqrt(r * r + g * g + b * b)) * 100;
        return { h, s };
    };

    return (
        <ScrollArea className="h-full pr-4">
            <div className="flex flex-col shrink-0 relative w-full select-none pb-8">
                <HistogramScope getHistogramData={getHistogramData} />

                <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-black/40 h-8 p-1 mb-4 border border-white/5">
                        <TabsTrigger value="wheels" className="text-[10px] uppercase font-bold data-[state=active]:bg-blue-600">Wheels</TabsTrigger>
                        <TabsTrigger value="curves" className="text-[10px] uppercase font-bold data-[state=active]:bg-purple-600">Curves</TabsTrigger>
                        <TabsTrigger value="presets" className="text-[10px] uppercase font-bold data-[state=active]:bg-orange-600">Presets</TabsTrigger>
                        <TabsTrigger value="match" className="text-[10px] uppercase font-bold data-[state=active]:bg-pink-600">Match</TabsTrigger>
                    </TabsList>

                    <TabsContent value="wheels" className="m-0 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><Layers size={10} /> 3-Way Color Wheels</span>
                            <Button variant="ghost" size="icon" disabled={isDisabled} onClick={() => onUpdate(selectedClip!.id, { color: defaultColor })} className="h-6 w-6 rounded-full hover:bg-red-500/10 hover:text-red-400"><RotateCcw size={10} /></Button>
                        </div>

                        {/* Primary Color Wheels */}
                        <div className="bg-gradient-to-b from-black/20 to-black/40 p-4 rounded-xl border border-white/5 space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <WheelControl
                                        label="Lift (Shadows)"
                                        mode="polar"
                                        valueX={rgbToPolar(color.lift, 'offset').h}
                                        valueY={rgbToPolar(color.lift, 'offset').s}
                                        onChange={(h: any, s: any) => updateColor('lift', polarToRGB(h, s, 'offset'))}
                                    />
                                    {/* Lift RGB Sliders */}
                                    <div className="space-y-1 px-1">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            <input
                                                type="range"
                                                min="-50"
                                                max="50"
                                                value={color.lift?.r || 0}
                                                onChange={(e) => updateColor('lift', { ...color.lift, r: parseFloat(e.target.value) })}
                                                className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
                                                disabled={isDisabled}
                                            />
                                            <span className="text-[8px] text-gray-500 w-6 text-right font-mono">{Math.round(color.lift?.r || 0)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <input
                                                type="range"
                                                min="-50"
                                                max="50"
                                                value={color.lift?.g || 0}
                                                onChange={(e) => updateColor('lift', { ...color.lift, g: parseFloat(e.target.value) })}
                                                className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
                                                disabled={isDisabled}
                                            />
                                            <span className="text-[8px] text-gray-500 w-6 text-right font-mono">{Math.round(color.lift?.g || 0)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <input
                                                type="range"
                                                min="-50"
                                                max="50"
                                                value={color.lift?.b || 0}
                                                onChange={(e) => updateColor('lift', { ...color.lift, b: parseFloat(e.target.value) })}
                                                className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                                                disabled={isDisabled}
                                            />
                                            <span className="text-[8px] text-gray-500 w-6 text-right font-mono">{Math.round(color.lift?.b || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <WheelControl
                                        label="Gamma (Midtones)"
                                        mode="polar"
                                        valueX={rgbToPolar(color.gamma, 'multiplier').h}
                                        valueY={rgbToPolar(color.gamma, 'multiplier').s}
                                        onChange={(h: any, s: any) => updateColor('gamma', polarToRGB(h, s, 'multiplier'))}
                                    />
                                    {/* Gamma RGB Sliders */}
                                    <div className="space-y-1 px-1">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="1.5"
                                                step="0.01"
                                                value={color.gamma?.r || 1}
                                                onChange={(e) => updateColor('gamma', { ...color.gamma, r: parseFloat(e.target.value) })}
                                                className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
                                                disabled={isDisabled}
                                            />
                                            <span className="text-[8px] text-gray-500 w-6 text-right font-mono">{(color.gamma?.r || 1).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="1.5"
                                                step="0.01"
                                                value={color.gamma?.g || 1}
                                                onChange={(e) => updateColor('gamma', { ...color.gamma, g: parseFloat(e.target.value) })}
                                                className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
                                                disabled={isDisabled}
                                            />
                                            <span className="text-[8px] text-gray-500 w-6 text-right font-mono">{(color.gamma?.g || 1).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="1.5"
                                                step="0.01"
                                                value={color.gamma?.b || 1}
                                                onChange={(e) => updateColor('gamma', { ...color.gamma, b: parseFloat(e.target.value) })}
                                                className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                                                disabled={isDisabled}
                                            />
                                            <span className="text-[8px] text-gray-500 w-6 text-right font-mono">{(color.gamma?.b || 1).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <WheelControl
                                        label="Gain (Highlights)"
                                        mode="polar"
                                        valueX={rgbToPolar(color.gain, 'multiplier').h}
                                        valueY={rgbToPolar(color.gain, 'multiplier').s}
                                        onChange={(h: any, s: any) => updateColor('gain', polarToRGB(h, s, 'multiplier'))}
                                    />
                                    {/* Gain RGB Sliders */}
                                    <div className="space-y-1 px-1">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="1.5"
                                                step="0.01"
                                                value={color.gain?.r || 1}
                                                onChange={(e) => updateColor('gain', { ...color.gain, r: parseFloat(e.target.value) })}
                                                className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
                                                disabled={isDisabled}
                                            />
                                            <span className="text-[8px] text-gray-500 w-6 text-right font-mono">{(color.gain?.r || 1).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="1.5"
                                                step="0.01"
                                                value={color.gain?.g || 1}
                                                onChange={(e) => updateColor('gain', { ...color.gain, g: parseFloat(e.target.value) })}
                                                className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
                                                disabled={isDisabled}
                                            />
                                            <span className="text-[8px] text-gray-500 w-6 text-right font-mono">{(color.gain?.g || 1).toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="1.5"
                                                step="0.01"
                                                value={color.gain?.b || 1}
                                                onChange={(e) => updateColor('gain', { ...color.gain, b: parseFloat(e.target.value) })}
                                                className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                                                disabled={isDisabled}
                                            />
                                            <span className="text-[8px] text-gray-500 w-6 text-right font-mono">{(color.gain?.b || 1).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Text */}
                            <div className="flex items-start gap-2 px-2 pt-2 border-t border-white/5">
                                <Eye size={10} className="text-blue-400 mt-0.5 shrink-0" />
                                <p className="text-[8px] text-gray-500 leading-relaxed">
                                    <span className="text-blue-400 font-bold">Lift</span> للظلال •
                                    <span className="text-purple-400 font-bold"> Gamma</span> للنصف •
                                    <span className="text-orange-400 font-bold"> Gain</span> للإضاءة
                                </p>
                            </div>
                        </div>

                        {/* Secondary Controls */}
                        <div className="bg-black/20 p-4 rounded-xl space-y-6 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={10} className="text-yellow-400" />
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Secondary Controls</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <WheelControl label="Hue/Sat" mode="polar" valueX={color.hue} valueY={color.saturation} onChange={(h: any, s: any) => { updateColor('hue', h); updateColor('saturation', s); }} />
                                <WheelControl label="Contrast/Bright" mode="cartesian" valueX={color.contrast} minX={0} maxX={200} valueY={color.brightness} minY={0} maxY={200} onChange={(c: any, b: any) => { updateColor('contrast', c); updateColor('brightness', b); }} />
                            </div>
                            <div className="flex items-center justify-center">
                                <WheelControl label="Temp/Vignette" mode="cartesian" valueX={color.temperature} minX={-100} maxX={100} valueY={color.vignette} minY={0} maxY={100} onChange={(t: any, v: any) => { updateColor('temperature', t); updateColor('vignette', v); }} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="curves" className="m-0 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="px-2">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tone Map Explorer</span>
                                <Button variant="ghost" size="icon" onClick={() => updateColor('curves', defaultColor.curves)} className="h-5 w-5 rounded-md hover:bg-gray-800 transition-colors"><RotateCcw size={10} /></Button>
                            </div>

                            {/* Channel Selector */}
                            <div className="flex gap-1 mb-2">
                                {['master', 'red', 'green', 'blue'].map((ch) => (
                                    <button
                                        key={ch}
                                        onClick={() => setActiveCurveChannel(ch as any)}
                                        className={`flex-1 h-6 rounded text-[9px] font-bold uppercase tracking-wider transition-all
                                        ${activeCurveChannel === ch
                                                ? (ch === 'master' ? 'bg-white text-black' : ch === 'red' ? 'bg-red-600 text-white' : ch === 'green' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white')
                                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                    >
                                        {ch}
                                    </button>
                                ))}
                            </div>

                            <div className="h-40 bg-[#0b0c0e] rounded-xl border border-gray-800 relative overflow-hidden group/curves shadow-2xl">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-10 pointer-events-none">
                                    {[...Array(3)].map((_, i) => <div key={`v-${i}`} className="border-r border-white" />)}
                                    {[...Array(3)].map((_, i) => <div key={`h-${i}`} className="border-b border-white" />)}
                                </div>

                                {/* Curve Line SVG */}
                                {/* Curve Line SVG */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 256 160">
                                    <path
                                        d={(() => {
                                            // Catmull-Rom to SVG Bezier conversion
                                            const curveData = color.curves?.[activeCurveChannel];
                                            const points = (curveData && curveData.length > 0 ? curveData : [0, 25, 50, 75, 100]).map((y, i) => ({
                                                x: i * 64, // 0, 64, 128, 192, 256
                                                y: 160 - (y * 1.6)
                                            }));

                                            if (points.length < 2) return '';

                                            // Helper to calculate control points
                                            const tension = 0.35; // optimal tension for smooth curves
                                            let d = `M ${points[0].x} ${points[0].y}`;

                                            for (let i = 0; i < points.length - 1; i++) {
                                                const p0 = i > 0 ? points[i - 1] : points[i];
                                                const p1 = points[i];
                                                const p2 = points[i + 1];
                                                const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1];

                                                const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
                                                const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
                                                const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
                                                const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;

                                                d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
                                            }
                                            return d;
                                        })()}
                                        fill="none"
                                        stroke={activeCurveChannel === 'master' ? 'white' : activeCurveChannel === 'red' ? '#ef4444' : activeCurveChannel === 'green' ? '#22c55e' : '#3b82f6'}
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ vectorEffect: 'non-scaling-stroke', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                                    />
                                </svg>

                                {/* Interactive Points */}
                                {(color.curves?.[activeCurveChannel] || [0, 25, 50, 75, 100]).map((v: number, i: number) => (
                                    <div
                                        key={i}
                                        className={`absolute w-3.5 h-3.5 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 border-2 cursor-ns-resize z-10 hover:scale-125 transition-transform shadow-lg group-hover/point:scale-125
                                            ${activeCurveChannel === 'master' ? 'border-gray-500' : activeCurveChannel === 'red' ? 'border-red-500' : activeCurveChannel === 'green' ? 'border-green-500' : 'border-blue-500'}`}
                                        style={{
                                            left: `${(i / 4) * 100}%`,
                                            top: `${100 - v}%`
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Prevent text selection
                                            const startY = e.clientY;
                                            const startV = v;

                                            // Get precise container height for 1:1 mapping
                                            const container = e.currentTarget.parentElement?.getBoundingClientRect();
                                            const height = container ? container.height : 160;

                                            const handleMove = (em: MouseEvent) => {
                                                const deltaPx = startY - em.clientY;
                                                const deltaPercent = (deltaPx / height) * 100;

                                                const currentChannelCurve = [...(color.curves?.[activeCurveChannel] || [0, 25, 50, 75, 100])];
                                                currentChannelCurve[i] = Math.max(0, Math.min(100, startV + deltaPercent));

                                                updateColor('curves', {
                                                    ...color.curves,
                                                    [activeCurveChannel]: currentChannelCurve
                                                });
                                            };
                                            const handleUp = () => {
                                                window.removeEventListener('mousemove', handleMove);
                                                window.removeEventListener('mouseup', handleUp);
                                            };
                                            window.addEventListener('mousemove', handleMove);
                                            window.addEventListener('mouseup', handleUp);
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 px-1">
                                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Blacks</span>
                                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Whites</span>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="presets" className="m-0 space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                            {presets.map((p, i) => (
                                <div
                                    key={i}
                                    onClick={() => !isDisabled && onUpdate(selectedClip.id, { color: { ...p.values, curves: defaultColor.curves } })}
                                    className={`group relative p-3 rounded-xl border border-white/5 cursor-pointer transition-all hover:bg-white/5 flex items-center gap-3 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-lg ${p.accent} shadow-xl transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}>
                                        <Sparkles size={16} className="text-white/80" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[11px] font-bold text-white mb-0.5">{p.name}</h4>
                                        <p className="text-[9px] text-gray-500">Apply cinematic color styling instantly.</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Zap size={14} className="text-orange-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="match" className="m-0 space-y-4">
                        <div className="bg-gradient-to-br from-pink-900/10 to-transparent p-4 rounded-xl border border-pink-500/20 space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={14} className="text-pink-400" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">AI Color Match</span>
                            </div>

                            <p className="text-[10px] text-gray-400 leading-relaxed">
                                Match the color grading of this clip to another reference frame.
                            </p>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {/* Reference Section */}
                                <div className="space-y-2">
                                    <span className="text-[9px] font-bold text-gray-500 uppercase">1. Reference</span>
                                    <div className="h-20 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center relative overflow-hidden">
                                        {referenceStats ? (
                                            <div
                                                className="absolute inset-0 w-full h-full"
                                                style={{ backgroundColor: `rgb(${referenceStats.r}, ${referenceStats.g}, ${referenceStats.b})` }}
                                            />
                                        ) : (
                                            <div className="text-center p-2">
                                                <Eye size={16} className="mx-auto mb-1 text-gray-600" />
                                                <span className="text-[8px] text-gray-600 block">No Reference</span>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            if (getFrameStats) {
                                                const stats = getFrameStats();
                                                if (stats) setReferenceStats(stats);
                                            }
                                        }}
                                        className="w-full text-[10px] h-7 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20"
                                    >
                                        Capture Frame
                                    </Button>
                                </div>

                                {/* Target Section */}
                                <div className="space-y-2">
                                    <span className="text-[9px] font-bold text-gray-500 uppercase">2. Target</span>
                                    <div className="h-20 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center">
                                        <span className="text-[8px] text-gray-500">Current Clip</span>
                                    </div>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        disabled={!referenceStats || isDisabled}
                                        onClick={() => {
                                            if (!referenceStats || !selectedClip || !getFrameStats) return;

                                            // Get Current Stats
                                            const currentStats = getFrameStats();
                                            if (!currentStats) return;

                                            // Calculate Difference
                                            // Use Gain to match brightness/white balance
                                            const rRatio = referenceStats.r / (currentStats.r || 1);
                                            const gRatio = referenceStats.g / (currentStats.g || 1);
                                            const bRatio = referenceStats.b / (currentStats.b || 1);

                                            // Apply logic: limit extreme shifts
                                            const safeRatio = (val: number) => Math.max(0.5, Math.min(2.0, val));

                                            // Helper to get safe number
                                            const getVal = (v: number | undefined) => (typeof v === 'number' ? v : 1);

                                            const newGain = {
                                                r: Math.round(safeRatio(rRatio) * getVal(color.gain.r) * 100) / 100,
                                                g: Math.round(safeRatio(gRatio) * getVal(color.gain.g) * 100) / 100,
                                                b: Math.round(safeRatio(bRatio) * getVal(color.gain.b) * 100) / 100
                                            };

                                            updateColor('gain', newGain);
                                        }}
                                        className="w-full text-[10px] h-7 bg-pink-600 hover:bg-pink-500 text-white"
                                    >
                                        Match Color
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
                    <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-gray-500 leading-relaxed">تؤثر تعديلات الألوان على الفيديو المختار فقط. استخدم Scopes لموازنة مستويات الإضاءة (Luma) بدقة احترافية.</p>
                </div>
            </div>
        </ScrollArea>
    );
};

export default ColorGradingControls;
