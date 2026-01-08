import React, { useState } from 'react';
import { Palette, Search, Sparkles, Sliders, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIVideoTools, LUT } from '@/services/aiVideoTools';

interface LUTsPanelProps {
  videoUrl: string | null;
  onApplyLUT?: (lutUrl: string) => void;
  isOpen: boolean;
  onClose?: () => void;
}

export default function LUTsPanel({
  videoUrl,
  onApplyLUT,
  isOpen,
  onClose,
}: LUTsPanelProps) {
  const [activeCategory, setActiveCategory] = useState<LUT['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLUT, setSelectedLUT] = useState<LUT | null>(null);
  const [intensity, setIntensity] = useState(80);
  const [applying, setApplying] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const allLUTs = AIVideoTools.getLUTsLibrary();
  const filteredLUTs = searchQuery
    ? AIVideoTools.searchLUTs(searchQuery, activeCategory === 'all' ? undefined : activeCategory)
    : activeCategory === 'all'
    ? allLUTs
    : AIVideoTools.getLUTsByCategory(activeCategory);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      all: 'الكل',
      cinematic: '🎬 سينمائي',
      vintage: '📼 كلاسيكي',
      modern: '✨ عصري',
      dramatic: '🎭 درامي',
      natural: '🌿 طبيعي',
    };
    return labels[category] || category;
  };

  const handleApplyLUT = async (lut: LUT) => {
    if (!videoUrl) return;

    setApplying(true);
    setProgress(0);

    try {
      const result = await AIVideoTools.applyLUT(videoUrl, lut, {
        intensity,
        onProgress: setProgress,
      });

      onApplyLUT?.(result.videoUrl);
      alert(`✅ تم تطبيق ${lut.nameAr} بنجاح!`);
    } catch (error) {
      console.error('فشل تطبيق LUT:', error);
      alert('❌ حدث خطأ في تطبيق التلوين');
    } finally {
      setApplying(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-5xl max-h-[90vh] mx-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl">
                <Palette size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  LUTs - جداول التلوين
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {filteredLUTs.length} تلوين احترافي متاح
                </p>
              </div>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-red-100 hover:text-red-600"
              >
                <X size={20} />
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن تلوين..."
              className="pr-10 rounded-xl"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 pt-4 border-b overflow-x-auto">
          <Tabs value={activeCategory} onValueChange={(v: any) => setActiveCategory(v)}>
            <TabsList className="inline-flex gap-2 bg-transparent">
              <TabsTrigger value="all" className="rounded-lg">
                {getCategoryLabel('all')} ({allLUTs.length})
              </TabsTrigger>
              <TabsTrigger value="cinematic" className="rounded-lg">
                {getCategoryLabel('cinematic')}
              </TabsTrigger>
              <TabsTrigger value="vintage" className="rounded-lg">
                {getCategoryLabel('vintage')}
              </TabsTrigger>
              <TabsTrigger value="modern" className="rounded-lg">
                {getCategoryLabel('modern')}
              </TabsTrigger>
              <TabsTrigger value="dramatic" className="rounded-lg">
                {getCategoryLabel('dramatic')}
              </TabsTrigger>
              <TabsTrigger value="natural" className="rounded-lg">
                {getCategoryLabel('natural')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {filteredLUTs.length === 0 ? (
            <div className="text-center py-12">
              <Palette size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">لم يتم العثور على تلوينات</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredLUTs.map((lut) => (
                <div
                  key={lut.id}
                  className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-xl ${
                    selectedLUT?.id === lut.id
                      ? 'ring-4 ring-purple-500'
                      : 'ring-1 ring-gray-200 dark:ring-slate-700'
                  }`}
                  onClick={() => setSelectedLUT(lut)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles size={32} className="text-white/50" />
                    </div>
                    
                    {/* Free Badge */}
                    {lut.free && (
                      <Badge className="absolute top-2 right-2 bg-green-600 text-white text-xs">
                        مجاني
                      </Badge>
                    )}

                    {/* Selected Indicator */}
                    {selectedLUT?.id === lut.id && (
                      <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                        <div className="bg-purple-500 text-white rounded-full p-2">
                          <Sparkles size={20} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 bg-white dark:bg-slate-800">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
                      {lut.nameAr}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {lut.name}
                    </p>
                    {lut.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                        {lut.description}
                      </p>
                    )}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyLUT(lut);
                      }}
                      disabled={!videoUrl || applying}
                    >
                      <Sparkles size={14} className="ml-1" />
                      تطبيق
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected LUT Preview & Controls */}
        {selectedLUT && (
          <div className="p-6 border-t bg-gray-50 dark:bg-slate-900">
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="w-32 h-20 rounded-lg bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center flex-shrink-0">
                <Sparkles size={24} className="text-white/50" />
              </div>

              {/* Info & Controls */}
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {selectedLUT.nameAr}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedLUT.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {selectedLUT.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Intensity Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Sliders size={14} />
                      الشدة: {intensity}%
                    </label>
                  </div>
                  <Slider
                    value={[intensity]}
                    onValueChange={([value]) => setIntensity(value)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Apply Button */}
                <Button
                  onClick={() => handleApplyLUT(selectedLUT)}
                  disabled={!videoUrl || applying}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
                >
                  {applying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      جاري التطبيق... {progress}%
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      تطبيق التلوين
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Tips */}
        <div className="p-4 border-t bg-purple-50 dark:bg-slate-800">
          <div className="flex items-start gap-2">
            <div className="p-1 bg-purple-500 text-white rounded">
              <Palette size={14} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-purple-900 dark:text-purple-200">
                💡 نصيحة
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                LUTs هي جداول تلوين احترافية تستخدم في السينما لإعطاء الفيديو مظهراً سينمائياً. اختر التلوين المناسب لمشروعك!
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
