# 🚀 البدء السريع - نظام الذكاء الاصطناعي للفيديو

## ⚡ 3 خطوات فقط للبدء

### الخطوة 1: استيراد المكون

```typescript
// في VideoTools.tsx أو أي مكون آخر
import AIVideoControl from '@/components/instructor/AIVideoControl';
import { useState } from 'react';
```

### الخطوة 2: إضافة State

```typescript
const [isAIVideoOpen, setIsAIVideoOpen] = useState(false);
const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
```

### الخطوة 3: استخدام المكون

```typescript
<>
  {/* زر لفتح التحكم الذكي */}
  <Button onClick={() => setIsAIVideoOpen(true)}>
    <Sparkles size={16} className="ml-2" />
    ذكاء اصطناعي للفيديو
  </Button>

  {/* مكون التحكم الذكي */}
  <AIVideoControl
    videoUrl={currentVideoUrl}
    isOpen={isAIVideoOpen}
    onClose={() => setIsAIVideoOpen(false)}
    onApplyTool={(tool, newVideoUrl) => {
      console.log('تم تطبيق:', tool.name);
      setCurrentVideoUrl(newVideoUrl);
      // قم بتحديث الفيديو في المشروع هنا
    }}
  />
</>
```

---

## 🎯 استخدام مباشر للخدمة

### مثال 1: تحليل فيديو

```typescript
import { AIVideoTools } from '@/services/aiVideoTools';

// تحليل كامل
const analysis = await AIVideoTools.analyzeVideo('video_url');
console.log('جودة الفيديو:', analysis.qualityScore);
console.log('مشاكل مكتشفة:', analysis.needsEnhancement);

// تحليل سريع (أسرع)
const quickAnalysis = await AIVideoTools.quickAnalyze('video_url');
```

### مثال 2: تطبيق تحسين واحد

```typescript
const tools = AIVideoTools.getSuggestedTools(analysis);
const bestTool = tools[0]; // أفضل تحسين

const result = await AIVideoTools.applyTool(
  bestTool,
  'video_url',
  (progress) => {
    console.log(`التقدم: ${progress}%`);
  }
);

console.log('الفيديو الجديد:', result.videoUrl);
console.log('استغرق:', result.processingTime, 'ثانية');
```

### مثال 3: تحسين تلقائي شامل

```typescript
// بنقرة واحدة!
const enhanceProfile = await AIVideoTools.createAutoEnhanceProfile(analysis);

const enhancedVideo = await AIVideoTools.applyBatchTools(
  enhanceProfile,
  'video_url',
  (current, total, progress) => {
    console.log(`تطبيق ${current}/${total} - ${progress}%`);
  }
);

console.log('تم التحسين:', enhancedVideo);
```

### مثال 4: إنشاء Shorts

```typescript
const shorts = await AIVideoTools.generateShorts('long_video_url', {
  count: 3,           // 3 مقاطع
  duration: 60,       // كل مقطع 60 ثانية
  aspectRatio: '9:16', // للموبايل
  includeSubtitles: true
});

console.log('المقاطع الجاهزة:', shorts);
// ['short_1_url', 'short_2_url', 'short_3_url']
```

---

## 🎨 الأدوات المتاحة

```typescript
import { VideoToolType } from '@/services/aiVideoTools';

// تحسينات أساسية
VideoToolType.BRIGHTNESS        // السطوع
VideoToolType.CONTRAST           // التباين
VideoToolType.SATURATION         // الإشباع
VideoToolType.COLOR_CORRECTION   // تصحيح الألوان

// تحسينات الصوت
VideoToolType.NOISE_REDUCTION    // إزالة الضوضاء
VideoToolType.VOLUME_NORMALIZE   // موازنة الصوت
VideoToolType.AUDIO_ENHANCE      // تحسين شامل

// ذكاء اصطناعي متقدم
VideoToolType.STABILIZATION      // تثبيت الفيديو
VideoToolType.UPSCALE            // رفع الجودة
VideoToolType.AUTO_CAPTION       // ترجمة تلقائية
VideoToolType.SILENCE_REMOVAL    // حذف الصمت
VideoToolType.FACE_ENHANCE       // تحسين الوجوه
```

---

## 💡 نصائح سريعة

### 1. للمبتدئين

```typescript
// استخدم التحسين التلقائي - أسهل طريقة!
const profile = await AIVideoTools.createAutoEnhanceProfile(analysis);
const result = await AIVideoTools.applyBatchTools(profile, videoUrl);
```

### 2. للمتقدمين

```typescript
// اختر التحسينات يدوياً
const tools = AIVideoTools.getSuggestedTools(analysis);
const selectedTools = tools.filter(t => t.confidence > 0.85);
const result = await AIVideoTools.applyBatchTools(selectedTools, videoUrl);
```

### 3. لأفضل أداء

```typescript
// استخدم التحليل السريع أولاً
const quick = await AIVideoTools.quickAnalyze(videoUrl);
if (quick.needsEnhancement) {
  // ثم التحليل الكامل فقط إذا لزم الأمر
  const full = await AIVideoTools.analyzeVideo(videoUrl);
}
```

---

## 🔥 أمثلة جاهزة للاستخدام

### سيناريو 1: تحسين كورس تعليمي

```typescript
async function enhanceEducationalVideo(videoUrl: string) {
  // التحليل
  const analysis = await AIVideoTools.analyzeVideo(videoUrl);
  
  // التحسينات المطلوبة للكورسات
  const tools = [
    { tool: VideoToolType.NOISE_REDUCTION, name: 'إزالة الضوضاء', /* ... */ },
    { tool: VideoToolType.VOLUME_NORMALIZE, name: 'موازنة الصوت', /* ... */ },
    { tool: VideoToolType.AUTO_CAPTION, name: 'ترجمة تلقائية', /* ... */ },
    { tool: VideoToolType.BRIGHTNESS, name: 'تحسين الإضاءة', /* ... */ }
  ];
  
  // التطبيق
  const enhanced = await AIVideoTools.applyBatchTools(tools, videoUrl);
  return enhanced;
}
```

### سيناريو 2: تحضير للنشر على YouTube

```typescript
async function prepareForYouTube(videoUrl: string) {
  const analysis = await AIVideoTools.analyzeVideo(videoUrl);
  
  // الحصول على توصيات YouTube
  const recommendations = AIVideoTools.getExportRecommendations(analysis);
  const youtubeRec = recommendations.find(r => r.platform === 'YouTube');
  
  // تحسين تلقائي
  const profile = await AIVideoTools.createAutoEnhanceProfile(analysis);
  const enhanced = await AIVideoTools.applyBatchTools(profile, videoUrl);
  
  return {
    video: enhanced,
    exportSettings: youtubeRec
  };
}
```

### سيناريو 3: إنشاء محتوى لوسائل التواصل

```typescript
async function createSocialMedia Content(longVideoUrl: string) {
  // فيديو كامل لـ YouTube
  const fullVideo = await enhanceEducationalVideo(longVideoUrl);
  
  // مقاطع قصيرة لـ TikTok/Instagram
  const shorts = await AIVideoTools.generateShorts(fullVideo, {
    count: 5,
    duration: 45,
    aspectRatio: '9:16',
    includeSubtitles: true
  });
  
  return {
    youtubeVideo: fullVideo,
    tiktokShorts: shorts,
    instagramReels: shorts
  };
}
```

---

## 🎬 المستوى التالي

### استخدام متقدم مع React

```typescript
function VideoEditor() {
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleEnhance = async (videoUrl: string) => {
    setProcessing(true);
    
    try {
      // التحليل
      const result = await AIVideoTools.analyzeVideo(videoUrl);
      setAnalysis(result);
      
      // التحسين
      const tools = AIVideoTools.getSuggestedTools(result);
      const enhanced = await AIVideoTools.applyBatchTools(
        tools,
        videoUrl,
        (current, total, p) => {
          setProgress(((current - 1) / total) * 100 + (p / total));
        }
      );
      
      // النتيجة
      onVideoReady(enhanced);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <Button onClick={() => handleEnhance(videoUrl)}>
        تحسين الفيديو
      </Button>
      {processing && <Progress value={progress} />}
      {analysis && <VideoStats analysis={analysis} />}
    </div>
  );
}
```

---

## ⚠️ ملاحظات مهمة

1. **الأداء:**
   - التحليل يأخذ 2-10 ثواني
   - التحسينات تأخذ وقتاً حسب طول الفيديو
   - استخدم مؤشرات التقدم دائماً

2. **الحجم:**
   - الفيديوهات الكبيرة (> 500MB) قد تأخذ وقتاً أطول
   - فكر في استخدام Proxy للفيديوهات الضخمة

3. **الجودة:**
   - التحسين التلقائي مناسب لـ 90% من الحالات
   - للتحكم الكامل، اختر التحسينات يدوياً

---

## 📞 الدعم

هل تحتاج مساعدة؟

- 📖 الوثائق الكاملة: `AI_VIDEO_ENHANCEMENT.md`
- 💡 الأمثلة المتقدمة: انظر الملف الرئيسي
- 🐛 مشاكل؟ تحقق من console.log للأخطاء

---

**🎉 استمتع بالتحرير الذكي!**

تم إنشاؤه بـ ❤️ من قبل فريق AVinar
