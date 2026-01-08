import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, ChevronRight, AlertCircle, Clock, Zap, Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AIVideoTools,
  VideoToolAction,
  VideoAnalysis,
  VideoToolType,
} from '@/services/aiVideoTools';

interface AIVideoControlProps {
  videoUrl: string | null;
  onApplyTool?: (tool: VideoToolAction, newVideoUrl: string) => void;
  isOpen: boolean;
  onClose?: () => void;
}

export default function AIVideoControl({
  videoUrl,
  onApplyTool,
  isOpen,
  onClose,
}: AIVideoControlProps) {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [suggestedTools, setSuggestedTools] = useState<VideoToolAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTools, setSelectedTools] = useState<VideoToolAction[]>([]);
  const [applyingTool, setApplyingTool] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'quick' | 'advanced' | 'batch'>('quick');

  // تحليل الفيديو عند التغيير
  useEffect(() => {
    if (videoUrl && isOpen) {
      analyzeVideo();
    }
  }, [videoUrl, isOpen]);

  const analyzeVideo = async () => {
    if (!videoUrl) return;

    setLoading(true);
    try {
      const analysisResult = await AIVideoTools.analyzeVideo(videoUrl);
      setAnalysis(analysisResult);

      const tools = AIVideoTools.getSuggestedTools(analysisResult);
      setSuggestedTools(tools);

      toast({
        title: 'تم التحليل ✅',
        description: `تم تحليل الفيديو بنجاح. وجدنا ${tools.length} تحسين مقترح`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل تحليل الفيديو',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTool = async (tool: VideoToolAction) => {
    if (!videoUrl) return;

    setApplyingTool(true);
    setProgress(0);
    setCurrentProcessing(tool.name);

    try {
      const result = await AIVideoTools.applyTool(
        tool,
        videoUrl,
        (p) => setProgress(p)
      );

      toast({
        title: 'تم التطبيق ✅',
        description: `تم تطبيق: ${tool.name} في ${result.processingTime.toFixed(1)} ثانية`,
      });

      if (onApplyTool) {
        onApplyTool(tool, result.videoUrl);
      }

      setTimeout(() => analyzeVideo(), 1000);
    } catch (error) {
      console.error('Apply tool error:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل تطبيق الأداة',
      });
    } finally {
      setApplyingTool(false);
      setProgress(0);
      setCurrentProcessing('');
    }
  };

  const handleApplyBatch = async () => {
    if (!videoUrl || selectedTools.length === 0) return;

    setApplyingTool(true);
    setProgress(0);

    try {
      const newVideoUrl = await AIVideoTools.applyBatchTools(
        selectedTools,
        videoUrl,
        (current, total, p) => {
          setCurrentProcessing(`تطبيق ${current} من ${total}`);
          setProgress(((current - 1) / total) * 100 + (p / total));
        }
      );

      toast({
        title: 'تم التطبيق الدفعي ✅',
        description: `تم تطبيق ${selectedTools.length} تحسينات بنجاح`,
      });

      if (onApplyTool) {
        onApplyTool(selectedTools[0], newVideoUrl);
      }

      setSelectedTools([]);
      setTimeout(() => analyzeVideo(), 1000);
    } catch (error) {
      console.error('Batch apply error:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل التطبيق الدفعي',
      });
    } finally {
      setApplyingTool(false);
      setProgress(0);
      setCurrentProcessing('');
    }
  };

  const handleAutoEnhance = async () => {
    if (!videoUrl || !analysis) return;

    setApplyingTool(true);
    setProgress(0);

    try {
      const enhanceProfile = await AIVideoTools.createAutoEnhanceProfile(analysis);
      
      const newVideoUrl = await AIVideoTools.applyBatchTools(
        enhanceProfile,
        videoUrl,
        (current, total, p) => {
          setCurrentProcessing(`تحسين تلقائي ${current}/${total}`);
          setProgress(((current - 1) / total) * 100 + (p / total));
        }
      );

      toast({
        title: 'تم التحسين التلقائي ✅',
        description: 'تم تحسين الفيديو تلقائياً بنجاح',
      });

      if (onApplyTool) {
        onApplyTool(enhanceProfile[0], newVideoUrl);
      }

      setTimeout(() => analyzeVideo(), 1000);
    } catch (error) {
      console.error('Auto enhance error:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل التحسين التلقائي',
      });
    } finally {
      setApplyingTool(false);
      setProgress(0);
      setCurrentProcessing('');
    }
  };

  const toggleToolSelection = (tool: VideoToolAction) => {
    setSelectedTools(prev => {
      const exists = prev.find(t => t.tool === tool.tool);
      if (exists) {
        return prev.filter(t => t.tool !== tool.tool);
      } else {
        return [...prev, tool];
      }
    });
  };

  const getToolIcon = (tool: VideoToolType) => {
    switch (tool) {
      case VideoToolType.BRIGHTNESS: return '💡';
      case VideoToolType.CONTRAST: return '⚖️';
      case VideoToolType.SATURATION: return '🎨';
      case VideoToolType.NOISE_REDUCTION: return '🔇';
      case VideoToolType.STABILIZATION: return '📹';
      case VideoToolType.AUTO_CAPTION: return '💬';
      case VideoToolType.FACE_ENHANCE: return '😊';
      case VideoToolType.UPSCALE: return '📐';
      case VideoToolType.SILENCE_REMOVAL: return '⏸️';
      default: return '✨';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !videoUrl) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[480px] animate-in fade-in slide-in-from-bottom-2">
      <Card className="shadow-2xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-3xl overflow-hidden">
        <div className="p-5 pb-3 border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-600">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 text-white p-2 rounded-xl shadow-lg">
                <Sparkles size={20} fill="currentColor" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  التحكم الذكي بالفيديو
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  بواسطة الذكاء الاصطناعي المتقدم
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onClose}
            >
              ✕
            </Button>
          </div>

          {analysis && (
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/60 dark:bg-slate-700/60 p-2 rounded-xl text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {analysis.qualityScore}
                </div>
                <div className="text-[9px] text-gray-600 dark:text-gray-400 uppercase font-bold">
                  الجودة
                </div>
              </div>
              <div className="bg-white/60 dark:bg-slate-700/60 p-2 rounded-xl text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatDuration(analysis.duration)}
                </div>
                <div className="text-[9px] text-gray-600 dark:text-gray-400 uppercase font-bold">
                  المدة
                </div>
              </div>
              <div className="bg-white/60 dark:bg-slate-700/60 p-2 rounded-xl text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {analysis.resolution.height}p
                </div>
                <div className="text-[9px] text-gray-600 dark:text-gray-400 uppercase font-bold">
                  الدقة
                </div>
              </div>
              <div className="bg-white/60 dark:bg-slate-700/60 p-2 rounded-xl text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {analysis.fps}
                </div>
                <div className="text-[9px] text-gray-600 dark:text-gray-400 uppercase font-bold">
                  FPS
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <span className="mr-3 text-sm text-gray-600 dark:text-gray-300">
                جاري تحليل الفيديو...
              </span>
            </div>
          )}

          {applyingTool && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                  {currentProcessing}
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                يرجى الانتظار، جاري المعالجة...
              </p>
            </div>
          )}

          {!loading && analysis && (
            <>
              <Button
                onClick={handleAutoEnhance}
                disabled={applyingTool}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg"
              >
                <Zap size={18} className="ml-2" />
                تحسين تلقائي شامل
              </Button>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 px-1">
                  التحسينات الموصى بها
                </h4>
                {suggestedTools.slice(0, 5).map((tool, index) => (
                  <button
                    key={index}
                    onClick={() => handleApplyTool(tool)}
                    disabled={applyingTool}
                    className="w-full text-right p-3 rounded-xl border bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 border-gray-200 dark:border-slate-600 hover:border-indigo-300 hover:shadow-md transition-all disabled:opacity-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl">{getToolIcon(tool.tool)}</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            {tool.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {tool.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-[10px]">
                              <Clock size={10} className="ml-1" />
                              {tool.estimatedTime ? `${tool.estimatedTime}ث` : 'سريع'}
                            </Badge>
                            <Badge className="text-[10px] bg-indigo-100 text-indigo-700">
                              {Math.round(tool.confidence * 100)}% ثقة
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 mr-2" />
                    </div>
                  </button>
                ))}
              </div>

              {analysis && (
                <div className="space-y-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl mt-4">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                    <AlertCircle size={12} /> نصائح مفيدة
                  </p>
                  {AIVideoTools.getTips(analysis).slice(0, 3).map((tip, index) => (
                    <p
                      key={index}
                      className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed"
                    >
                      {tip}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
