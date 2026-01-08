import React from 'react';
import { 
  Download, 
  Trash2, 
  Save, 
  Undo, 
  Redo, 
  Play, 
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Scissors,
  Copy,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface ProModeToolbarProps {
  onExport?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  isPlaying?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  hasSelection?: boolean;
}

export default function ProModeToolbar({
  onExport,
  onDelete,
  onSave,
  onUndo,
  onRedo,
  onPlay,
  onPause,
  isPlaying = false,
  canUndo = false,
  canRedo = false,
  hasSelection = false,
}: ProModeToolbarProps) {
  
  return (
    <div className="w-full bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 shadow-lg">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* القسم الأيسر - التصدير (أزرق) */}
          <div className="flex items-center gap-2">
            {/* زر التصدير الرئيسي */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6"
                  onClick={onExport}
                >
                  <Download size={18} />
                  <span className="font-semibold">تصدير</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={onExport}>
                  <Download size={16} className="ml-2" />
                  تصدير الفيديو
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download size={16} className="ml-2" />
                  تصدير كـ MP4
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download size={16} className="ml-2" />
                  تصدير كـ MOV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings size={16} className="ml-2" />
                  إعدادات التصدير
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* زر الحفظ */}
            <Button
              variant="outline"
              className="border-slate-600 hover:bg-slate-700 text-white gap-2"
              onClick={onSave}
            >
              <Save size={18} />
              حفظ
            </Button>

            {/* فاصل */}
            <div className="h-8 w-px bg-slate-600" />

            {/* أزرار التراجع والإعادة */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-slate-700 text-white"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-slate-700 text-white"
                onClick={onRedo}
                disabled={!canRedo}
              >
                <Redo size={18} />
              </Button>
            </div>
          </div>

          {/* القسم الأوسط - أدوات التحكم في التشغيل */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-slate-700 text-white"
            >
              <SkipBack size={18} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-slate-700 text-white h-10 w-10"
              onClick={isPlaying ? onPause : onPlay}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-slate-700 text-white"
            >
              <SkipForward size={18} />
            </Button>

            <div className="h-8 w-px bg-slate-600 mx-2" />

            {/* أدوات التحرير السريع */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-slate-700 text-white"
              title="قص"
            >
              <Scissors size={18} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-slate-700 text-white"
              title="نسخ"
            >
              <Copy size={18} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-slate-700 text-white"
              title="صوت"
            >
              <Volume2 size={18} />
            </Button>
          </div>

          {/* القسم الأيمن - الحذف (أحمر) */}
          <div className="flex items-center gap-2">
            {/* مؤشر الاختيار */}
            {hasSelection && (
              <Badge variant="secondary" className="bg-blue-600 text-white">
                محدد
              </Badge>
            )}

            {/* فاصل */}
            <div className="h-8 w-px bg-slate-600" />

            {/* زر الحذف */}
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 gap-2 px-6"
              onClick={onDelete}
              disabled={!hasSelection}
            >
              <Trash2 size={18} />
              <span className="font-semibold">حذف</span>
            </Button>
          </div>
        </div>
      </div>

      {/* شريط معلومات إضافي */}
      <div className="px-4 py-1.5 bg-slate-950/50 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>⌨️ اضغط <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">?</kbd> للاختصارات</span>
            <span>•</span>
            <span>✂️ <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">S</kbd> للقص</span>
            <span>•</span>
            <span>📋 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Ctrl+C</kbd> للنسخ</span>
          </div>
          <div className="flex items-center gap-4">
            <span>وضع المحترف Pro Mode</span>
            <span>•</span>
            <span className="text-green-400">● متصل</span>
          </div>
        </div>
      </div>
    </div>
  );
}
