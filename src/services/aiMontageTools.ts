/**
 * خدمة الذكاء الاصطناعي للتحكم في أدوات المونتاج
 * AI Service to Control Montage Tools in AIPhotopeaStudio
 */

// أنواع الأدوات المتاحة
export enum MontageToolType {
  FILTER = 'filter',
  ADJUSTMENT = 'adjustment',
  EFFECT = 'effect',
  RESIZE = 'resize',
  CROP = 'crop',
  ROTATE = 'rotate',
  TEXT = 'text',
  LAYER = 'layer',
  COLOR = 'color',
  BLUR = 'blur',
  SHARPEN = 'sharpen',
  BRIGHTNESS = 'brightness',
  CONTRAST = 'contrast',
  SATURATION = 'saturation',
  HUE = 'hue',
}

// واجهة لأداة المونتاج
export interface MontageToolAction {
  tool: MontageToolType;
  name: string;
  description: string;
  parameters: Record<string, any>;
  priority: number;
  confidence: number;
}

// واجهة لتحليل الصورة
export interface ImageAnalysis {
  brightness: number;
  contrast: number;
  saturation: number;
  colorTemperature: string;
  dominantColors: string[];
  needsEnhancement: boolean;
  suggestedTools: MontageToolAction[];
}

// واجهة للمشهد
export interface SceneDescription {
  type: string; // landscape, portrait, product, etc.
  lighting: string; // natural, artificial, mixed
  colors: string[];
  mood: string; // dark, bright, warm, cool, etc.
}

export class AIMontageTools {
  private static readonly API_ENDPOINT = '/api/v1/instructor/ai/analyze';

  /**
   * تحليل الصورة باستخدام الذكاء الاصطناعي
   */
  static async analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ imageUrl, type: 'analyze' }),
      });

      if (!response.ok) throw new Error('Failed to analyze image');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Image analysis error:', error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * الحصول على تحليل افتراضي للصورة
   */
  private static getDefaultAnalysis(): ImageAnalysis {
    return {
      brightness: 50,
      contrast: 50,
      saturation: 50,
      colorTemperature: 'neutral',
      dominantColors: ['#808080'],
      needsEnhancement: false,
      suggestedTools: [],
    };
  }

  /**
   * الحصول على الأدوات الموصى بها بناءً على تحليل الصورة
   */
  static getSuggestedTools(analysis: ImageAnalysis): MontageToolAction[] {
    const tools: MontageToolAction[] = [];

    // إذا كانت الصورة مظلمة جداً
    if (analysis.brightness < 30) {
      tools.push({
        tool: MontageToolType.BRIGHTNESS,
        name: 'زيادة الإضاءة',
        description: 'الصورة مظلمة جداً، سيتم زيادة الإضاءة',
        parameters: { increase: 20 },
        priority: 10,
        confidence: 0.95,
      });
    }

    // إذا كانت الصورة مضيئة جداً
    if (analysis.brightness > 80) {
      tools.push({
        tool: MontageToolType.BRIGHTNESS,
        name: 'تقليل الإضاءة',
        description: 'الصورة مضيئة جداً، سيتم تقليل الإضاءة',
        parameters: { decrease: 15 },
        priority: 10,
        confidence: 0.9,
      });
    }

    // إذا كان التباين منخفضاً
    if (analysis.contrast < 40) {
      tools.push({
        tool: MontageToolType.CONTRAST,
        name: 'زيادة التباين',
        description: 'التباين منخفض، سيتم زيادة التفاصيل',
        parameters: { increase: 25 },
        priority: 8,
        confidence: 0.85,
      });
    }

    // إذا كانت الألوان باهتة
    if (analysis.saturation < 35) {
      tools.push({
        tool: MontageToolType.SATURATION,
        name: 'تعزيز الألوان',
        description: 'الألوان باهتة، سيتم تعزيزها',
        parameters: { increase: 20 },
        priority: 7,
        confidence: 0.8,
      });
    }

    // إذا كان درجة الحرارة دافئة جداً
    if (analysis.colorTemperature === 'warm') {
      tools.push({
        tool: MontageToolType.COLOR,
        name: 'ضبط درجة الحرارة',
        description: 'الصورة دافئة جداً، سيتم تبريدها قليلاً',
        parameters: { cool: true, amount: 10 },
        priority: 6,
        confidence: 0.75,
      });
    }

    return tools.sort((a, b) => b.priority - a.priority);
  }

  /**
   * تطبيق أداة على الصورة
   */
  static async applyTool(
    tool: MontageToolAction,
    imageUrl: string
  ): Promise<string> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          tool: tool.tool,
          parameters: tool.parameters,
          imageUrl,
        }),
      });

      if (!response.ok) throw new Error('Failed to apply tool');
      const data = await response.json();
      return data.data.imageUrl;
    } catch (error) {
      console.error('Apply tool error:', error);
      throw error;
    }
  }

  /**
   * الحصول على نصائح لتحسين الصورة
   */
  static getTips(analysis: ImageAnalysis): string[] {
    const tips: string[] = [];

    if (analysis.brightness < 40) {
      tips.push('💡 الصورة مظلمة، جرب زيادة الإضاءة للحصول على تفاصيل أفضل');
    }

    if (analysis.contrast < 45) {
      tips.push('⚖️ يمكنك تحسين التباين لجعل الصورة أكثر حدة وجاذبية');
    }

    if (analysis.saturation < 40) {
      tips.push('🎨 الألوان باهتة قليلاً، جرب تعزيزها للحصول على صورة أكثر حيوية');
    }

    if (
      analysis.dominantColors.length > 0 &&
      analysis.colorTemperature === 'warm'
    ) {
      tips.push('🌡️ يمكنك إضافة لون بارد قليل للتوازن');
    }

    if (!tips.length) {
      tips.push(
        '✨ الصورة جميلة بالفعل! جرب إضافة بعض التأثيرات الإبداعية'
      );
    }

    return tips;
  }

  /**
   * إنشاء أوامر Photopea للتحكم التلقائي
   */
  static generatePhotopeaCommands(tools: MontageToolAction[]): string[] {
    const commands: string[] = [];

    tools.forEach((tool) => {
      switch (tool.tool) {
        case MontageToolType.BRIGHTNESS:
          if (tool.parameters.increase) {
            commands.push(
              `app.activeDocument.adjustmentLayers[app.activeDocument.adjustmentLayers.length - 1].brightness += ${tool.parameters.increase}`
            );
          } else if (tool.parameters.decrease) {
            commands.push(
              `app.activeDocument.adjustmentLayers[app.activeDocument.adjustmentLayers.length - 1].brightness -= ${tool.parameters.decrease}`
            );
          }
          break;

        case MontageToolType.CONTRAST:
          if (tool.parameters.increase) {
            commands.push(
              `app.activeDocument.adjustmentLayers[app.activeDocument.adjustmentLayers.length - 1].contrast += ${tool.parameters.increase}`
            );
          }
          break;

        case MontageToolType.SATURATION:
          if (tool.parameters.increase) {
            commands.push(
              `app.activeDocument.adjustmentLayers[app.activeDocument.adjustmentLayers.length - 1].saturation += ${tool.parameters.increase}`
            );
          }
          break;

        case MontageToolType.SHARPEN:
          commands.push(
            `app.activeDocument.filters.sharpen(${tool.parameters.amount || 1})`
          );
          break;

        case MontageToolType.BLUR:
          commands.push(
            `app.activeDocument.filters.blur(${tool.parameters.radius || 3})`
          );
          break;

        default:
          break;
      }
    });

    return commands;
  }

  /**
   * تصنيف نوع المشهد في الصورة
   */
  static classifyScene(imageUrl: string): SceneDescription {
    // تصنيف مبسط - يمكن تحسينه لاحقاً
    return {
      type: 'general',
      lighting: 'natural',
      colors: ['neutral'],
      mood: 'balanced',
    };
  }

  /**
   * الحصول على مجموعة من الفلاتر المناسبة
   */
  static getRecommendedFilters(scene: SceneDescription): MontageToolAction[] {
    const filters: MontageToolAction[] = [];

    if (scene.lighting === 'dark') {
      filters.push({
        tool: MontageToolType.FILTER,
        name: 'فلتر الإضاءة الدافئة',
        description: 'يحسن الإضاءة في الأماكن المظلمة',
        parameters: { type: 'warm-light' },
        priority: 9,
        confidence: 0.85,
      });
    }

    if (scene.type === 'landscape') {
      filters.push({
        tool: MontageToolType.FILTER,
        name: 'فلتر تحسين الطبيعة',
        description: 'يزيد من حدة وألوان المناظر الطبيعية',
        parameters: { type: 'nature-enhance' },
        priority: 8,
        confidence: 0.8,
      });
    }

    if (scene.type === 'portrait') {
      filters.push({
        tool: MontageToolType.FILTER,
        name: 'فلتر تجميل البورتريه',
        description: 'يحسن مظهر الوجه والجلد',
        parameters: { type: 'portrait-enhance' },
        priority: 8,
        confidence: 0.85,
      });
    }

    return filters;
  }

  /**
   * إنشاء أمر وصفي بناءً على التحليل
   */
  static generateEditingPrompt(analysis: ImageAnalysis): string {
    let prompt = 'اقترح';

    if (analysis.brightness < 40) {
      prompt += ' زيادة الإضاءة،';
    }

    if (analysis.contrast < 45) {
      prompt += ' تحسين التباين،';
    }

    if (analysis.saturation < 40) {
      prompt += ' تعزيز الألوان،';
    }

    if (analysis.colorTemperature === 'warm') {
      prompt += ' موازنة درجة الحرارة،';
    }

    // إزالة الفاصلة الأخيرة
    prompt = prompt.slice(0, -1);
    prompt += ' لتحسين جودة الصورة';

    return prompt;
  }

  /**
   * تحديث أداة بناءً على رد المستخدم
   */
  static updateToolBasedOnFeedback(
    tool: MontageToolAction,
    feedback: 'increase' | 'decrease' | 'apply'
  ): MontageToolAction {
    const updated = { ...tool };

    if (feedback === 'increase') {
      if (tool.tool === MontageToolType.BRIGHTNESS) {
        updated.parameters.increase = (updated.parameters.increase || 10) + 5;
      } else if (tool.tool === MontageToolType.CONTRAST) {
        updated.parameters.increase = (updated.parameters.increase || 10) + 5;
      } else if (tool.tool === MontageToolType.SATURATION) {
        updated.parameters.increase = (updated.parameters.increase || 10) + 5;
      }
    } else if (feedback === 'decrease') {
      if (tool.tool === MontageToolType.BRIGHTNESS) {
        updated.parameters.decrease = (updated.parameters.decrease || 10) + 5;
      } else if (tool.tool === MontageToolType.CONTRAST) {
        updated.parameters.increase = Math.max(0, (updated.parameters.increase || 10) - 5);
      } else if (tool.tool === MontageToolType.SATURATION) {
        updated.parameters.increase = Math.max(0, (updated.parameters.increase || 10) - 5);
      }
    }

    return updated;
  }
}
