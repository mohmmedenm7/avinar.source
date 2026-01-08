/**
 * 🎯 مثال تكامل كامل - VideoTools مع التحسينات الجديدة
 * 
 * هذا المثال يوضح كيفية دمج جميع التحسينات في VideoTools
 * بطريقة سهلة ومباشرة
 */

import React, { useState, useEffect } from 'react';
import { Settings, Keyboard as KeyboardIcon, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// المكونات الجديدة
import BeginnerModeToggle from '@/components/instructor/shared/BeginnerModeToggle';
import KeyboardShortcutsPanel from '@/components/instructor/video-editor/KeyboardShortcutsPanel';
import ClipOrganizer from '@/components/instructor/video-editor/ClipOrganizer';

// الخدمات
import { AIVideoTools, UserPreferences } from '@/services/aiVideoTools';

/**
 * 📝 Example 1: دمج بسيط
 * الحد الأدنى من الكود للبدء
 */
export function SimpleIntegration() {
  const [prefs, setPrefs] = useState<UserPreferences>(AIVideoTools.loadUserPreferences());
  const [showShortcuts, setShowShortcuts] = useState(false);

  // اختصار ? لفتح لوحة الاختصارات
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div>
      {/* وضع المبتدئ */}
      <BeginnerModeToggle
        isBeginnerMode={prefs.beginnerMode}
        onChange={(enabled) => {
          const updated = { ...prefs, beginnerMode: enabled };
          setPrefs(updated);
          AIVideoTools.saveUserPreferences(updated);
        }}
      />

      {/* لوحة الاختصارات */}
      <KeyboardShortcutsPanel
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}

/**
 * 📝 Example 2: دمج متوسط
 * إضافة نظام المجلدات والتنظيم
 */
export function MediumIntegration() {
  const [prefs, setPrefs] = useState<UserPreferences>(AIVideoTools.loadUserPreferences());
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [clips, setClips] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);

  // اختصارات لوحة المفاتيح
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleClipUpdate = (clipId: string, updates: any) => {
    setClips(prev => prev.map(clip =>
      clip.id === clipId ? { ...clip, ...updates } : clip
    ));
  };

  return (
    <div className="space-y-4">
      {/* وضع المبتدئ */}
      <BeginnerModeToggle
        isBeginnerMode={prefs.beginnerMode}
        onChange={(enabled) => {
          const updated = { ...prefs, beginnerMode: enabled };
          setPrefs(updated);
          AIVideoTools.saveUserPreferences(updated);
        }}
      />

      {/* منظم المقاطع */}
      <ClipOrganizer
        clips={clips}
        onClipUpdate={handleClipUpdate}
        onFoldersChange={setFolders}
      />

      {/* لوحة الاختصارات */}
      <KeyboardShortcutsPanel
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}

/**
 * 📝 Example 3: دمج كامل مع VideoTools الموجود
 * دمج شامل مع جميع الميزات
 */
export default function VideoToolsEnhanced() {
  // إدارة الإعدادات
  const [prefs, setPrefs] = useState<UserPreferences>(AIVideoTools.loadUserPreferences());
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showOrganizer, setShowOrganizer] = useState(false);

  // بيانات الفيديو
  const [clips, setClips] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedClip, setSelectedClip] = useState<any>(null);

  // تحميل المجلدات عند البدء
  useEffect(() => {
    const savedFolders = AIVideoTools.loadFolders();
    setFolders(savedFolders);
  }, []);

  // اختصارات لوحة المفاتيح - شامل
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // لوحة الاختصارات
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }

      // التشغيل
      if (e.key === ' ' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        // togglePlayPause();
      }

      // التحرير
      if (e.key === 's' && !e.ctrlKey && selectedClip) {
        e.preventDefault();
        // splitClip(selectedClip);
      }

      if (e.key === 'c' && e.ctrlKey && selectedClip) {
        // copyClip(selectedClip);
      }

      if (e.key === 'v' && e.ctrlKey) {
        // pasteClip();
      }

      if (e.key === 'Delete' && selectedClip) {
        // deleteClip(selectedClip);
      }

      if (e.key === 'z' && e.ctrlKey) {
        // undo();
      }

      if (e.key === 'y' && e.ctrlKey) {
        // redo();
      }

      // الملفات
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        // saveProject();
      }

      if (e.key === 'e' && e.ctrlKey) {
        e.preventDefault();
        // exportVideo();
      }

      // التنقل
      if (e.key === 'f' && e.ctrlKey) {
        e.preventDefault();
        // focusSearch();
      }

      // التنظيم
      if (e.key === 'g' && e.ctrlKey) {
        e.preventDefault();
        setShowOrganizer(true);
      }

      // علامات لونية (1-8)
      const num = parseInt(e.key);
      if (num >= 1 && num <= 8 && selectedClip) {
        const colors = AIVideoTools.DEFAULT_COLORS;
        const color = colors[num - 1];
        if (color) {
          handleClipUpdate(selectedClip.id, {
            colorTag: color.id,
            color: color.color
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedClip]);

  const handleClipUpdate = (clipId: string, updates: any) => {
    setClips(prev => prev.map(clip =>
      clip.id === clipId ? { ...clip, ...updates } : clip
    ));
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    AIVideoTools.saveUserPreferences(updated);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* شريط علوي */}
      <header className="bg-white dark:bg-slate-800 border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            محرر الفيديو المتقدم
          </h1>

          <div className="flex items-center gap-2">
            {/* وضع المبتدئ */}
            <BeginnerModeToggle
              isBeginnerMode={prefs.beginnerMode}
              onChange={(enabled) => handlePreferenceChange('beginnerMode', enabled)}
            />

            {/* أزرار سريعة */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOrganizer(!showOrganizer)}
              className="gap-2"
            >
              <FolderOpen size={16} />
              المجلدات
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShortcuts(true)}
              className="gap-2"
            >
              <KeyboardIcon size={16} />
              الاختصارات
            </Button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 overflow-hidden">
        <Tabs defaultValue="editor" className="h-full">
          <TabsList className="border-b w-full justify-start rounded-none">
            <TabsTrigger value="editor">المحرر</TabsTrigger>
            <TabsTrigger value="organizer">التنظيم</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="h-full p-4">
            {/* محرر الفيديو الأساسي هنا */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 h-full">
              <p className="text-gray-500">محرر الفيديو الأساسي...</p>
              {prefs.beginnerMode && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>وضع المبتدئ نشط:</strong> الأدوات المتقدمة مخفية للتبسيط
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="organizer" className="h-full p-4 overflow-auto">
            <ClipOrganizer
              clips={clips}
              onClipUpdate={handleClipUpdate}
              onFoldersChange={setFolders}
            />
          </TabsContent>

          <TabsContent value="settings" className="h-full p-4 overflow-auto">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-lg font-bold">الإعدادات</h2>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">عرض اختصارات لوحة المفاتيح</p>
                    <p className="text-sm text-gray-500">إظهار التلميحات للاختصارات</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.showKeyboardShortcuts}
                    onChange={(e) => handlePreferenceChange('showKeyboardShortcuts', e.target.checked)}
                    className="rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">تنظيم تلقائي</p>
                    <p className="text-sm text-gray-500">تنظيم المقاطع تلقائياً</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.autoOrganize}
                    onChange={(e) => handlePreferenceChange('autoOrganize', e.target.checked)}
                    className="rounded"
                  />
                </div>

                <div>
                  <label className="font-medium block mb-2">العلامة اللونية الافتراضية</label>
                  <div className="grid grid-cols-8 gap-2">
                    {AIVideoTools.DEFAULT_COLORS.map(color => (
                      <button
                        key={color.id}
                        onClick={() => handlePreferenceChange('defaultColorTag', color.id)}
                        className={`w-10 h-10 rounded-lg transition-all ${prefs.defaultColorTag === color.id
                            ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                            : 'hover:scale-105'
                          }`}
                        style={{ backgroundColor: color.color }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium block mb-2">ترتيب المقاطع</label>
                  <select
                    value={prefs.clipSortBy}
                    onChange={(e) => handlePreferenceChange('clipSortBy', e.target.value as any)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="time">حسب الوقت</option>
                    <option value="name">حسب الاسم</option>
                    <option value="color">حسب اللون</option>
                    <option value="folder">حسب المجلد</option>
                  </select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* النوافذ المنبثقة */}
      <KeyboardShortcutsPanel
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* شريط الحالة */}
      <footer className="bg-white dark:bg-slate-800 border-t p-2">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>{clips.length} مقطع</span>
            <span>{folders.length} مجلد</span>
          </div>
          <div className="flex items-center gap-2">
            <span>اضغط</span>
            <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 border rounded">?</kbd>
            <span>للاختصارات</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * 📝 Example 4: دمج جزئي - فقط في قسم معين
 * إضافة المكونات في أماكن محددة
 */
export function PartialIntegration() {
  const [prefs, setPrefs] = useState<UserPreferences>(AIVideoTools.loadUserPreferences());

  return (
    <div>
      {/* في قائمة الإعدادات */}
      <div className="settings-menu">
        <BeginnerModeToggle
          isBeginnerMode={prefs.beginnerMode}
          onChange={(enabled) => {
            const updated = { ...prefs, beginnerMode: enabled };
            setPrefs(updated);
            AIVideoTools.saveUserPreferences(updated);
          }}
        />
      </div>

      {/* في شريط الأدوات */}
      <div className="toolbar">
        <Button onClick={() => {/* toggle shortcuts */ }}>
          <KeyboardIcon size={16} />
        </Button>
      </div>
    </div>
  );
}
