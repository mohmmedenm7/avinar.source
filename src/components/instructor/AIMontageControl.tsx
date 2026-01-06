import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  AIMontageTools,
  MontageToolAction,
  ImageAnalysis,
  MontageToolType,
} from '@/services/aiMontageTools';

interface AIMontageControlProps {
  imageUrl: string | null;
  onApplyTool?: (tool: MontageToolAction, newImageUrl: string) => void;
  isOpen: boolean;
  onClose?: () => void;
}

export default function AIMontageControl({
  imageUrl,
  onApplyTool,
  isOpen,
  onClose,
}: AIMontageControlProps) {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [suggestedTools, setSuggestedTools] = useState<MontageToolAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState<MontageToolAction | null>(null);
  const [applyingTool, setApplyingTool] = useState(false);

  // تحليل الصورة عند التغيير
  useEffect(() => {
    if (imageUrl && isOpen) {
      analyzeImage();
    }
  }, [imageUrl, isOpen]);

  const analyzeImage = async () => {
    if (!imageUrl) return;

    setLoading(true);
    try {
      const analysisResult = await AIMontageTools.analyzeImage(imageUrl);
      setAnalysis(analysisResult);

      const tools = AIMontageTools.getSuggestedTools(analysisResult);
      setSuggestedTools(tools);

      // تحديد الأداة الأولى افتراضياً
      if (tools.length > 0) {
        setSelectedTool(tools[0]);
      }

      toast({
        title: 'تم التحليل',
        description: 'تم تحليل الصورة بنجاح وتم اقتراح التحسينات',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل تحليل الصورة',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTool = async (tool: MontageToolAction) => {
    if (!imageUrl) return;

    setApplyingTool(true);
    try {
      const newImageUrl = await AIMontageTools.applyTool(tool, imageUrl);

      toast({
        title: 'تم تطبيق الأداة',
        description: `تم تطبيق: ${tool.name}`,
      });

      if (onApplyTool) {
        onApplyTool(tool, newImageUrl);
      }

      // إعادة تحليل الصورة الجديدة
      setTimeout(() => analyzeImage(), 500);
    } catch (error) {
      console.error('Apply tool error:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل تطبيق الأداة',
      });
    } finally {
      setApplyingTool(false);
    }
  };

  const getToolIcon = (tool: MontageToolType) => {
    switch (tool) {
      case MontageToolType.BRIGHTNESS:
        return '💡';
      case MontageToolType.CONTRAST:
        return '⚖️';
      case MontageToolType.SATURATION:
        return '🎨';
      case MontageToolType.SHARPEN:
        return '🔪';
      case MontageToolType.BLUR:
        return '💨';
      case MontageToolType.COLOR:
        return '🌡️';
      default:
        return '✨';
    }
  };

  if (!isOpen || !imageUrl) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-2">
      <Card className="shadow-2xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500 text-white p-1.5 rounded-lg">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-800 dark:text-white">
                التحكم الذكي
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                بواسطة الذكاء الاصطناعي
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>

        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="animate-spin text-indigo-500" size={24} />
              <span className="mr-2 text-sm text-gray-600 dark:text-gray-300">
                جاري التحليل...
              </span>
            </div>
          )}

          {/* Analysis Results */}
          {!loading && analysis && (
            <>
              {/* Statistics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-300">الإضاءة</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${analysis.brightness}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {analysis.brightness}%
                    </span>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-300">التباين</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${analysis.contrast}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {analysis.contrast}%
                    </span>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-300">الألوان</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${analysis.saturation}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {analysis.saturation}%
                    </span>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-300">الحرارة</p>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">
                    {analysis.colorTemperature === 'warm'
                      ? '🔥 دافئ'
                      : analysis.colorTemperature === 'cool'
                      ? '❄️ بارد'
                      : '⚪ محايد'}
                  </p>
                </div>
              </div>

              {/* Suggested Tools */}
              {suggestedTools.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 px-1">
                    التحسينات المقترحة
                  </h4>

                  {suggestedTools.map((tool, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTool(tool)}
                      className={`w-full text-right p-2 rounded-lg border transition-all ${
                        selectedTool?.name === tool.name
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-400'
                          : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1">
                          <span className="text-lg">{getToolIcon(tool.tool)}</span>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                              {tool.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <span className="text-xs bg-indigo-500 text-white px-1.5 py-0.5 rounded">
                            {Math.round(tool.confidence * 100)}%
                          </span>
                          <ChevronRight size={14} className="text-gray-400" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Tips */}
              {analysis && (
                <div className="space-y-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                    <AlertCircle size={14} /> نصائح
                  </p>
                  {AIMontageTools.getTips(analysis).map((tip, index) => (
                    <p
                      key={index}
                      className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed"
                    >
                      {tip}
                    </p>
                  ))}
                </div>
              )}

              {/* Apply Button */}
              {selectedTool && (
                <Button
                  onClick={() => handleApplyTool(selectedTool)}
                  disabled={applyingTool}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-2 rounded-lg"
                >
                  {applyingTool ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      جاري التطبيق...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="mr-2" />
                      تطبيق: {selectedTool.name}
                    </>
                  )}
                </Button>
              )}

              {/* Analyze Again */}
              <Button
                variant="outline"
                onClick={analyzeImage}
                disabled={loading}
                className="w-full text-xs"
              >
                🔄 إعادة التحليل
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
