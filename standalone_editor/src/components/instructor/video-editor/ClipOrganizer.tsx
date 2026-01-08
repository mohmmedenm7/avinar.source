import React, { useState, useEffect } from 'react';
import { Folder, FolderPlus, Tag, Search, Filter, Grid3x3, List, Sparkles, X, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AIVideoTools, ClipFolder, ColorTag } from '@/services/aiVideoTools';

interface ClipOrganizerProps {
  clips: any[];
  onClipUpdate: (clipId: string, updates: any) => void;
  onFoldersChange?: (folders: ClipFolder[]) => void;
}

export default function ClipOrganizer({ clips, onClipUpdate, onFoldersChange }: ClipOrganizerProps) {
  const [folders, setFolders] = useState<ClipFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3B82F6');

  // Load folders on mount
  useEffect(() => {
    const loadedFolders = AIVideoTools.loadFolders();
    setFolders(loadedFolders);
  }, []);

  // Save folders when they change
  useEffect(() => {
    if (folders.length > 0) {
      AIVideoTools.saveFolders(folders);
      onFoldersChange?.(folders);
    }
  }, [folders, onFoldersChange]);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder = AIVideoTools.createFolder(newFolderName, newFolderColor);
    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setShowNewFolderDialog(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المجلد؟ (لن يتم حذف المقاطع)')) {
      setFolders(prev => prev.filter(f => f.id !== folderId));
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
    }
  };

  const handleAutoOrganize = () => {
    const { folders: newFolders, assignments } = AIVideoTools.autoOrganizeClips(clips);
    setFolders(prev => [...prev, ...newFolders]);
    
    // Update clips with folder assignments
    assignments.forEach((folderId, clipId) => {
      onClipUpdate(clipId, { folderId });
    });
  };

  const handleAddClipToFolder = (clipId: string, folderId: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? AIVideoTools.addClipToFolder(folder, clipId)
        : folder
    ));
    onClipUpdate(clipId, { folderId });
  };

  const handleRemoveClipFromFolder = (clipId: string, folderId: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? AIVideoTools.removeClipFromFolder(folder, clipId)
        : folder
    ));
    onClipUpdate(clipId, { folderId: null });
  };

  const handleApplyColorTag = (clipId: string, colorId: string) => {
    const color = AIVideoTools.DEFAULT_COLORS.find(c => c.id === colorId);
    if (color) {
      onClipUpdate(clipId, { colorTag: colorId, color: color.color });
    }
  };

  const filteredClips = searchQuery 
    ? AIVideoTools.searchClips(clips, searchQuery)
    : clips;

  const displayedClips = selectedFolder
    ? filteredClips.filter(clip => clip.folderId === selectedFolder)
    : filteredClips;

  const getClipCount = (folderId: string) => {
    return clips.filter(clip => clip.folderId === folderId).length;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في المقاطع..."
            className="pr-10 text-sm"
          />
        </div>

        {/* View Mode */}
        <div className="flex border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-none"
          >
            <Grid3x3 size={16} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-none"
          >
            <List size={16} />
          </Button>
        </div>

        {/* Auto Organize */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAutoOrganize}
          className="gap-2"
        >
          <Sparkles size={16} />
          تنظيم تلقائي
        </Button>

        {/* New Folder */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewFolderDialog(true)}
          className="gap-2"
        >
          <FolderPlus size={16} />
          مجلد جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Folders Sidebar */}
        <Card className="p-4 space-y-2">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">
            المجلدات
          </h3>

          {/* All Clips */}
          <button
            onClick={() => setSelectedFolder(null)}
            className={`w-full text-right p-2 rounded-lg transition-colors ${
              selectedFolder === null
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder size={16} className="text-gray-400" />
                <span className="text-sm">جميع المقاطع</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {clips.length}
              </Badge>
            </div>
          </button>

          {/* Folder List */}
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {folders.map(folder => (
              <div
                key={folder.id}
                className={`group relative p-2 rounded-lg transition-colors ${
                  selectedFolder === folder.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <button
                  onClick={() => setSelectedFolder(folder.id)}
                  className="w-full text-right"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Folder size={16} style={{ color: folder.color }} />
                      <span className="text-sm">{folder.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {getClipCount(folder.id)}
                    </Badge>
                  </div>
                </button>
                
                {/* Folder Actions */}
                <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:bg-red-100"
                    onClick={() => handleDeleteFolder(folder.id)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Clips Grid/List */}
        <div className="lg:col-span-3">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                {selectedFolder
                  ? folders.find(f => f.id === selectedFolder)?.name
                  : 'جميع المقاطع'}
                <span className="text-gray-400 mr-2">({displayedClips.length})</span>
              </h3>

              {/* Color Tags Quick Filter */}
              <div className="flex items-center gap-1">
                {AIVideoTools.DEFAULT_COLORS.slice(0, 4).map(color => (
                  <button
                    key={color.id}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.color }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Clips Display */}
            {displayedClips.length === 0 ? (
              <div className="text-center py-12">
                <Folder size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">لا توجد مقاطع</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-3' : 'space-y-2'}>
                {displayedClips.map(clip => (
                  <div
                    key={clip.id}
                    className={`group relative ${
                      viewMode === 'grid'
                        ? 'aspect-video'
                        : 'flex items-center gap-3'
                    } bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow`}
                  >
                    {/* Clip Thumbnail */}
                    <div className={`${viewMode === 'grid' ? 'w-full h-full' : 'w-24 h-16'} bg-gray-200 dark:bg-slate-600 relative`}>
                      {clip.thumbnail && (
                        <img src={clip.thumbnail} alt={clip.title} className="w-full h-full object-cover" />
                      )}
                      
                      {/* Color Tag */}
                      {clip.colorTag && (
                        <div
                          className="absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-white shadow"
                          style={{ backgroundColor: clip.color }}
                        />
                      )}
                    </div>

                    {/* Clip Info */}
                    <div className={`${viewMode === 'grid' ? 'absolute bottom-0 left-0 right-0' : 'flex-1'} p-2 bg-gradient-to-t from-black/70 to-transparent`}>
                      <p className="text-xs font-medium text-white line-clamp-1">
                        {clip.title || 'بدون عنوان'}
                      </p>
                    </div>

                    {/* Actions Menu */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="h-7 w-7">
                            <Tag size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {/* Color Tags */}
                          <div className="p-2">
                            <p className="text-xs font-semibold mb-2">علامة لونية</p>
                            <div className="grid grid-cols-4 gap-1">
                              {AIVideoTools.DEFAULT_COLORS.map(color => (
                                <button
                                  key={color.id}
                                  onClick={() => handleApplyColorTag(clip.id, color.id)}
                                  className="w-8 h-8 rounded-full hover:scale-110 transition-transform shadow-sm"
                                  style={{ backgroundColor: color.color }}
                                  title={color.name}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Move to Folder */}
                          <div className="border-t p-2">
                            <p className="text-xs font-semibold mb-2">نقل إلى مجلد</p>
                            {folders.map(folder => (
                              <DropdownMenuItem
                                key={folder.id}
                                onClick={() => handleAddClipToFolder(clip.id, folder.id)}
                              >
                                <Folder size={14} className="ml-2" style={{ color: folder.color }} />
                                {folder.name}
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">مجلد جديد</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNewFolderDialog(false)}
              >
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">اسم المجلد</label>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="مثال: مقاطع الدرس الأول"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">اللون</label>
                <div className="grid grid-cols-8 gap-2">
                  {AIVideoTools.DEFAULT_COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => setNewFolderColor(color.color)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        newFolderColor === color.color
                          ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.color }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateFolder}
                  className="flex-1"
                  disabled={!newFolderName.trim()}
                >
                  إنشاء المجلد
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewFolderDialog(false)}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
