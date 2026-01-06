import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Eye, EyeOff, Lock, Unlock, Trash2, Copy, Plus,
    ChevronDown, ChevronRight, Layers as LayersIcon,
    GripVertical, Edit2, Check, X, Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Track {
    id: number;
    type: 'video' | 'audio' | 'overlay';
    label: string;
    visible: boolean;
    muted: boolean;
    locked: boolean;
    color: string;
    collapsed?: boolean;
    groupId?: number;
}

interface LayersPanelProps {
    tracks: Track[];
    onUpdateTrack: (id: number, updates: Partial<Track>) => void;
    onDeleteTrack: (id: number) => void;
    onAddTrack: (type: 'video' | 'audio') => void;
    onReorderTracks: (tracks: Track[]) => void;
    onDuplicateTrack: (id: number) => void;
    selectedTrackId?: number;
    onSelectTrack?: (id: number) => void;
}

const PRESET_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
];

export default function LayersPanel({
    tracks,
    onUpdateTrack,
    onDeleteTrack,
    onAddTrack,
    onReorderTracks,
    onDuplicateTrack,
    selectedTrackId,
    onSelectTrack
}: LayersPanelProps) {
    const { t } = useTranslation();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingLabel, setEditingLabel] = useState('');
    const [draggedTrack, setDraggedTrack] = useState<Track | null>(null);
    const [dragOverId, setDragOverId] = useState<number | null>(null);

    const handleStartEdit = (track: Track) => {
        setEditingId(track.id);
        setEditingLabel(track.label);
    };

    const handleSaveEdit = () => {
        if (editingId !== null) {
            onUpdateTrack(editingId, { label: editingLabel });
            setEditingId(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingLabel('');
    };

    const handleDragStart = (e: React.DragEvent, track: Track) => {
        setDraggedTrack(track);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, trackId: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverId(trackId);
    };

    const handleDragLeave = () => {
        setDragOverId(null);
    };

    const handleDrop = (e: React.DragEvent, targetTrack: Track) => {
        e.preventDefault();

        if (!draggedTrack || draggedTrack.id === targetTrack.id) {
            setDraggedTrack(null);
            setDragOverId(null);
            return;
        }

        // Reorder tracks
        const newTracks = [...tracks];
        const draggedIndex = newTracks.findIndex(t => t.id === draggedTrack.id);
        const targetIndex = newTracks.findIndex(t => t.id === targetTrack.id);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            newTracks.splice(draggedIndex, 1);
            newTracks.splice(targetIndex, 0, draggedTrack);
            onReorderTracks(newTracks);
        }

        setDraggedTrack(null);
        setDragOverId(null);
    };

    const videoTracks = tracks.filter(t => t.type !== 'audio');
    const audioTracks = tracks.filter(t => t.type === 'audio');

    const renderTrack = (track: Track) => {
        const isEditing = editingId === track.id;
        const isSelected = selectedTrackId === track.id;
        const isDragOver = dragOverId === track.id;

        return (
            <div
                key={track.id}
                draggable={!track.locked && !isEditing}
                onDragStart={(e) => handleDragStart(e, track)}
                onDragOver={(e) => handleDragOver(e, track.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, track)}
                onClick={() => onSelectTrack?.(track.id)}
                className={`
                    group relative flex items-center gap-2 px-2 py-2 border-b border-gray-700/50
                    transition-all duration-150 cursor-pointer
                    ${isSelected ? 'bg-blue-500/20 border-l-4 border-l-blue-500' : 'hover:bg-gray-700/30'}
                    ${isDragOver ? 'border-t-2 border-t-blue-500' : ''}
                    ${track.locked ? 'opacity-60' : ''}
                `}
            >
                {/* Drag Handle */}
                {!track.locked && (
                    <div className="cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-opacity">
                        <GripVertical size={14} className="text-gray-400" />
                    </div>
                )}

                {/* Color Indicator */}
                <div
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: track.color }}
                />

                {/* Track Label */}
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="flex items-center gap-1">
                            <Input
                                value={editingLabel}
                                onChange={(e) => setEditingLabel(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit();
                                    if (e.key === 'Escape') handleCancelEdit();
                                }}
                                className="h-6 text-xs bg-gray-800 border-gray-600"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveEdit();
                                }}
                            >
                                <Check size={12} className="text-green-500" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEdit();
                                }}
                            >
                                <X size={12} className="text-red-500" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-300 truncate">
                                {track.label}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase">
                                {track.type}
                            </span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Visibility Toggle */}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdateTrack(track.id, { visible: !track.visible });
                        }}
                        title={track.visible ? 'إخفاء' : 'إظهار'}
                    >
                        {track.visible ? (
                            <Eye size={12} className="text-blue-400" />
                        ) : (
                            <EyeOff size={12} className="text-gray-500" />
                        )}
                    </Button>

                    {/* Lock Toggle */}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdateTrack(track.id, { locked: !track.locked });
                        }}
                        title={track.locked ? 'فك القفل' : 'قفل'}
                    >
                        {track.locked ? (
                            <Lock size={12} className="text-yellow-400" />
                        ) : (
                            <Unlock size={12} className="text-gray-500" />
                        )}
                    </Button>

                    {/* More Options */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 shrink-0"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Edit2 size={12} className="text-gray-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEdit(track);
                                }}
                            >
                                <Edit2 size={14} className="mr-2" />
                                إعادة تسمية
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDuplicateTrack(track.id);
                                }}
                            >
                                <Copy size={14} className="mr-2" />
                                نسخ الطبقة
                            </DropdownMenuItem>

                            {/* Color Picker */}
                            <div className="px-2 py-2 border-t border-gray-700">
                                <div className="text-xs text-gray-400 mb-2">اللون:</div>
                                <div className="grid grid-cols-4 gap-1">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            className={`w-6 h-6 rounded border-2 transition-all ${track.color === color
                                                    ? 'border-white scale-110'
                                                    : 'border-transparent hover:border-gray-500'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdateTrack(track.id, { color });
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`هل تريد حذف الطبقة "${track.label}"؟`)) {
                                        onDeleteTrack(track.id);
                                    }
                                }}
                                className="text-red-500 focus:text-red-500"
                            >
                                <Trash2 size={14} className="mr-2" />
                                حذف الطبقة
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-[#1a1d21] border-l border-gray-800">
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-800 flex items-center justify-between bg-[#131518]">
                <div className="flex items-center gap-2">
                    <LayersIcon size={16} className="text-blue-400" />
                    <h3 className="text-sm font-bold text-gray-200">الطبقات</h3>
                </div>
                <div className="text-xs text-gray-500">
                    {tracks.length} طبقة
                </div>
            </div>

            {/* Tracks List */}
            <ScrollArea className="flex-1">
                {/* Video Tracks Section */}
                <div className="border-b border-gray-800">
                    <div className="px-3 py-2 bg-[#131518] flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                            <ChevronDown size={14} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase">
                                فيديو ({videoTracks.length})
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[10px] px-2"
                            onClick={() => onAddTrack('video')}
                        >
                            <Plus size={12} className="mr-1" />
                            إضافة
                        </Button>
                    </div>
                    <div>
                        {videoTracks.length === 0 ? (
                            <div className="px-3 py-6 text-center text-xs text-gray-500">
                                لا توجد طبقات فيديو
                            </div>
                        ) : (
                            videoTracks.map(renderTrack)
                        )}
                    </div>
                </div>

                {/* Audio Tracks Section */}
                <div>
                    <div className="px-3 py-2 bg-[#131518] flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                            <ChevronDown size={14} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase">
                                صوت ({audioTracks.length})
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[10px] px-2"
                            onClick={() => onAddTrack('audio')}
                        >
                            <Plus size={12} className="mr-1" />
                            إضافة
                        </Button>
                    </div>
                    <div>
                        {audioTracks.length === 0 ? (
                            <div className="px-3 py-6 text-center text-xs text-gray-500">
                                لا توجد طبقات صوت
                            </div>
                        ) : (
                            audioTracks.map(renderTrack)
                        )}
                    </div>
                </div>
            </ScrollArea>

            {/* Footer Info */}
            <div className="px-3 py-2 border-t border-gray-800 bg-[#131518]">
                <div className="text-[10px] text-gray-500 space-y-1">
                    <div className="flex items-center gap-2">
                        <GripVertical size={10} />
                        <span>اسحب لإعادة الترتيب</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Eye size={10} />
                        <span>إظهار/إخفاء الطبقة</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Lock size={10} />
                        <span>قفل/فك قفل الطبقة</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
