import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Move, Undo, Volume2, Palette, Type as TypeIcon, Diamond, Plus, Trash2 } from 'lucide-react';
import ColorGradingControls from './ColorGradingControls';

export interface Keyframe {
    time: number; // seconds relative to clip start
    x: number;
    y: number;
    scale: number;
    rotation: number;
    opacity: number;
}

export interface Clip {
    id: string;
    trackId: number;
    type: 'video' | 'audio' | 'text' | 'image' | 'adjustment' | 'shape';
    name: string;
    startAt: number; // seconds
    duration: number; // seconds (original duration)
    trimStart: number;
    trimEnd: number;
    url?: string;
    thumbnail?: string;
    textContent?: string;
    textStyle?: {
        fontSize: number;
        color: string;
        fontFamily: string;
        bold?: boolean;
        italic?: boolean;
        shadow?: boolean;
    };
    pathData?: {
        points: { x: number; y: number }[];
        strokeColor: string;
        strokeWidth: number;
        fillColor?: string;
        isClosed?: boolean;
    };
    maskPath?: {
        points: { x: number; y: number }[];
        isClosed: boolean;
    };
    transform: { x: number; y: number; scale: number; rotation: number; opacity: number };
    color: { brightness: number; contrast: number; saturation: number; hue: number; blur: number; vignette: number; temperature: number };
    animation: {
        type: 'none' | 'orbit' | 'float' | 'shake' | 'spin' | 'slide-right' | 'slide-left' | 'slide-up' | 'slide-down';
        speed: number;
        startTime?: number;
        endTime?: number;
    };
    keyframes?: Keyframe[];
    audio: { volume: number; mute: boolean; fadeIn: number; fadeOut: number; voiceEnhance: boolean };
    speed: number;
}

const defaultTransform = { x: 0, y: 0, scale: 100, rotation: 0, opacity: 100 };
const defaultColor = { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0, vignette: 0, temperature: 0 };
const defaultAudio = { volume: 1, mute: false, fadeIn: 0, fadeOut: 0, voiceEnhance: false };

interface PropertiesPanelProps {
    clip: Clip | null;
    currentTime: number;
    onUpdate: (id: string, updates: Partial<Clip>) => void;
}

const presets = [
    { name: 'سينمائي', color: { brightness: 110, contrast: 120, saturation: 90, hue: 0, blur: 0, vignette: 20, temperature: -10 } },
    { name: 'دافئ', color: { brightness: 105, contrast: 110, saturation: 110, hue: 10, blur: 0, vignette: 10, temperature: 20 } },
    { name: 'أبيض وأسود', color: { brightness: 100, contrast: 130, saturation: 0, hue: 0, blur: 0, vignette: 30, temperature: 0 } },
    { name: 'فليلم قديم', color: { brightness: 90, contrast: 110, saturation: 80, hue: 30, blur: 1, vignette: 40, temperature: 30 } },
];

const PropertiesPanel = ({ clip, currentTime, onUpdate }: PropertiesPanelProps) => {
    if (!clip) return <div className="p-4 text-center text-gray-500 text-xs">Select a clip to edit properties</div>;

    const getInterpolatedTransform = () => {
        if (!clip.keyframes || clip.keyframes.length === 0) return clip.transform;

        const t = currentTime - clip.startAt;
        const kfs = clip.keyframes;
        const nextIdx = kfs.findIndex(kf => kf.time > t);

        if (nextIdx === 0) return kfs[0];
        if (nextIdx === -1) return kfs[kfs.length - 1];

        const k1 = kfs[nextIdx - 1];
        const k2 = kfs[nextIdx];
        const range = k2.time - k1.time;
        const factor = range > 0 ? (t - k1.time) / range : 0;

        return {
            x: k1.x + (k2.x - k1.x) * factor,
            y: k1.y + (k2.y - k1.y) * factor,
            scale: k1.scale + (k2.scale - k1.scale) * factor,
            rotation: k1.rotation + (k2.rotation - k1.rotation) * factor,
            opacity: k1.opacity + (k2.opacity - k1.opacity) * factor,
        };
    };

    const currentTransform = getInterpolatedTransform();

    const updateTransform = (key: string, value: number) => {
        const timeInClip = currentTime - clip.startAt;
        const hasKeyframes = clip.keyframes && clip.keyframes.length > 0;

        if (hasKeyframes) {
            const keyframes = [...(clip.keyframes || [])];
            const index = keyframes.findIndex(kf => Math.abs(kf.time - timeInClip) < 0.1);

            // If we found a keyframe near current time, update it. 
            // Otherwise, we take current interpolated values and update the specific property.
            const baseValues = index >= 0 ? keyframes[index] : currentTransform;
            const updatedKeyframe = { ...baseValues, time: index >= 0 ? keyframes[index].time : timeInClip, [key]: value };

            if (index >= 0) {
                keyframes[index] = updatedKeyframe;
            } else {
                keyframes.push(updatedKeyframe);
                keyframes.sort((a, b) => a.time - b.time);
            }
            onUpdate(clip.id, { keyframes, transform: { ...clip.transform, [key]: value } });
        } else {
            onUpdate(clip.id, { transform: { ...clip.transform, [key]: value } });
        }
    };

    const updateAudio = (key: keyof typeof defaultAudio, value: number) => {
        onUpdate(clip.id, { audio: { ...clip.audio, [key]: value } });
    };

    const updateColor = (key: keyof typeof defaultColor, value: number) => {
        onUpdate(clip.id, { color: { ...clip.color, [key]: value } });
    };

    const applyPreset = (preset: typeof presets[0]) => {
        onUpdate(clip.id, { color: { ...clip.color, ...preset.color } });
    };

    return (
        <ScrollArea className="h-full bg-[#1a1d21]">
            <div className="p-4 space-y-6">
                {/* Basic Info */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Info</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Name</span> <span>{clip.name}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Duration</span> <span>{clip.duration ? clip.duration.toFixed(2) : ((clip.trimEnd - clip.trimStart) / clip.speed).toFixed(2)}s</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Type</span> <Badge variant="outline" className="text-[10px] h-4">{clip.type}</Badge></div>
                    </div>
                </div>

                <div className="h-px bg-gray-800" />

                {/* Motion / Transform */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2"><Move size={12} /> Motion</h3>
                        <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => updateTransform('scale', 100)}><Undo size={10} /></Button>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-400"><span>Position X</span> <span>{(currentTransform.x ?? 0).toFixed(0)}</span></div>
                            <Slider min={-1000} max={1000} step={1} value={[currentTransform.x ?? 0]} onValueChange={([v]) => updateTransform('x', v)} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-400"><span>Position Y</span> <span>{(currentTransform.y ?? 0).toFixed(0)}</span></div>
                            <Slider min={-1000} max={1000} step={1} value={[currentTransform.y ?? 0]} onValueChange={([v]) => updateTransform('y', v)} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-400"><span>Scale</span> <span>{(currentTransform.scale ?? 100).toFixed(0)}%</span></div>
                            <Slider min={0} max={400} step={1} value={[currentTransform.scale ?? 100]} onValueChange={([v]) => updateTransform('scale', v)} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-400"><span>Rotation</span> <span>{(currentTransform.rotation ?? 0).toFixed(0)}°</span></div>
                            <Slider min={-360} max={360} step={1} value={[currentTransform.rotation ?? 0]} onValueChange={([v]) => updateTransform('rotation', v)} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-400"><span>Opacity</span> <span>{(currentTransform.opacity ?? 100).toFixed(0)}%</span></div>
                            <Slider min={0} max={100} step={1} value={[currentTransform.opacity ?? 100]} onValueChange={([v]) => updateTransform('opacity', v)} />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-800" />

                {/* Keyframes */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                            <Diamond size={12} /> Keyframes
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 gap-1 text-[10px] text-blue-400 hover:text-blue-300"
                            onClick={() => {
                                const timeInClip = currentTime - clip.startAt;
                                const newKeyframe = {
                                    time: timeInClip,
                                    x: clip.transform.x,
                                    y: clip.transform.y,
                                    scale: clip.transform.scale,
                                    rotation: clip.transform.rotation,
                                    opacity: clip.transform.opacity
                                };
                                const keyframes = [...(clip.keyframes || [])];
                                const index = keyframes.findIndex(kf => Math.abs(kf.time - timeInClip) < 0.1);
                                if (index >= 0) keyframes[index] = newKeyframe;
                                else keyframes.push(newKeyframe);
                                keyframes.sort((a, b) => a.time - b.time);
                                onUpdate(clip.id, { keyframes });
                            }}
                        >
                            <Plus size={10} /> Add
                        </Button>
                    </div>

                    <div className="space-y-1">
                        {!clip.keyframes || clip.keyframes.length === 0 ? (
                            <p className="text-[10px] text-gray-500 italic">No keyframes added</p>
                        ) : (
                            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                                {clip.keyframes.map((kf, i) => (
                                    <div key={i} className="flex items-center justify-between bg-gray-800/30 p-1.5 rounded text-[10px]">
                                        <div className="flex items-center gap-2">
                                            <Diamond size={8} className="text-purple-500 fill-purple-500" />
                                            <span className="text-gray-300">{kf.time.toFixed(2)}s</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 text-gray-600 hover:text-red-400"
                                            onClick={() => {
                                                const kfs = clip.keyframes?.filter((_, idx) => idx !== i);
                                                onUpdate(clip.id, { keyframes: kfs });
                                            }}
                                        >
                                            <Trash2 size={10} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-px bg-gray-800" />



                <div className="h-px bg-gray-800" />

                {/* Audio Controls */}
                {
                    (clip.type === 'video' || clip.type === 'audio') && (
                        <div>
                            <h3 className="text-xs font-bold text-green-400 mb-3 uppercase tracking-wider flex items-center gap-2"><Volume2 size={12} /> Audio</h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-400"><span>Volume</span> <span>{(clip.audio?.volume ?? 1) * 100}%</span></div>
                                    <Slider min={0} max={200} step={1} value={[(clip.audio?.volume ?? 1) * 100]} onValueChange={([v]) => updateAudio('volume', v / 100)} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Mute</span>
                                    <Switch checked={!!clip.audio?.mute} onCheckedChange={(c) => updateAudio('mute', c ? 1 : 0)} />
                                </div>
                            </div>
                        </div>
                    )
                }

                <div className="h-px bg-gray-800" />

                {/* Color / Lumetri */}
                {
                    (clip.type === 'video' || clip.type === 'image') && (
                        <div>
                            <h3 className="text-xs font-bold text-yellow-400 mb-3 uppercase tracking-wider flex items-center gap-2"><Palette size={12} /> Color</h3>

                            {/* Presets */}
                            {/* Presets */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {presets.map(preset => (
                                    <div key={preset.name}
                                        className="w-8 h-8 rounded-full cursor-pointer ring-1 ring-gray-600 hover:ring-2 hover:ring-white transition-all relative group"
                                        style={{
                                            background: `linear-gradient(135deg, 
                                            hsl(0, 0%, ${preset.color.brightness / 2}%) 0%, 
                                            hsl(${preset.color.hue}, ${preset.color.saturation}%, 50%) 100%)`
                                        }}
                                        onClick={() => applyPreset(preset)}
                                    >
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black text-[9px] px-1 py-0.5 rounded text-white opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                                            {preset.name}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-2">
                                <ColorGradingControls selectedClip={clip} onUpdate={onUpdate} />
                            </div>
                        </div>
                    )
                }

                {/* Text Controls */}
                {
                    clip.type === 'text' && (
                        <div>
                            <h3 className="text-xs font-bold text-white mb-3 uppercase tracking-wider flex items-center gap-2"><TypeIcon size={12} /> Text</h3>
                            <div className="space-y-2">
                                <Input value={clip.textContent} onChange={(e) => {
                                    onUpdate(clip.id, { textContent: e.target.value, name: e.target.value });
                                }} className="bg-gray-900 border-gray-700 h-8 text-xs" />
                                <div className="flex gap-1">
                                    <input type="color" value={clip.textStyle?.color || '#ffffff'} onChange={(e) => {
                                        onUpdate(clip.id, { textStyle: { ...clip.textStyle, color: e.target.value } as any });
                                    }} className="h-8 w-8 bg-transparent border-0 cursor-pointer" />
                                    <Input type="number" value={clip.textStyle?.fontSize || 40} onChange={(e) => {
                                        onUpdate(clip.id, { textStyle: { ...clip.textStyle, fontSize: parseInt(e.target.value) } as any });
                                    }} className="bg-gray-900 border-gray-700 h-8 text-xs w-16" />
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </ScrollArea >
    );
};

export default PropertiesPanel;
