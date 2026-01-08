import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Move, Undo, Volume2, Palette, Type as TypeIcon, Diamond, Plus, Trash2, Sparkles, ArrowLeftRight, Wand2, Mic, Scissors, Layers } from 'lucide-react';
import ColorGradingControls from './ColorGradingControls';
import GraphEditor from './GraphEditor';

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
    proxyUrl?: string;
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
    color: {
        brightness: number;
        contrast: number;
        saturation: number;
        hue: number;
        blur: number;
        vignette: number;
        temperature: number;
        lift: { r: number; g: number; b: number };
        gamma: { r: number; g: number; b: number };
        gain: { r: number; g: number; b: number };
        curves: {
            master: number[];
            red: number[];
            green: number[];
            blue: number[];
        };
        lut?: 'none' | 'hollywood' | 'vintage' | 'noir' | 'teal_orange' | 'faded' | 'warm_vibe';
    };
    effects?: {
        id: string;
        type: 'vhs' | 'glitch' | 'old_film' | 'rgb_split' | 'mirror' | 'grain';
        intensity: number;
        enabled: boolean;
    }[];
    animation: {
        type: 'none' | 'orbit' | 'float' | 'shake' | 'spin' | 'slide-right' | 'slide-left' | 'slide-up' | 'slide-down';
        speed: number;
        startTime?: number;
        endTime?: number;
    };
    keyframes?: Keyframe[];
    audio: {
        volume: number;
        mute: boolean;
        fadeIn: number;
        fadeOut: number;
        voiceEnhance: boolean;
        noiseRemoval: number;
        effects?: {
            bass: number;
            mid: number;
            treble: number;
            compression: boolean;
            ducking: boolean;
        };
    };
    speed: number;
    chromaKey?: {
        enabled: boolean;
        color: string;
        similarity: number;
        smoothness: number;
        spill: number;
        lightWrap?: number; // New property
    };
    transitions?: {
        in: { type: 'none' | 'fade' | 'zoom' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down'; duration: number };
        out: { type: 'none' | 'fade' | 'zoom' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down'; duration: number };
    };
    parentClipId?: string;
    tracking?: {
        enabled: boolean;
        mode: 'point' | 'planar' | 'face' | 'stabilize';
        quality: 'fast' | 'best';
        targetId?: string; // For linking
        isAnalyzed: boolean;
        progress: number;
        data?: any[]; // Stored keyframes/points
        rect?: { x: number, y: number, w: number, h: number }; // ROI
        settings?: {
            smoothness: number; // For Stabilize
            corners?: { x: number, y: number }[]; // For Planar
            faceFeatures?: string[]; // For Face
        };
    };
    maskKeyframes?: {
        time: number;
        points: { x: number; y: number }[];
    }[];
    maskSettings?: {
        enabled: boolean;
        feather: number;
        opacity: number;
        inverted: boolean;
        expansion: number;
    };
}

const defaultTransform = { x: 0, y: 0, scale: 100, rotation: 0, opacity: 100 };
export const defaultColor = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    vignette: 0,
    temperature: 0,
    lift: { r: 0, g: 0, b: 0 },
    gamma: { r: 0.8, g: 0.8, b: 0.8 },
    gain: { r: 1, g: 1, b: 1 },
    curves: {
        master: [0, 25, 50, 75, 100],
        red: [0, 25, 50, 75, 100],
        green: [0, 25, 50, 75, 100],
        blue: [0, 25, 50, 75, 100]
    }
};
const defaultTransitions = {
    in: { type: 'none' as const, duration: 0.5 },
    out: { type: 'none' as const, duration: 0.5 }
};
const defaultAudio = { volume: 1, mute: false, fadeIn: 0, fadeOut: 0, voiceEnhance: false, noiseRemoval: 0 };

interface PropertiesPanelProps {
    clip: Clip | null;
    currentTime: number;
    clips: Clip[];
    drawingPath?: { x: number; y: number }[];
    onClearDrawing?: () => void;
    onUpdate: (id: string, updates: Partial<Clip>) => void;
    getFrameStats?: () => { r: number, g: number, b: number } | null;
    getHistogramData?: () => { r: number[], g: number[], b: number[], luma: number[] } | null;
    onSetToolMode?: (mode: string) => void;
}

const presets = [
    { name: 'سينمائي', color: { brightness: 110, contrast: 120, saturation: 90, hue: 0, blur: 0, vignette: 20, temperature: -10 } },
    { name: 'دافئ', color: { brightness: 105, contrast: 110, saturation: 110, hue: 10, blur: 0, vignette: 10, temperature: 20 } },
    { name: 'أبيض وأسود', color: { brightness: 100, contrast: 130, saturation: 0, hue: 0, blur: 0, vignette: 30, temperature: 0 } },
    { name: 'فليلم قديم', color: { brightness: 90, contrast: 110, saturation: 80, hue: 30, blur: 1, vignette: 40, temperature: 30 } },
];

const PropertiesPanel = ({ clip, currentTime, clips, drawingPath = [], onClearDrawing, onUpdate, getFrameStats, getHistogramData, onSetToolMode }: PropertiesPanelProps) => {
    const [showGraph, setShowGraph] = useState(false);
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

                {/* Color Grading */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                            <Palette size={12} /> Color Grading
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={() => onUpdate(clip.id, { color: defaultColor })}
                        >
                            <Undo size={10} />
                        </Button>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={12} className="text-yellow-400" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cinematic LUTs</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {['none', 'hollywood', 'teal_orange', 'vintage', 'noir', 'warm_vibe', 'faded'].map((lut) => (
                                <button
                                    key={lut}
                                    onClick={() => onUpdate(clip.id, { color: { ...clip.color, lut: lut as any } })}
                                    className={`group relative h-10 rounded-lg overflow-hidden border-2 transition-all ${clip.color.lut === lut ? 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'border-gray-800 hover:border-gray-600'}`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br opacity-50 ${lut === 'hollywood' ? 'from-orange-900 to-blue-900' : lut === 'teal_orange' ? 'from-teal-600 to-orange-600' : lut === 'vintage' ? 'from-sepia-600 to-gray-600' : 'from-gray-700 to-black'}`} />
                                    <span className="relative z-10 text-[8px] font-bold uppercase text-white drop-shadow-md">{lut}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        <ColorGradingControls
                            selectedClip={clip}
                            onUpdate={onUpdate}
                            getFrameStats={getFrameStats}
                            getHistogramData={getHistogramData}
                        />
                    </div>
                </div>

                <div className="h-px bg-gray-800" />

                {/* Keyframes */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                            <Diamond size={12} /> Keyframes
                        </h3>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 px-2 text-[10px] ${showGraph ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400'}`}
                                onClick={() => setShowGraph(!showGraph)}
                            >
                                Graph
                            </Button>
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

                    {showGraph && clip.keyframes && clip.keyframes.length > 0 && (
                        <div className="mt-4 h-64 bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                            <GraphEditor
                                clip={clip}
                                currentTime={currentTime}
                                onUpdate={onUpdate}
                                onClose={() => setShowGraph(false)}
                            />
                        </div>
                    )}
                </div>

                <div className="h-px bg-gray-800" />

                {/* Transitions (In/Out Effects) */}
                <div>
                    <h3 className="text-xs font-bold text-orange-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <ArrowLeftRight size={12} /> Transitions
                    </h3>
                    <div className="space-y-4">
                        {/* Transitions IN */}
                        <div className="space-y-2 p-2 bg-gray-900/40 rounded-lg border border-gray-800/50">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Entrance (In)</span>
                                <select
                                    className="bg-gray-800 border-none text-[10px] rounded px-2 h-5 text-gray-200 focus:ring-0"
                                    value={clip.transitions?.in?.type || 'none'}
                                    onChange={(e) => onUpdate(clip.id, {
                                        transitions: {
                                            ...clip.transitions,
                                            in: { ...clip.transitions?.in, type: e.target.value as any, duration: clip.transitions?.in?.duration || 0.5 }
                                        }
                                    })}
                                >
                                    <option value="none">None</option>
                                    <option value="fade">Fade In</option>
                                    <option value="zoom">Zoom In</option>
                                    <option value="slide-left">Slide Left</option>
                                    <option value="slide-right">Slide Right</option>
                                    <option value="slide-up">Slide Up</option>
                                    <option value="slide-down">Slide Down</option>
                                </select>
                            </div>
                            {(clip.transitions?.in?.type !== 'none') && (
                                <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                                    <div className="flex justify-between text-[10px] text-gray-500">
                                        <span>Duration</span>
                                        <span>{(clip.transitions?.in?.duration || 0.5).toFixed(1)}s</span>
                                    </div>
                                    <Slider
                                        min={0.1} max={3.0} step={0.1}
                                        value={[clip.transitions?.in?.duration || 0.5]}
                                        onValueChange={([v]) => onUpdate(clip.id, {
                                            transitions: {
                                                ...clip.transitions,
                                                in: { ...clip.transitions?.in, duration: v }
                                            }
                                        })}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Transitions OUT */}
                        <div className="space-y-2 p-2 bg-gray-900/40 rounded-lg border border-gray-800/50">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Exit (Out)</span>
                                <select
                                    className="bg-gray-800 border-none text-[10px] rounded px-2 h-5 text-gray-200 focus:ring-0"
                                    value={clip.transitions?.out?.type || 'none'}
                                    onChange={(e) => onUpdate(clip.id, {
                                        transitions: {
                                            ...clip.transitions,
                                            out: { ...clip.transitions?.out, type: e.target.value as any, duration: clip.transitions?.out?.duration || 0.5 }
                                        }
                                    })}
                                >
                                    <option value="none">None</option>
                                    <option value="fade">Fade Out</option>
                                    <option value="zoom">Zoom Out</option>
                                    <option value="slide-left">Slide Left</option>
                                    <option value="slide-right">Slide Right</option>
                                    <option value="slide-up">Slide Up</option>
                                    <option value="slide-down">Slide Down</option>
                                </select>
                            </div>
                            {(clip.transitions?.out?.type !== 'none') && (
                                <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                                    <div className="flex justify-between text-[10px] text-gray-500">
                                        <span>Duration</span>
                                        <span>{(clip.transitions?.out?.duration || 0.5).toFixed(1)}s</span>
                                    </div>
                                    <Slider
                                        min={0.1} max={3.0} step={0.1}
                                        value={[clip.transitions?.out?.duration || 0.5]}
                                        onValueChange={([v]) => onUpdate(clip.id, {
                                            transitions: {
                                                ...clip.transitions,
                                                out: { ...clip.transitions?.out, duration: v }
                                            }
                                        })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

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
                                <div className="h-px bg-gray-800/50 my-2" />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Wand2 size={12} className="text-purple-400" />
                                        <span className="text-xs text-gray-200">AI Voice Enhance</span>
                                    </div>
                                    <Switch
                                        checked={!!clip.audio?.voiceEnhance}
                                        onCheckedChange={(c) => onUpdate(clip.id, { audio: { ...clip.audio, voiceEnhance: c } })}
                                    />
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Mic size={12} className="text-blue-400" />
                                            <span className="text-xs text-gray-200">AI Noise Removal</span>
                                        </div>
                                        <Switch
                                            checked={(clip.audio?.noiseRemoval ?? 0) > 0}
                                            onCheckedChange={(c) => onUpdate(clip.id, { audio: { ...clip.audio, noiseRemoval: c ? 50 : 0 } })}
                                        />
                                    </div>
                                    {(clip.audio?.noiseRemoval ?? 0) > 0 && (
                                        <div className="space-y-1 pl-6 animate-in fade-in slide-in-from-top-1">
                                            <div className="flex justify-between text-[10px] text-gray-500">
                                                <span>Reduction Amount</span>
                                                <span>{clip.audio.noiseRemoval}%</span>
                                            </div>
                                            <Slider
                                                min={0} max={100} step={1}
                                                value={[clip.audio.noiseRemoval]}
                                                onValueChange={([v]) => onUpdate(clip.id, { audio: { ...clip.audio, noiseRemoval: v } })}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Advanced Audio Processor */}
                                <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 space-y-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Layers size={12} className="text-blue-400" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Advanced Audio Processor</span>
                                    </div>

                                    {/* EQ Controls */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {['bass', 'mid', 'treble'].map((band) => (
                                            <div key={band} className="space-y-1">
                                                <div className="text-[8px] text-center uppercase text-gray-500">{band}</div>
                                                <Slider
                                                    orientation="vertical"
                                                    className="h-16 mx-auto"
                                                    min={-12} max={12} step={1}
                                                    value={[(clip.audio?.effects as any)?.[band] ?? 0]}
                                                    onValueChange={([v]) => onUpdate(clip.id, {
                                                        audio: {
                                                            ...clip.audio,
                                                            effects: { ...clip.audio?.effects as any, [band]: v }
                                                        }
                                                    })}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Toggles */}
                                    <div className="space-y-2 pt-2 border-t border-white/5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-gray-400 uppercase">Dynamics Compression</span>
                                            <Switch
                                                checked={!!clip.audio?.effects?.compression}
                                                onCheckedChange={(c) => onUpdate(clip.id, {
                                                    audio: { ...clip.audio, effects: { ...clip.audio?.effects as any, compression: c } }
                                                })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-gray-400 uppercase">Auto Voice Ducking</span>
                                            <Switch
                                                checked={!!clip.audio?.effects?.ducking}
                                                onCheckedChange={(c) => onUpdate(clip.id, {
                                                    audio: { ...clip.audio, effects: { ...clip.audio?.effects as any, ducking: c } }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                <div className="h-px bg-gray-800" />

                {/* Chroma Key (Green Screen) */}
                {
                    (clip.type === 'video' || clip.type === 'image') && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles size={12} /> Chroma Key
                                </h3>
                                <Switch
                                    checked={!!clip.chromaKey?.enabled}
                                    onCheckedChange={(enabled) => onUpdate(clip.id, {
                                        chromaKey: {
                                            enabled,
                                            color: clip.chromaKey?.color || '#00ff00',
                                            similarity: clip.chromaKey?.similarity ?? 20,
                                            smoothness: clip.chromaKey?.smoothness ?? 10,
                                            spill: clip.chromaKey?.spill ?? 10
                                        }
                                    })}
                                />
                            </div>

                            {clip.chromaKey?.enabled && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 space-y-1">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold">Key Color</div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={clip.chromaKey.color}
                                                    onChange={(e) => onUpdate(clip.id, { chromaKey: { ...clip.chromaKey!, color: e.target.value } })}
                                                    className="h-8 w-12 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                                                />
                                                <Input
                                                    value={clip.chromaKey.color}
                                                    onChange={(e) => onUpdate(clip.id, { chromaKey: { ...clip.chromaKey!, color: e.target.value } })}
                                                    className="bg-gray-900 border-gray-700 h-8 text-[10px] font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-400"><span>Similarity</span> <span>{clip.chromaKey.similarity}%</span></div>
                                        <Slider min={0} max={100} step={1} value={[clip.chromaKey.similarity]} onValueChange={([v]) => onUpdate(clip.id, { chromaKey: { ...clip.chromaKey!, similarity: v } })} />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-400"><span>Smoothness</span> <span>{clip.chromaKey.smoothness}%</span></div>
                                        <Slider min={0} max={100} step={1} value={[clip.chromaKey.smoothness]} onValueChange={([v]) => onUpdate(clip.id, { chromaKey: { ...clip.chromaKey!, smoothness: v } })} />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-400"><span>Spill Removal</span> <span>{clip.chromaKey.spill}%</span></div>
                                        <Slider min={0} max={100} step={1} value={[clip.chromaKey.spill]} onValueChange={([v]) => onUpdate(clip.id, { chromaKey: { ...clip.chromaKey!, spill: v } })} />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-400"><span>Light Wrap</span> <span>{clip.chromaKey.lightWrap ?? 0}%</span></div>
                                        <Slider min={0} max={100} step={1} value={[clip.chromaKey.lightWrap ?? 0]} onValueChange={([v]) => onUpdate(clip.id, { chromaKey: { ...clip.chromaKey!, lightWrap: v } })} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }

                <div className="h-px bg-gray-800" />

                {/* Advanced Tracking */}
                <div>
                    <h3 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Move size={12} /> Intelligent Tracking
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Enable Tracking</span>
                            <Switch
                                checked={!!clip.tracking?.enabled}
                                onCheckedChange={(c) => onUpdate(clip.id, {
                                    tracking: {
                                        ...(clip.tracking || { mode: 'point', quality: 'fast', isAnalyzed: false, progress: 0 }),
                                        enabled: c
                                    }
                                })}
                            />
                        </div>

                        {clip.tracking?.enabled && (
                            <div className="space-y-4 p-3 bg-gray-900/40 rounded-lg border border-gray-800/50 animate-in fade-in slide-in-from-top-1">
                                {/* Mode Selection */}
                                <div className="grid grid-cols-4 gap-1 p-1 bg-gray-800 rounded-lg">
                                    {['point', 'planar', 'face', 'stabilize'].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => onUpdate(clip.id, { tracking: { ...clip.tracking!, mode: m as any } })}
                                            className={`text-[8px] uppercase font-bold py-1.5 rounded transition-all ${clip.tracking?.mode === m ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            {m.charAt(0).toUpperCase() + m.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {/* Dynamic Content based on Mode */}
                                <div className="space-y-3">
                                    {clip.tracking?.mode === 'stabilize' ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] text-gray-500"><span>Smoothness</span> <span>{(clip.tracking.settings?.smoothness || 50)}%</span></div>
                                            <Slider
                                                min={0} max={100}
                                                value={[clip.tracking.settings?.smoothness || 50]}
                                                onValueChange={([v]) => onUpdate(clip.id, { tracking: { ...clip.tracking!, settings: { ...clip.tracking?.settings, smoothness: v } } })}
                                            />
                                            <Button size="sm" variant="secondary" className="w-full h-7 text-[10px] mt-2">
                                                <Sparkles size={10} className="mr-2" /> Stabilize Motion
                                            </Button>
                                        </div>
                                    ) : clip.tracking?.mode === 'point' ? (
                                        <div className="space-y-2">
                                            <div className="text-[10px] text-gray-400 mb-2">
                                                Place the tracker box on a high-contrast area.
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px] border-gray-700">
                                                    <Undo size={10} className="mr-1" /> Track Back
                                                </Button>
                                                <Button size="sm" variant="secondary" className="flex-1 h-7 text-[10px] bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
                                                    Track Fwd <Move size={10} className="ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 bg-gray-800/50 rounded border border-gray-700/50 border-dashed">
                                            <Wand2 size={16} className="mx-auto text-purple-400 mb-2 opacity-50" />
                                            <span className="text-[10px] text-gray-500 block">AI Analysis Required</span>
                                            <Button size="sm" variant="default" className="h-6 text-[10px] mt-2 bg-purple-600 hover:bg-purple-500">
                                                Analyze Frame
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Target Link (Common) */}
                                {clip.tracking?.mode !== 'stabilize' && (
                                    <div className="pt-2 border-t border-gray-800/50">
                                        <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Apply To</span>
                                        <select
                                            className="w-full bg-gray-800 border-none text-xs rounded px-2 h-7 text-gray-200 focus:ring-1 focus:ring-blue-500"
                                            value={clip.tracking?.targetId || ''}
                                            onChange={(e) => onUpdate(clip.id, { tracking: { ...clip.tracking!, targetId: e.target.value } })}
                                        >
                                            <option value="">None (Tracking Only)</option>
                                            {clips.filter(c => c.id !== clip.id).map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {(c as any).name || c.type} ({c.id.substring(0, 4)})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-px bg-gray-800" />

                {/* Masking */}
                <div>
                    <h3 className="text-xs font-bold text-pink-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Scissors size={12} /> Masking
                    </h3>
                    <div className="space-y-3">
                        {clip.maskPath && (
                            <div className="p-2 bg-pink-500/10 border border-pink-500/20 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-pink-300 font-bold uppercase">Active Mask</span>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 text-[9px] text-blue-400 hover:text-blue-300 px-1"
                                            onClick={() => {
                                                const timeInClip = currentTime - clip.startAt;
                                                const newKeyframe = {
                                                    time: timeInClip,
                                                    points: JSON.parse(JSON.stringify(clip.maskPath?.points || []))
                                                };
                                                const kfs = [...(clip.maskKeyframes || [])];
                                                const idx = kfs.findIndex(kf => Math.abs(kf.time - timeInClip) < 0.1);
                                                if (idx >= 0) kfs[idx] = newKeyframe;
                                                else kfs.push(newKeyframe);
                                                kfs.sort((a, b) => a.time - b.time);
                                                onUpdate(clip.id, { maskKeyframes: kfs });
                                            }}
                                        >
                                            <Diamond size={10} className="mr-1" /> Add KF
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 text-[9px] text-red-400 hover:text-red-300 px-1"
                                            onClick={() => onUpdate(clip.id, { maskPath: undefined, maskKeyframes: undefined })}
                                        >
                                            Remove Mask
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-2 border-t border-pink-500/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400 uppercase">Invert Mask</span>
                                            <Switch
                                                checked={!!clip.maskSettings?.inverted}
                                                onCheckedChange={(c) => onUpdate(clip.id, { maskSettings: { ...clip.maskSettings!, inverted: c } })}
                                            />
                                        </div>
                                        <div className="text-[10px] text-gray-500">Points: {clip.maskPath.points.length}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] text-gray-400"><span>Feather (تنعيم الحواف)</span> <span>{clip.maskSettings?.feather ?? 0}px</span></div>
                                        <Slider min={0} max={100} step={1} value={[clip.maskSettings?.feather ?? 0]} onValueChange={([v]) => onUpdate(clip.id, { maskSettings: { ...clip.maskSettings!, feather: v } })} />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] text-gray-400"><span>Opacity (الشفافية)</span> <span>{clip.maskSettings?.opacity ?? 100}%</span></div>
                                        <Slider min={0} max={100} step={1} value={[clip.maskSettings?.opacity ?? 100]} onValueChange={([v]) => onUpdate(clip.id, { maskSettings: { ...clip.maskSettings!, opacity: v } })} />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] text-gray-400"><span>Expansion (التمدد)</span> <span>{clip.maskSettings?.expansion ?? 0}px</span></div>
                                        <Slider min={-100} max={100} step={1} value={[clip.maskSettings?.expansion ?? 0]} onValueChange={([v]) => onUpdate(clip.id, { maskSettings: { ...clip.maskSettings!, expansion: v } })} />
                                    </div>
                                </div>

                                {/* Mask Keyframes List */}
                                {clip.maskKeyframes && clip.maskKeyframes.length > 0 && (
                                    <div className="space-y-1 mt-2 border-t border-pink-500/20 pt-2">
                                        <span className="text-[9px] text-pink-400 font-bold">Rotoscoping (Keyframes)</span>
                                        <div className="max-h-20 overflow-y-auto pr-1 space-y-1">
                                            {clip.maskKeyframes.map((kf, i) => (
                                                <div key={i} className="flex items-center justify-between bg-gray-900/50 p-1 rounded text-[9px]">
                                                    <div className="flex items-center gap-2">
                                                        <Diamond size={8} className="text-pink-500 fill-pink-500" />
                                                        <span className="text-gray-300">{kf.time.toFixed(2)}s</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-3 w-3 text-gray-600 hover:text-red-400"
                                                        onClick={() => {
                                                            const kfs = clip.maskKeyframes?.filter((_, idx) => idx !== i);
                                                            onUpdate(clip.id, { maskKeyframes: kfs });
                                                        }}
                                                    >
                                                        <Trash2 size={8} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {drawingPath.length > 0 && (
                            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-2 animate-in fade-in slide-in-from-top-1">
                                <p className="text-[10px] text-blue-300">New drawing detected ({drawingPath.length} points)</p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-1 h-7 text-[10px] bg-blue-600 hover:bg-blue-500"
                                        onClick={() => {
                                            onUpdate(clip.id, { maskPath: { points: drawingPath, isClosed: true } });
                                            if (onClearDrawing) onClearDrawing();
                                        }}
                                    >
                                        Apply as Mask
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-[10px] border-gray-700 hover:bg-gray-800"
                                        onClick={onClearDrawing}
                                    >
                                        Discard
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!clip.maskPath && drawingPath.length === 0 && (
                            <div className="p-3 border border-dashed border-gray-800 rounded-lg text-center">
                                <p className="text-[10px] text-gray-600 italic">Use the Pen Tool (P) on canvas to draw a mask for this clip.</p>
                            </div>
                        )}
                    </div>
                </div>

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
                                <ColorGradingControls selectedClip={clip} onUpdate={onUpdate} getFrameStats={getFrameStats} />
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
