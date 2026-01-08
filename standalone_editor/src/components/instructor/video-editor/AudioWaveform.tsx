import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
    audioSrc?: string;
    duration: number;
    width: number;
    height?: number;
    color?: string;
    backgroundColor?: string;
    isPlaying?: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
    audioSrc,
    duration,
    width,
    height = 48,
    color = '#10b981',
    backgroundColor = 'transparent',
    isPlaying = false
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const waveformDataRef = useRef<number[]>([]);

    // Generate waveform data from audio source
    useEffect(() => {
        if (!audioSrc) {
            // Generate random waveform for demo
            generateRandomWaveform();
            return;
        }

        const generateWaveform = async () => {
            try {
                const response = await fetch(audioSrc);
                const arrayBuffer = await response.arrayBuffer();

                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                }

                const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
                const rawData = audioBuffer.getChannelData(0);
                const samples = Math.min(width, 500); // Limit samples for performance
                const blockSize = Math.floor(rawData.length / samples);
                const filteredData: number[] = [];

                for (let i = 0; i < samples; i++) {
                    let blockStart = blockSize * i;
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) {
                        sum += Math.abs(rawData[blockStart + j]);
                    }
                    filteredData.push(sum / blockSize);
                }

                // Normalize
                const max = Math.max(...filteredData);
                waveformDataRef.current = filteredData.map(val => val / max);
                drawWaveform();
            } catch (error) {
                console.error('Error generating waveform:', error);
                generateRandomWaveform();
            }
        };

        generateWaveform();
    }, [audioSrc, width]);

    const generateRandomWaveform = () => {
        const samples = Math.min(width / 2, 250);
        const data: number[] = [];

        for (let i = 0; i < samples; i++) {
            // Create more realistic waveform with varying amplitudes
            const baseAmplitude = 0.3 + Math.random() * 0.7;
            const smoothing = Math.sin((i / samples) * Math.PI); // Envelope
            data.push(baseAmplitude * smoothing);
        }

        waveformDataRef.current = data;
        drawWaveform();
    };

    const drawWaveform = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        // Clear canvas
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        const data = waveformDataRef.current;
        if (data.length === 0) return;

        const barWidth = width / data.length;
        const centerY = height / 2;
        const maxBarHeight = height * 0.8;

        // Draw waveform bars
        ctx.fillStyle = color;

        data.forEach((value, index) => {
            const barHeight = value * maxBarHeight;
            const x = index * barWidth;
            const y = centerY - barHeight / 2;

            // Draw symmetric bars (top and bottom)
            ctx.fillRect(x, y, Math.max(barWidth - 1, 1), barHeight);
        });

        // Add subtle gradient overlay
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    };

    useEffect(() => {
        drawWaveform();
    }, [width, height, color, backgroundColor]);

    return (
        <canvas
            ref={canvasRef}
            className={`${isPlaying ? 'opacity-100' : 'opacity-70'} transition-opacity`}
            style={{ display: 'block' }}
        />
    );
};

// Simplified version for inline use
export const SimpleWaveform: React.FC<{ width: number; height: number; color: string }> = ({ width, height, color }) => {
    const bars = Math.min(Math.floor(width / 3), 100);
    const barData = Array.from({ length: bars }, () => 0.2 + Math.random() * 0.8);

    return (
        <div className="flex items-center justify-center h-full gap-[1px]" style={{ width, height }}>
            {barData.map((amplitude, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                        height: `${amplitude * 100}%`,
                        backgroundColor: color,
                        opacity: 0.6 + amplitude * 0.4
                    }}
                />
            ))}
        </div>
    );
};
