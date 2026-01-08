import React, { useState, useEffect } from 'react';
import { GraduationCap, Zap, Info, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AIVideoTools, UserPreferences } from '@/services/aiVideoTools';

interface BeginnerModeToggleProps {
  isBeginnerMode: boolean;
  onChange: (enabled: boolean) => void;
}

export default function BeginnerModeToggle({ isBeginnerMode, onChange }: BeginnerModeToggleProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const features = {
    beginner: [
      { icon: '🎯', title: 'واجهة مبسطة', desc: 'إخفاء الأدوات المتقدمة' },
      { icon: '💡', title: 'نصائح تلقائية', desc: 'إرشادات خطوة بخطوة' },
      { icon: '🎨', title: 'قوالب جاهزة', desc: 'تصميمات معدة مسبقاً' },
      { icon: '🚀', title: 'تحرير سريع', desc: 'عمليات تلقائية بنقرة واحدة' },
    ],
    advanced: [
      { icon: '⚙️', title: 'تحكم كامل', desc: 'جميع الأدوات والخيارات' },
      { icon: '📊', title: 'إحصائيات متقدمة', desc: 'تحليلات تفصيلية' },
      { icon: '🎛️', title: 'تخصيص شامل', desc: 'ضبط دقيق لكل شيء' },
      { icon: '⌨️', title: 'اختصارات متقدمة', desc: 'سير عمل احترافي' },
    ],
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-xl">
        <div className="flex items-center gap-2 flex-1">
          {isBeginnerMode ? (
            <GraduationCap className="text-indigo-500" size={20} />
          ) : (
            <Zap className="text-purple-500" size={20} />
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {isBeginnerMode ? 'وضع المبتدئ' : 'وضع المحترف'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isBeginnerMode ? 'واجهة مبسطة وسهلة' : 'جميع الأدوات المتقدمة'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowExplanation(!showExplanation)}
          >
            <Info size={16} />
          </Button>
          
          <Switch
            checked={!isBeginnerMode}
            onCheckedChange={(checked) => onChange(!checked)}
          />
        </div>
      </div>

      {/* Explanation Card */}
      {showExplanation && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-in slide-in-from-top-2">
          <Card className="p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">
                اختر الوضع المناسب لك
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowExplanation(false)}
              >
                <X size={14} />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Beginner Mode */}
              <div
                onClick={() => onChange(true)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isBeginnerMode
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="text-indigo-500" size={20} />
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    وضع المبتدئ
                  </h4>
                  {isBeginnerMode && (
                    <Badge className="bg-indigo-500 text-white mr-auto">
                      <Check size={12} className="ml-1" />
                      نشط
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  مثالي للمبتدئين والمستخدمين الجدد
                </p>

                <div className="space-y-2">
                  {features.beginner.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-lg">{feature.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          {feature.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Mode */}
              <div
                onClick={() => onChange(false)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  !isBeginnerMode
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-slate-700 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="text-purple-500" size={20} />
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    وضع المحترف
                  </h4>
                  {!isBeginnerMode && (
                    <Badge className="bg-purple-500 text-white mr-auto">
                      <Check size={12} className="ml-1" />
                      نشط
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  للمحترفين الذين يريدون تحكماً كاملاً
                </p>

                <div className="space-y-2">
                  {features.advanced.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-lg">{feature.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          {feature.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                💡 <strong>نصيحة:</strong> يمكنك التبديل بين الوضعين في أي وقت حسب احتياجك
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
