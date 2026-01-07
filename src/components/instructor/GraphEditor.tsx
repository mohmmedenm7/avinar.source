import React, { useRef, useEffect, useState } from 'react';
import { Clip, Keyframe } from './PropertiesPanel';
import { Button } from '@/components/ui/button';
import { X, Diamond, MoveVertical, MoveHorizontal, Maximize2, Minimize2, MousePointer2 } from 'lucide-react';

interface GraphEditorProps {
    clip: Clip;
    currentTime: number;
    onUpdate: (id: string, updates: Partial<Clip>) => void;
    onClose: () => void;
}

const PROPERTY_COLORS = {
    x: '#ff4d4d', // Red
    y: '#4dff4d', // Green
    scale: '#4d4dff', // Blue
    rotation: '#ffff4d', // Yellow
    opacity: '#ff4dff', // Magenta
};

const PROPERTIES = ['x', 'y', 'scale', 'rotation', 'opacity'] as const;
type Property = typeof PROPERTIES[number];

const GraphEditor: React.FC<GraphEditorProps> = ({ clip, currentTime, onUpdate, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property>('x');
    const [isDragging, setIsDragging] = useState<{ index: number; type: 'value' | 'time' | 'both' } | null>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 300 });

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const getPropertyRange = (prop: Property) => {
        switch (prop) {
            case 'x':
            case 'y': return { min: -1000, max: 1000 };
            case 'scale': return { min: 0, max: 400 };
            case 'rotation': return { min: -180, max: 180 };
            case 'opacity': return { min: 0, max: 100 };
            default: return { min: 0, max: 100 };
        }
    };

    const drawGraph = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = dimensions;
        canvas.width = width;
        canvas.height = height;

        const padding = { top: 40, right: 40, bottom: 40, left: 60 };
        const graphWidth = width - padding.left - padding.right;
        const graphHeight = height - padding.top - padding.bottom;

        // Clear
        ctx.clearRect(0, 0, width, height);

        const range = getPropertyRange(selectedProperty);
        const kfs = clip.keyframes || [];
        const clipDur = (clip.trimEnd - clip.trimStart) / clip.speed;

        // Scale functions
        const timeToX = (t: number) => padding.left + (t / (clipDur || 5)) * graphWidth;
        const valueToY = (v: number) => {
            const normalized = (v - range.min) / (range.max - range.min);
            return padding.top + (1 - normalized) * graphHeight;
        };

        // Draw Background Gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1a1d21');
        gradient.addColorStop(1, '#111214');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw Grid
        ctx.strokeStyle = '#2d2d2d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= 10; i++) {
            const x = padding.left + (i / 10) * graphWidth;
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, height - padding.bottom);

            const y = padding.top + (i / 10) * graphHeight;
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
        }
        ctx.stroke();

        // Draw Axes Labels
        ctx.fillStyle = '#666';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(range.max.toString(), padding.left - 10, padding.top + 5);
        ctx.fillText(range.min.toString(), padding.left - 10, height - padding.bottom + 5);

        ctx.textAlign = 'center';
        ctx.fillText('0s', padding.left, height - padding.bottom + 20);
        ctx.fillText((clipDur || 5).toFixed(1) + 's', width - padding.right, height - padding.bottom + 20);

        // Draw Playhead
        const playheadX = timeToX(currentTime - clip.startAt);
        if (playheadX >= padding.left && playheadX <= width - padding.right) {
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(playheadX, padding.top);
            ctx.lineTo(playheadX, height - padding.bottom);
            ctx.stroke();
            ctx.setLineDash([]);

            // Playhead indicator at top
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.moveTo(playheadX - 5, padding.top);
            ctx.lineTo(playheadX + 5, padding.top);
            ctx.lineTo(playheadX, padding.top + 8);
            ctx.fill();
        }

        // Draw Curve
        if (kfs.length > 0) {
            ctx.strokeStyle = PROPERTY_COLORS[selectedProperty];
            ctx.lineWidth = 3;
            ctx.lineJoin = 'round';
            ctx.beginPath();

            kfs.forEach((kf, i) => {
                const x = timeToX(kf.time);
                const y = valueToY(kf[selectedProperty] ?? 0);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Glow effect
            ctx.strokeStyle = PROPERTY_COLORS[selectedProperty];
            ctx.globalAlpha = 0.2;
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            // Draw Keyframe handles
            kfs.forEach((kf, i) => {
                const x = timeToX(kf.time);
                const y = valueToY(kf[selectedProperty] ?? 0);

                const isSelected = Math.abs(currentTime - clip.startAt - kf.time) < 0.1;

                ctx.fillStyle = isSelected ? PROPERTY_COLORS[selectedProperty] : '#1a1d21';
                ctx.strokeStyle = PROPERTY_COLORS[selectedProperty];
                ctx.lineWidth = 2;

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(Math.PI / 4);
                ctx.fillRect(-5, -5, 10, 10);
                ctx.strokeRect(-5, -5, 10, 10);
                ctx.restore();
            });
        }
    };

    useEffect(() => {
        drawGraph();
    }, [clip, selectedProperty, currentTime, dimensions]);

    const handleMouseDown = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const padding = { top: 40, right: 40, bottom: 40, left: 60 };
        const { width, height } = dimensions;
        const graphWidth = width - padding.left - padding.right;
        const graphHeight = height - padding.top - padding.bottom;
        const range = getPropertyRange(selectedProperty);
        const clipDur = (clip.trimEnd - clip.trimStart) / clip.speed;

        const timeToX = (t: number) => padding.left + (t / (clipDur || 5)) * graphWidth;
        const valueToY = (v: number) => {
            const normalized = (v - range.min) / (range.max - range.min);
            return padding.top + (1 - normalized) * graphHeight;
        };

        const kfs = clip.keyframes || [];
        const foundIdx = kfs.findIndex(kf => {
            const kx = timeToX(kf.time);
            const ky = valueToY(kf[selectedProperty] ?? 0);
            return Math.sqrt(Math.pow(mouseX - kx, 2) + Math.pow(mouseY - ky, 2)) < 15;
        });

        if (foundIdx !== -1) {
            setIsDragging({ index: foundIdx, type: 'both' });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const padding = { top: 40, right: 40, bottom: 40, left: 60 };
        const { width, height } = dimensions;
        const graphWidth = width - padding.left - padding.right;
        const graphHeight = height - padding.top - padding.bottom;
        const range = getPropertyRange(selectedProperty);
        const clipDur = (clip.trimEnd - clip.trimStart) / clip.speed;

        const xToTime = (x: number) => ((x - padding.left) / graphWidth) * (clipDur || 5);
        const yToValue = (y: number) => {
            const normalized = 1 - (y - padding.top) / graphHeight;
            return normalized * (range.max - range.min) + range.min;
        };

        const newTime = Math.max(0, Math.min((clipDur || 5), xToTime(mouseX)));
        const newValue = Math.max(range.min, Math.min(range.max, yToValue(mouseY)));

        const kfs = [...(clip.keyframes || [])];
        kfs[isDragging.index] = {
            ...kfs[isDragging.index],
            time: newTime,
            [selectedProperty]: newValue
        };
        kfs.sort((a, b) => a.time - b.time);

        // Find new index after sort
        const newIdx = kfs.findIndex(kf => kf.time === newTime && kf[selectedProperty] === newValue);
        setIsDragging({ index: newIdx, type: 'both' });

        onUpdate(clip.id, { keyframes: kfs });
    };

    const handleMouseUp = () => {
        setIsDragging(null);
    };

    return (
        <div ref={containerRef} className="flex flex-col h-full bg-[#111214] border-t border-gray-800 animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#1a1d21]">
                <div className="flex items-center gap-4">
                    <h3 className="text-xs font-bold text-gray-300 flex items-center gap-2 uppercase tracking-widest">
                        <MoveVertical size={14} className="text-purple-500" /> Graph Editor
                    </h3>
                    <div className="flex bg-[#0b0c0e] p-0.5 rounded-lg border border-white/5">
                        {PROPERTIES.map(prop => (
                            <button
                                key={prop}
                                onClick={() => setSelectedProperty(prop)}
                                className={`px-3 py-1 text-[10px] rounded-md transition-all font-bold ${selectedProperty === prop
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {prop.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:text-white" onClick={onClose}>
                        <X size={14} />
                    </Button>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden flex">
                <div className="w-12 border-r border-gray-800 flex flex-col items-center py-4 gap-4 bg-[#0b0c0e]/50">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400"><Diamond size={14} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400"><MoveHorizontal size={14} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400"><Maximize2 size={14} /></Button>
                </div>

                <div className="flex-1 relative cursor-crosshair">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />

                    {(!clip.keyframes || clip.keyframes.length === 0) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="text-center p-6 border border-white/5 bg-[#1a1d21] rounded-2xl shadow-2xl">
                                <Diamond className="mx-auto mb-4 text-purple-500 opacity-50" size={32} />
                                <p className="text-xs text-gray-400 max-w-[200px]">لا توجد إطارات مفتاحية (Keyframes) لهذا المقطع. أضف بعض الإطارات في لوحة الخصائص لبدء تعديل المنحنيات.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-8 border-t border-gray-800 bg-[#0b0c0e] flex items-center px-4 gap-4">
                <span className="text-[10px] text-gray-500 font-mono">CLIP: {clip.name}</span>
                <span className="text-[10px] text-gray-500 font-mono">SELECTED: {selectedProperty.toUpperCase()}</span>
                {isDragging && (
                    <span className="text-[10px] text-blue-400 animate-pulse font-mono ml-auto">تعديل الإطار...</span>
                )}
            </div>
        </div>
    );
};

export default GraphEditor;
