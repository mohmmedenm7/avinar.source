import React, { useState } from 'react';
import { Volume2, Mic, Zap, Subtitles, Music, Wand2, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  AIVideoTools, 
  AdvancedAudioAnalysis, 
  SpeechToTextResult,
  AudioEffect 
} from '@/services/aiVideoTools';

interface AdvancedAudioPanelProps {
  videoUrl: string | null;
  onApplyEffect?: (effectUrl: string) => void;
  isOpen: boolean;
  onClose?: () => void;
}

export default function AdvancedAudioPanel({
  videoUrl,
  onApplyEffect,
  isOpen,
  onClose,
}: AdvancedAudioPanelProps) {
  const [activeTab, setActiveTab] = useState<'analyze' | 'enhance' | 'subtitles' | 'library'>('analyze');
  const [analysis, setAnalysis] = useState<AdvancedAudioAnalysis | null>(null);
  const [subtitles, setSubtitles] = useState<SpeechToTextResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const audioEffects = AIVideoTools.getAudioEffectsLibrary();
  const filteredEffects = searchQuery 
    ? AIVideoTools.searchAudioEffects(searchQuery)
    : audioEffects;

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!videoUrl) return;
    
    setProcessing(true);
    try {
      const result = await AIVideoTools.analyzeAdvancedAudio(videoUrl);
      setAnalysis(result);
    } catch (error) {
      console.error('فشل التحليل:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleNoiseRemoval = async (intensity: 'light' | 'medium' | 'aggressive') => {
    if (!videoUrl) return;
    
    setProcessing(true);
    setProgress(0);
    
    try {
      const result = await AIVideoTools.aiNoiseRemoval(videoUrl, {
        intensity,
        preserveVoice: true,
        onProgress: setProgress
      });
      
      onApplyEffect?.(result.videoUrl);
      alert(`✅ تم إزالة ${result.noiseReduction.toFixed(0)}% من الضوضاء`);
    } catch (error) {
      console.error('فشل إزالة الضوضاء:', error);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleAudioBalance = async () => {
    if (!videoUrl) return;
    
    setProcessing(true);
    setProgress(0);
    
    try {
      const result = await AIVideoTools.autoAudioBalance(videoUrl, setProgress);
      onApplyEffect?.(result.videoUrl);
      alert('✅ تم توازن الصوت بنجاح');
    } catch (error) {
      console.error('فشل توازن الصوت:', error);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleLipSync = async () => {
    if (!videoUrl) return;
    
    setProcessing(true);
    setProgress(0);
    
    try {
      const result = await AIVideoTools.lipSync(videoUrl, {
        adjustSpeed: true,
        onProgress: setProgress
      });
      
      onApplyEffect?.(result.videoUrl);
      alert(`✅ تمت المزامنة بدقة ${result.syncAccuracy}%`);
    } catch (error) {
      console.error('فشل المزامنة:', error);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleSpeechToText = async () => {
    if (!videoUrl) return;
    
    setProcessing(true);
    setProgress(0);
    
    try {
      const result = await AIVideoTools.speechToText(videoUrl, {
        language: 'ar',
        generateSRT: true,
        onProgress: setProgress
      });
      
      setSubtitles(result);
      setActiveTab('subtitles');
      alert('✅ تم تحويل الكلام إلى نص بنجاح');
    } catch (error) {
      console.error('فشل التحويل:', error);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleDownloadSRT = () => {
    if (!subtitles) return;
    
    const srtContent = AIVideoTools.exportSRT(subtitles);
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles.srt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 w-96 max-h-[600px] overflow-hidden">
      <Card className="shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500 text-white rounded-lg">
                <Volume2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  تحسينات صوتية AI
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  ميزات متقدمة بالذكاء الاصطناعي
                </p>
              </div>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                ✕
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {processing && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="animate-spin text-blue-500" size={16} />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                جاري المعالجة...
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {progress}%
            </p>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList className="w-full grid grid-cols-4 p-1">
            <TabsTrigger value="analyze" className="text-xs">
              تحليل
            </TabsTrigger>
            <TabsTrigger value="enhance" className="text-xs">
              تحسين
            </TabsTrigger>
            <TabsTrigger value="subtitles" className="text-xs">
              ترجمة
            </TabsTrigger>
            <TabsTrigger value="library" className="text-xs">
              مكتبة
            </TabsTrigger>
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analyze" className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {!analysis ? (
              <div className="text-center py-8">
                <Volume2 size={48} className="mx-auto text-gray-300 mb-4" />
                <Button
                  onClick={handleAnalyze}
                  disabled={!videoUrl || processing}
                  className="gap-2"
                >
                  <Zap size={16} />
                  تحليل الصوت
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Quality Scores */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">الضوضاء</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {analysis.noiseLevel}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">الوضوح</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {analysis.speechClarity}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">التوازن</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {analysis.volumeBalance}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">المستوى</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {analysis.averageLevel} dB
                    </p>
                  </div>
                </div>

                {/* Noise Type */}
                {analysis.backgroundNoiseType && analysis.backgroundNoiseType !== 'none' && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-xs font-medium text-orange-900 dark:text-orange-200">
                      🎯 نوع الضوضاء: {analysis.backgroundNoiseType}
                    </p>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      التوصيات:
                    </p>
                    {analysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <Badge variant="secondary" className="mt-0.5">💡</Badge>
                        <span className="text-gray-600 dark:text-gray-400">{rec}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={processing}
                >
                  إعادة التحليل
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Enhancement Tab */}
          <TabsContent value="enhance" className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {/* AI Noise Removal */}
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 size={16} className="text-purple-500" />
                <h4 className="font-semibold text-sm">إزالة الضوضاء AI</h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                إزالة الضوضاء الخلفية بتقنية الذكاء الاصطناعي المتقدمة
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleNoiseRemoval('light')}
                  disabled={!videoUrl || processing}
                >
                  خفيف
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleNoiseRemoval('medium')}
                  disabled={!videoUrl || processing}
                >
                  متوسط
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleNoiseRemoval('aggressive')}
                  disabled={!videoUrl || processing}
                >
                  قوي
                </Button>
              </div>
            </div>

            {/* Auto Balance */}
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 size={16} className="text-blue-500" />
                <h4 className="font-semibold text-sm">توازن الصوت التلقائي</h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                ضبط مستوى الصوت تلقائياً للحصول على توازن مثالي
              </p>
              <Button
                size="sm"
                className="w-full gap-2"
                onClick={handleAudioBalance}
                disabled={!videoUrl || processing}
              >
                <Check size={14} />
                تطبيق التوازن
              </Button>
            </div>

            {/* Lip Sync */}
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mic size={16} className="text-pink-500" />
                <h4 className="font-semibold text-sm">مزامنة الصوت</h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                مزامنة الصوت مع حركة الشفاه تلقائياً
              </p>
              <Button
                size="sm"
                className="w-full gap-2"
                onClick={handleLipSync}
                disabled={!videoUrl || processing}
              >
                <Check size={14} />
                مزامنة
              </Button>
            </div>

            {/* Speech to Text */}
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Subtitles size={16} className="text-green-500" />
                <h4 className="font-semibold text-sm">تحويل إلى نص</h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                تحويل الكلام إلى نص وإنشاء ترجمة تلقائية
              </p>
              <Button
                size="sm"
                className="w-full gap-2"
                onClick={handleSpeechToText}
                disabled={!videoUrl || processing}
              >
                <Check size={14} />
                تحويل الآن
              </Button>
            </div>
          </TabsContent>

          {/* Subtitles Tab */}
          <TabsContent value="subtitles" className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {!subtitles ? (
              <div className="text-center py-8">
                <Subtitles size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-sm text-gray-500 mb-4">
                  لم يتم إنشاء ترجمة بعد
                </p>
                <Button
                  onClick={handleSpeechToText}
                  disabled={!videoUrl || processing}
                  className="gap-2"
                >
                  <Mic size={16} />
                  إنشاء ترجمة
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded">
                    <p className="text-xs text-gray-600">اللغة</p>
                    <p className="font-semibold">{subtitles.language === 'ar' ? 'عربي' : 'English'}</p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded">
                    <p className="text-xs text-gray-600">الدقة</p>
                    <p className="font-semibold">{(subtitles.confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Full Text */}
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs font-semibold mb-2">النص الكامل:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {subtitles.text}
                  </p>
                </div>

                {/* Subtitles */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold">الترجمة ({subtitles.subtitles.length}):</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {subtitles.subtitles.map(sub => (
                      <div key={sub.index} className="p-2 text-xs bg-white dark:bg-slate-700 rounded border">
                        <div className="flex justify-between text-gray-500 mb-1">
                          <span>#{sub.index}</span>
                          <span>{sub.startTime} → {sub.endTime}</span>
                        </div>
                        <p className="text-gray-900 dark:text-white">{sub.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download */}
                <Button
                  onClick={handleDownloadSRT}
                  className="w-full gap-2"
                  variant="outline"
                >
                  📥 تحميل SRT
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {/* Search */}
            <input
              type="text"
              placeholder="ابحث عن مؤثر صوتي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 text-sm border rounded-lg"
            />

            {/* Effects Grid */}
            <div className="space-y-2">
              {filteredEffects.map(effect => (
                <div
                  key={effect.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => onApplyEffect?.(effect.url)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Music size={14} className="text-purple-500" />
                      <h5 className="text-sm font-semibold">{effect.nameAr}</h5>
                    </div>
                    {effect.free && (
                      <Badge variant="secondary" className="text-xs">
                        مجاني
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{effect.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {effect.duration}s
                    </Badge>
                    {effect.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {filteredEffects.length === 0 && (
              <div className="text-center py-8">
                <Music size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">لم يتم العثور على مؤثرات</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
