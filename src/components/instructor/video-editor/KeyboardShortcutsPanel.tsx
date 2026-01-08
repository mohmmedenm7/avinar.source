import React, { useState } from 'react';
import { X, Keyboard, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIVideoTools } from '@/services/aiVideoTools';

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsPanel({ isOpen, onClose }: KeyboardShortcutsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const shortcuts = AIVideoTools.KEYBOARD_SHORTCUTS;
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  // Filter shortcuts based on search and category
  const filteredShortcuts = shortcuts.filter(shortcut => {
    const matchesSearch = 
      shortcut.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || shortcut.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      playback: '⏯️ التشغيل',
      editing: '✂️ التحرير',
      file: '📁 ملفات',
      navigation: '🧭 التنقل',
      organization: '📂 التنظيم',
      help: '❓ مساعدة',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      playback: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
      editing: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
      file: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
      navigation: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
      organization: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200',
      help: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-3xl max-h-[80vh] mx-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 text-white rounded-xl">
                <Keyboard size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  اختصارات لوحة المفاتيح
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {filteredShortcuts.length} اختصار متاح
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-red-100 hover:text-red-600"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن اختصار..."
              className="pr-10 rounded-xl"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <div className="px-6 pt-4 border-b overflow-x-auto">
            <TabsList className="inline-flex gap-2 bg-transparent">
              <TabsTrigger 
                value="all"
                className="rounded-lg data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700"
              >
                الكل ({shortcuts.length})
              </TabsTrigger>
              {categories.map(category => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="rounded-lg data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700"
                >
                  {getCategoryLabel(category)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {filteredShortcuts.length === 0 ? (
              <div className="text-center py-12">
                <Keyboard size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">لم يتم العثور على اختصارات</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                  <div key={category}>
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Badge className={getCategoryColor(category)}>
                        {getCategoryLabel(category)}
                      </Badge>
                    </h3>
                    <div className="grid gap-2">
                      {categoryShortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-1">
                            {shortcut.key.split('+').map((key, i) => (
                              <React.Fragment key={i}>
                                {i > 0 && <span className="text-gray-400 mx-1">+</span>}
                                <kbd className="px-3 py-1.5 text-xs font-semibold text-gray-800 bg-white dark:bg-slate-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm">
                                  {key}
                                </kbd>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Tabs>

        {/* Footer Tips */}
        <div className="p-4 border-t bg-blue-50 dark:bg-slate-800">
          <div className="flex items-start gap-2">
            <div className="p-1 bg-blue-500 text-white rounded">
              <Keyboard size={14} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                💡 نصيحة
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                اضغط <kbd className="px-2 py-0.5 text-xs bg-white dark:bg-slate-700 border rounded">?</kbd> في أي وقت لفتح هذه اللوحة
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
