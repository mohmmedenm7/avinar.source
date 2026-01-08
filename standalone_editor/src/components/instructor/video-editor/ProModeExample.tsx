import React, { useState } from 'react';
import ProModeToolbar from './ProModeToolbar';
import { Card } from '@/components/ui/card';

/**
 * مثال على استخدام شريط Pro Mode
 * التصميم: التصدير على اليسار، الحذف على اليمين
 */
export default function ProModeExample() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const handleExport = () => {
    console.log('🎬 تصدير الفيديو...');
    alert('جاري تصدير الفيديو...');
  };

  const handleDelete = () => {
    if (!hasSelection) return;
    
    if (confirm('هل أنت متأكد من حذف العناصر المحددة؟')) {
      console.log('🗑️ حذف العناصر المحددة');
      setHasSelection(false);
      
      // إضافة للتراجع
      setUndoStack([...undoStack, 'delete_action']);
    }
  };

  const handleSave = () => {
    console.log('💾 حفظ المشروع...');
    alert('تم حفظ المشروع بنجاح!');
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack([...redoStack, lastAction]);
    
    console.log('↩️ تراجع عن:', lastAction);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const action = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack([...undoStack, action]);
    
    console.log('↪️ إعادة:', action);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    console.log('▶️ تشغيل');
  };

  const handlePause = () => {
    setIsPlaying(false);
    console.log('⏸️ إيقاف مؤقت');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* شريط الأدوات في الأعلى */}
      <ProModeToolbar
        onExport={handleExport}
        onDelete={handleDelete}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPlay={handlePlay}
        onPause={handlePause}
        isPlaying={isPlaying}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        hasSelection={hasSelection}
      />

      {/* محتوى الصفحة */}
      <div className="p-6 space-y-6">
        {/* معاينة الفيديو */}
        <Card className="bg-slate-900 border-slate-700 p-6">
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-white text-2xl mb-2">
                {isPlaying ? '▶️ جاري التشغيل...' : '⏸️ متوقف'}
              </p>
              <p className="text-slate-400 text-sm">
                منطقة معاينة الفيديو
              </p>
            </div>
          </div>
        </Card>

        {/* خط الزمن */}
        <Card className="bg-slate-900 border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-4">Timeline - خط الزمن</h3>
          
          <div className="space-y-3">
            {/* مقطع 1 */}
            <div
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                hasSelection 
                  ? 'bg-blue-600 border-2 border-blue-400' 
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
              onClick={() => setHasSelection(!hasSelection)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">مقطع فيديو 1</p>
                  <p className="text-slate-400 text-sm">00:00 - 00:15</p>
                </div>
                {hasSelection && (
                  <span className="text-white text-sm">✓ محدد</span>
                )}
              </div>
            </div>

            {/* مقطع 2 */}
            <div className="p-4 bg-slate-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">مقطع فيديو 2</p>
                  <p className="text-slate-400 text-sm">00:15 - 00:30</p>
                </div>
              </div>
            </div>

            {/* مقطع 3 */}
            <div className="p-4 bg-slate-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">مقطع فيديو 3</p>
                  <p className="text-slate-400 text-sm">00:30 - 00:45</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* معلومات الحالة */}
        <Card className="bg-slate-900 border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-4">الحالة الحالية</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-800 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">التشغيل</p>
              <p className="text-white font-semibold">
                {isPlaying ? '▶️ يعمل' : '⏸️ متوقف'}
              </p>
            </div>

            <div className="p-3 bg-slate-800 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">الاختيار</p>
              <p className="text-white font-semibold">
                {hasSelection ? '✓ محدد' : '○ لا شيء'}
              </p>
            </div>

            <div className="p-3 bg-slate-800 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">التراجع</p>
              <p className="text-white font-semibold">
                {undoStack.length} إجراء
              </p>
            </div>

            <div className="p-3 bg-slate-800 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">الإعادة</p>
              <p className="text-white font-semibold">
                {redoStack.length} إجراء
              </p>
            </div>
          </div>
        </Card>

        {/* تعليمات */}
        <Card className="bg-blue-900/20 border-blue-700 p-6">
          <h3 className="text-blue-200 font-semibold mb-3">📘 تعليمات الاستخدام</h3>
          <div className="space-y-2 text-sm text-blue-100">
            <p>• <strong>اليسار:</strong> 🔵 زر التصدير الأزرق + حفظ + تراجع/إعادة</p>
            <p>• <strong>الوسط:</strong> أدوات التشغيل والتحرير السريع</p>
            <p>• <strong>اليمين:</strong> 🔴 زر الحذف الأحمر</p>
            <p>• <strong>الاختيار:</strong> انقر على مقطع في Timeline لتحديده</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
