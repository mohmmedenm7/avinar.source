import React, { useEffect, useRef, useState } from 'react';
import { X, Activity, BarChart3, Disc, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VideoScopesProps {
    sourceRef: React.RefObject<HTMLCanvasElement>;
    isOpen: boolean;
    onClose: () => void;
}

const VideoScopes = ({ sourceRef, isOpen, onClose }: VideoScopesProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scopeType, setScopeType] = useState<'waveform' | 'vectorscope' | 'histogram'>('waveform');
    const requestRef = useRef<number>();

    // Optimization: Skip frames to reduce load (process every Nth frame)
    const skipCounter = useRef(0);
    const PROCESS_EVERY_N_FRAMES = 3;

    useEffect(() => {
        if (!isOpen) {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        const renderScopes = () => {
            requestRef.current = requestAnimationFrame(renderScopes);

            if (skipCounter.current < PROCESS_EVERY_N_FRAMES) {
                skipCounter.current++;
                return;
            }
            skipCounter.current = 0;

            const source = sourceRef.current;
            const target = canvasRef.current;
            if (!source || !target) return;

            const ctx = target.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            // Resize target to match source aspect ratio or fixed size
            // We use a fixed internal resolution for consistency and performance
            const w = 256;
            const h = 256;
            if (target.width !== w || target.height !== h) {
                target.width = w;
                target.height = h;
            }

            // Draw black background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);

            // Get source data (downsampled for performance)
            // We draw the source into a small helper canvas first?
            // Actually, getImageData from source is heavy if source is 4K.
            // Better to draw source to a small offscreen canvas, then getImageData.
            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = 256; // Downsample for scopes
            smallCanvas.height = 144; // Maintain aspect ratio approx
            const smallCtx = smallCanvas.getContext('2d');
            if (!smallCtx) return;

            smallCtx.drawImage(source, 0, 0, smallCanvas.width, smallCanvas.height);
            const imageData = smallCtx.getImageData(0, 0, smallCanvas.width, smallCanvas.height);
            const data = imageData.data;

            if (scopeType === 'histogram') {
                drawHistogram(ctx, data, w, h);
            } else if (scopeType === 'waveform') {
                drawWaveform(ctx, data, smallCanvas.width, smallCanvas.height, w, h);
            } else if (scopeType === 'vectorscope') {
                drawVectorscope(ctx, data, w, h);
            }
        };

        renderScopes();
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isOpen, scopeType, sourceRef]); // Dependencies

    const drawHistogram = (ctx: CanvasRenderingContext2D, data: Uint8ClampedArray, w: number, h: number) => {
        // Use TypedArrays for performance
        const binsR = new Uint32Array(256);
        const binsG = new Uint32Array(256);
        const binsB = new Uint32Array(256);

        // Populate bins (sampling every pixel of the downsampled buffer)
        for (let i = 0; i < data.length; i += 4) {
            binsR[data[i]]++;
            binsG[data[i + 1]]++;
            binsB[data[i + 2]]++;
        }

        // Find peak to normalize height
        // We use a smoothed max to prevent jitters, or just local max
        // Use a minimum floor for max to prevent division by near-zero on black frames
        const max = Math.max(
            Math.max(...binsR),
            Math.max(...binsG),
            Math.max(...binsB),
            data.length / 256 * 2 // Minimum scale factor (avoid zooming in too much on noise)
        );

        const scale = h / max * 0.95; // Leave top padding

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Draw Grid (25%, 50%, 75%)
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        [0.25, 0.5, 0.75].forEach(p => {
            const x = w * p;
            ctx.moveTo(x, 0); ctx.lineTo(x, h);
        });
        ctx.stroke();

        ctx.globalCompositeOperation = 'screen'; // Additive blending for R+G+B = White

        const drawChannel = (bins: Uint32Array, color: string, fill: string) => {
            ctx.fillStyle = fill;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.moveTo(0, h);

            for (let i = 0; i < 256; i++) {
                const x = (i / 255) * w;
                // Simple 3-tap smooth for display
                let val = bins[i];
                if (i > 0 && i < 255) val = (bins[i - 1] + bins[i] * 2 + bins[i + 1]) / 4;

                const barHeight = val * scale;
                const y = h - barHeight;
                ctx.lineTo(x, y);
            }

            ctx.lineTo(w, h);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        };

        drawChannel(binsR, 'rgba(255, 50, 50, 0.8)', 'rgba(255, 0, 0, 0.4)');
        drawChannel(binsG, 'rgba(50, 255, 50, 0.8)', 'rgba(0, 255, 0, 0.4)');
        drawChannel(binsB, 'rgba(50, 50, 255, 0.8)', 'rgba(0, 0, 255, 0.4)');

        // Reset
        ctx.globalCompositeOperation = 'source-over';
    };

    const drawWaveform = (ctx: CanvasRenderingContext2D, data: Uint8ClampedArray, sw: number, sh: number, dw: number, dh: number) => {
        // Waveform: X axis = image X axis. Y axis = luminance intensity.
        // We iterate columns.
        const intensity = new Uint32Array(dw * 256); // 256 bins for Y

        for (let x = 0; x < sw; x++) {
            // Map source x to dest x
            const dx = Math.floor((x / sw) * dw);

            for (let y = 0; y < sh; y++) {
                const i = (y * sw + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // Rec. 709 Luma
                const luma = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);

                // Increment intensity bucket
                // bucket index = dx + (255 - luma) * dw  (flip Y)
                const idx = dx + (255 - luma) * dw;
                intensity[idx] = (intensity[idx] || 0) + 1;
            }
        }

        // Render intensity
        const imgData = ctx.createImageData(dw, dh);
        for (let i = 0; i < intensity.length; i++) {
            const val = intensity[i];
            if (val > 0) {
                // value scaling driven by density
                const alpha = Math.min(255, val * 10);
                imgData.data[i * 4] = 0;   // R
                imgData.data[i * 4 + 1] = 255; // G (Green waveform standard)
                imgData.data[i * 4 + 2] = 0;   // B
                imgData.data[i * 4 + 3] = alpha;
            }
        }
        ctx.putImageData(imgData, 0, 0);
    };

    const drawVectorscope = (ctx: CanvasRenderingContext2D, data: Uint8ClampedArray, w: number, h: number) => {
        // Vectorscope: Cb vs Cr.
        // Center is 128, 128.
        const pixels = new Uint8Array(w * h); // Hit map?

        const cx = w / 2;
        const cy = h / 2;

        const imgData = ctx.createImageData(w, h);

        // Draw Graticule (simple circle)
        // We'll do this on top effectively, or just iterate pixels

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // RGB to YCbCr
            const cb = 128 + -0.168736 * r - 0.331264 * g + 0.5 * b;
            const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

            const x = Math.floor(cb / 255 * w); // Map 0-255 to 0-w
            const y = Math.floor((255 - cr) / 255 * h); // Flip Y for Cr? usually Cr is Y axis.

            // Plot
            if (x >= 0 && x < w && y >= 0 && y < h) {
                const idx = (y * w + x) * 4;
                // Accumulate color
                imgData.data[idx] = Math.min(255, imgData.data[idx] + 20); // R
                imgData.data[idx + 1] = Math.min(255, imgData.data[idx + 1] + 50); // G (Tealish)
                imgData.data[idx + 2] = Math.min(255, imgData.data[idx + 2] + 20); // B
                imgData.data[idx + 3] = 255;
            }
        }

        ctx.putImageData(imgData, 0, 0);

        // Overlay Graticule
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, w * 0.4, 0, Math.PI * 2); // 75% saturation
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
        ctx.moveTo(0, cy); ctx.lineTo(w, cy);
        ctx.stroke();

        // Skin tone line (approx 10-11 o'clock)
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - w * 0.3, cy - w * 0.3);
        ctx.strokeStyle = 'rgba(255, 200, 150, 0.5)';
        ctx.stroke();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-20 right-4 z-50 w-72 bg-[#1a1d21] border border-gray-700 shadow-2xl rounded-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-2 bg-[#0b0c0e] border-b border-gray-700 drag-handle cursor-move">
                <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
                    <Activity size={12} className="text-blue-400" /> Video Scopes
                </span>
                <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-red-500/20 hover:text-red-400" onClick={onClose}>
                    <X size={12} />
                </Button>
            </div>

            <div className="p-1 bg-[#1a1d21]">
                <Tabs value={scopeType} onValueChange={(v: any) => setScopeType(v)} className="w-full">
                    <TabsList className="w-full h-7 bg-[#0b0c0e] grid grid-cols-3 mb-1">
                        <TabsTrigger value="waveform" className="text-[10px] h-6"><Activity size={10} className="mr-1" /> Wave</TabsTrigger>
                        <TabsTrigger value="vectorscope" className="text-[10px] h-6"><Disc size={10} className="mr-1" /> Vector</TabsTrigger>
                        <TabsTrigger value="histogram" className="text-[10px] h-6"><BarChart3 size={10} className="mr-1" /> Hist</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="aspect-square w-full bg-black relative">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full object-contain"
                />

                {/* Labels/Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-30">
                    {scopeType === 'waveform' && (
                        <div className="w-full h-full border-t border-b border-white/20 flex flex-col justify-between p-1 text-[8px] text-white">
                            <span>100</span>
                            <span>50</span>
                            <span>0</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoScopes;
