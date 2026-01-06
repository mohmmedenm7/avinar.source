/**
 * أمثلة على استخدام نظام التحكم الذكي
 * Usage Examples for AI Montage Control System
 */

// ===== مثال 1: الاستخدام الأساسي =====
import { AIMontageTools } from '@/services/aiMontageTools';

async function basicExample() {
  const imageUrl = 'https://example.com/image.jpg';

  try {
    // الخطوة 1: تحليل الصورة
    const analysis = await AIMontageTools.analyzeImage(imageUrl);
    console.log('Analysis:', analysis);

    // الخطوة 2: الحصول على الأدوات المقترحة
    const tools = AIMontageTools.getSuggestedTools(analysis);
    console.log('Suggested tools:', tools);

    // الخطوة 3: اختيار أول أداة وتطبيقها
    if (tools.length > 0) {
      const selectedTool = tools[0];
      const newImageUrl = await AIMontageTools.applyTool(selectedTool, imageUrl);
      console.log('Enhanced image:', newImageUrl);
    }

    // الخطوة 4: الحصول على النصائح
    const tips = AIMontageTools.getTips(analysis);
    console.log('Tips:', tips);

  } catch (error) {
    console.error('Error:', error);
  }
}

// ===== مثال 2: التطبيق المتسلسل للأدوات =====
async function sequentialEnhancement() {
  const imageUrl = 'https://example.com/image.jpg';
  let currentImageUrl = imageUrl;

  try {
    // تطبيق عدة أدوات بالتتابع
    const tools = [
      {
        tool: 'BRIGHTNESS',
        name: 'زيادة الإضاءة',
        description: 'زيادة الإضاءة',
        parameters: { increase: 15 },
        priority: 10,
        confidence: 0.95
      },
      {
        tool: 'CONTRAST',
        name: 'تحسين التباين',
        description: 'تحسين التباين',
        parameters: { increase: 20 },
        priority: 8,
        confidence: 0.85
      },
      {
        tool: 'SATURATION',
        name: 'تعزيز الألوان',
        description: 'تعزيز الألوان',
        parameters: { increase: 10 },
        priority: 7,
        confidence: 0.8
      }
    ];

    for (const tool of tools) {
      console.log(`Applying ${tool.name}...`);
      currentImageUrl = await AIMontageTools.applyTool(tool, currentImageUrl);
      console.log(`Applied: ${tool.name}`);
      
      // انتظر قليلاً بين التطبيقات
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Final enhanced image:', currentImageUrl);

  } catch (error) {
    console.error('Error during sequential enhancement:', error);
  }
}

// ===== مثال 3: مراقبة وتحديث ديناميكي =====
async function dynamicMonitoring() {
  const imageUrl = 'https://example.com/image.jpg';
  let currentImageUrl = imageUrl;
  let previousAnalysis = null;

  try {
    // حلقة مراقبة (تحسين مستمر)
    for (let iteration = 0; iteration < 3; iteration++) {
      console.log(`\n=== Iteration ${iteration + 1} ===`);

      // تحليل الصورة الحالية
      const analysis = await AIMontageTools.analyzeImage(currentImageUrl);

      // إذا كانت هذه الحلقة الأولى، احفظ التحليل
      if (!previousAnalysis) {
        previousAnalysis = analysis;
      }

      // حساب التحسن
      const improvementScore =
        ((previousAnalysis.brightness - analysis.brightness) / previousAnalysis.brightness) * 100;

      console.log(`Brightness: ${previousAnalysis.brightness} → ${analysis.brightness}`);
      console.log(`Improvement: ${improvementScore.toFixed(2)}%`);

      // الحصول على الأدوات المقترحة
      const tools = AIMontageTools.getSuggestedTools(analysis);

      if (tools.length > 0) {
        const topTool = tools[0];
        console.log(`Applying: ${topTool.name} (Confidence: ${topTool.confidence * 100}%)`);
        currentImageUrl = await AIMontageTools.applyTool(topTool, currentImageUrl);
        previousAnalysis = analysis;
      } else {
        console.log('No more tools needed');
        break;
      }

      // انتظر قليلاً
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error) {
    console.error('Error during dynamic monitoring:', error);
  }
}

// ===== مثال 4: مع React Component =====
import React, { useState } from 'react';

export function ImageEnhancerComponent() {
  const [imageUrl, setImageUrl] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAnalyzeImage = async (url) => {
    setLoading(true);
    try {
      const analysisResult = await AIMontageTools.analyzeImage(url);
      setAnalysis(analysisResult);

      const suggestedTools = AIMontageTools.getSuggestedTools(analysisResult);
      setTools(suggestedTools);

      setImageUrl(url);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTool = async (tool) => {
    if (!imageUrl) return;

    setLoading(true);
    try {
      const newImageUrl = await AIMontageTools.applyTool(tool, imageUrl);
      // تحديث الصورة والتحليل
      await handleAnalyzeImage(newImageUrl);
    } catch (error) {
      console.error('Apply tool error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* عرض الصورة */}
      {imageUrl && (
        <img src={imageUrl} alt="Enhanced" className="max-w-md rounded-lg" />
      )}

      {/* عرض التحليل */}
      {analysis && (
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 bg-blue-50 rounded">
            <p className="text-xs">الإضاءة</p>
            <p className="font-bold">{analysis.brightness}%</p>
          </div>
          <div className="p-2 bg-purple-50 rounded">
            <p className="text-xs">التباين</p>
            <p className="font-bold">{analysis.contrast}%</p>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <p className="text-xs">الألوان</p>
            <p className="font-bold">{analysis.saturation}%</p>
          </div>
          <div className="p-2 bg-orange-50 rounded">
            <p className="text-xs">الحرارة</p>
            <p className="font-bold">{analysis.colorTemperature}</p>
          </div>
        </div>
      )}

      {/* قائمة الأدوات */}
      {tools.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold">الأدوات المقترحة</h3>
          {tools.map((tool, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyTool(tool)}
              disabled={loading}
              className="w-full p-2 bg-indigo-100 hover:bg-indigo-200 rounded text-left"
            >
              <p className="font-semibold">{tool.name}</p>
              <p className="text-sm text-gray-600">{tool.description}</p>
              <p className="text-xs text-gray-500">
                ثقة: {Math.round(tool.confidence * 100)}%
              </p>
            </button>
          ))}
        </div>
      )}

      {/* زر التحليل */}
      <button
        onClick={() => handleAnalyzeImage(imageUrl)}
        disabled={!imageUrl || loading}
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'جاري المعالجة...' : 'تحليل الصورة'}
      </button>
    </div>
  );
}

// ===== مثال 5: مع معالجة الأخطاء =====
async function robustExample() {
  const imageUrl = 'https://example.com/image.jpg';
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const analysis = await AIMontageTools.analyzeImage(imageUrl);
      const tools = AIMontageTools.getSuggestedTools(analysis);

      if (tools.length === 0) {
        console.log('No tools needed, image is already optimized');
        break;
      }

      const tool = tools[0];
      console.log(`Applying: ${tool.name}`);

      try {
        const newImageUrl = await AIMontageTools.applyTool(tool, imageUrl);
        console.log('Tool applied successfully');
        return newImageUrl;
      } catch (applyError) {
        console.warn(`Failed to apply ${tool.name}:`, applyError);
        // جرب الأداة التالية
        continue;
      }

    } catch (error) {
      retryCount++;
      if (retryCount >= maxRetries) {
        console.error('Max retries reached');
        throw error;
      }
      console.warn(`Attempt ${retryCount} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// ===== مثال 6: مقارنة قبل وبعد =====
async function beforeAfterComparison() {
  const originalImageUrl = 'https://example.com/original.jpg';

  try {
    // الحصول على التحليل الأصلي
    const originalAnalysis = await AIMontageTools.analyzeImage(originalImageUrl);
    console.log('Original analysis:', originalAnalysis);

    // تطبيق التحسينات
    let enhancedImageUrl = originalImageUrl;
    const tools = AIMontageTools.getSuggestedTools(originalAnalysis);

    for (const tool of tools.slice(0, 3)) {
      enhancedImageUrl = await AIMontageTools.applyTool(tool, enhancedImageUrl);
    }

    // الحصول على التحليل المحسّن
    const enhancedAnalysis = await AIMontageTools.analyzeImage(enhancedImageUrl);
    console.log('Enhanced analysis:', enhancedAnalysis);

    // المقارنة
    const comparison = {
      brightness: {
        before: originalAnalysis.brightness,
        after: enhancedAnalysis.brightness,
        improvement: enhancedAnalysis.brightness - originalAnalysis.brightness
      },
      contrast: {
        before: originalAnalysis.contrast,
        after: enhancedAnalysis.contrast,
        improvement: enhancedAnalysis.contrast - originalAnalysis.contrast
      },
      saturation: {
        before: originalAnalysis.saturation,
        after: enhancedAnalysis.saturation,
        improvement: enhancedAnalysis.saturation - originalAnalysis.saturation
      }
    };

    console.log('Comparison:', comparison);

  } catch (error) {
    console.error('Error during comparison:', error);
  }
}

// ===== مثال 7: دفعة من الصور =====
async function batchEnhancement(imageUrls) {
  const results = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i];
    console.log(`Processing image ${i + 1}/${imageUrls.length}...`);

    try {
      const analysis = await AIMontageTools.analyzeImage(imageUrl);
      const tools = AIMontageTools.getSuggestedTools(analysis);

      let enhancedUrl = imageUrl;

      if (tools.length > 0) {
        enhancedUrl = await AIMontageTools.applyTool(tools[0], imageUrl);
      }

      results.push({
        original: imageUrl,
        enhanced: enhancedUrl,
        status: 'success'
      });

    } catch (error) {
      results.push({
        original: imageUrl,
        error: error.message,
        status: 'error'
      });
    }

    // تجنب إرهاق الخادم
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

// ===== الاستخدام =====
// basicExample();
// sequentialEnhancement();
// dynamicMonitoring();
// robustExample();
// beforeAfterComparison();
// batchEnhancement(['url1', 'url2', 'url3']);

export {
  basicExample,
  sequentialEnhancement,
  dynamicMonitoring,
  robustExample,
  beforeAfterComparison,
  batchEnhancement
};
