# 🔗 دليل التكامل - نظام الذكاء الاصطناعي للفيديو

## 📋 الملفات المضافة

```
✅ src/services/aiVideoTools.ts (644 سطر)
   └─ خدمة الذكاء الاصطناعي الرئيسية

✅ src/components/instructor/AIVideoControl.tsx (394 سطر)
   └─ واجهة المستخدم الذكية

✅ AI_VIDEO_ENHANCEMENT.md
   └─ التوثيق الكامل

✅ AI_VIDEO_QUICK_START.md
   └─ دليل البدء السريع

✅ INTEGRATION_GUIDE.md (هذا الملف)
   └─ خطوات التكامل
```

---

## 🚀 خطوات التكامل مع VideoTools

### الخطوة 1: إضافة الزر في Toolbar

```typescript
// في VideoTools.tsx
// ابحث عن الـ Toolbar الخاص بالأدوات

<div className="toolbar flex gap-2">
  {/* الأدوات الموجودة... */}
  
  {/* إضافة زر الذكاء الاصطناعي للفيديو */}
  <Button
    variant={isAIVideoOpen ? "default" : "outline"}
    size="sm"
    onClick={() => setIsAIVideoOpen(!isAIVideoOpen)}
    className="gap-2"
    title="ذكاء اصطناعي للفيديو"
  >
    <Sparkles size={16} />
    AI للفيديو
  </Button>
</div>
```

### الخطوة 2: إضافة State Management

```typescript
// في أعلى المكون VideoTools
import { useState } from 'react';
import AIVideoControl from './AIVideoControl';

export default function VideoTools() {
  // ... الـ states الموجودة
  
  // إضافة states جديدة
  const [isAIVideoOpen, setIsAIVideoOpen] = useState(false);
  const [currentVideoForAI, setCurrentVideoForAI] = useState<string | null>(null);
  
  // ... بقية الكود
}
```

### الخطوة 3: إضافة المكون في نهاية JSX

```typescript
return (
  <div className="video-tools-container">
    {/* كل الـ UI الموجود... */}
    
    {/* إضافة مكون الذكاء الاصطناعي قبل إغلاق div */}
    <AIVideoControl
      videoUrl={currentVideoForAI}
      isOpen={isAIVideoOpen}
      onClose={() => setIsAIVideoOpen(false)}
      onApplyTool={(tool, newVideoUrl) => {
        // تحديث الفيديو في Timeline
        handleVideoEnhanced(newVideoUrl);
        
        // إظهار رسالة نجاح
        toast({
          title: 'تم التحسين ✅',
          description: `تم تطبيق: ${tool.name}`,
        });
      }}
    />
  </div>
);
```

### الخطوة 4: ربط الفيديو الحالي

```typescript
// عند اختيار clip/video
const handleClipSelect = (clip: Clip) => {
  // ... الكود الموجود
  
  // تحديث الفيديو للذكاء الاصطناعي
  if (clip.type === 'video' && clip.src) {
    setCurrentVideoForAI(clip.src);
  }
};

// أو عند رفع فيديو جديد
const handleVideoUpload = (file: File) => {
  // ... معالجة الرفع
  
  const videoUrl = URL.createObjectURL(file);
  setCurrentVideoForAI(videoUrl);
};
```

### الخطوة 5: معالجة الفيديو المحسّن

```typescript
const handleVideoEnhanced = (enhancedVideoUrl: string) => {
  // 1. إيجاد الـ clip الحالي
  const currentClip = clips.find(c => c.id === selectedClipIds[0]);
  
  if (currentClip) {
    // 2. تحديث مصدر الفيديو
    setClips(prev => prev.map(c => 
      c.id === currentClip.id 
        ? { ...c, src: enhancedVideoUrl }
        : c
    ));
    
    // 3. حفظ في السجل (للتراجع)
    saveToHistory();
    
    // 4. تحديث المعاينة
    updatePreview();
  }
};
```

---

## 🎨 تخصيص الواجهة

### تغيير موقع اللوحة

```typescript
// في AIVideoControl.tsx
// السطر 238 - يمكنك تغيير الموقع

// الموقع الحالي: أسفل اليسار
<div className="fixed bottom-4 left-4 ...">

// للتغيير إلى أسفل اليمين:
<div className="fixed bottom-4 right-4 ...">

// أو أعلى اليسار:
<div className="fixed top-20 left-4 ...">
```

### تغيير عرض اللوحة

```typescript
// السطر 238
// العرض الحالي: 480px

<div className="... w-[480px] ...">

// للوحة أصغر:
<div className="... w-[380px] ...">

// للوحة أكبر:
<div className="... w-[600px] ...">
```

### تغيير الألوان

```typescript
// ابحث عن هذه الأسطر وغير الألوان:

// اللون الأساسي (indigo):
bg-indigo-500  // غير إلى: bg-blue-500, bg-purple-500, etc.

// لون الزر الرئيسي:
from-indigo-500 via-purple-500 to-pink-500
// غير إلى ألوان أخرى مثل:
from-blue-500 via-cyan-500 to-teal-500
```

---

## ⚙️ الإعدادات المتقدمة

### تخصيص نقاط النهاية (Endpoints)

```typescript
// في aiVideoTools.ts
// السطر 97

private static readonly API_ENDPOINT = '/api/v1/instructor/ai/video';

// للتغيير إلى endpoint مختلف:
private static readonly API_ENDPOINT = '/api/v1/video-ai';
```

### تخصيص أوقات المعالجة المتوقعة

```typescript
// في aiVideoTools.ts
// عند إنشاء VideoToolAction، يمكنك تعديل estimatedTime

{
  tool: VideoToolType.NOISE_REDUCTION,
  name: 'إزالة الضوضاء',
  // ...
  estimatedTime: 60,  // غير هذا الرقم (بالثواني)
}
```

### إضافة أدوات جديدة

```typescript
// 1. إضافة النوع الجديد في VideoToolType
export enum VideoToolType {
  // ... الأنواع الموجودة
  MY_NEW_TOOL = 'my_new_tool',
}

// 2. إضافة في getSuggestedTools
static getSuggestedTools(analysis: VideoAnalysis): VideoToolAction[] {
  const tools: VideoToolAction[] = [];
  
  // إضافة الأداة الجديدة
  if (analysis.someCondition) {
    tools.push({
      tool: VideoToolType.MY_NEW_TOOL,
      name: 'أداتي الجديدة',
      description: 'وصف الأداة',
      parameters: { /* ... */ },
      priority: 5,
      confidence: 0.8,
      estimatedTime: 30,
    });
  }
  
  return tools;
}

// 3. إضافة الأيقونة في getToolIcon
const getToolIcon = (tool: VideoToolType) => {
  switch (tool) {
    // ... الحالات الموجودة
    case VideoToolType.MY_NEW_TOOL: return '🆕';
  }
};
```

---

## 🔧 استكشاف الأخطاء

### المشكلة 1: اللوحة لا تظهر

```typescript
// تحقق من:
1. هل isOpen = true?
2. هل videoUrl موجود وصحيح?
3. افتح console للأخطاء

// الحل:
console.log('AI Video Open:', isAIVideoOpen);
console.log('Video URL:', currentVideoForAI);
```

### المشكلة 2: التحليل يفشل

```typescript
// تحقق من:
1. هل الـ API متاح?
2. هل الـ token صحيح?

// إضافة معالجة أخطاء أفضل:
try {
  const analysis = await AIVideoTools.analyzeVideo(videoUrl);
} catch (error) {
  console.error('Analysis Error:', error);
  toast({
    variant: 'destructive',
    title: 'خطأ في التحليل',
    description: error.message
  });
}
```

### المشكلة 3: التطبيق بطيء

```typescript
// الحلول:
1. استخدم التحليل السريع أولاً:
   const quick = await AIVideoTools.quickAnalyze(videoUrl);

2. قلل عدد التحسينات المطبقة:
   const topTools = suggestedTools.slice(0, 3);

3. استخدم Proxy للفيديوهات الكبيرة
```

---

## 📱 التوافق مع الأجهزة المختلفة

### للموبايل

```typescript
// في AIVideoControl.tsx
// غير العرض للموبايل

<div className={`fixed bottom-4 left-4 z-50 
  ${isMobile ? 'w-full px-4' : 'w-[480px]'}
  ...`}>
```

### للتابلت

```typescript
// استخدم media queries
<div className="
  w-full md:w-[480px]
  bottom-0 md:bottom-4
  left-0 md:left-4
  ...">
```

---

## 🎓 أمثلة تكامل كاملة

### مثال 1: تكامل بسيط

```typescript
import AIVideoControl from '@/components/instructor/AIVideoControl';

function MyVideoEditor() {
  const [aiOpen, setAiOpen] = useState(false);
  const [video, setVideo] = useState<string | null>(null);

  return (
    <div>
      <video src={video} controls />
      <Button onClick={() => setAiOpen(true)}>
        تحسين بالذكاء الاصطناعي
      </Button>
      
      <AIVideoControl
        videoUrl={video}
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        onApplyTool={(tool, newUrl) => setVideo(newUrl)}
      />
    </div>
  );
}
```

### مثال 2: تكامل متقدم مع Timeline

```typescript
function AdvancedVideoEditor() {
  const [aiOpen, setAiOpen] = useState(false);
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);

  const handleEnhance = (tool: VideoToolAction, newUrl: string) => {
    if (selectedClip) {
      // تحديث الـ clip
      setClips(prev => prev.map(c =>
        c.id === selectedClip.id
          ? { ...c, src: newUrl, enhanced: true }
          : c
      ));
      
      // إظهار نجاح
      showSuccessNotification(tool.name);
      
      // حفظ في التاريخ
      saveToHistory();
    }
  };

  return (
    <div className="editor">
      <Timeline clips={clips} onSelect={setSelectedClip} />
      <PreviewPanel clip={selectedClip} />
      
      <AIVideoControl
        videoUrl={selectedClip?.src}
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        onApplyTool={handleEnhance}
      />
    </div>
  );
}
```

---

## ✅ Checklist التكامل

قبل الإطلاق، تأكد من:

- [ ] إضافة الزر في الواجهة
- [ ] ربط State Management
- [ ] إضافة المكون AIVideoControl
- [ ] معالجة الفيديو المحسّن
- [ ] اختبار التحليل
- [ ] اختبار تطبيق الأدوات
- [ ] اختبار التطبيق الدفعي
- [ ] معالجة الأخطاء
- [ ] إضافة Loading States
- [ ] اختبار على أجهزة مختلفة

---

## 🎉 انتهى!

الآن نظام الذكاء الاصطناعي للفيديو جاهز ومتكامل!

**للأسئلة أو الدعم:**
- 📖 راجع: AI_VIDEO_ENHANCEMENT.md
- 🚀 للبدء السريع: AI_VIDEO_QUICK_START.md

تم إنشاؤه بـ ❤️ من قبل فريق AVinar
