/**
 * ملف الإعدادات والتكامل
 * Configuration and Integration File
 */

// ===== إعدادات API =====
export const AI_MONTAGE_CONFIG = {
  // نقاط النهاية
  endpoints: {
    analyze: '/api/v1/instructor/ai/analyze',
    applyTool: '/api/v1/instructor/ai/apply-tool',
    applyPreset: '/api/v1/instructor/ai/apply-preset',
    batchEnhance: '/api/v1/instructor/ai/batch-enhance',
    compare: '/api/v1/instructor/ai/compare',
    presets: '/api/v1/instructor/ai/presets',
    history: '/api/v1/instructor/ai/history'
  },

  // أوقات الانتظار
  timeouts: {
    analyze: 5000,        // تحليل الصورة: 5 ثواني
    applyTool: 10000,     // تطبيق الأداة: 10 ثواني
    batchEnhance: 30000   // تحسينات متعددة: 30 ثانية
  },

  // الحدود القصوى
  limits: {
    maxImageSize: 50 * 1024 * 1024,  // 50MB
    maxBatchSize: 10,                 // 10 صور في المرة
    maxToolsPerBatch: 5,              // 5 أدوات كحد أقصى
    rateLimit: 100                    // 100 طلب/ساعة
  },

  // صيغ الصور المدعومة
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],

  // إعدادات الواجهة
  ui: {
    showAnalysisPanel: true,
    showTipsPanel: true,
    autoCloseAfterApply: false,
    enableAnimations: true,
    panelPosition: 'bottom-right'  // top-right, bottom-right, bottom-left, top-left
  },

  // مستويات الثقة
  confidenceThresholds: {
    high: 0.85,      // عالي جداً: > 85%
    medium: 0.70,    // متوسط: 70-85%
    low: 0.50        // منخفض: 50-70%
  },

  // الأولويات
  priorities: {
    brightness: 10,
    contrast: 8,
    saturation: 7,
    color: 6,
    sharpen: 5,
    blur: 4
  },

  // الألوان والتصاميم
  theme: {
    primary: '#4F46E5',      // إندigo
    secondary: '#7C3AED',    // بنفسجي
    success: '#10B981',      // أخضر
    warning: '#F59E0B',      // برتقالي
    danger: '#EF4444',       // أحمر
    info: '#3B82F6'         // أزرق
  }
};

// ===== إعدادات المكتبات =====
export const LIBRARY_CONFIG = {
  // مكتبة معالجة الصور (Sharp)
  sharp: {
    quality: 90,
    progressive: true,
    withMetadata: false
  },

  // مكتبة تحليل الصور (Jimp)
  jimp: {
    enableCache: true,
    cacheSize: 100
  },

  // مكتبة الذكاء الاصطناعي (TensorFlow.js)
  tensorflow: {
    backend: 'webgl',  // webgl, cpu, wasm
    enableOptimization: true,
    precisionMode: 'float32'
  }
};

// ===== رسائل الواجهة =====
export const MESSAGES = {
  ar: {
    analyzing: 'جاري تحليل الصورة...',
    analysisComplete: 'تم تحليل الصورة بنجاح',
    applyingTool: 'جاري تطبيق الأداة...',
    toolApplied: 'تم تطبيق الأداة بنجاح',
    noImageSelected: 'يرجى اختيار صورة أولاً',
    analysisError: 'فشل تحليل الصورة',
    applyError: 'فشل تطبيق الأداة',
    noSuggestedTools: 'لا توجد أدوات مقترحة',
    imageTooSmall: 'الصورة صغيرة جداً (الحد الأدنى 100x100)',
    imageTooLarge: 'حجم الصورة كبير جداً (الحد الأقصى 50MB)',
    unsupportedFormat: 'صيغة الصورة غير مدعومة',
    networkError: 'خطأ في الاتصال بالإنترنت',
    serverError: 'خطأ في الخادم، يرجى المحاولة لاحقاً',
    retrying: 'إعادة المحاولة...',
    cancelled: 'تم الإلغاء',
    success: 'نجاح',
    error: 'خطأ'
  },
  en: {
    analyzing: 'Analyzing image...',
    analysisComplete: 'Image analyzed successfully',
    applyingTool: 'Applying tool...',
    toolApplied: 'Tool applied successfully',
    noImageSelected: 'Please select an image first',
    analysisError: 'Failed to analyze image',
    applyError: 'Failed to apply tool',
    noSuggestedTools: 'No suggested tools available',
    imageTooSmall: 'Image is too small (minimum 100x100)',
    imageTooLarge: 'Image is too large (maximum 50MB)',
    unsupportedFormat: 'Image format not supported',
    networkError: 'Network error',
    serverError: 'Server error, please try again later',
    retrying: 'Retrying...',
    cancelled: 'Cancelled',
    success: 'Success',
    error: 'Error'
  }
};

// ===== الأدوات المتاحة =====
export const AVAILABLE_TOOLS = {
  BRIGHTNESS: {
    label: { ar: 'الإضاءة', en: 'Brightness' },
    icon: '💡',
    category: 'adjustment',
    minValue: -100,
    maxValue: 100,
    defaultValue: 0,
    step: 5
  },
  CONTRAST: {
    label: { ar: 'التباين', en: 'Contrast' },
    icon: '⚖️',
    category: 'adjustment',
    minValue: -100,
    maxValue: 100,
    defaultValue: 0,
    step: 5
  },
  SATURATION: {
    label: { ar: 'الألوان', en: 'Saturation' },
    icon: '🎨',
    category: 'adjustment',
    minValue: -100,
    maxValue: 100,
    defaultValue: 0,
    step: 5
  },
  HUE: {
    label: { ar: 'الصبغة', en: 'Hue' },
    icon: '🌈',
    category: 'adjustment',
    minValue: -180,
    maxValue: 180,
    defaultValue: 0,
    step: 5
  },
  SHARPNESS: {
    label: { ar: 'الحدة', en: 'Sharpness' },
    icon: '🔪',
    category: 'adjustment',
    minValue: 0,
    maxValue: 100,
    defaultValue: 0,
    step: 5
  },
  BLUR: {
    label: { ar: 'الضبابية', en: 'Blur' },
    icon: '💨',
    category: 'effect',
    minValue: 0,
    maxValue: 50,
    defaultValue: 0,
    step: 1
  },
  TEMPERATURE: {
    label: { ar: 'درجة الحرارة', en: 'Temperature' },
    icon: '🌡️',
    category: 'adjustment',
    minValue: -100,
    maxValue: 100,
    defaultValue: 0,
    step: 5
  },
  VIBRANCE: {
    label: { ar: 'النشاط', en: 'Vibrance' },
    icon: '✨',
    category: 'adjustment',
    minValue: -100,
    maxValue: 100,
    defaultValue: 0,
    step: 5
  }
};

// ===== نقاط مرجعية للتحسين =====
export const ENHANCEMENT_BENCHMARKS = {
  brightness: {
    dark: { min: 0, max: 35, recommendation: 20 },
    normal: { min: 35, max: 65, recommendation: 0 },
    bright: { min: 65, max: 100, recommendation: -15 }
  },
  contrast: {
    low: { min: 0, max: 40, recommendation: 20 },
    normal: { min: 40, max: 70, recommendation: 0 },
    high: { min: 70, max: 100, recommendation: -10 }
  },
  saturation: {
    dull: { min: 0, max: 35, recommendation: 20 },
    normal: { min: 35, max: 70, recommendation: 0 },
    oversaturated: { min: 70, max: 100, recommendation: -15 }
  }
};

// ===== إعدادات الكاش =====
export const CACHE_CONFIG = {
  enabled: true,
  ttl: 3600,          // ساعة واحدة
  maxSize: 100,       // 100 صورة
  strategy: 'LRU'     // Least Recently Used
};

// ===== إعدادات التحليل =====
export const ANALYSIS_CONFIG = {
  pixelSampling: 0.1,        // عينة 10% من البكسل
  colorAnalysis: true,
  faceDetection: true,
  sceneDetection: true,
  objectDetection: true,
  qualityMetrics: true
};

// ===== إعدادات التسجيل =====
export const LOGGING_CONFIG = {
  enabled: true,
  level: 'info',  // debug, info, warn, error
  logAnalysis: true,
  logOperations: true,
  retentionDays: 7
};

// ===== التكامل مع الخدمات الخارجية =====
export const EXTERNAL_SERVICES = {
  // AWS S3
  s3: {
    enabled: false,
    bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },

  // Google Cloud Vision API
  googleVision: {
    enabled: false,
    apiKey: process.env.GOOGLE_VISION_API_KEY,
    features: ['LABEL_DETECTION', 'IMAGE_PROPERTIES', 'CROP_HINTS']
  },

  // Firebase Storage
  firebase: {
    enabled: false,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  },

  // Cloudinary
  cloudinary: {
    enabled: false,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  }
};

// ===== الإصدار والمعلومات =====
export const VERSION_INFO = {
  version: '1.0.0',
  name: 'AI Montage Control System',
  description: 'Intelligent system to control and enhance image editing tools',
  releaseDate: '2026-01-03',
  author: 'AVinar Team',
  license: 'MIT'
};

// ===== الوظائف المساعدة =====

/**
 * الحصول على رسالة حسب اللغة
 */
export function getMessage(key, language = 'ar') {
  return MESSAGES[language]?.[key] || MESSAGES.en[key] || key;
}

/**
 * التحقق من صيغة الصورة
 */
export function isImageFormatSupported(mimeType) {
  return AI_MONTAGE_CONFIG.supportedFormats.includes(mimeType);
}

/**
 * الحصول على أداة حسب الاسم
 */
export function getToolByName(toolName) {
  return AVAILABLE_TOOLS[toolName];
}

/**
 * التحقق من حجم الصورة
 */
export function validateImageSize(bytes) {
  return bytes <= AI_MONTAGE_CONFIG.limits.maxImageSize;
}

/**
 * الحصول على التوصية بناءً على القيمة
 */
export function getRecommendation(metric, value) {
  const benchmark = ENHANCEMENT_BENCHMARKS[metric];
  
  for (const [key, range] of Object.entries(benchmark)) {
    if (value >= range.min && value <= range.max) {
      return {
        level: key,
        recommendation: range.recommendation,
        needsEnhancement: range.recommendation !== 0
      };
    }
  }
  
  return {
    level: 'unknown',
    recommendation: 0,
    needsEnhancement: false
  };
}

export default {
  AI_MONTAGE_CONFIG,
  LIBRARY_CONFIG,
  MESSAGES,
  AVAILABLE_TOOLS,
  ENHANCEMENT_BENCHMARKS,
  CACHE_CONFIG,
  ANALYSIS_CONFIG,
  LOGGING_CONFIG,
  EXTERNAL_SERVICES,
  VERSION_INFO,
  getMessage,
  isImageFormatSupported,
  getToolByName,
  validateImageSize,
  getRecommendation
};
