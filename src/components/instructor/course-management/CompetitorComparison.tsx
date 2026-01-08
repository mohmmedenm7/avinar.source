import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, AlertCircle, TrendingUp, Zap } from 'lucide-react';

/**
 * 🎬 مقارنة Avinar مع برامج الفيديو الاحترافية
 * 
 * المنافسين:
 * - Adobe After Effects (Motion Graphics & VFX)
 * - DaVinci Resolve (Professional Editing & Color)
 * - Adobe Premiere Pro (Video Editing)
 */

interface Feature {
  name: string;
  avinar: boolean | 'partial' | 'planned';
  afterEffects: boolean;
  davinci: boolean;
  premiere: boolean;
  priority: 'high' | 'medium' | 'low';
  description?: string;
}

interface FeatureCategory {
  category: string;
  icon: string;
  features: Feature[];
}

export default function CompetitorComparison() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const comparisonData: FeatureCategory[] = [
    {
      category: 'Basic Editing',
      icon: '✂️',
      features: [
        {
          name: 'Cut & Trim',
          avinar: true,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: 'قص وتقطيع المقاطع',
        },
        {
          name: 'Multi-Track Timeline',
          avinar: 'partial',
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: 'خط زمني متعدد المسارات',
        },
        {
          name: 'Undo/Redo History',
          avinar: true,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
        },
        {
          name: 'Keyboard Shortcuts',
          avinar: true,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'medium',
        },
        {
          name: 'Proxy Workflow',
          avinar: false,
          afterEffects: false,
          davinci: true,
          premiere: true,
          priority: 'medium',
          description: 'العمل على نسخ منخفضة الجودة',
        },
      ],
    },
    {
      category: 'Color Grading',
      icon: '🎨',
      features: [
        {
          name: 'LUTs Support',
          avinar: true,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: '✅ لديك 14 LUT',
        },
        {
          name: 'Color Wheels',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: 'عجلات الألوان (Lift, Gamma, Gain)',
        },
        {
          name: 'Curves & HSL',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: 'منحنيات RGB و HSL',
        },
        {
          name: 'Scopes (Waveform, Vectorscope)',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'medium',
          description: 'أدوات قياس الألوان',
        },
        {
          name: 'HDR Grading',
          avinar: false,
          afterEffects: false,
          davinci: true,
          premiere: true,
          priority: 'low',
        },
      ],
    },
    {
      category: 'Audio Editing',
      icon: '🔊',
      features: [
        {
          name: 'AI Noise Removal',
          avinar: true,
          afterEffects: false,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: '✅ لديك هذه الميزة',
        },
        {
          name: 'Audio Effects Library',
          avinar: true,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'medium',
          description: '✅ لديك 10 مؤثرات',
        },
        {
          name: 'Audio Mixer',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: 'خلاط صوتي متقدم',
        },
        {
          name: 'EQ & Compression',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'medium',
          description: 'معادل صوتي وضاغط',
        },
        {
          name: 'Speech to Text',
          avinar: true,
          afterEffects: false,
          davinci: true,
          premiere: true,
          priority: 'medium',
          description: '✅ لديك هذه الميزة',
        },
      ],
    },
    {
      category: 'Visual Effects (VFX)',
      icon: '✨',
      features: [
        {
          name: 'Motion Tracking',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: false,
          priority: 'high',
          description: 'تتبع الحركة',
        },
        {
          name: 'Chroma Key (Green Screen)',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: 'إزالة الخلفية الخضراء',
        },
        {
          name: 'Masking & Rotoscoping',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: 'القناع والروتوسكوب',
        },
        {
          name: 'Particle Systems',
          avinar: false,
          afterEffects: true,
          davinci: false,
          premiere: false,
          priority: 'medium',
          description: 'أنظمة الجزيئات',
        },
        {
          name: '3D Camera & Layers',
          avinar: false,
          afterEffects: true,
          davinci: false,
          premiere: false,
          priority: 'medium',
          description: 'كاميرا وطبقات ثلاثية الأبعاد',
        },
      ],
    },
    {
      category: 'Transitions & Effects',
      icon: '🌟',
      features: [
        {
          name: 'Basic Transitions',
          avinar: 'partial',
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: 'انتقالات بسيطة (fade, wipe)',
        },
        {
          name: 'Advanced Transitions',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'medium',
          description: 'انتقالات متقدمة (morph, blur)',
        },
        {
          name: 'Plugins Support',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'medium',
          description: 'دعم الإضافات الخارجية',
        },
        {
          name: 'Built-in Effects Library',
          avinar: 'partial',
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: 'مكتبة مؤثرات مدمجة',
        },
      ],
    },
    {
      category: 'Text & Graphics',
      icon: '📝',
      features: [
        {
          name: 'Text Animations',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: 'رسوم متحركة للنصوص',
        },
        {
          name: 'Lower Thirds',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: 'عناوين سفلية احترافية',
        },
        {
          name: 'Shape Layers',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: false,
          priority: 'medium',
          description: 'طبقات الأشكال',
        },
        {
          name: 'Arabic Text Support',
          avinar: true,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: '✅ دعم اللغة العربية',
        },
      ],
    },
    {
      category: 'Export & Delivery',
      icon: '📤',
      features: [
        {
          name: 'Multiple Format Export',
          avinar: 'partial',
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: 'تصدير بصيغ متعددة',
        },
        {
          name: 'Batch Export',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'medium',
          description: 'تصدير دفعي',
        },
        {
          name: 'Hardware Acceleration',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: 'تسريع GPU',
        },
        {
          name: 'Social Media Presets',
          avinar: false,
          afterEffects: false,
          davinci: true,
          premiere: true,
          priority: 'medium',
          description: 'إعدادات جاهزة لوسائل التواصل',
        },
      ],
    },
    {
      category: 'AI Features',
      icon: '🤖',
      features: [
        {
          name: 'AI Noise Removal',
          avinar: true,
          afterEffects: false,
          davinci: true,
          premiere: true,
          priority: 'high',
          description: '✅ لديك',
        },
        {
          name: 'Auto Reframe',
          avinar: false,
          afterEffects: false,
          davinci: false,
          premiere: true,
          priority: 'medium',
          description: 'إعادة تأطير تلقائي',
        },
        {
          name: 'Object Removal',
          avinar: false,
          afterEffects: true,
          davinci: true,
          premiere: false,
          priority: 'medium',
          description: 'إزالة الكائنات',
        },
        {
          name: 'Face Detection',
          avinar: false,
          afterEffects: false,
          davinci: true,
          premiere: true,
          priority: 'low',
          description: 'كشف الوجوه',
        },
      ],
    },
    {
      category: 'Collaboration',
      icon: '👥',
      features: [
        {
          name: 'Cloud Sync',
          avinar: false,
          afterEffects: true,
          davinci: false,
          premiere: true,
          priority: 'medium',
        },
        {
          name: 'Team Projects',
          avinar: false,
          afterEffects: false,
          davinci: true,
          premiere: true,
          priority: 'low',
        },
        {
          name: 'Version Control',
          avinar: false,
          afterEffects: false,
          davinci: true,
          premiere: true,
          priority: 'low',
        },
      ],
    },
  ];

  const getStatusIcon = (status: boolean | 'partial' | 'planned') => {
    if (status === true) return <Check size={16} className="text-green-500" />;
    if (status === 'partial') return <AlertCircle size={16} className="text-yellow-500" />;
    if (status === 'planned') return <TrendingUp size={16} className="text-blue-500" />;
    return <X size={16} className="text-red-500" />;
  };

  const getStatusText = (status: boolean | 'partial' | 'planned') => {
    if (status === true) return 'موجود';
    if (status === 'partial') return 'جزئي';
    if (status === 'planned') return 'مخطط';
    return 'غير موجود';
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-gray-500',
    };
    const labels = {
      high: 'أولوية عالية',
      medium: 'أولوية متوسطة',
      low: 'أولوية منخفضة',
    };
    return <Badge className={`${colors[priority]} text-white text-xs`}>{labels[priority]}</Badge>;
  };

  const categories = ['all', ...comparisonData.map((c) => c.category)];
  const filteredData =
    selectedCategory === 'all'
      ? comparisonData
      : comparisonData.filter((c) => c.category === selectedCategory);

  // إحصائيات
  const totalFeatures = comparisonData.reduce((sum, cat) => sum + cat.features.length, 0);
  const avinarFullFeatures = comparisonData.reduce(
    (sum, cat) => sum + cat.features.filter((f) => f.avinar === true).length,
    0
  );
  const avinarPartialFeatures = comparisonData.reduce(
    (sum, cat) => sum + cat.features.filter((f) => f.avinar === 'partial').length,
    0
  );
  const missingHighPriority = comparisonData.reduce(
    (sum, cat) => sum + cat.features.filter((f) => !f.avinar && f.priority === 'high').length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎬 Avinar vs المنافسين</h1>
          <p className="text-purple-200">مقارنة شاملة مع After Effects, DaVinci Resolve, Premiere Pro</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-300">
                {avinarFullFeatures}/{totalFeatures}
              </div>
              <div className="text-green-100 text-sm mt-1">ميزة كاملة</div>
              <div className="text-green-200 text-xs mt-2">
                {Math.round((avinarFullFeatures / totalFeatures) * 100)}% تغطية
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-yellow-500/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">{avinarPartialFeatures}</div>
              <div className="text-yellow-100 text-sm mt-1">ميزة جزئية</div>
              <div className="text-yellow-200 text-xs mt-2">تحتاج تطوير</div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-900/50 to-pink-900/50 border-red-500/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-300">{missingHighPriority}</div>
              <div className="text-red-100 text-sm mt-1">ميزة ناقصة مهمة</div>
              <div className="text-red-200 text-xs mt-2">أولوية عالية</div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-300">
                {totalFeatures - avinarFullFeatures - avinarPartialFeatures}
              </div>
              <div className="text-blue-100 text-sm mt-1">ميزة غير موجودة</div>
              <div className="text-blue-200 text-xs mt-2">فرص للتطوير</div>
            </div>
          </Card>
        </div>

        {/* Category Filter */}
        <Card className="p-4 bg-slate-800/50 border-purple-500/30">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className={
                  selectedCategory === cat
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'border-purple-500 text-white hover:bg-purple-500/20'
                }
              >
                {cat === 'all'
                  ? 'جميع الفئات'
                  : comparisonData.find((c) => c.category === cat)?.icon + ' ' + cat}
              </Button>
            ))}
          </div>
        </Card>

        {/* Comparison Table */}
        <div className="space-y-6">
          {filteredData.map((categoryData) => (
            <Card key={categoryData.category} className="overflow-hidden bg-slate-800/50 border-purple-500/30">
              <div className="p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-purple-500/30">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{categoryData.icon}</span>
                  {categoryData.category}
                  <Badge variant="secondary" className="ml-auto">
                    {categoryData.features.length} ميزة
                  </Badge>
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-900/50">
                      <th className="p-3 text-right text-white font-semibold">الميزة</th>
                      <th className="p-3 text-center text-purple-300 font-semibold w-28">Avinar</th>
                      <th className="p-3 text-center text-gray-400 font-semibold w-28">After Effects</th>
                      <th className="p-3 text-center text-gray-400 font-semibold w-28">DaVinci</th>
                      <th className="p-3 text-center text-gray-400 font-semibold w-28">Premiere</th>
                      <th className="p-3 text-center text-white font-semibold w-32">الأولوية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData.features.map((feature, idx) => (
                      <tr
                        key={idx}
                        className={`border-t border-slate-700 ${
                          !feature.avinar && feature.priority === 'high' ? 'bg-red-900/10' : ''
                        }`}
                      >
                        <td className="p-3 text-white">
                          <div>
                            <div className="font-medium">{feature.name}</div>
                            {feature.description && (
                              <div className="text-xs text-gray-400 mt-1">{feature.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {getStatusIcon(feature.avinar)}
                            <span className="text-xs text-gray-300">{getStatusText(feature.avinar)}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">{getStatusIcon(feature.afterEffects)}</td>
                        <td className="p-3 text-center">{getStatusIcon(feature.davinci)}</td>
                        <td className="p-3 text-center">{getStatusIcon(feature.premiere)}</td>
                        <td className="p-3 text-center">{getPriorityBadge(feature.priority)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>

        {/* Missing Features Summary */}
        <Card className="p-6 bg-gradient-to-br from-red-900/30 to-pink-900/30 border-red-500/30">
          <div className="flex items-start gap-3 mb-4">
            <Zap className="text-red-400" size={24} />
            <div>
              <h3 className="text-xl font-bold text-white">⚠️ الميزات الناقصة ذات الأولوية العالية</h3>
              <p className="text-red-200 text-sm">هذه الميزات مهمة جداً لمنافسة البرامج الاحترافية</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comparisonData.map((cat) =>
              cat.features
                .filter((f) => !f.avinar && f.priority === 'high')
                .map((feature, idx) => (
                  <div key={idx} className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-semibold">{feature.name}</h4>
                        <p className="text-red-200 text-xs mt-1">{cat.icon} {cat.category}</p>
                        {feature.description && (
                          <p className="text-red-300 text-xs mt-2">{feature.description}</p>
                        )}
                      </div>
                      <Badge className="bg-red-600 text-white">مهم</Badge>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
