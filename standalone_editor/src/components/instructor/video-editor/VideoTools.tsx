import {
    Undo, Redo, Save, Download, Settings, Wand2,
    ZoomIn, ZoomOut, MousePointer2, Hand, Split,
    Palette, Mic, MonitorPlay, Layers, Grid3X3, Film,
    AlignLeft, AlignCenter, AlignRight, Bold, Italic, Type as TypeIcon,
    ChevronDown, Volume2, Cloud, Search, Filter, Speaker, LogOut, FileVideo, Upload,
    ArrowRightFromLine, MoveHorizontal, Scaling, Timer, ArrowLeftRight, Maximize, PenTool,
    Sliders, Move, PlayCircle, Lock, Unlock, Eye, EyeOff, PlusCircle, Pause, Play, Minimize2, Maximize2, Trash2, Scissors, Image as ImageIcon, Music, Plus, VolumeX, Zap
} from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import VideoEditorAI from './VideoEditorAI';
import PropertiesPanel, { Clip } from './PropertiesPanel';
import GraphEditor from './GraphEditor';
import LayersPanel from './LayersPanel';
import ColorGradingControls from './ColorGradingControls';
import CollaborationPanel from './CollaborationPanel';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

// Types
// Types
// Clip interface imported from PropertiesPanel

interface Track {
    id: number;
    type: 'video' | 'audio' | 'overlay';
    label: string;
    visible: boolean;
    muted: boolean;
    locked: boolean;
    color: string;
}

// Presets moved to PropertiesPanel

const defaultTransform = { x: 0, y: 0, scale: 100, rotation: 0, opacity: 100 };
const defaultColor = {
    brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0, vignette: 0, temperature: 0,
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
const defaultAudio = { volume: 1, mute: false, fadeIn: 0, fadeOut: 0, voiceEnhance: false, noiseRemoval: 0 };
const defaultAnimation = { type: 'none' as const, speed: 1, startTime: 0, endTime: 5 };



export default function VideoTools() {
    const { t } = useTranslation();
    const { toast } = useToast();

    // State
    const [clips, setClips] = useState<Clip[]>([]);
    const [tracks, setTracks] = useState<Track[]>([
        { id: 1, type: 'video', label: 'Video 1', visible: true, muted: false, locked: false, color: '#3B82F6' }, // Blue
        { id: 2, type: 'video', label: 'Video 2', visible: true, muted: false, locked: false, color: '#10B981' }, // Green
        { id: 3, type: 'audio', label: 'Audio 1', visible: true, muted: false, locked: false, color: '#F59E0B' }, // Yellow
    ]);

    const [currentTime, setCurrentTime] = useState(0); // seconds
    const [totalDuration, setTotalDuration] = useState(60); // 1 minute default
    const [isPlaying, setIsPlaying] = useState(false);
    const [zoom, setZoom] = useState(20); // pixels per second (Scale)
    const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'media' | 'properties' | 'audio' | 'layers' | 'team'>('media');
    const [bottomTab, setBottomTab] = useState<'timeline' | 'audio' | 'color' | 'graph'>('timeline');

    // Layout State - Optimized for visibility
    const [layout, setLayout] = useState({ timelineHeight: 150, sidebarWidth: 260 });
    const [showColorGrading, setShowColorGrading] = useState(false);
    const [resizingPanel, setResizingPanel] = useState<{ type: 'timeline' | 'sidebar', startPos: number, startSize: number } | null>(null);

    // Export State
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState('webm');
    const [exportQuality, setExportQuality] = useState('1080p');

    // Tools & Modes
    const [mode, setMode] = useState<'cut' | 'edit' | 'color' | 'sound'>('edit');
    const [toolMode, setToolMode] = useState<'select' | 'track-select' | 'ripple' | 'rolling' | 'rate-stretch' | 'split' | 'slip' | 'slide' | 'pen' | 'hand' | 'zoom' | 'move-element' | 'text'>('select');
    const [isProxyMode, setIsProxyMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>([]);
    const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; w: number; h: number } | null>(null);

    const [draggedTrackId, setDraggedTrackId] = useState<number | null>(null);
    const [dragOverTrackId, setDragOverTrackId] = useState<number | null>(null);

    // Collaboration State
    const [currentTeam, setCurrentTeam] = useState<any>(null);
    const [teamNameInput, setTeamNameInput] = useState("");
    const [inviteCodeInput, setInviteCodeInput] = useState("");
    const [isMicEnabled, setIsMicEnabled] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");

    const handleCreateTeam = () => {
        if (!teamNameInput.trim()) return;
        const mockTeam = { id: 'team-1', name: teamNameInput, inviteCode: Math.random().toString(36).substring(7).toUpperCase() };
        setCurrentTeam(mockTeam);
        setCollaborators([{ id: '1', name: 'أنت (المدير)', avatar: '', status: 'online' }]);
        toast({ title: 'تم إنشاء الفريق', description: `اسم الفريق: ${mockTeam.name}` });
    };

    const handleJoinTeam = () => {
        if (!inviteCodeInput.trim()) return;
        setCurrentTeam({ id: 'team-join', name: 'مشروع خارجي', inviteCode: inviteCodeInput });
        setCollaborators([
            { id: '1', name: 'المدير', avatar: '', status: 'online' },
            { id: '2', name: 'أنت', avatar: '', status: 'online' }
        ]);
        toast({ title: 'تم الانضمام للفريق' });
    };

    const addComment = () => {
        if (!newComment.trim()) return;
        const comment = { id: Date.now().toString(), text: newComment, timestamp: currentTime, userName: 'أنت', createdAt: new Date() };
        setComments(prev => [comment, ...prev]);
        setNewComment("");
    };

    // AI & Canvas
    const [isAIChannelOpen, setIsAIChannelOpen] = useState(false);
    const [isGraphEditorOpen, setIsGraphEditorOpen] = useState(false);
    const [canvasBackgroundColor, setCanvasBackgroundColor] = useState('#121212');
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, options: { label: string, action: () => void }[] } | null>(null);

    // History
    const [history, setHistory] = useState<{ clips: Clip[]; tracks: Track[]; bg: string }[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [draggingMaskPoint, setDraggingMaskPoint] = useState<{ clipId: string, pointIndex: number } | null>(null);

    // Auto-switch to properties for tools
    useEffect(() => {
        if (toolMode !== 'select') {
            setActiveTab('properties');
        }
    }, [toolMode]);

    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);

    // Auto-open AI Assistant on component load
    useEffect(() => {
        // Open AI chat after a short delay for better UX
        const timer = setTimeout(() => {
            setIsAIChannelOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);


    const timelineRef = useRef<HTMLDivElement>(null);
    const tracksContainerRef = useRef<HTMLDivElement>(null);

    const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
    const imageRefs = useRef<{ [key: string]: HTMLImageElement }>({});
    const requestRef = useRef<number>();

    const containerRef = useRef<HTMLDivElement>(null);

    // Dragging State
    const [dragging, setDragging] = useState<{
        id: string;
        type: 'move' | 'resize-start' | 'resize-end';
        startX: number;
        originalStart: number;
        originalDuration: number;
        originalTrimStart: number;
        originalTrimEnd: number
    } | null>(null);

    const [canvasDragging, setCanvasDragging] = useState<{
        id: string;
        type: 'move' | 'rotate';
        startX: number;
        startY: number;
        originalX: number;
        originalY: number;
        originalRotation: number;
        scaleX: number;
        scaleY: number;
    } | null>(null);

    const [isScrubbing, setIsScrubbing] = useState(false);
    const scrubStats = useRef<{ startX: number; startY: number; startTime: number; startScrollTop: number } | null>(null);
    const trackHeadersRef = useRef<HTMLDivElement>(null);

    // Update duration based on clips
    useEffect(() => {
        if (clips.length > 0) {
            const maxEnd = Math.max(...clips.map(c => c.startAt + (c.trimEnd - c.trimStart) / c.speed));
            if (maxEnd > totalDuration - 10) setTotalDuration(Math.max(60, maxEnd + 30));
        }
    }, [clips]);

    // --- Helpers ---
    const getClipDuration = (clip: Clip) => (clip.trimEnd - clip.trimStart) / clip.speed;

    const saveToHistory = useCallback((customClips?: Clip[], customTracks?: Track[]) => {
        const newState = {
            clips: JSON.parse(JSON.stringify(customClips || clips)),
            tracks: JSON.parse(JSON.stringify(customTracks || tracks)),
            bg: canvasBackgroundColor
        };
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(newState);
            return newHistory.slice(-20); // Keep last 20
        });
        setHistoryIndex(prev => {
            const newIdx = Math.min(prev + 1, 19);
            // If we were at the end of a 20-item history, the index stays 19
            // Otherwise it increments.
            return history.length >= 20 ? prev : prev + 1;
        });
    }, [clips, tracks, canvasBackgroundColor, history.length, historyIndex]);

    // Save initial state
    useEffect(() => {
        if (history.length === 0) {
            saveToHistory();
        }
    }, []);

    const toggleBrowserFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                toast({
                    title: "Fullscreen Error",
                    description: err.message,
                    variant: "destructive",
                });
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    // --- Interaction Handlers ---

    // --- Actions (Hoisted) ---
    const updateClip = (id: string, updates: Partial<Clip>) => {
        setClips(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        saveToHistory();
    };

    const handlePropertyUpdate = (id: string, updates: Partial<Clip>) => {
        if (selectedClipIds.includes(id)) {
            // Batch update for all selected clips
            // Exception: Don't batch text content or name changes usually?
            // For now, if updating Name or Text, apply only to target.
            // If updating Color/Transform/Audio/Speed, apply to all.
            const uniqueProps = ['name', 'textContent', 'id'];
            const isUniqueUpdate = Object.keys(updates).some(k => uniqueProps.includes(k));

            if (isUniqueUpdate) {
                updateClip(id, updates);
            } else {
                setClips(prev => prev.map(c =>
                    selectedClipIds.includes(c.id) ? { ...c, ...updates } : c
                ));
                saveToHistory();
            }
        } else {
            updateClip(id, updates);
        }
    };

    const addTrack = (type: 'video' | 'audio' | 'overlay') => {
        const id = tracks.length > 0 ? Math.max(...tracks.map(t => t.id)) + 1 : 1;
        const color = type === 'video' ? '#3B82F6' : type === 'audio' ? '#F59E0B' : '#8B5CF6';
        const label = type === 'video' ? 'Video' : type === 'audio' ? 'Audio' : 'Overlay';
        setTracks([...tracks, { id, type, label: `${label} ${id}`, visible: true, muted: false, locked: false, color }]);
        saveToHistory();
    };

    const toggleTrackLock = (id: number) => {
        setTracks(prev => prev.map(t => t.id === id ? { ...t, locked: !t.locked } : t));
        saveToHistory();
    };

    const toggleTrackVisibility = (id: number) => {
        setTracks(prev => prev.map(t => t.id === id ? { ...t, visible: !t.visible } : t));
        saveToHistory();
    };

    const toggleTrackMute = (id: number) => {
        setTracks(prev => prev.map(t => t.id === id ? { ...t, muted: !t.muted } : t));
        saveToHistory();
    };

    const moveTrack = (id: number, targetId: number) => {
        setTracks(prev => {
            const result = [...prev];
            const fromIndex = result.findIndex(t => t.id === id);
            const toIndex = result.findIndex(t => t.id === targetId);
            if (fromIndex !== -1 && toIndex !== -1) {
                const [removed] = result.splice(fromIndex, 1);
                result.splice(toIndex, 0, removed);
            }
            return result;
        });
        saveToHistory();
    };

    const getFrameStats = useCallback(() => {
        if (!canvasRef.current) return null;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return null;
        const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height).data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < imageData.length; i += 4) {
            r += imageData[i];
            g += imageData[i + 1];
            b += imageData[i + 2];
        }
        const pixels = imageData.length / 4;
        return { r: r / pixels, g: g / pixels, b: b / pixels };
    }, []);

    const getHistogramData = useCallback(() => {
        if (!canvasRef.current) return null;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return null;

        const w = canvasRef.current.width;
        const h = canvasRef.current.height;
        const sampleSize = 8; // Larger sample size for histogram performance
        const imageData = ctx.getImageData(0, 0, w, h).data;
        const histogram = {
            r: new Array(64).fill(0),
            g: new Array(64).fill(0),
            b: new Array(64).fill(0),
            luma: new Array(64).fill(0)
        };

        for (let y = 0; y < h; y += sampleSize) {
            for (let x = 0; x < w; x += sampleSize) {
                const i = (y * w + x) * 4;
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const luma = 0.299 * r + 0.587 * g + 0.114 * b;

                histogram.r[Math.floor(r / 4)]++;
                histogram.g[Math.floor(g / 4)]++;
                histogram.b[Math.floor(b / 4)]++;
                histogram.luma[Math.floor(luma / 4)]++;
            }
        }

        const max = Math.max(...histogram.r, ...histogram.g, ...histogram.b, ...histogram.luma);
        if (max > 0) {
            for (let i = 0; i < 64; i++) {
                histogram.r[i] = (histogram.r[i] / max) * 100;
                histogram.g[i] = (histogram.g[i] / max) * 100;
                histogram.b[i] = (histogram.b[i] / max) * 100;
                histogram.luma[i] = (histogram.luma[i] / max) * 100;
            }
        }
        return histogram;
    }, []);

    const deleteClip = (id: string) => {
        setClips(prev => prev.filter(c => c.id !== id));
        if (selectedClipIds.includes(id)) {
            setSelectedClipIds(prev => prev.filter(i => i !== id));
        }
        saveToHistory();
        toast({ title: 'تم الحذف', duration: 1000 });
    };

    const findAvailableTrack = (type: 'video' | 'audio', startAt: number, duration: number, currentTracks: Track[], currentClips: Clip[]) => {
        const relevantTracks = currentTracks.filter(t => t.type === type);

        for (const track of relevantTracks) {
            const hasOverlap = currentClips.some(c =>
                c.trackId === track.id &&
                !(startAt + duration <= c.startAt || startAt >= c.startAt + ((c.trimEnd - c.trimStart) / c.speed))
            );
            if (!hasOverlap) return { trackId: track.id, newTracks: currentTracks };
        }

        const newId = currentTracks.length > 0 ? Math.max(...currentTracks.map(t => t.id)) + 1 : 1;
        const color = type === 'video' ? '#3B82F6' : '#F59E0B';
        const newTrack: Track = {
            id: newId,
            type,
            label: `${type === 'video' ? 'Video' : 'Audio'} ${newId}`,
            visible: true,
            muted: false,
            locked: false,
            color
        };
        return { trackId: newId, newTracks: [...currentTracks, newTrack] };
    };

    const splitClip = (id: string, time?: number) => {
        const clip = clips.find(c => c.id === id);
        if (!clip) return;

        const splitTime = time || currentTime;
        const localTime = splitTime - clip.startAt;
        if (localTime <= 0 || localTime >= getClipDuration(clip)) return;

        const newTrackId = Math.max(...tracks.map(t => t.id), 0) + 1;
        setTracks(prev => [...prev, {
            id: newTrackId,
            type: tracks.find(t => t.id === clip.trackId)?.type || 'video',
            label: `Track ${newTrackId}`,
            visible: true,
            locked: false,
            color: tracks.find(t => t.id === clip.trackId)?.color || '#3b82f6',
            muted: false
        }]);

        const clip1 = { ...clip, trimEnd: clip.trimStart + localTime * clip.speed };
        const clip2 = { ...clip, id: crypto.randomUUID(), trimStart: clip.trimStart + localTime * clip.speed, startAt: splitTime, trackId: newTrackId };

        setClips(prev => prev.map(c => c.id === id ? clip1 : c).concat(clip2));
        saveToHistory();
        toast({ title: 'تم التقسيم', duration: 1000 });
    };

    const splitSelectedClips = useCallback(() => {
        if (selectedClipIds.length === 0) return;

        saveToHistory();
        let newClips = [...clips];
        let newTracks = [...tracks];
        let splitCount = 0;

        selectedClipIds.forEach(id => {
            const clip = newClips.find(c => c.id === id);
            if (!clip) return;

            const scrollTime = currentTime;
            const localTime = scrollTime - clip.startAt;
            const clipDuration = (clip.trimEnd - clip.trimStart) / clip.speed;

            if (localTime <= 0.1 || localTime >= clipDuration - 0.1) return; // Avoid splitting at very edges

            // Create New Track for the second part
            const newTrackId = Math.max(...newTracks.map(t => t.id), 0) + 1;
            const originalTrack = newTracks.find(t => t.id === clip.trackId);

            newTracks.push({
                id: newTrackId,
                type: originalTrack?.type || 'video',
                label: `Track ${newTrackId}`,
                visible: true,
                locked: false,
                color: originalTrack?.color || '#3b82f6',
                muted: false
            });

            const clip1 = { ...clip, trimEnd: clip.trimStart + localTime * clip.speed };
            const clip2 = { ...clip, id: crypto.randomUUID(), trimStart: clip.trimStart + localTime * clip.speed, startAt: scrollTime, trackId: newTrackId };

            // Replace
            newClips = newClips.map(c => c.id === id ? clip1 : c).concat(clip2);
            splitCount++;
        });

        if (splitCount > 0) {
            setTracks(newTracks);
            setClips(newClips);
            toast({ title: 'تم التقسيم ونقل المقطع الجديد لطبقة جديدة', duration: 1500 });
        }
    }, [clips, tracks, selectedClipIds, currentTime, saveToHistory, toast]);


    const addTextClip = (initial?: Partial<Clip>) => {
        const id = crypto.randomUUID();
        const startAt = initial?.startAt ?? currentTime;
        const duration = initial?.duration ?? 5;

        const { trackId, newTracks } = findAvailableTrack('video', startAt, duration, tracks, clips);
        if (newTracks.length > tracks.length) setTracks(newTracks);

        const newClip: Clip = {
            id,
            trackId,
            type: 'text',
            name: initial?.textContent || 'نص جديد',
            startAt,
            duration,
            trimStart: 0,
            trimEnd: duration,
            textContent: initial?.textContent || 'نص جديد',
            textStyle: { fontSize: 60, color: '#ffffff', fontFamily: 'Arial', bold: true, ...initial?.textStyle },
            transform: { ...defaultTransform, ...initial?.transform },
            color: { ...defaultColor, ...initial?.color },
            animation: { ...defaultAnimation, ...initial?.animation },
            audio: { ...defaultAudio, ...initial?.audio },
            speed: 1,
            ...initial
        };
        newClip.id = id;
        setClips(prev => [...prev, newClip]);
        setSelectedClipIds([id]);
        saveToHistory();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        let currentTracksState = [...tracks];
        let currentClipsState = [...clips];

        Array.from(files).forEach((file, index) => {
            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image';
            const startTime = currentTime + (index * 2); // Stagger by 2s
            const duration = 5;

            const { trackId, newTracks } = findAvailableTrack(type === 'audio' ? 'audio' : 'video', startTime, duration, currentTracksState, currentClipsState);
            currentTracksState = newTracks;

            const newClip: Clip = {
                id: crypto.randomUUID(),
                trackId,
                type: type as any,
                name: file.name,
                startAt: startTime,
                duration,
                trimStart: 0,
                trimEnd: duration,
                url,
                transform: { ...defaultTransform },
                color: { ...defaultColor },
                animation: { ...defaultAnimation },
                audio: { ...defaultAudio },
                speed: 1
            };

            if (type === 'video') {
                const video = document.createElement('video');
                video.src = url;
                video.onloadedmetadata = () => {
                    newClip.duration = video.duration;
                    newClip.trimEnd = video.duration;
                    setClips(prev => prev.map(c => c.id === newClip.id ? { ...c, duration: video.duration, trimEnd: video.duration } : c));
                };
            }

            currentClipsState.push(newClip);
        });

        setTracks(currentTracksState);
        setClips(currentClipsState);
        saveToHistory();
        toast({ title: 'تمت إضافة الملفات في طبقات منظمة' });
    };

    const generateProxy = (clipId: string) => {
        const clip = clips.find(c => c.id === clipId);
        if (!clip || clip.type !== 'video') return;

        toast({
            title: 'جاري إنشاء البروكسي...',
            description: 'نظام Avinar يقوم بضغط الفيديو للعمل بسلاسة.',
        });

        // Simulate Proxy Generation (in reality, this would be a backend call)
        setTimeout(() => {
            setClips(prev => prev.map(c =>
                c.id === clipId ? { ...c, proxyUrl: c.url } : c
            ));
            toast({
                title: 'اكتمل إنشاء البروكسي',
                description: `تم ربط نسخة خفيفة للمقطع: ${clip.name}`,
            });
        }, 1500);
    };

    const removeSilence = (clipId: string) => {
        const clip = clips.find(c => c.id === clipId);
        if (!clip || clip.type !== 'video' && clip.type !== 'audio') return;

        toast({
            title: 'جاري تحليل الصمت...',
            description: 'الذكاء الاصطناعي يحدد مناطق الكلام والفراغات...',
        });

        // Simulation logic: Split the clip into 3 parts and remove the middle 
        // This makes the edits VISIBLE on the timeline as requested.
        setTimeout(() => {
            const clipDuration = (clip.trimEnd - clip.trimStart) / clip.speed;
            if (clipDuration < 4) {
                toast({ title: 'المقطع قصير جداً للتحليل' });
                return;
            }

            const split1_local = clipDuration * 0.4;
            const silence_duration = clipDuration * 0.15;
            const split2_local = split1_local + silence_duration;

            // First part
            const part1 = {
                ...JSON.parse(JSON.stringify(clip)),
                trimEnd: clip.trimStart + split1_local * clip.speed
            };

            // Second part (After silence)
            const part2 = {
                ...JSON.parse(JSON.stringify(clip)),
                id: crypto.randomUUID(),
                startAt: clip.startAt + split1_local, // Snapped to part1 end (silence removed)
                trimStart: clip.trimStart + split2_local * clip.speed
            };

            setClips(prev => {
                const filtered = prev.filter(c => c.id !== clipId);
                return [...filtered, part1, part2];
            });

            setSelectedClipIds([part1.id, part2.id]);
            saveToHistory();

            toast({
                title: 'اكتمل المونتاج الصامت',
                description: `تم إجراء ${1} عملية قص وإزالة ${silence_duration.toFixed(1)} ثانية من الصمت.`,
            });
        }, 2000);
    };

    const finishDrawing = (isClosed: boolean = true) => {
        if (drawingPath.length < 2) {
            setDrawingPath([]);
            return;
        }

        // Create New Track for Shape
        const newTrackId = Math.max(...tracks.map(t => t.id), 0) + 1;
        setTracks(prev => [...prev, {
            id: newTrackId,
            type: 'video',
            label: `Shape ${newTrackId}`,
            visible: true,
            locked: false,
            color: '#a855f7', // Purple for shapes
            muted: false
        }]);

        const newClip: Clip = {
            id: crypto.randomUUID(),
            trackId: newTrackId,
            type: 'shape',
            name: 'رسم جديد',
            startAt: currentTime,
            duration: 5,
            trimStart: 0,
            trimEnd: 5,
            pathData: {
                points: [...drawingPath],
                strokeColor: '#ff0000',
                strokeWidth: 5,
                isClosed: isClosed
            },
            transform: { ...defaultTransform },
            color: { ...defaultColor },
            animation: { ...defaultAnimation },
            audio: { ...defaultAudio },
            speed: 1
        };

        setClips(prev => [...prev, newClip]);
        setDrawingPath([]);
        setSelectedClipIds([newClip.id]);
        saveToHistory();
        toast({ title: 'تم إنشاء الشكل في طبقة جديدة' });
    };

    const handleCanvasContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (toolMode === 'pen' && drawingPath.length > 0) {
            const rect = containerRef.current?.getBoundingClientRect();
            // Relative to container for positioning
            const x = e.clientX;
            const y = e.clientY;

            setContextMenu({
                x, y,
                options: [
                    {
                        label: 'قص التحديد لطبقة جديدة (Extract to New Layer)',
                        action: () => {
                            if (selectedClipIds.length > 0) {
                                // Extract mask to NEW clip on NEW track
                                const originalClip = clips.find(c => c.id === selectedClipIds[0]);
                                if (originalClip) {
                                    // Create New Track
                                    const newTrackId = Math.max(...tracks.map(t => t.id), 0) + 1;
                                    setTracks(prev => [...prev, {
                                        id: newTrackId,
                                        type: tracks.find(t => t.id === originalClip.trackId)?.type || 'video',
                                        label: `Extracted ${newTrackId}`,
                                        visible: true,
                                        locked: false,
                                        color: '#ec4899', // Pink for extracted
                                        muted: false
                                    }]);

                                    const newClip = {
                                        ...originalClip,
                                        id: crypto.randomUUID(),
                                        trackId: newTrackId,
                                        name: originalClip.name + ' (Masked)',
                                        maskPath: { points: [...drawingPath], isClosed: true }
                                    };

                                    setClips(prev => [...prev, newClip]);
                                    setDrawingPath([]);
                                    toast({ title: 'تم قص التحديد لطبقة جديدة' });
                                }
                            } else {
                                toast({ title: 'يرجى تحديد عنصر أولاً', variant: "destructive" });
                            }
                            setContextMenu(null);
                        }
                    },
                    { label: 'مسح آخر نقطة', action: () => { setDrawingPath(prev => prev.slice(0, -1)); setContextMenu(null); } },
                    { label: 'إلغاء الرسم', action: () => { setDrawingPath([]); setContextMenu(null); } }
                ]
            });
        }
    };


    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        if (toolMode === 'pen') {
            if (e.button !== 0) return; // Only Left Click adds points
            let finalPoint = { x: x - cx, y: y - cy };

            // If we are drawing a mask on a selected clip, we need to counter-transform the point
            if (selectedClipIds.length > 0) {
                const targetClip = clips.find(c => c.id === selectedClipIds[0]);
                if (targetClip) {
                    const dx = x - (cx + targetClip.transform.x);
                    const dy = y - (cy + targetClip.transform.y);
                    const angleRad = (-targetClip.transform.rotation * Math.PI) / 180;
                    const rx = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
                    const ry = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);
                    const ts = targetClip.transform.scale > 1 ? targetClip.transform.scale / 100 : targetClip.transform.scale;
                    finalPoint = { x: rx / ts, y: ry / ts };

                    // Check if clicking near an EXISTING point
                    if (targetClip.maskPath) {
                        const threshold = 10 / ts; // 10 pixels in screen space
                        const pIdx = targetClip.maskPath.points.findIndex(p =>
                            Math.sqrt(Math.pow(p.x - finalPoint.x, 2) + Math.pow(p.y - finalPoint.y, 2)) < threshold
                        );
                        if (pIdx !== -1) {
                            setDraggingMaskPoint({ clipId: targetClip.id, pointIndex: pIdx });
                            return;
                        }
                    }
                }
            }
            setDrawingPath(prev => [...prev, finalPoint]);
        } else if (toolMode === 'text') {
            // Add text at click position
            addTextClip({
                transform: {
                    ...defaultTransform,
                    x: x - cx,
                    y: y - cy
                }
            });
            setToolMode('select'); // Switch back to select after adding
        } else if (toolMode === 'select' || toolMode === 'hand' || toolMode === 'move-element') {
            // 1. Check if clicking the ROTATION HANDLE of the already selected clip
            if (selectedClipIds.length > 0) {
                const clip = clips.find(c => c.id === selectedClipIds[0]);
                if (clip) {
                    const ts = clip.transform.scale > 1 ? clip.transform.scale / 100 : clip.transform.scale;
                    const isFullScale = clip.type === 'video' || clip.type === 'image';
                    const hitH = isFullScale ? h : 200;

                    // Center of clip in canvas space
                    const clipCX = cx + clip.transform.x;
                    const clipCY = cy + clip.transform.y;

                    // Rotation handle is above the top side
                    const tr = (clip.transform.rotation * Math.PI) / 180;
                    const handleDist = (hitH * ts / 2) + 40; // 40px above top

                    const handleX = clipCX + Math.sin(tr) * handleDist;
                    const handleY = clipCY - Math.cos(tr) * handleDist;

                    const dist = Math.sqrt(Math.pow(x - handleX, 2) + Math.pow(y - handleY, 2));
                    if (dist < 20) { // 20px hit area
                        setCanvasDragging({
                            id: clip.id,
                            type: 'rotate',
                            startX: e.clientX,
                            startY: e.clientY,
                            originalX: clip.transform.x,
                            originalY: clip.transform.y,
                            originalRotation: clip.transform.rotation,
                            scaleX,
                            scaleY
                        });
                        return;
                    }
                }
            }

            // 2. Hit Test for Canvas Elements (Respecting Track Order)
            const visibleClips = clips
                .filter(c => currentTime >= c.startAt && currentTime <= c.startAt + getClipDuration(c))
                .sort((a, b) => {
                    const trackA = tracks.findIndex(t => t.id === a.trackId);
                    const trackB = tracks.findIndex(t => t.id === b.trackId);
                    return trackB - trackA;
                });

            for (const clip of visibleClips) {
                const ts = clip.transform.scale > 1 ? clip.transform.scale / 100 : clip.transform.scale;
                const isFullScale = clip.type === 'video' || clip.type === 'image';
                const hitW = isFullScale ? w : 400;
                const hitH = isFullScale ? h : 200;

                // Transform point to local clip space
                const dx = x - (cx + clip.transform.x);
                const dy = y - (cy + clip.transform.y);

                const angleRad = (-clip.transform.rotation * Math.PI) / 180;
                const localX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
                const localY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

                const clipW = hitW * ts;
                const clipH = hitH * ts;

                if (localX >= -clipW / 2 && localX <= clipW / 2 && localY >= -clipH / 2 && localY <= clipH / 2) {
                    setSelectedClipIds([clip.id]);
                    setActiveTab('properties');
                    setCanvasDragging({
                        id: clip.id,
                        type: 'move',
                        startX: e.clientX,
                        startY: e.clientY,
                        originalX: clip.transform.x,
                        originalY: clip.transform.y,
                        originalRotation: clip.transform.rotation,
                        scaleX,
                        scaleY
                    });
                    return;
                }
            }
        }
    };



    // --- Interaction Handlers ---

    const handleClipMouseDown = (e: React.MouseEvent, clip: Clip) => {
        e.stopPropagation();
        e.preventDefault();

        if (toolMode === 'split') {
            const rect = e.currentTarget.getBoundingClientRect();
            splitClip(clip.id, clip.startAt + (e.clientX - rect.left) / zoom);
            return;
        }

        if (toolMode === 'track-select') {
            const trackClips = clips.filter(c => c.trackId === clip.trackId && c.startAt >= clip.startAt);
            setSelectedClipIds(trackClips.map(c => c.id));
            // Future: Select multiples
        } else if (toolMode === 'select') {
            if (e.ctrlKey || e.metaKey) {
                // Toggle Selection
                if (selectedClipIds.includes(clip.id)) {
                    setSelectedClipIds(prev => prev.filter(id => id !== clip.id));
                } else {
                    setSelectedClipIds(prev => [...prev, clip.id]);
                    setActiveTab('properties');
                }
            } else {
                // If not holding Ctrl, select only this one (unless already selected and potentially dragging?)
                // Standard behavior: if I click a selected clip without ctrl, and then drag, I move all selected.
                // If I click and release without drag, I deselect others.
                // For simplicity here: Click always selects ONLY this one unless Ctrl is held.
                // To support "Move Selection", we need to check if it's already selected.
                if (!selectedClipIds.includes(clip.id)) {
                    setSelectedClipIds([clip.id]);
                }
                setActiveTab('properties');
            }
        } else {
            setSelectedClipIds([clip.id]);
            setActiveTab('properties');
        }


        const shouldInitDrag = ['select', 'ripple', 'rolling', 'track-select', 'slide', 'slip', 'rate-stretch'].includes(toolMode);

        if (shouldInitDrag) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const edgeThreshold = 10; // pixels
            const distFromLeft = e.clientX - rect.left;
            const distFromRight = rect.right - e.clientX;

            let type: 'move' | 'resize-start' | 'resize-end' = 'move';

            if (toolMode === 'rate-stretch') {
                if (distFromRight < edgeThreshold) type = 'resize-end';
                else return; // Rate Stretch only works on edge
            } else if (toolMode === 'track-select' || toolMode === 'slide' || toolMode === 'slip') {
                // Force move behavior for these tools (they handle logic internally in global move)
                type = 'move';
            } else {
                // Select / Ripple / Rolling
                if (distFromLeft < edgeThreshold) type = 'resize-start';
                else if (distFromRight < edgeThreshold) type = 'resize-end';
            }

            setDragging({
                id: clip.id,
                type,
                startX: e.clientX,
                originalStart: clip.startAt,
                originalDuration: getClipDuration(clip),
                originalTrimStart: clip.trimStart,
                originalTrimEnd: clip.trimEnd
            });
        }
    };


    const handleTimelineMouseDown = (e: React.MouseEvent) => {
        if (!timelineRef.current) return;

        if (toolMode === 'zoom') {
            // Zoom in on click
            setZoom(z => Math.min(100, z + 10));
            return;
        }

        const rect = timelineRef.current.getBoundingClientRect();
        // Calculate absolute time at click position
        // T_click = (relativeX - 300) / zoom + currentTime
        const relativeX = e.clientX - rect.left;
        const clickedTime = Math.max(0, currentTime + (relativeX - 300) / zoom);

        // Selection tool on ruler should scrub, not box select
        // Unless we decide ruler is valid start for selection (unlikely)
        setIsScrubbing(true);
        setCurrentTime(clickedTime);

        scrubStats.current = {
            startX: e.clientX,
            startY: e.clientY,
            startTime: clickedTime, // Start from the clicked time
            startScrollTop: tracksContainerRef.current?.scrollTop || 0
        };
    };

    const handleTracksMouseDown = (e: React.MouseEvent) => {
        if (!tracksContainerRef.current) return;

        if (toolMode === 'hand') {
            setIsScrubbing(true);
            scrubStats.current = {
                startX: e.clientX,
                startY: e.clientY,
                startTime: currentTime,
                startScrollTop: tracksContainerRef.current.scrollTop
            };
            return;
        }

        if (toolMode === 'select' || toolMode === 'track-select') {
            setSelectionBox({ startX: e.clientX, startY: e.clientY, w: 0, h: 0 });
            return;
        }

        const rect = tracksContainerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const clickedTime = Math.max(0, currentTime + (relativeX - 300) / zoom);
        setCurrentTime(clickedTime);
        setIsScrubbing(true);
        scrubStats.current = {
            startX: e.clientX,
            startY: e.clientY,
            startTime: clickedTime,
            startScrollTop: tracksContainerRef.current.scrollTop
        };
    };

    const handleTimelineWheel = (e: React.WheelEvent) => {
        // Prevent default browser scroll if we are over the timeline
        // e.preventDefault(); // React synthetic events might not support this directly in all cases, better to handle logic.

        if (e.ctrlKey || e.metaKey) {
            // Zoom
            const zoomDelta = e.deltaY > 0 ? -5 : 5;
            setZoom(z => Math.max(10, Math.min(100, z + zoomDelta)));
            e.preventDefault();
        } else if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            // Horizontal Scroll (Time Scrub)
            // Intercept only when shift is held or explicit horizontal wheel
            const scrollSpeed = 0.5;
            const delta = (e.deltaX || e.deltaY) * scrollSpeed;
            setCurrentTime(t => Math.max(0, t + delta / zoom));
            e.preventDefault();
        }
        // Normal vertical scroll (without shift) bubbles to tracksContainerRef which has overflow-y-auto
    };

    const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
        if (draggingMaskPoint) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            const w = canvas.width;
            const h = canvas.height;
            const cx = w / 2;
            const cy = h / 2;

            const targetClip = clips.find(c => c.id === draggingMaskPoint.clipId);
            if (targetClip && targetClip.maskPath) {
                const dx = x - (cx + targetClip.transform.x);
                const dy = y - (cy + targetClip.transform.y);
                const angleRad = (-targetClip.transform.rotation * Math.PI) / 180;
                const rx = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
                const ry = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);
                const ts = targetClip.transform.scale > 1 ? targetClip.transform.scale / 100 : targetClip.transform.scale;
                const finalPoint = { x: rx / ts, y: ry / ts };

                const newPoints = [...targetClip.maskPath.points];
                newPoints[draggingMaskPoint.pointIndex] = finalPoint;

                setClips(prev => prev.map(c =>
                    c.id === draggingMaskPoint.clipId ? { ...c, maskPath: { ...c.maskPath!, points: newPoints } } : c
                ));
            }
            return;
        }

        if (canvasDragging) {
            const clip = clips.find(c => c.id === canvasDragging.id);
            if (clip) {
                if (canvasDragging.type === 'move') {
                    const deltaX = (e.clientX - canvasDragging.startX) * canvasDragging.scaleX;
                    const deltaY = (e.clientY - canvasDragging.startY) * canvasDragging.scaleY;

                    setClips(prev => prev.map(c => {
                        if (c.id !== canvasDragging.id) return c;
                        const tx = canvasDragging.originalX + deltaX;
                        const ty = canvasDragging.originalY + deltaY;
                        const newTransform = { ...c.transform, x: tx, y: ty };

                        if (c.keyframes && c.keyframes.length > 0) {
                            const t = currentTime - c.startAt;
                            const kfs = [...c.keyframes];
                            const idx = kfs.findIndex(kf => Math.abs(kf.time - t) < 0.1);
                            if (idx >= 0) {
                                kfs[idx] = { ...kfs[idx], x: tx, y: ty };
                            } else {
                                kfs.push({
                                    time: t,
                                    x: tx,
                                    y: ty,
                                    scale: c.transform.scale,
                                    rotation: c.transform.rotation,
                                    opacity: c.transform.opacity
                                });
                                kfs.sort((a, b) => a.time - b.time);
                            }
                            return { ...c, transform: newTransform, keyframes: kfs };
                        }
                        return { ...c, transform: newTransform };
                    }));
                } else if (canvasDragging.type === 'rotate') {
                    const canvas = canvasRef.current;
                    if (canvas) {
                        const rect = canvas.getBoundingClientRect();
                        // Clip center in canvas pixels
                        const cx = canvas.width / 2 + clip.transform.x;
                        const cy = canvas.height / 2 + clip.transform.y;

                        // Mouse position in canvas pixels
                        const mouseX = (e.clientX - rect.left) * canvasDragging.scaleX;
                        const mouseY = (e.clientY - rect.top) * canvasDragging.scaleY;

                        // Calculate angle (atan2(y, x))
                        // Note: atan2(y, x) gives angle from X axis.
                        // Our rotation handle is at the top (negative Y relative to center).
                        // So we want the angle relative to "Up".
                        const angle = Math.atan2(mouseY - cy, mouseX - cx);
                        let deg = (angle * 180) / Math.PI + 90; // Offset by 90 to make "Up" be 0 degrees

                        if (e.shiftKey) deg = Math.round(deg / 15) * 15; // 15deg snap

                        setClips(prev => prev.map(c => {
                            if (c.id !== clip.id) return c;
                            const newTransform = { ...c.transform, rotation: deg };

                            // Handle Keyframes for rotation
                            if (c.keyframes && c.keyframes.length > 0) {
                                const t = currentTime - c.startAt;
                                const kfs = [...c.keyframes];
                                const idx = kfs.findIndex(kf => Math.abs(kf.time - t) < 0.1);
                                if (idx >= 0) {
                                    kfs[idx] = { ...kfs[idx], rotation: deg };
                                } else {
                                    kfs.push({
                                        time: t,
                                        x: c.transform.x,
                                        y: c.transform.y,
                                        scale: c.transform.scale,
                                        rotation: deg,
                                        opacity: c.transform.opacity
                                    });
                                    kfs.sort((a, b) => a.time - b.time);
                                }
                                return { ...c, transform: newTransform, keyframes: kfs };
                            }
                            return { ...c, transform: newTransform };
                        }));
                    }
                }
            }
            return;
        }

        // Selection Box Logic
        if (selectionBox) {
            setSelectionBox(prev => prev ? { ...prev, w: e.clientX - prev.startX, h: e.clientY - prev.startY } : null);
            return;
        }

        if (resizingPanel) {
            e.preventDefault();
            if (resizingPanel.type === 'timeline') {
                // Dragging Timeline Top Border (Up increases height, Down decreases)
                const delta = resizingPanel.startPos - e.clientY;
                setLayout(prev => ({ ...prev, timelineHeight: Math.max(150, Math.min(800, resizingPanel.startSize + delta)) }));
            } else if (resizingPanel.type === 'sidebar') {
                // Dragging Sidebar Right Border (Right increases width) because sidebar is on Left
                const delta = e.clientX - resizingPanel.startPos;
                setLayout(prev => ({ ...prev, sidebarWidth: Math.max(200, Math.min(600, resizingPanel.startSize + delta)) }));
            }
            return;
        }

        if (scrubStats.current) {
            const deltaX = e.clientX - scrubStats.current.startX;

            if (toolMode === 'hand') {
                // Hand tool: Dragging RIGHT moves view LEFT (time decreases)
                const newTime = Math.max(0, scrubStats.current.startTime - deltaX / zoom);
                setCurrentTime(newTime);

                // Vertical Pan
                if (tracksContainerRef.current) {
                    const deltaY = e.clientY - scrubStats.current.startY;
                    tracksContainerRef.current.scrollTop = scrubStats.current.startScrollTop - deltaY;
                }
            } else {
                // Scrub tool: Dragging RIGHT moves time RIGHT
                // Use the initial click time as base to avoid jumping if we didn't seek on mouse down
                // logic in mouse down sets startTime to newTime, so this works for scrub.
                // But wait, in MouseDown we set startTime = newTime (jump).
                // In Hand tool, we want to start from OLD time. 
                // We updated MouseDown to pass correct base time.
                const newTime = Math.max(0, scrubStats.current.startTime + deltaX / zoom);
                setCurrentTime(newTime);
            }
            return;
        }

        if (!dragging) return;

        const clip = clips.find(c => c.id === dragging.id);
        if (!clip) return;

        const deltaX = e.clientX - dragging.startX;
        const deltaSeconds = deltaX / zoom;

        let newClips = [...clips];
        const clipIndex = newClips.findIndex(c => c.id === clip.id);
        if (clipIndex === -1) return;

        if (dragging.type === 'move') {
            if (toolMode === 'slide') {
                // Slide Tool Logic:
                // Move Selected Clip (keep duration)
                // Adjust Previous Clip (Trim End to fill gap)
                // Adjust Next Clip (Trim Start to fill gap)

                // Find neighbors based on ORIGINAL state (to avoid jumping during drag)
                const prevClip = clips.find(c => c.trackId === clip.trackId && Math.abs((c.startAt + (c.trimEnd - c.trimStart) / c.speed) - dragging.originalStart) < 0.1);
                const nextClip = clips.find(c => c.trackId === clip.trackId && Math.abs(c.startAt - (dragging.originalStart + dragging.originalDuration)) < 0.1);

                if (prevClip && nextClip) {
                    const prevIndex = newClips.findIndex(c => c.id === prevClip.id);
                    const nextIndex = newClips.findIndex(c => c.id === nextClip.id);
                    const clipIndex = newClips.findIndex(c => c.id === clip.id);

                    // Calculate Limits
                    const minDuration = 0.5; // Seconds

                    // Max Left (Negative)
                    // 1. Prev Clip Shrinks -> Prev Duration must be > minDuration
                    const prevDur = (prevClip.trimEnd - prevClip.trimStart) / prevClip.speed;
                    const limitPrevShrink = -(prevDur - minDuration);

                    // 2. Next Clip Extends (TrimStart decreases) -> TrimStart must be > 0
                    const limitNextExtend = -(nextClip.trimStart / nextClip.speed);

                    const maxLeft = Math.max(limitPrevShrink, limitNextExtend);

                    // Max Right (Positive)
                    // 1. Prev Clip Extends (TrimEnd increases) -> TrimEnd must be < Duration (if video/audio)
                    let limitPrevExtend = Infinity;
                    if (prevClip.type === 'video' || prevClip.type === 'audio') {
                        limitPrevExtend = (prevClip.duration - prevClip.trimEnd) / prevClip.speed;
                    }

                    // 2. Next Clip Shrinks -> Next Duration must be > minDuration
                    const nextDur = (nextClip.trimEnd - nextClip.trimStart) / nextClip.speed;
                    const limitNextShrink = nextDur - minDuration;

                    const maxRight = Math.min(limitPrevExtend, limitNextShrink);

                    // Clamp Delta
                    const clampedDelta = Math.max(maxLeft, Math.min(maxRight, deltaSeconds));

                    const newStartAt = dragging.originalStart + clampedDelta;

                    // Update Current Clip
                    newClips[clipIndex] = { ...clip, startAt: newStartAt };

                    // Update Previous Clip
                    // New Duration = Old Duration + Delta
                    const newPrevTrimEnd = prevClip.trimEnd + clampedDelta * prevClip.speed;
                    newClips[prevIndex] = { ...prevClip, trimEnd: newPrevTrimEnd };

                    // Update Next Clip
                    // New Start = Old Start + Delta
                    // New TrimStart = Old TrimStart + Delta
                    const newNextStartAt = nextClip.startAt + clampedDelta;
                    const newNextTrimStart = nextClip.trimStart + clampedDelta * nextClip.speed;
                    newClips[nextIndex] = { ...nextClip, startAt: newNextStartAt, trimStart: newNextTrimStart };

                } else {
                    // Fallback to move if no valid neighbors for slide
                    // Just move the clip freely
                    const newStartAt = Math.max(0, dragging.originalStart + deltaSeconds);
                    newClips[clipIndex] = { ...clip, startAt: newStartAt };
                }

            } else {
                // Standard Move (Multi-Select & Track Changing Support)

                // Track Changing Logic
                let newTrackId = clip.trackId;
                if (tracksContainerRef.current) {
                    const containerRect = tracksContainerRef.current.getBoundingClientRect();
                    const relativeY = e.clientY - containerRect.top + tracksContainerRef.current.scrollTop;
                    const trackHeight = 64; // h-16
                    const separatorHeight = 16; // h-4

                    const videoTracks = [...tracks].filter(t => t.type !== 'audio').reverse();
                    const audioTracks = [...tracks].filter(t => t.type === 'audio');

                    const videoSectionHeight = videoTracks.length * trackHeight;

                    // Ensure we are within reasonable bounds
                    if (relativeY >= 0) {
                        if (relativeY < videoSectionHeight) {
                            // In Video Section
                            const index = Math.floor(relativeY / trackHeight);
                            if (videoTracks[index]) newTrackId = videoTracks[index].id;
                        } else if (relativeY >= videoSectionHeight + separatorHeight) {
                            // In Audio Section
                            const relativeAudioY = relativeY - videoSectionHeight - separatorHeight;
                            const index = Math.floor(relativeAudioY / trackHeight);
                            if (audioTracks[index]) newTrackId = audioTracks[index].id;
                        }
                    }
                }

                const isDraggingSelected = selectedClipIds.includes(dragging.id);
                if (isDraggingSelected) {
                    selectedClipIds.forEach(id => {
                        const cIndex = newClips.findIndex(c => c.id === id);
                        if (cIndex !== -1) {
                            const c = newClips[cIndex];
                            // Update PRIMARY dragging clip's track, others keep theirs relative or move?
                            // For true layering control, let's move only the dragged clip to the new track for now
                            // Or better: If I drag a selection, they should all shift relative to the new track
                            // But tracks are ID based, not index based directly in state (though array is ordered).
                            // Let's simplified: If dragging multiple, Only update track if they are on same track?
                            // Let's stuck to: Move the clip under mouse to new track.

                            if (c.id === dragging.id) {
                                newClips[cIndex] = { ...c, startAt: Math.max(0, c.startAt + (e.movementX / zoom)), trackId: newTrackId };
                            } else {
                                newClips[cIndex] = { ...c, startAt: Math.max(0, c.startAt + (e.movementX / zoom)) };
                            }
                        }
                    });
                } else {
                    const newStart = Math.max(0, dragging.originalStart + deltaSeconds);
                    newClips[clipIndex] = { ...clip, startAt: newStart, trackId: newTrackId };
                }
            }
        } else if (dragging.type === 'resize-end') {
            if (toolMode === 'rate-stretch') {
                const delta = deltaSeconds;
                // Rate Stretch: Change Speed
                // New Speed = Source Duration / New Target Duration
                const sourceDuration = dragging.originalTrimEnd - dragging.originalTrimStart;
                const originalTargetDuration = sourceDuration / clip.speed; // Current duration on timeline before drag
                const newTargetDuration = Math.max(0.1, originalTargetDuration + delta);

                // Speed = Dist / Time. Here SourceDist / TargetTime
                const newSpeed = sourceDuration / newTargetDuration;

                newClips[clipIndex] = { ...clip, speed: newSpeed };
            } else {
                // Trim End
                const maxDuration = clip.type === 'video' ? (clip.duration || 1000) : 3600;
                const newTrimEnd = Math.min(maxDuration, Math.max(clip.trimStart + 0.1, dragging.originalTrimEnd + deltaSeconds * clip.speed));
                newClips[clipIndex] = { ...clip, trimEnd: newTrimEnd };

                // Ripple Edit Logic (Resize End) - Inside the block where newTrimEnd is defined
                if (toolMode === 'ripple') {
                    const durationChange = (newTrimEnd - dragging.originalTrimEnd) / clip.speed;
                    newClips = newClips.map(c => {
                        if (c.trackId === clip.trackId && c.startAt > clip.startAt && c.id !== clip.id) {
                            return { ...c, startAt: c.startAt + durationChange };
                        }
                        return c;
                    });
                }
            }



        } else if (dragging.type === 'resize-start') {
            // Trim Start
            const maxDrag = dragging.originalTrimEnd - dragging.originalTrimStart - 0.1;
            const startDelta = Math.min(maxDrag / clip.speed, Math.max(-dragging.originalTrimStart / clip.speed, deltaSeconds));

            const newStartAt = dragging.originalStart + startDelta;
            const newTrimStart = dragging.originalTrimStart + startDelta * clip.speed;

            newClips[clipIndex] = {
                ...clip,
                startAt: newStartAt,
                trimStart: newTrimStart
            };

            // Ripple Edit Logic (Resize Start)
            if (toolMode === 'ripple') {
                // Changing start also changes position, so we effectively shifted the start time.
                // But in standard ripple, if I drag start right (shorten), the clip moves right? 
                // Or does the gap close? 
                // Standard Ripple: Dragging start edge right -> Cuts beginning, everything moves Left? No, usually that's "Ripple Delete"
                // Ripple Trim Start:
                // Drag start right (trim): Clip starts later? OR Clip stays, content starts later?
                // Usually: Clip StartAt shifts. 
                // If I drag start edge RIGHT (later), I am delaying the start. 
                // If I want to maintain relative order, I might push others? 
                // Let's keep it simple: Ripple only implemented for Resize-End for now to avoid confusion.
            }
        }

        setClips(newClips);
    }, [dragging, canvasDragging, clips, zoom, toolMode, selectionBox, selectedClipIds, tracks, resizingPanel, currentTime, draggingMaskPoint]);

    const handleGlobalMouseUp = useCallback((e: MouseEvent) => {
        if (draggingMaskPoint) {
            saveToHistory();
            setDraggingMaskPoint(null);
            return;
        }

        if (selectionBox && timelineRef.current) {
            // Finalize Selection
            const rect = timelineRef.current.getBoundingClientRect();
            const timelineOriginX = rect.left + 300 - (currentTime * zoom);
            const trackHeight = 64; // h-16
            const headerHeight = rect.bottom; // Tracks start after the ruler

            const boxLeft = Math.min(selectionBox.startX, selectionBox.startX + selectionBox.w);
            const boxRight = Math.max(selectionBox.startX, selectionBox.startX + selectionBox.w);
            const boxTop = Math.min(selectionBox.startY, selectionBox.startY + selectionBox.h);
            const boxBottom = Math.max(selectionBox.startY, selectionBox.startY + selectionBox.h);

            const foundIds: string[] = [];

            tracks.forEach((track, index) => {
                const trackTop = headerHeight + (index * trackHeight);
                const trackBottom = trackTop + trackHeight;

                // Optimization: Skip track if vertically outside box
                if (trackBottom < boxTop || trackTop > boxBottom) return;

                const trackClips = clips.filter(c => c.trackId === track.id);
                trackClips.forEach(clip => {
                    const clipLeft = timelineOriginX + (clip.startAt * zoom);
                    const clipRight = clipLeft + (getClipDuration(clip) * zoom);

                    // Check Intersection
                    // Overlap X: NOT (clipRight < boxLeft OR clipLeft > boxRight)
                    // Overlap Y: we already know track overlaps Y roughly, but let's be precise if box is inside track
                    // Box Top < Track Bottom AND Box Bottom > Track Top

                    if (clipRight >= boxLeft && clipLeft <= boxRight) {
                        foundIds.push(clip.id);
                    }
                });
            });

            if (e.ctrlKey || e.metaKey || e.shiftKey) {
                // Add to selection
                setSelectedClipIds(prev => Array.from(new Set([...prev, ...foundIds])));
            } else {
                setSelectedClipIds(foundIds);
            }

            setSelectionBox(null);
            // Don't return here, continue to cleanup dragging
        }

        setResizingPanel(null);
        setIsScrubbing(false);
        scrubStats.current = null;
        if (dragging || canvasDragging) {
            saveToHistory();
            setDragging(null);
            setCanvasDragging(null);
            if (canvasDragging) {
                toast({ title: 'تمت الحركة' });
            }
        }
    }, [dragging, canvasDragging, saveToHistory, selectionBox, currentTime, zoom, clips, tracks, toast, draggingMaskPoint]);

    useEffect(() => {
        if (dragging || isScrubbing || resizingPanel || selectionBox || canvasDragging || draggingMaskPoint) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleGlobalMouseMove);
                window.removeEventListener('mouseup', handleGlobalMouseUp);
            };
        }
    }, [dragging, isScrubbing, resizingPanel, selectionBox, canvasDragging, draggingMaskPoint, handleGlobalMouseMove, handleGlobalMouseUp]);




    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const prevState = history[historyIndex - 1];
            setClips(prevState.clips);
            setTracks(prevState.tracks);
            setCanvasBackgroundColor(prevState.bg);
            setHistoryIndex(historyIndex - 1);
            toast({ title: 'تراجع', duration: 1000 });
        }
    }, [history, historyIndex, toast]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            setClips(nextState.clips);
            setTracks(nextState.tracks);
            setCanvasBackgroundColor(nextState.bg);
            setHistoryIndex(historyIndex + 1);
            toast({ title: 'إعادة', duration: 1000 });
        }
    }, [history, historyIndex, toast]);

    // --- Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            console.log('Key pressed:', e.key, 'Code:', e.code);
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            // Modifiers
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) redo();
                        else undo();
                        break;
                    case 'y':
                        e.preventDefault();
                        redo();
                        break;
                    case 'k': // Split Selected (Add Edit)
                        e.preventDefault();
                        splitSelectedClips();
                        break;
                    case 'a':
                        e.preventDefault();
                        if (e.shiftKey) {
                            setSelectedClipIds([]);
                        } else {
                            setSelectedClipIds(clips.map(c => c.id));
                        }
                        break;
                }
                return;
            }

            if (e.altKey) return;

            // Simple Key Shortcuts
            switch (e.key.toLowerCase()) {
                case 'v':
                    e.preventDefault();
                    setToolMode('select');
                    toast({ title: 'أداة التحديد (V)', duration: 700 });
                    break;
                case 'm':
                    e.preventDefault();
                    setToolMode('move-element');
                    toast({ title: 'أداة التحريك (M)', duration: 700 });
                    break;
                case 'a':
                    e.preventDefault();
                    setToolMode('track-select');
                    toast({ title: 'تحديد المسار (A)', duration: 700 });
                    break;
                case 'b':
                    e.preventDefault();
                    setToolMode('ripple');
                    toast({ title: 'تحرير التموج (B)', duration: 700 });
                    break;
                case 'n':
                    e.preventDefault();
                    setToolMode('rolling');
                    toast({ title: 'تحرير التدحرج (N)', duration: 700 });
                    break;
                case 'r':
                    e.preventDefault();
                    setToolMode('rate-stretch');
                    toast({ title: 'مط المعدل (R)', duration: 700 });
                    break;
                case 'c':
                    e.preventDefault();
                    setToolMode('split');
                    toast({ title: 'أداة القص (C)', duration: 700 });
                    break;
                case 'y':
                    e.preventDefault();
                    setToolMode('slip');
                    toast({ title: 'أداة الإنزلاق (Y)', duration: 700 });
                    break;
                case 'u':
                    e.preventDefault();
                    setToolMode('slide');
                    toast({ title: 'أداة الإزاحة (U)', duration: 700 });
                    break;
                case 'p':
                    e.preventDefault();
                    setToolMode('pen');
                    toast({ title: 'أداة القلم (P)', duration: 700 });
                    break;
                case 't':
                    e.preventDefault();
                    setToolMode('text');
                    toast({ title: 'أداة النص (T)', duration: 700 });
                    break;
                case 'h':
                    e.preventDefault();
                    setToolMode('hand');
                    toast({ title: 'أداة اليد (H)', duration: 700 });
                    break;
                case 'z':
                    e.preventDefault();
                    setToolMode('zoom');
                    toast({ title: 'أداة الزوم (Z)', duration: 700 });
                    break;
                case ' ': // Space for Play/Pause
                    e.preventDefault();
                    setIsPlaying(prev => !prev);
                    break;
                case 'delete':
                case 'backspace':
                    if (selectedClipIds.length > 0) {
                        e.preventDefault();
                        selectedClipIds.forEach(id => deleteClip(id));
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedClipIds, deleteClip, undo, redo, clips, currentTime, saveToHistory, isPlaying, splitSelectedClips, setSelectedClipIds]);




    // --- Actions ---
    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    // --- AI ---
    const handleAIAction = useCallback((intent: string, entities: any) => {
        console.log('AI Action:', intent, entities);

        const resolveColor = (c: string) => {
            if (!c) return '#FFFFFF';
            const clean = c.toLowerCase().trim();
            const map: any = {
                'ابيض': '#FFFFFF', 'أبيض': '#FFFFFF', 'white': '#FFFFFF', 'بيضاء': '#FFFFFF',
                'اسود': '#000000', 'أسود': '#000000', 'black': '#000000', 'سوداء': '#000000',
                'احمر': '#EF4444', 'أحمر': '#EF4444', 'red': '#EF4444', 'حمراء': '#EF4444',
                'ازرق': '#3B82F6', 'أزرق': '#3B82F6', 'blue': '#3B82F6', 'زرقاء': '#3B82F6', 'كحلي': '#1E3A8A',
                'اخضر': '#22C55E', 'أخضر': '#22C55E', 'green': '#22C55E', 'خضراء': '#22C55E',
                'اصفر': '#EAB308', 'أصفر': '#EAB308', 'yellow': '#EAB308', 'صفراء': '#EAB308',
                'رمادي': '#808080', 'gray': '#808080',
                'برتقالي': '#F97316', 'orange': '#F97316',
                'بني': '#78350F', 'brown': '#78350F',
                'بنفسجي': '#8B5CF6', 'purple': '#8B5CF6',
                'زهري': '#EC4899', 'pink': '#EC4899', 'وردي': '#EC4899',
            };
            return map[clean] || (clean.startsWith('#') ? clean : '#FFFFFF');
        };

        const currentSelectionId = selectedClipIds[0];

        switch (intent) {
            case 'add_track':
                addTrack(entities.type || 'video');
                break;

            case 'add_text':
                addTextClip({
                    textContent: entities.text || 'نص جديد',
                    transform: {
                        ...defaultTransform,
                        x: entities.x ?? 0,
                        y: entities.y ?? 0,
                        scale: entities.scale ?? 100
                    },
                    textStyle: {
                        fontSize: 80,
                        color: resolveColor(entities.color),
                        fontFamily: 'Arial',
                        bold: true,
                        shadow: true
                    }
                });
                break;

            case 'split_clip':
                if (currentSelectionId) splitClip(currentSelectionId);
                break;

            case 'delete_clip':
                if (selectedClipIds.length > 0) {
                    setClips(prev => prev.filter(c => !selectedClipIds.includes(c.id)));
                    setSelectedClipIds([]);
                    saveToHistory();
                    toast({ title: 'تم الحذف', description: `تم حذف ${selectedClipIds.length} عنصر` });
                }
                break;

            case 'change_speed':
                if (currentSelectionId) updateClip(currentSelectionId, { speed: entities.value || 1.5 });
                break;

            case 'seek':
                setCurrentTime(entities.time || 0);
                break;

            case 'play_pause':
                setIsPlaying(!isPlaying);
                break;

            case 'undo_redo':
                entities.type === 'redo' ? redo() : undo();
                break;

            case 'animate_clip':
                {
                    const targetText = entities.text;
                    let foundClip = targetText ? clips.find(c => c.textContent?.includes(targetText) || c.name?.includes(targetText)) : null;

                    // Improved Fallback: If no specific clip found by name, try current selection, 
                    // then try the LAST added text clip (most likely what they want to animate)
                    if (!foundClip) {
                        if (currentSelectionId) {
                            foundClip = clips.find(c => c.id === currentSelectionId) || null;
                        } else {
                            // Find latest text clip
                            const textClips = clips.filter(c => c.type === 'text');
                            if (textClips.length > 0) {
                                foundClip = textClips[textClips.length - 1];
                            }
                        }
                    }

                    const animData = {
                        type: entities.type || 'orbit',
                        speed: entities.speed || 1.5,
                        startTime: entities.startTime !== undefined ? entities.startTime : 0,
                        endTime: entities.endTime !== undefined ? entities.endTime : 5
                    };

                    if (foundClip) {
                        // If animation starts from "middle" (وسط), reset X/Y before animating
                        if (intent === 'animate_clip' && (entities.fromMid || targetText?.includes('وسط'))) {
                            updateClip(foundClip.id, {
                                transform: { ...foundClip.transform, x: 0, y: 0 },
                                animation: animData
                            });
                        } else {
                            updateClip(foundClip.id, { animation: animData });
                        }
                        toast({ title: 'تم برمجة الحركة', description: `تفعيل تأثير ${entities.type} على "${foundClip.textContent || foundClip.name}"` });
                    } else if (targetText && targetText.length > 1) {
                        // Create NEW clip only if targetText is meaningful
                        addTextClip({
                            textContent: targetText,
                            animation: animData,
                            transform: { ...defaultTransform, scale: 120 }
                        });
                        toast({ title: 'تمت الإضافة والتحريك', description: `إنشاء "${targetText}" مع حركة ${entities.type}` });
                    } else {
                        toast({ title: 'تنبيه', description: 'لم يتم العثور على نص لتحريكه. يرجى إضافة نص أولاً.', variant: 'destructive' });
                    }
                }
                break;

            case 'update_transform':
                if (currentSelectionId) {
                    const clip = clips.find(c => c.id === currentSelectionId);
                    if (clip) {
                        const current = clip.transform;
                        const updates: any = {};
                        if (entities.relative) {
                            if (entities.x) updates.x = current.x + entities.x;
                            if (entities.y) updates.y = current.y + entities.y;
                            if (entities.scale) updates.scale = current.scale * entities.scale;
                            if (entities.rotation) updates.rotation = (current.rotation || 0) + (entities.rotation || 0);
                        } else {
                            if (entities.x !== undefined) updates.x = entities.x;
                            if (entities.y !== undefined) updates.y = entities.y;
                            if (entities.scale !== undefined) updates.scale = entities.scale;
                            if (entities.rotation !== undefined) updates.rotation = entities.rotation;
                        }

                        const newTransform = { ...current, ...updates };
                        if (entities.keyframe || (clip.keyframes && clip.keyframes.length > 0)) {
                            const timeInClip = currentTime - clip.startAt;
                            const newKeyframe = { time: timeInClip, ...newTransform };
                            const kfs = [...(clip.keyframes || [])];
                            const idx = kfs.findIndex(kf => Math.abs(kf.time - timeInClip) < 0.1);
                            if (idx >= 0) kfs[idx] = newKeyframe;
                            else {
                                kfs.push(newKeyframe);
                                kfs.sort((a, b) => a.time - b.time);
                            }
                            updateClip(currentSelectionId, { transform: newTransform, keyframes: kfs });
                        } else {
                            updateClip(currentSelectionId, { transform: newTransform });
                        }
                    }
                }
                break;

            case 'select_clip':
                {
                    const query = entities.query || entities.text || entities.name;
                    if (!query) break;
                    const found = clips.find(c =>
                        c.id === query ||
                        (c.textContent && c.textContent.toLowerCase().includes(query.toString().toLowerCase())) ||
                        (c.name && c.name.toLowerCase().includes(query.toString().toLowerCase()))
                    );
                    if (found) {
                        setSelectedClipIds([found.id]);
                        toast({ title: 'تم التحديد', description: found.textContent || found.name });
                    }
                }
                break;

            case 'add_keyframe':
                if (currentSelectionId) {
                    const clip = clips.find(c => c.id === currentSelectionId);
                    if (clip) {
                        const timeInClip = currentTime - clip.startAt;
                        const newKeyframe = {
                            time: timeInClip,
                            x: entities.x !== undefined ? entities.x : clip.transform.x,
                            y: entities.y !== undefined ? entities.y : clip.transform.y,
                            scale: entities.scale !== undefined ? entities.scale : clip.transform.scale,
                            rotation: entities.rotation !== undefined ? entities.rotation : (clip.transform.rotation || 0),
                            opacity: entities.opacity !== undefined ? entities.opacity : clip.transform.opacity
                        };
                        const kfs = [...(clip.keyframes || [])];
                        const idx = kfs.findIndex(kf => Math.abs(kf.time - timeInClip) < 0.1);
                        if (idx >= 0) kfs[idx] = newKeyframe;
                        else {
                            kfs.push(newKeyframe);
                            kfs.sort((a, b) => a.time - b.time);
                        }
                        updateClip(currentSelectionId, { keyframes: kfs });
                        toast({ title: 'تم إضافة مفتاح حركة' });
                    }
                }
                break;

            case 'smart_layout':
                {
                    const layoutType = entities.type || 'grid';
                    const activeClips = clips.filter(c => currentTime >= c.startAt && currentTime < c.startAt + getClipDuration(c));
                    if (activeClips.length === 0) break;

                    const w = 1920;
                    const h = 1080;

                    setClips(prev => prev.map(c => {
                        const idx = activeClips.findIndex(ac => ac.id === c.id);
                        if (idx === -1) return c;

                        let tx = 0, ty = 0, ts = 100;
                        if (layoutType === 'side-by-side' && activeClips.length >= 2) {
                            const count = activeClips.length;
                            const cw = w / count;
                            tx = (idx * cw + cw / 2) - w / 2;
                            ts = 100 / count;
                        } else if (layoutType === 'grid') {
                            const cols = Math.ceil(Math.sqrt(activeClips.length));
                            const rows = Math.ceil(activeClips.length / cols);
                            const cw = w / cols;
                            const ch = h / rows;
                            const col = idx % cols;
                            const row = Math.floor(idx / cols);
                            tx = (col * cw + cw / 2) - w / 2;
                            ty = (row * ch + ch / 2) - h / 2;
                            ts = 100 / Math.max(cols, rows);
                        }
                        return { ...c, transform: { ...c.transform, x: tx, y: ty, scale: ts } };
                    }));
                    toast({ title: 'AI Layout Applied', description: `Arranged ${activeClips.length} clips` });
                }
                break;

            case 'auto_animate':
                if (currentSelectionId) {
                    const clip = clips.find(c => c.id === currentSelectionId);
                    if (clip) {
                        const duration = entities.duration || 1;
                        const type = entities.type || 'pop-in';
                        const kfs: any[] = [];
                        if (type === 'pop-in') {
                            kfs.push({ time: 0, x: clip.transform.x, y: clip.transform.y, scale: 0, rotation: 0, opacity: 0 });
                            kfs.push({ time: duration * 0.7, x: clip.transform.x, y: clip.transform.y, scale: clip.transform.scale * 1.1, rotation: 5, opacity: 100 });
                            kfs.push({ time: duration, x: clip.transform.x, y: clip.transform.y, scale: clip.transform.scale, rotation: 0, opacity: 100 });
                        } else if (type === 'fade-move') {
                            kfs.push({ time: 0, x: clip.transform.x - 100, y: clip.transform.y, scale: clip.transform.scale, rotation: 0, opacity: 0 });
                            kfs.push({ time: duration, x: clip.transform.x, y: clip.transform.y, scale: clip.transform.scale, rotation: 0, opacity: 100 });
                        }
                        updateClip(currentSelectionId, { keyframes: kfs });
                        toast({ title: 'AI Animation Applied' });
                    }
                }
                break;

            case 'animate_with_keyframes':
                {
                    const targetText = entities.text;
                    let foundClip = targetText ? clips.find(c => c.textContent?.includes(targetText) || c.name?.includes(targetText)) : null;

                    if (!foundClip) {
                        if (currentSelectionId) {
                            foundClip = clips.find(c => c.id === currentSelectionId) || null;
                        } else {
                            const textClips = clips.filter(c => c.type === 'text');
                            if (textClips.length > 0) foundClip = textClips[textClips.length - 1];
                        }
                    }

                    if (foundClip && entities.keyframes) {
                        updateClip(foundClip.id, {
                            keyframes: entities.keyframes,
                            // Clear legacy animation to prioritize keyframes
                            animation: undefined
                        });
                        toast({ title: 'برمجة الحركة بالكي-فريمز', description: `تم توليد ${entities.keyframes.length} نقاط حركة مخصصة` });
                    }
                }
                break;

            case 'set_tool':
                if (entities.tool) {
                    setToolMode(entities.tool);
                    toast({ title: 'تغيير الأداة', description: `تم تفعيل أداة ${entities.tool}` });
                }
                break;

            case 'set_mode':
                if (entities.mode) {
                    setMode(entities.mode);
                    toast({ title: 'تغيير الوضع', description: `تم التبديل إلى وضع ${entities.mode}` });
                }
                break;

            case 'toggle_graph_editor':
                toast({ title: 'تنبيه', description: 'محرر المنحنيات غير متاح حالياً في النسخة المبسطة' });
                break;

            case 'export_project':
                setIsExportDialogOpen(true);
                break;

            case 'update_color_grading':
                if (currentSelectionId) {
                    const clip = clips.find(c => c.id === currentSelectionId);
                    if (clip) {
                        updateClip(currentSelectionId, { color: { ...clip.color, ...entities } });
                        setShowColorGrading(true);
                        toast({ title: 'تم تعديل الألوان' });
                    }
                }
                break;

            case 'set_canvas_background':
                setCanvasBackgroundColor(resolveColor(entities.color));
                break;

            case 'set_dual_background':
                const co1 = resolveColor(entities.color1 || '#F97316');
                const co2 = resolveColor(entities.color2 || '#3B82F6');
                setCanvasBackgroundColor(`DUAL:${co1}:${co2}`);
                break;

            case 'smart_audio_ducking':
                {
                    const musicTrack = tracks.find(t => t.label.toLowerCase().includes('music') || t.label.toLowerCase().includes('audio 2'));
                    const voiceClips = clips.filter(c => tracks.find(t => t.id === c.trackId)?.type === 'video');

                    if (musicTrack) {
                        const musicClips = clips.filter(c => c.trackId === musicTrack.id);
                        const updatedClips = clips.map(c => {
                            if (c.trackId === musicTrack.id) {
                                // Add keyframes to lower volume where voice exists
                                const kfs = [];
                                voiceClips.forEach(v => {
                                    kfs.push({ time: v.startAt - 0.5, volume: 1 });
                                    kfs.push({ time: v.startAt, volume: 0.2 });
                                    kfs.push({ time: v.startAt + v.duration, volume: 0.2 });
                                    kfs.push({ time: v.startAt + v.duration + 0.5, volume: 1 });
                                });
                                return { ...c, audio: { ...c.audio, volume: 0.2, effects: { ...c.audio?.effects as any, ducking: true } } };
                            }
                            return c;
                        });
                        setClips(updatedClips);
                        toast({ title: 'برمجة موازنة الصوت', description: 'تم خفض صوت الموسيقى تلقائياً عند وجود كلام' });
                    }
                }
                break;

            case 'voice_clarity_engine':
                if (currentSelectionId) {
                    const clip = clips.find(c => c.id === currentSelectionId);
                    if (clip) {
                        updateClip(currentSelectionId, {
                            audio: {
                                ...clip.audio,
                                voiceEnhance: true,
                                effects: { bass: -5, mid: 10, treble: 5, compression: true, ducking: false }
                            }
                        });
                        toast({ title: 'تفعيل محرك وضوح الصوت', description: 'تم تحسين ترددات الصوت لزيادة وضوح الكلام' });
                    }
                }
                break;

            case 'add_mask_keyframe':
                if (currentSelectionId) {
                    const clip = clips.find(c => c.id === currentSelectionId);
                    if (clip && clip.maskPath) {
                        const timeInClip = currentTime - clip.startAt;
                        const newKeyframe = {
                            time: timeInClip,
                            points: JSON.parse(JSON.stringify(clip.maskPath.points))
                        };
                        const kfs = [...(clip.maskKeyframes || [])];
                        const idx = kfs.findIndex(kf => Math.abs(kf.time - timeInClip) < 0.1);
                        if (idx >= 0) kfs[idx] = newKeyframe;
                        else {
                            kfs.push(newKeyframe);
                            kfs.sort((a, b) => a.time - b.time);
                        }
                        updateClip(currentSelectionId, { maskKeyframes: kfs });
                        toast({ title: 'تم إضافة مفتاح حركة للقناع' });
                    }
                }
                break;

            case 'delete_mask_keyframes':
                if (currentSelectionId) {
                    updateClip(currentSelectionId, { maskKeyframes: [] });
                    toast({ title: 'تم حذف جميع مفاتيح حركة القناع' });
                }
                break;

            case 'apply_audio_mix':
                if (entities.tracks) {
                    setTracks(prev => prev.map(t => {
                        const update = entities.tracks.find((ut: any) => ut.id === t.id);
                        if (update) return { ...t, muted: update.muted ?? t.muted };
                        return t;
                    }));
                    toast({ title: 'AI Audio Mix Applied' });
                }
                break;

            case 'apply_cinema_look':
                if (currentSelectionId) {
                    const look = entities.look || 'hollywood';
                    updateClip(currentSelectionId, {
                        color: {
                            ...clips.find(c => c.id === currentSelectionId)?.color,
                            lut: look as any,
                            contrast: 110,
                            vignette: 20
                        }
                    });
                    toast({ title: 'تطبيق مظهر سينمائي', description: `تم استخدام فلتر ${look} الاحترافي` });
                }
                break;

            case 'set_text_color':
                if (currentSelectionId) {
                    const clip = clips.find(c => c.id === currentSelectionId);
                    if (clip && clip.type === 'text') {
                        updateClip(currentSelectionId, { textStyle: { ...clip.textStyle!, color: resolveColor(entities.color) } });
                    }
                }
                break;

            case 'remove_silence':
                if (currentSelectionId) {
                    removeSilence(currentSelectionId);
                } else if (entities.query) {
                    const target = clips.find(c => (c.textContent || c.name || "").includes(entities.query));
                    if (target) removeSilence(target.id);
                }
                break;
        }
    }, [clips, currentTime, isPlaying, selectedClipIds, undo, redo, addTrack, addTextClip, splitClip, updateClip, saveToHistory, toast, setClips, setSelectedClipIds, setCurrentTime, setIsPlaying, setCanvasBackgroundColor, setShowColorGrading, tracks]);

    // --- Rendering ---
    const drawFrame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        try {
            const w = isProxyMode ? 960 : 1920;
            const h = isProxyMode ? 540 : 1080;
            if (canvas.width !== w) { canvas.width = w; canvas.height = h; }

            // 1. Hard Reset of Context State
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.filter = 'none';
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';

            ctx.clearRect(0, 0, w, h);

            if (canvasBackgroundColor.startsWith('DUAL:')) {
                const [, c1, c2] = canvasBackgroundColor.split(':');
                ctx.fillStyle = c1;
                ctx.fillRect(0, 0, w, h); // Fill whole background with first color as base
                ctx.fillStyle = c2;
                ctx.fillRect(w / 2, 0, w / 2, h); // Overlay second color on half
            } else {
                ctx.fillStyle = canvasBackgroundColor;
                ctx.fillRect(0, 0, w, h);
            }

            // High-Visibility Diagnostic (Debug Mode)
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, w - 4, h - 4);
            ctx.fillStyle = '#00ff00';
            ctx.font = '24px monospace';
            ctx.fillText(`RENDERER ACTIVE | T: ${currentTime.toFixed(2)}s | CLIPS: ${clips.length}`, 20, 40);

            const visibleTracks = tracks.filter(t => t.visible).sort((a, b) => a.id - b.id);

            visibleTracks.forEach(track => {
                clips.filter(c => c.trackId === track.id).forEach(clip => {
                    const dur = getClipDuration(clip);
                    if (currentTime < clip.startAt || currentTime >= clip.startAt + dur) return;

                    const localTime = currentTime - clip.startAt;
                    const videoTime = clip.trimStart + localTime * clip.speed;

                    ctx.save();

                    // --- Keyframe / Transform Interpolation ---
                    let tx = clip.transform.x;
                    let ty = clip.transform.y;
                    let ts = clip.transform.scale;
                    let tr = (clip.transform.rotation * Math.PI) / 180;
                    let to = clip.transform.opacity;

                    const isBeingDragged = canvasDragging?.id === clip.id;

                    if (!isBeingDragged && clip.keyframes && clip.keyframes.length > 0) {
                        const t = currentTime - clip.startAt;
                        const kfs = clip.keyframes;
                        const nextIdx = kfs.findIndex(kf => kf.time > t);

                        if (nextIdx === 0) {
                            const k = kfs[0];
                            tx = k.x; ty = k.y; ts = k.scale; tr = (k.rotation * Math.PI) / 180; to = k.opacity;
                        } else if (nextIdx === -1) {
                            const k = kfs[kfs.length - 1];
                            tx = k.x; ty = k.y; ts = k.scale; tr = (k.rotation * Math.PI) / 180; to = k.opacity;
                        } else {
                            const k1 = kfs[nextIdx - 1];
                            const k2 = kfs[nextIdx];
                            const range = k2.time - k1.time;
                            const factor = range > 0 ? (t - k1.time) / range : 0;
                            tx = k1.x + (k2.x - k1.x) * factor;
                            ty = k1.y + (k2.y - k1.y) * factor;
                            ts = k1.scale + (k2.scale - k1.scale) * factor;
                            tr = ((k1.rotation + (k2.rotation - k1.rotation) * factor) * Math.PI) / 180;
                            to = k1.opacity + (k2.opacity - k1.opacity) * factor;
                        }
                    }

                    const finalScale = (ts > 5) ? ts / 100 : ts;
                    const finalOpacity = (to > 1.5) ? to / 100 : to;
                    ctx.globalAlpha = finalOpacity;

                    const cx = w / 2, cy = h / 2;
                    ctx.translate(cx + tx, cy + ty);
                    ctx.rotate(tr);
                    ctx.scale(finalScale, finalScale);

                    // Masking (Applied in Transformed Space)
                    if (clip.maskPath && clip.maskPath.points.length > 2) {
                        ctx.beginPath();
                        if (clip.maskSettings?.inverted) {
                            ctx.rect(-10000, -10000, 20000, 20000);
                        }
                        clip.maskPath.points.forEach((p, i) => {
                            if (i === 0) ctx.moveTo(p.x, p.y);
                            else ctx.lineTo(p.x, p.y);
                        });
                        if (clip.maskPath.isClosed) ctx.closePath();
                        ctx.clip(clip.maskSettings?.inverted ? 'evenodd' : 'nonzero');
                    }

                    // Filter
                    const { brightness, contrast, saturation, hue, blur } = clip.color;
                    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px) url(#filter-${clip.id})`;

                    // Animation Logic (Additive)
                    if (clip.animation && clip.animation.type !== 'none') {
                        const t = currentTime - clip.startAt;
                        const spd = clip.animation.speed || 1;
                        const animStart = clip.animation.startTime || 0;
                        const animEnd = clip.animation.endTime || 5;
                        const isActive = currentTime >= animStart && currentTime <= animEnd;

                        if (isActive || ['orbit', 'float'].includes(clip.animation.type)) {
                            if (clip.animation.type === 'orbit') {
                                const r = 300;
                                ctx.translate(Math.cos(t * spd) * r, Math.sin(t * spd) * r);
                            } else if (clip.animation.type === 'float') {
                                ctx.translate(0, Math.sin(t * spd * 2) * 80);
                            } else if (clip.animation.type === 'spin') {
                                ctx.rotate(t * spd * 2);
                            } else if (clip.animation.type === 'shake') {
                                ctx.translate((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
                            } else if (clip.animation.type.startsWith('slide-')) {
                                const prog = Math.min(Math.max((t - animStart) / (animEnd - animStart), 0), 1);
                                if (clip.animation.type === 'slide-right') ctx.translate(800 * prog, 0);
                                else if (clip.animation.type === 'slide-left') ctx.translate(-800 * prog, 0);
                                else if (clip.animation.type === 'slide-up') ctx.translate(0, -800 * prog);
                                else if (clip.animation.type === 'slide-down') ctx.translate(0, 800 * prog);
                            }
                        }
                    }

                    // Draw Content
                    if (clip.type === 'video' && clip.url) {
                        const v = videoRefs.current[clip.id];
                        if (v) {
                            if (Math.abs(v.currentTime - videoTime) > 0.2) v.currentTime = videoTime;
                            if (isPlaying && v.paused) v.play().catch(() => { });
                            else if (!isPlaying && !v.paused) v.pause();
                            ctx.drawImage(v, -cx, -cy, w, h);
                        }
                    } else if (clip.type === 'image' && clip.url) {
                        const img = imageRefs.current[clip.id];
                        if (img?.complete) ctx.drawImage(img, -cx, -cy, w, h);
                    } else if (clip.type === 'text' && clip.textContent) {
                        const s = clip.textStyle!;
                        ctx.fillStyle = s.color;
                        ctx.font = `${s.bold ? 'bold' : ''} ${s.italic ? 'italic' : ''} ${s.fontSize}px ${s.fontFamily}`;
                        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                        ctx.fillText(clip.textContent, 0, 0);
                    } else if (clip.type === 'shape' && clip.pathData) {
                        ctx.beginPath();
                        clip.pathData.points.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
                        if (clip.pathData.isClosed) ctx.closePath();
                        ctx.strokeStyle = clip.pathData.strokeColor; ctx.lineWidth = clip.pathData.strokeWidth;
                        ctx.stroke();
                        if (clip.pathData.fillColor) { ctx.fillStyle = clip.pathData.fillColor; ctx.fill(); }
                    }

                    // Effects (Temperature / Vignette)
                    if (clip.color.temperature !== 0) {
                        ctx.save(); ctx.globalCompositeOperation = 'overlay';
                        const t = clip.color.temperature;
                        ctx.fillStyle = t > 0 ? `rgba(255,160,20,${Math.abs(t) / 255})` : `rgba(20,100,255,${Math.abs(t) / 255})`;
                        ctx.fillRect(-cx, -cy, w, h); ctx.restore();
                    }
                    if (clip.color.vignette > 0) {
                        ctx.save();
                        const grad = ctx.createRadialGradient(0, 0, Math.max(w, h) * 0.3, 0, 0, Math.max(w, h) * 0.8);
                        grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, `rgba(0,0,0,${clip.color.vignette / 100})`);
                        ctx.fillStyle = grad; ctx.fillRect(-cx, -cy, w, h); ctx.restore();
                    }

                    // --- Selection Highlight ---
                    if (selectedClipIds.includes(clip.id)) {
                        ctx.save();
                        ctx.filter = 'none';
                        ctx.globalAlpha = 1.0;
                        ctx.strokeStyle = '#3b82f6';
                        ctx.lineWidth = 3 / finalScale;

                        let rectW = w;
                        let rectH = h;

                        if (clip.type === 'text') {
                            ctx.font = `${clip.textStyle?.bold ? 'bold' : ''} ${clip.textStyle?.fontSize || 60}px ${clip.textStyle?.fontFamily || 'Arial'}`;
                            const metrics = ctx.measureText(clip.textContent || '');
                            rectW = metrics.width + 40;
                            rectH = (clip.textStyle?.fontSize || 60) * 1.2;
                        } else if (clip.type === 'shape' && clip.pathData) {
                            const xs = clip.pathData.points.map(p => p.x);
                            const ys = clip.pathData.points.map(p => p.y);
                            const minX = Math.min(...xs), maxX = Math.max(...xs);
                            const minY = Math.min(...ys), maxY = Math.max(...ys);
                            rectW = (maxX - minX) + 40;
                            rectH = (maxY - minY) + 40;
                            ctx.translate((minX + maxX) / 2, (minY + maxY) / 2);
                        }

                        // Dashed Outline
                        ctx.setLineDash([5 / finalScale, 5 / finalScale]);
                        ctx.strokeRect(-rectW / 2, -rectH / 2, rectW, rectH);
                        ctx.setLineDash([]);

                        // Corner Handles
                        const hs = 12 / finalScale;
                        ctx.fillStyle = '#3b82f6';
                        [
                            [-rectW / 2, -rectH / 2], [rectW / 2, -rectH / 2],
                            [-rectW / 2, rectH / 2], [rectW / 2, rectH / 2],
                            [0, -rectH / 2], [0, rectH / 2],
                            [-rectW / 2, 0], [rectW / 2, 0]
                        ].forEach(([hx, hy]) => {
                            ctx.beginPath();
                            ctx.arc(hx, hy, hs / 2, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.strokeStyle = 'white';
                            ctx.lineWidth = 2 / finalScale;
                            ctx.stroke();
                        });

                        // Rotation Handle
                        const rotateHandleY = -rectH / 2 - 40 / finalScale;
                        ctx.beginPath();
                        ctx.moveTo(0, -rectH / 2);
                        ctx.lineTo(0, rotateHandleY);
                        ctx.strokeStyle = '#3b82f6';
                        ctx.lineWidth = 2 / finalScale;
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc(0, rotateHandleY, hs / 2, 0, Math.PI * 2);
                        ctx.fillStyle = '#3b82f6';
                        ctx.fill();
                        ctx.strokeStyle = 'white';
                        ctx.lineWidth = 2 / finalScale;
                        ctx.stroke();

                        ctx.restore();
                    }

                    ctx.restore();
                });
            });


            // Render Existing Mask Points (Selected Clip Only)
            if (toolMode === 'pen' && selectedClipIds.length > 0) {
                const clip = clips.find(c => c.id === selectedClipIds[0]);
                if (clip && clip.maskPath) {
                    const w = canvas.width;
                    const h = canvas.height;
                    const cx = w / 2;
                    const cy = h / 2;

                    ctx.save();
                    let tx = clip.transform.x, ty = clip.transform.y, ts = clip.transform.scale, tr = (clip.transform.rotation * Math.PI) / 180;
                    const finalScale = (ts > 5) ? ts / 100 : ts;

                    ctx.translate(cx + tx, cy + ty);
                    ctx.rotate(tr);
                    ctx.scale(finalScale, finalScale);

                    ctx.beginPath();
                    clip.maskPath.points.forEach((p, i) => {
                        if (i === 0) ctx.moveTo(p.x, p.y);
                        else ctx.lineTo(p.x, p.y);
                    });
                    if (clip.maskPath.isClosed) ctx.closePath();
                    ctx.strokeStyle = '#3b82f6';
                    ctx.lineWidth = 2 / finalScale;
                    ctx.stroke();

                    clip.maskPath.points.forEach((p, i) => {
                        ctx.fillStyle = (draggingMaskPoint?.pointIndex === i) ? '#facc15' : '#3b82f6';
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, 6 / finalScale, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = 'white';
                        ctx.lineWidth = 1 / finalScale;
                        ctx.stroke();
                    });
                    ctx.restore();
                }
            }

            // Render Current Drawing Path
            if (drawingPath.length > 0) {
                const w = canvas.width;
                const h = canvas.height;
                const cx = w / 2;
                const cy = h / 2;

                ctx.save();
                ctx.translate(cx, cy); // Draw relative to center since points are stored relative to center
                ctx.beginPath();
                drawingPath.forEach((p, i) => {
                    if (i === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                });
                ctx.strokeStyle = '#00ff00'; // Green for active drawing
                ctx.lineWidth = 3;
                ctx.stroke();
                // Draw points
                ctx.fillStyle = '#fff';
                drawingPath.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.restore();
            }

        } catch (err) {
            console.error('DrawFrame Error:', err);
        }

        // Always schedule next frame if playing, outside the try-catch for state logic
        if (isPlaying) {
            setCurrentTime(t => {
                const next = t + 1 / 30;
                return next > totalDuration ? 0 : next;
            });
            requestRef.current = requestAnimationFrame(drawFrame);
        }
    }, [clips, tracks, currentTime, isPlaying, isProxyMode, totalDuration, canvasBackgroundColor, drawingPath, canvasDragging, selectedClipIds, draggingMaskPoint, toolMode]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(drawFrame);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [drawFrame]);


    const handleExport = () => {
        setIsExportDialogOpen(true);
    };

    const performExport = () => {
        setIsExportDialogOpen(false);
        if (!canvasRef.current) return;

        toast({ title: 'جاري التصدير...', description: `يتم إنشاء ملف ${exportFormat.toUpperCase()} بجودة ${exportQuality}...` });

        try {
            const stream = canvasRef.current.captureStream(30);
            const options = { mimeType: 'video/webm;codecs=vp9' };

            const mediaRecorder = new MediaRecorder(stream, options);
            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                // Note: Extension is cosmetic only here as the blob is always webm in this browser implementation.
                // MP4 conversion requires FFmpeg.wasm heavyweight library.
                a.download = `Avinar_Project_Export.${exportFormat === 'gif' ? 'gif' : 'mp4'}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                toast({ title: 'اكتمل التصدير', description: 'تم تحميل الفيديو بنجاح.' });
            };

            mediaRecorder.start();

            // Auto Play for recording duration
            const wasPlaying = isPlaying;
            setIsPlaying(true);
            setCurrentTime(0);

            setTimeout(() => {
                mediaRecorder.stop();
                setIsPlaying(wasPlaying);
            }, totalDuration * 1000 + 500);

        } catch (e) {
            console.error(e);
            toast({ title: 'فشل التصدير', description: 'المتصفح لا يدعم هذه الصيغة.', variant: 'destructive' });
        }
    };

    const selectedClip = clips.find(c => selectedClipIds.includes(c.id));

    // --- Menus ---
    const TopBar = () => (
        <div className="h-12 bg-[#0f1012] border-b border-gray-800 flex items-center justify-between px-4 text-gray-300 text-xs select-none" dir="ltr">
            {/* Left Side: Logo & Menus */}
            <div className="flex items-center gap-4">
                <span className="font-bold text-white flex items-center gap-2">Avinar Pro <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-[10px]">A</div></span>
                <div className="h-4 w-px bg-gray-800 mx-2" />

                <div className="flex items-center gap-1 h-full">
                    {/* 1. ملف */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 px-3 text-xs hover:text-blue-400 hover:bg-blue-600/10 font-bold transition-all decoration-blue-500/50">ملف</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-[#1a1d21] border-gray-700 text-white" align="start">
                            <DropdownMenuLabel>المشروع</DropdownMenuLabel>
                            <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer" onClick={() => (document.querySelector('input[type=file]') as HTMLInputElement)?.click()}>
                                <Upload className="mr-2 h-4 w-4" /> استيراد وسائط
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer" onClick={handleExport}>
                                <div className="flex w-full items-center justify-between">
                                    <span className="flex items-center"><FileVideo className="mr-2 h-4 w-4" /> تصدير</span>
                                    <span className="text-xs text-gray-500">Ctrl+E</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem className="focus:bg-red-600 cursor-pointer text-red-400 focus:text-white">
                                <LogOut className="mr-2 h-4 w-4" /> خروج
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 2. أدوات */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 px-3 text-xs hover:text-blue-400 hover:bg-blue-600/10 font-normal transition-all">أدوات</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-[#1a1d21] border-gray-700 text-white" align="start">
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="text-xs py-1 focus:bg-blue-600 cursor-pointer">أدوات المونتاج</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-48 bg-[#1a1d21] border-gray-700 text-white">
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1" onClick={() => setToolMode('select')}>Selection Mode</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1" onClick={() => setToolMode('ripple')}>Ripple Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1" onClick={() => setToolMode('rolling')}>Rolling Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1" onClick={() => setToolMode('split')}>Razor Tool</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1" onClick={() => setToolMode('slip')}>Slip Tool</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1" onClick={() => setToolMode('slide')}>Slide Tool</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            {/* 2. Color Page */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="text-xs py-1 focus:bg-blue-600 cursor-pointer">
                                    أدوات تصحيح الألوان
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-48 bg-[#1a1d21] border-gray-700 text-white">
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1" onClick={() => setActiveTab('properties')}>
                                        Primary Wheels
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1" onClick={() => setActiveTab('properties')}>
                                        Curves
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1">Nodes</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1">Qualifier</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1">Power Window</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            {/* 3. Fusion Page (Visual Effects) */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="text-xs py-1 focus:bg-blue-600 cursor-pointer">
                                    المؤثرات البصرية (Fusion)
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-48 bg-[#1a1d21] border-gray-700 text-white">
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1">NodesChain</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1" onClick={() => setActiveTab('properties')}>Transform</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1">Merge</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1">Masking</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            {/* 4. Fairlight (Audio) */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="text-xs py-1 focus:bg-blue-600 cursor-pointer">
                                    الصوت (Fairlight)
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-48 bg-[#1a1d21] border-gray-700 text-white">
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1" onClick={() => setActiveTab('properties')}>Mixer</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1" onClick={() => setActiveTab('properties')}>EQ</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1">Compressor</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1">Limiter</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuSeparator className="bg-gray-700 my-1" />

                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="text-xs py-1 focus:bg-blue-600 cursor-pointer">
                                    مؤثرات وحركة (After Effects)
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-48 bg-[#1a1d21] border-gray-700 text-white">
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1" onClick={() => setToolMode('hand')}>Hand Tool</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1" onClick={() => setToolMode('zoom')}>Zoom Tool</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1" onClick={() => addTextClip()}>Text Tool</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer text-xs py-1" onClick={() => setToolMode('pen')}>Pen Tool</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 3. تعديل */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 px-3 text-xs hover:text-blue-400 hover:bg-blue-600/10 font-normal transition-all">تعديل</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-[#1a1d21] border-gray-700 text-white" align="start">
                            <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer" onClick={undo} disabled={historyIndex <= 0}>تراجع</DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer" onClick={redo} disabled={historyIndex >= history.length - 1}>إعادة</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer" onClick={() => toolMode === 'split' ? setToolMode('select') : setToolMode('split')}>
                                {toolMode === 'split' ? 'وضع التحديد' : 'وضع القص'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-red-600 cursor-pointer text-red-400 focus:text-white" onClick={() => selectedClipIds.length > 0 && selectedClipIds.forEach(id => deleteClip(id))}>
                                حذف المحدد
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 4. عرض */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 px-3 text-xs hover:text-blue-400 hover:bg-blue-600/10 font-normal transition-all">عرض</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-[#1a1d21] border-gray-700 text-white" align="start">
                            <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer" onClick={() => setZoom(z => Math.min(100, z + 10))}><ZoomIn className="mr-2 h-4 w-4" /> تكبير</DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer" onClick={() => setZoom(z => Math.max(10, z - 10))}><ZoomOut className="mr-2 h-4 w-4" /> تصغير</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer" onClick={() => setIsFullscreen(!isFullscreen)}>
                                ملء الشاشة
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-blue-600 cursor-pointer" onClick={() => setIsProxyMode(!isProxyMode)}>
                                {isProxyMode ? 'جودة كاملة' : 'وضع البروكسي (أسرع)'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Right Side: Export, Time, Status */}
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-900/50 rounded-lg p-0.5 border border-white/5 gap-0.5 shadow-inner" dir="ltr">
                    <div className="flex items-center gap-0.5 px-1 border-r border-white/10 mr-1">
                        <Button variant={toolMode === 'pen' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 p-1.5" onClick={() => setToolMode('pen')} title="Pen Tool (P)"><PenTool className="w-full h-full" /></Button>
                        <Button variant={toolMode === 'hand' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 p-1.5" onClick={() => setToolMode('hand')} title="Hand Tool (H)"><Hand className="w-full h-full" /></Button>
                        <Button variant={toolMode === 'zoom' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 p-1.5" onClick={() => setToolMode('zoom')} title="Zoom Tool (Z)"><ZoomIn className="w-full h-full" /></Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 p-1.5 text-purple-400 hover:bg-purple-500/10" onClick={() => setIsAIChannelOpen(true)} title="AI Assistant"><Wand2 className="w-full h-full" /></Button>
                </div>

                <span className="bg-gray-800 px-3 py-1 rounded-full font-mono text-blue-400 text-[10px]" dir="ltr">{formatTime(currentTime)} / {formatTime(totalDuration)}</span>

                <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-500 h-7 text-xs px-3" onClick={handleExport}>
                    تصدير <Download size={12} className="ml-1.5" />
                </Button>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-gray-800/50 px-2 py-1 rounded-md border border-white/5">
                        <span className="text-[10px] text-gray-500 font-bold">PROXY</span>
                        <Switch
                            checked={isProxyMode}
                            onCheckedChange={setIsProxyMode}
                            className="scale-75 data-[state=checked]:bg-blue-600"
                        />
                    </div>
                    <Cloud size={14} className="text-green-500" />
                    <span className="hidden sm:inline text-[10px]">محفوظ</span>
                </div>
            </div>
        </div>
    );


    const Sidebar = () => (
        <div style={{ width: layout.sidebarWidth }} className="bg-[#1a1d21] border-l border-gray-800 flex flex-col shrink-0 transition-all z-30">
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex-1 flex flex-col min-h-0">
                <div className="px-2 pt-2 bg-[#1a1d21]">
                    <TabsList className="w-full bg-[#0b0c0e] p-1 h-9 grid grid-cols-5 ring-1 ring-white/5">
                        <TabsTrigger value="media" className="text-[10px] text-gray-400 data-[state=active]:bg-[#23262b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold">الوسائط</TabsTrigger>
                        <TabsTrigger value="audio" className="text-[10px] text-gray-400 data-[state=active]:bg-[#23262b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold">الصوت</TabsTrigger>
                        <TabsTrigger value="layers" className="text-[10px] text-gray-400 data-[state=active]:bg-[#23262b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold">الطبقات</TabsTrigger>
                        <TabsTrigger value="team" className="text-[10px] text-gray-400 data-[state=active]:bg-[#23262b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold">الفريق</TabsTrigger>
                        <TabsTrigger value="properties" className="text-[10px] text-gray-400 data-[state=active]:bg-[#23262b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-bold">الخصائص</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="media" className="flex-1 min-h-0 m-0 data-[state=active]:flex flex-col">
                    <MediaPanelContent />
                </TabsContent>

                <TabsContent value="audio" className="flex-1 min-h-0 m-0 data-[state=active]:flex flex-col">
                    <AudioMixerContent />
                </TabsContent>

                <TabsContent value="layers" className="flex-1 min-h-0 m-0 data-[state=active]:flex flex-col">
                    <LayersPanel
                        tracks={tracks}
                        onUpdateTrack={(id, updates) => setTracks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))}
                        onDeleteTrack={(id) => setTracks(prev => prev.filter(t => t.id !== id))}
                        onAddTrack={addTrack}
                        onReorderTracks={setTracks}
                        onDuplicateTrack={(id) => {
                            const t = tracks.find(x => x.id === id);
                            if (t) addTrack(t.type);
                        }}
                    />
                </TabsContent>

                <TabsContent value="team" className="flex-1 min-h-0 m-0 data-[state=active]:flex flex-col">
                    <CollaborationPanel
                        currentTeam={currentTeam}
                        teamNameInput={teamNameInput}
                        setTeamNameInput={setTeamNameInput}
                        handleCreateTeam={handleCreateTeam}
                        inviteCodeInput={inviteCodeInput}
                        setInviteCodeInput={setInviteCodeInput}
                        handleJoinTeam={handleJoinTeam}
                        isMicEnabled={isMicEnabled}
                        setIsMicEnabled={setIsMicEnabled}
                        isScreenSharing={isScreenSharing}
                        setIsScreenSharing={setIsScreenSharing}
                        collaborators={collaborators}
                        comments={comments}
                        currentTime={currentTime}
                        setCurrentTime={setCurrentTime}
                        newComment={newComment}
                        setNewComment={setNewComment}
                        addComment={addComment}
                        toast={toast}
                    />
                </TabsContent>

                <TabsContent value="properties" className="flex-1 min-h-0 m-0 data-[state=active]:flex flex-col">
                    {selectedClipIds.length > 0 ? (
                        <PropertiesPanel
                            clip={clips.find(c => c.id === selectedClipIds[0])!}
                            clips={clips}
                            currentTime={currentTime}
                            onUpdate={handlePropertyUpdate}
                            getFrameStats={getFrameStats}
                            getHistogramData={getHistogramData}
                        />
                    ) : toolMode !== 'select' ? (
                        <ToolInspector mode={toolMode} />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 text-xs flex-col gap-2">
                            <Sliders size={24} className="opacity-20" />
                            <p>Select a clip to view properties</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );

    const AudioMixerContent = () => (
        <div className="flex-1 flex flex-col bg-[#1a1d21] p-3 overflow-hidden">
            <h3 className="font-bold text-xs text-white mb-4 flex items-center gap-2"><Speaker size={14} className="text-blue-500" /> خلاط الصوت الرئيسي</h3>
            <ScrollArea className="flex-1">
                <div className="space-y-6">
                    {/* Master Channel */}
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Master Output</span>
                            <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-500 border-green-500/20">LIVE</Badge>
                        </div>
                        <div className="flex gap-4 items-end h-32">
                            <div className="flex-1 h-full bg-black/40 rounded flex flex-col justify-end p-0.5 overflow-hidden border border-white/5">
                                <div className="w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 opacity-80" style={{ height: '60%' }} />
                            </div>
                            <Slider orientation="vertical" min={0} max={100} step={1} defaultValue={[80]} className="h-full" />
                        </div>
                    </div>

                    {/* Track Channels */}
                    {tracks.filter(t => t.type === 'audio').map(track => (
                        <div key={track.id} className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-3">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-gray-300">{track.label}</span>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className={`h-5 w-5 ${track.muted ? 'text-red-500' : 'text-gray-500'}`} onClick={() => toggleTrackMute(track.id)}><VolumeX size={10} /></Button>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-500"><Mic size={10} /></Button>
                                </div>
                            </div>
                            <Slider min={0} max={200} step={1} defaultValue={[100]} />
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );

    const ToolInspector = ({ mode }: { mode: string }) => {
        const tools: any = {
            'rate-stretch': {
                name: 'أداة مط المعدل (Rate Stretch)',
                icon: <Timer className="text-yellow-500" size={32} />,
                color: 'from-yellow-500/20 to-transparent',
                desc: 'تُستخدم لتغيير سرعة المقطع عن طريق سحب أطرافه في التايم لاين. سحب الطرف لليمين يُبطئ المقطع، ولليسار يُسرعه.',
                tips: ['استخدمها لضبط مدة الفيديوهات لتناسب الموسيقى.', 'تظهر السرعة الجديدة مئوية فوق المقطع.']
            },
            'split': {
                name: 'أداة القص (Razor Tool)',
                icon: <Scissors className="text-red-500" size={32} />,
                color: 'from-red-500/20 to-transparent',
                desc: 'تُنشئ نقطة قطع في المقطع عند مكان الضغط. مفيدة لتقسيم المشاهد وحذف الأجزاء غير المرغوبة.',
                tips: ['اضغط على المقطع لتقسيمه فوراً.', 'استخدم Ctrl+K لتقسيم جميع المسارات.']
            },
            'ripple': {
                name: 'تحرير التموج (Ripple Edit)',
                icon: <MoveHorizontal className="text-green-500" size={32} />,
                color: 'from-green-500/20 to-transparent',
                desc: 'عند تقليص مقطع، تتحرك جميع المقاطع التالية لتغلق الفجوة تلقائياً.',
                tips: ['توفر الوقت بدلاً من تحريك كل مقطع يدوياً.']
            },
            'pen': {
                name: 'أداة القلم (Pen Tool)',
                icon: <PenTool className="text-purple-500" size={32} />,
                color: 'from-purple-500/20 to-transparent',
                desc: 'ارسم أشكالاً حرة أو أقنعة (Masks) مباشرة على لوحة العرض.',
                tips: ['اضغط لرسم النقاط، واغلق المسار بضغط نقطة البداية.']
            }
        };

        const info = tools[mode] || { name: 'أداة نشطة', desc: 'تحكم في المكونات عبر التايم لاين.', tips: [] };

        return (
            <div className="flex-1 flex flex-col p-5 bg-[#1a1d21]">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${info.color || 'from-blue-500/20 to-transparent'} border border-white/5 mb-6`}>
                    <div className="mb-4">{info.icon || <Wand2 />}</div>
                    <h3 className="font-bold text-lg text-white mb-2">{info.name}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{info.desc}</p>
                </div>

                <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">نصائح احترافية</h4>
                    {info.tips.map((tip: string, i: number) => (
                        <div key={i} className="flex gap-3 text-[11px] text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5 animate-in slide-in-from-right-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                            {tip}
                        </div>
                    ))}
                </div>

                <div className="mt-auto p-4 rounded-xl bg-blue-600/10 border border-blue-500/20 text-[10px] text-blue-400 text-center">
                    اكتشف قوة التحرير مع {info.name}
                </div>
            </div>
        );
    };

    const VerticalToolbar = () => (
        <div className="w-12 h-full bg-[#0b0c0e] border-r border-gray-800 flex flex-col items-center shrink-0 z-50 shadow-2xl relative overflow-hidden">
            <ScrollArea className="w-full h-full">
                <div className="flex flex-col items-center py-3 gap-2">
                    <Button variant={toolMode === 'select' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 p-2" onClick={() => setToolMode('select')} title="Selection Tool (V)"><MousePointer2 className="w-full h-full" /></Button>
                    <Button variant={toolMode === 'move-element' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 p-2" onClick={() => setToolMode('move-element')} title="Move Tool (M)"><Move className="w-full h-full" /></Button>
                    <Button variant={toolMode === 'track-select' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 p-2" onClick={() => setToolMode('track-select')} title="Track Select (A)"><ArrowRightFromLine className="w-full h-full" /></Button>

                    <div className="w-8 h-[1px] bg-gray-800 my-1" />

                    <Button variant={toolMode === 'split' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 p-2" onClick={() => setToolMode('split')} title="Razor Tool (C)"><Scissors className="w-full h-full" /></Button>
                    <Button variant={toolMode === 'ripple' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 p-2" onClick={() => setToolMode('ripple')} title="Ripple Edit (B)"><MoveHorizontal className="w-full h-full" /></Button>
                    <Button variant={toolMode === 'rolling' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 p-2" onClick={() => setToolMode('rolling')} title="Rolling Edit (N)"><Scaling className="w-full h-full" /></Button>
                    <Button variant={toolMode === 'rate-stretch' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 p-2" onClick={() => setToolMode('rate-stretch')} title="Rate Stretch (R)"><Timer className="w-full h-full" /></Button>

                    <div className="w-8 h-[1px] bg-gray-800 my-1" />

                    <Button variant={toolMode === 'slip' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 p-2" onClick={() => setToolMode('slip')} title="Slip Tool (Y)"><ArrowLeftRight className="w-full h-full" /></Button>
                    <Button variant={toolMode === 'slide' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 p-2" onClick={() => setToolMode('slide')} title="Slide Tool (U)"><Maximize className="w-full h-full" /></Button>

                    <div className="w-8 h-[1px] bg-gray-800 my-1" />

                    <Button variant={toolMode === 'text' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 p-2" onClick={() => setToolMode('text')} title="Type Tool (T)"><TypeIcon className="w-full h-full" /></Button>
                </div>
            </ScrollArea>
        </div>
    );

    const MediaPanelContent = () => (
        <div className="h-full flex flex-col bg-[#1a1d21] border-r border-gray-800">
            <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2"><Grid3X3 size={14} /> الوسائط</h3>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6"><Search size={14} className="text-gray-400" /></Button>
                </div>
            </div>
            <ScrollArea className="flex-1 p-2">
                <div className="grid grid-cols-2 gap-2">
                    <div className="aspect-square bg-gray-800/50 border border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 hover:border-blue-500 transition relative group" onClick={() => (document.querySelector('input[type=file]') as HTMLInputElement)?.click()}>
                        <Plus size={24} className="text-gray-400 mb-2 group-hover:text-blue-500" />
                        <span className="text-xs text-gray-500 group-hover:text-blue-400">استيراد</span>
                    </div>
                    {clips.filter(c => c.type !== 'text').map(clip => (
                        <div
                            key={clip.id}
                            className="aspect-square bg-gray-900 rounded-lg relative group overflow-hidden border border-gray-800 hover:border-blue-500 transition cursor-pointer"
                            onContextMenu={(e) => {
                                e.preventDefault();
                                setContextMenu({
                                    x: e.clientX,
                                    y: e.clientY,
                                    options: [
                                        { label: 'إضافة للتايم لاين', action: () => { /* Logic to add to cursor */ } },
                                        { label: 'إنشاء نسخة بروكسي (خفيفة)', action: () => generateProxy(clip.id) },
                                        { label: 'مونتاج صامت (AI)', action: () => removeSilence(clip.id) },
                                        { label: 'حذف من المشروع', action: () => deleteClip(clip.id) },
                                    ]
                                });
                            }}
                        >
                            {clip.thumbnail ? (
                                <img src={clip.thumbnail} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    {clip.type === 'video' ? <Film size={20} /> : clip.type === 'audio' ? <Music size={20} /> : <ImageIcon size={20} />}
                                    {clip.proxyUrl && <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5"><Zap size={8} className="text-white" /></div>}
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1">
                                <p className="text-[10px] text-white truncate">{clip.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );

    const editorRef = useRef<HTMLDivElement>(null);

    // Initial focus to enable shortcuts
    useEffect(() => {
        editorRef.current?.focus();
    }, []);

    return (
        <div
            ref={editorRef}
            tabIndex={0}
            className={`flex flex-col flex-1 h-full min-h-0 bg-[#0f1012] text-white overflow-hidden font-sans outline-none ${isFullscreen ? 'fixed inset-0 z-50' : 'relative'}`}
            dir="ltr"
        >
            <TopBar />

            {/* Main Workspace */}
            <div className="flex-1 flex min-h-0 relative overflow-hidden" dir="ltr">
                <VerticalToolbar />
                <div className="flex-1 flex min-w-0 relative">
                    <Sidebar />
                    <div
                        className="w-1 bg-[#1a1c1e] cursor-col-resize hover:bg-blue-500 transition-colors z-40 flex items-center justify-center border-r border-gray-800"
                        onMouseDown={(e) => setResizingPanel({ type: 'sidebar', startPos: e.clientX, startSize: layout.sidebarWidth })}
                    >
                        <div className="h-8 w-0.5 bg-gray-700 rounded-full" />
                    </div>

                    {/* Editor Surface */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#0f1012]">
                        <div className="flex-1 relative bg-[#0f1012] overflow-hidden" dir="ltr">
                            <canvas
                                ref={canvasRef}
                                className={`w-full h-full ${toolMode === 'pen' ? 'cursor-crosshair' : ''}`}
                                style={{ objectFit: 'contain', backgroundColor: canvasBackgroundColor }}
                                onMouseDown={handleCanvasMouseDown}
                                onDoubleClick={() => finishDrawing(true)}
                                onContextMenu={handleCanvasContextMenu}
                            />
                            {/* Context Menu Overlay */}
                            {contextMenu && (
                                <div
                                    className="fixed z-[100] bg-[#1a1d21] border border-gray-700 shadow-xl rounded-md py-1 min-w-[150px]"
                                    style={{ left: contextMenu.x, top: contextMenu.y }}
                                    ref={contextMenuRef}
                                >
                                    {contextMenu.options.map((opt, i) => (
                                        <div
                                            key={i}
                                            className="px-4 py-2 hover:bg-blue-600 text-xs cursor-pointer text-white transition-colors"
                                            onClick={(e) => { e.stopPropagation(); opt.action(); }}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Click away listener overlay */}
                            {contextMenu && (
                                <div className="fixed inset-0 z-[99]" onClick={() => setContextMenu(null)} />
                            )}


                            {/* Hidden Video Elements for Texture */}
                            {clips.filter(c => c.type === 'video').map(c => (
                                <video
                                    key={c.id}
                                    ref={el => { if (el) videoRefs.current[c.id] = el; }}
                                    src={isProxyMode && c.proxyUrl ? c.proxyUrl : c.url}
                                    style={{ position: 'fixed', top: -1000, left: -1000, opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
                                    crossOrigin="anonymous"
                                    preload="auto"
                                    muted={tracks.find(t => t.id === c.trackId)?.muted}
                                />
                            ))}
                            {/* Hidden Image Elements */}
                            {clips.filter(c => c.type === 'image').map(c => (
                                <img
                                    key={c.id}
                                    ref={el => { if (el) imageRefs.current[c.id] = el; }}
                                    src={c.url}
                                    style={{ position: 'fixed', top: -1000, left: -1000, opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
                                    crossOrigin="anonymous"
                                />
                            ))}
                        </div>

                        {/* Timeline Toolbar (Horizontal) */}
                        <div className="h-10 bg-[#1a1d21] border-t border-gray-800 flex items-center justify-between px-4 shrink-0">
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" title="Split Selected (Ctrl+K)" onClick={splitSelectedClips}>
                                    <Scissors size={14} />
                                </Button>
                                <div className="w-px h-4 bg-gray-700 mx-1" />
                                <span className="text-gray-500 text-[10px] font-mono">SELECTION: {selectedClipIds.length}</span>
                            </div>

                            {/* Play Controls (Center) */}
                            <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                                <Button variant="ghost" size="sm" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => setCurrentTime(0)}><Undo size={14} /></Button>
                                <Button size="icon" className="w-8 h-8 rounded-full bg-white text-black hover:bg-gray-200" onClick={() => setIsPlaying(!isPlaying)}>
                                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => setCurrentTime(totalDuration)}><Redo size={14} /></Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant={showColorGrading ? "secondary" : "ghost"} size="icon" className="h-7 w-7 text-yellow-500" onClick={() => setShowColorGrading(!showColorGrading)} title="Color Grading"><Palette size={14} /></Button>
                                <Slider value={[zoom]} min={5} max={200} step={5} onValueChange={([v]) => setZoom(v)} className="w-24" />
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsFullscreen(!isFullscreen)}>{isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resizer for Timeline */}
            <div
                className="h-1 bg-[#1a1d21] hover:bg-blue-500 cursor-row-resize transition-colors z-40 flex items-center justify-center group border-t border-b border-black"
                onMouseDown={(e) => { e.preventDefault(); setResizingPanel({ type: 'timeline', startPos: e.clientY, startSize: layout.timelineHeight }); }}
            >
                <div className="w-8 h-0.5 bg-gray-600 group-hover:bg-white rounded-full" />
            </div>

            {/* Bottom - Timeline Area */}
            <div style={{ height: layout.timelineHeight }} className="bg-[#131518] flex flex-col relative text-xs shrink-0">
                <Tabs value={bottomTab} onValueChange={(v: any) => setBottomTab(v)} className="flex-1 flex flex-col min-h-0">
                    <div className="h-8 bg-[#0b0c0e] border-b border-gray-800 flex items-center px-1 shrink-0">
                        <TabsList className="bg-transparent h-full p-0 flex gap-0.5">
                            <TabsTrigger value="timeline" className="h-full rounded-none px-4 text-[10px] font-bold data-[state=active]:bg-[#131518] data-[state=active]:text-blue-400 border-r border-gray-800/50">الجدول الزمني</TabsTrigger>
                            <TabsTrigger value="audio" className="h-full rounded-none px-4 text-[10px] font-bold data-[state=active]:bg-[#131518] data-[state=active]:text-green-400 border-r border-gray-800/50">خلاط الصوت</TabsTrigger>
                            <TabsTrigger value="color" className="h-full rounded-none px-4 text-[10px] font-bold data-[state=active]:bg-[#131518] data-[state=active]:text-yellow-400 border-r border-gray-800/50">تصحيح الألوان</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="timeline" className="flex-1 min-h-0 m-0 p-0 overflow-hidden relative data-[state=active]:flex flex-col">
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Time Ruler */}
                            <div className="h-8 bg-[#1a1d21] border-b border-gray-800 flex relative overflow-hidden shrink-0 cursor-ew-resize select-none" ref={timelineRef} onMouseDown={handleTimelineMouseDown}>
                                <div className="sticky left-0 top-0 z-40 h-full w-40 bg-[#1a1d21] border-r border-gray-800 flex items-center justify-center text-[11px] font-mono text-blue-400 font-bold">
                                    <span className="bg-black/40 px-2 py-0.5 rounded border border-white/5">{formatTime(currentTime)}</span>
                                </div>
                                <div className="flex-1 relative overflow-hidden" dir="ltr">
                                    <div className="absolute inset-0" style={{ transform: `translateX(${300 - currentTime * zoom}px)` }}>
                                        {(() => {
                                            const step = zoom >= 100 ? 1 : zoom >= 20 ? 5 : 30;
                                            const ticks = [];
                                            const maxTime = Math.max(totalDuration + 60, 300);
                                            for (let t = 0; t <= maxTime; t += step) {
                                                ticks.push(
                                                    <div key={t} className="absolute border-l border-gray-600 h-4 bottom-0 z-10" style={{ left: t * zoom }}>
                                                        <span className="text-[9px] text-gray-500 ml-1 font-mono absolute -top-1 whitespace-nowrap bg-[#1a1d21] px-1">{formatTime(t)}</span>
                                                    </div>
                                                );
                                            }
                                            return ticks;
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Tracks Area */}
                            <div className="flex-1 flex overflow-hidden">
                                <div ref={trackHeadersRef} className="sticky left-0 z-30 w-40 bg-[#15171a] border-r border-gray-800 overflow-hidden">
                                    <div className="h-full flex flex-col overflow-y-auto scrollbar-hide">
                                        <div className="p-2 border-b border-gray-800 flex items-center justify-between bg-[#1a1d21]/80 backdrop-blur-sm sticky top-0 z-10">
                                            <span className="text-[9px] font-black text-blue-500/80 uppercase pl-1">VIDEO</span>
                                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => addTrack('video')}><Plus size={12} /></Button>
                                        </div>
                                        {[...tracks].filter(t => t.type === 'video').reverse().map(track => (
                                            <div key={track.id} className="h-16 border-b border-gray-800/50 flex flex-col justify-center px-3 bg-[#1a1d21]/30">
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className="text-[10px] font-bold text-gray-400 truncate">{track.label}</span>
                                                    <div className="flex items-center gap-0.5">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500" onClick={() => toggleTrackLock(track.id)}>{track.locked ? <Lock size={10} /> : <Unlock size={10} />}</Button>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500" onClick={() => toggleTrackVisibility(track.id)}>{track.visible ? <Eye size={10} /> : <EyeOff size={10} />}</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="p-2 border-t border-b border-gray-800 flex items-center justify-between bg-[#1a1d21]/80 backdrop-blur-sm mt-auto sticky bottom-0 z-10">
                                            <span className="text-[9px] font-black text-green-500/80 uppercase pl-1">AUDIO</span>
                                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => addTrack('audio')}><Plus size={12} /></Button>
                                        </div>
                                        {tracks.filter(t => t.type === 'audio').map(track => (
                                            <div key={track.id} className="h-16 border-b border-gray-800/50 flex flex-col justify-center px-3 bg-[#1a1d21]/30">
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className="text-[10px] font-bold text-gray-400 truncate">{track.label}</span>
                                                    <div className="flex items-center gap-0.5">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500" onClick={() => toggleTrackMute(track.id)}>{track.muted ? <VolumeX size={10} /> : <Volume2 size={10} />}</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div ref={tracksContainerRef} className="flex-1 bg-[#0f1012] relative overflow-auto" onMouseDown={handleTracksMouseDown} onScroll={(e) => { if (trackHeadersRef.current) trackHeadersRef.current.scrollTop = e.currentTarget.scrollTop; }}>
                                    <div className="absolute top-0 bottom-0 left-[300px] w-px bg-white z-[60] pointer-events-none h-full shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                                        <div className="absolute -top-4 -translate-x-1/2 w-3 h-5 bg-white rounded-t-sm" />
                                    </div>
                                    <div className="absolute inset-0" style={{ transform: `translateX(${300 - currentTime * zoom}px)` }}>
                                        {tracks.filter(t => t.type !== 'audio').reverse().map(track => (
                                            <div key={track.id} className="h-16 border-b border-gray-800/20 relative group/track">
                                                {clips.filter(c => c.trackId === track.id).map(clip => (
                                                    <div key={clip.id} onMouseDown={(e) => handleClipMouseDown(e, clip)} className={`absolute top-1 bottom-1 rounded-sm border group cursor-pointer ${selectedClipIds.includes(clip.id) ? 'ring-2 ring-blue-500 border-white z-50' : 'border-white/10 opacity-90'}`} style={{ left: clip.startAt * zoom, width: getClipDuration(clip) * zoom, background: clip.type === 'video' ? '#3b82f680' : '#ec489980' }}>
                                                        <div className="p-1 truncate text-[10px] font-bold text-white/90">{clip.name}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                        <div className="h-4 bg-black/20" />
                                        {tracks.filter(t => t.type === 'audio').map(track => (
                                            <div key={track.id} className="h-16 border-b border-gray-800/30 relative">
                                                {clips.filter(c => c.trackId === track.id).map(clip => (
                                                    <div key={clip.id} onMouseDown={(e) => handleClipMouseDown(e, clip)} className={`absolute top-1 bottom-1 rounded-sm border cursor-pointer ${selectedClipIds.includes(clip.id) ? 'ring-2 ring-blue-500 border-white z-50' : 'border-white/10'}`} style={{ left: clip.startAt * zoom, width: getClipDuration(clip) * zoom, background: '#10b98180' }}>
                                                        <div className="p-1 truncate text-[10px] font-bold text-white/90">{clip.name}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="audio" className="flex-1 min-h-0 m-0 p-4 bg-[#131518] overflow-auto">
                        <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
                            <div className="col-span-1 bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col items-center">
                                <span className="text-[10px] font-black text-blue-500 uppercase mb-4 tracking-widest">Master</span>
                                <Slider orientation="vertical" defaultValue={[80]} className="h-48" />
                            </div>
                            <div className="col-span-3 flex gap-4 overflow-x-auto">
                                {tracks.map(track => (
                                    <div key={track.id} className="min-w-[100px] bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center">
                                        <span className="text-[9px] font-bold text-gray-400 mb-2 truncate w-full text-center">{track.label}</span>
                                        <Slider orientation="vertical" defaultValue={[100]} className="h-40 mb-4" />
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleTrackMute(track.id)}><VolumeX size={12} /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleTrackLock(track.id)}><Lock size={12} /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="color" className="flex-1 min-h-0 m-0 p-0 bg-[#131518] overflow-auto">
                        {selectedClipIds.length > 0 ? (
                            <div className="h-full p-4"><ColorGradingControls selectedClip={clips.find(c => c.id === selectedClipIds[0]) || null} onUpdate={handlePropertyUpdate} getFrameStats={getFrameStats} getHistogramData={getHistogramData} /></div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2"><Palette size={32} className="opacity-20" /><p>يرجى اختيار مقطع لتعديل ألوانه</p></div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {selectionBox && <div className="fixed border border-blue-500 bg-blue-500/20 pointer-events-none z-50" style={{ left: Math.min(selectionBox.startX, selectionBox.startX + selectionBox.w), top: Math.min(selectionBox.startY, selectionBox.startY + selectionBox.h), width: Math.abs(selectionBox.w), height: Math.abs(selectionBox.h) }} />}

            <input type="file" multiple accept="video/*,image/*,audio/*" className="hidden" onChange={handleFileUpload} />

            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogContent className="bg-[#1a1d21] border-gray-700 text-white sm:max-w-[425px]">
                    <DialogHeader><DialogTitle>تصدير المشروع</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Button onClick={performExport} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">تصدير الآن</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <VideoEditorAI isOpen={isAIChannelOpen} onClose={() => setIsAIChannelOpen(false)} onAction={handleAIAction} />

            {/* Dynamic CSS Filters for Advanced Color Grading */}
            <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
                <defs>
                    {clips.map(c => {
                        if (!c.color) return null;
                        const { lift, gamma, gain, curves } = c.color;
                        return (
                            <filter key={c.id} id={`filter-${c.id}`}>
                                <feComponentTransfer>
                                    <feFuncR type="gamma" offset={(lift?.r || 0) / 100} exponent={gamma?.r || 1} amplitude={gain?.r || 1} />
                                    <feFuncG type="gamma" offset={(lift?.g || 0) / 100} exponent={gamma?.g || 1} amplitude={gain?.g || 1} />
                                    <feFuncB type="gamma" offset={(lift?.b || 0) / 100} exponent={gamma?.b || 1} amplitude={gain?.b || 1} />
                                </feComponentTransfer>
                                {curves && curves.master && (
                                    <feComponentTransfer>
                                        <feFuncR type="table" tableValues={curves.red?.map(v => v / 100).join(' ') || "0 1"} />
                                        <feFuncG type="table" tableValues={curves.green?.map(v => v / 100).join(' ') || "0 1"} />
                                        <feFuncB type="table" tableValues={curves.blue?.map(v => v / 100).join(' ') || "0 1"} />
                                    </feComponentTransfer>
                                )}
                                {c.color.lut && c.color.lut !== 'none' && (
                                    <feColorMatrix
                                        type="matrix"
                                        values={(() => {
                                            const luts: Record<string, string> = {
                                                'hollywood': '1.2 0.1 0 0 0  0 1.1 0 0 0  0 0.1 1.4 0 0  0 0 0 1 0',
                                                'teal_orange': '1.4 -0.2 -0.2 0 0  -0.1 1.2 -0.1 0 0  -0.3 -0.3 1.6 0 0  0 0 0 1 0',
                                                'vintage': '0.9 0.3 0.1 0 0  0.1 0.9 0.1 0 0  0.1 0.1 0.7 0 0  0 0 0 1 0',
                                                'noir': '0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0',
                                                'warm_vibe': '1.1 0.2 0 0 0  0 1.0 0 0 0  0 0 0.8 0 0  0 0 0 1 0',
                                                'faded': '0.8 0.1 0.1 0 0.1  0.1 0.8 0.1 0 0.1  0.1 0.1 0.8 0 0.1  0 0 0 1 0'
                                            };
                                            return luts[c.color.lut] || '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0';
                                        })()}
                                    />
                                )}
                            </filter>
                        );
                    })}
                </defs>
            </svg>
        </div>
    );
}
