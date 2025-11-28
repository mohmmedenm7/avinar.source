# Professional Animation System
# نظام الأنيميشنات الاحترافي

مجموعة شاملة من الأنيميشنات الاحترافية للاستخدام في واجهات الويب، تشمل مؤشرات التحميل، التفاعلات الدقيقة، وانتقالات الصفحات.

## 📦 المحتويات

- **React/Framer Motion Components**: مكونات جاهزة للاستخدام مع React
- **Lottie JSON**: ملفات Lottie محسّنة
- **Vanilla CSS/HTML**: نسخة خفيفة بدون مكتبات
- **دعم كامل للوصول (A11y)**
- **دعم الثيمات (Theming)**

## 🚀 التثبيت السريع

### React/Framer Motion

```bash
npm install framer-motion
# or
yarn add framer-motion
```

### Lottie (اختياري)

```bash
npm install lottie-react
# or
yarn add lottie-react
```

## 📚 الاستخدام

### 1. LoadingSpinner

```tsx
import { LoadingSpinner } from '@/components/animations/LoadingSpinner';

function MyComponent() {
  return (
    <LoadingSpinner 
      size={48}
      color="var(--primary)"
      speed={1.2}
      loop={true}
    />
  );
}
```

**Props:**
- `size` (number): الحجم بالبكسل (افتراضي: 48)
- `color` (string): اللون (افتراضي: var(--primary))
- `speed` (number): السرعة بالثواني (افتراضي: 1.2)
- `loop` (boolean): تكرار لا نهائي (افتراضي: true)
- `reducedMotionFallback` (boolean): نسخة ثابتة للحركة المخفضة (افتراضي: true)

### 2. MicroInteraction

```tsx
import { MicroInteraction, ButtonPress, CardLift } from '@/components/animations/MicroInteraction';

// استخدام عام
<MicroInteraction scaleDown={0.96} translateY={-2} duration={0.12}>
  <div>محتوى تفاعلي</div>
</MicroInteraction>

// للأزرار
<ButtonPress>
  <button>اضغط هنا</button>
</ButtonPress>

// للبطاقات
<CardLift>
  <div className="card">بطاقة تفاعلية</div>
</CardLift>
```

**Props:**
- `scaleDown` (number): معامل التصغير عند الضغط (افتراضي: 0.96)
- `translateY` (number): الحركة العمودية عند hover (افتراضي: -2)
- `duration` (number): مدة الأنيميشن (افتراضي: 0.12)
- `easing` (string | number[]): دالة التسارع (افتراضي: "easeInOut")
- `disabled` (boolean): تعطيل الأنيميشن (افتراضي: false)

### 3. PageTransition

```tsx
import { PageTransition, AnimatedRoutes } from '@/components/animations/PageTransition';
import { Routes, Route, useLocation } from 'react-router-dom';

// مع React Router
function App() {
  const location = useLocation();
  
  return (
    <AnimatedRoutes>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </AnimatedRoutes>
  );
}

// استخدام مباشر
<PageTransition mode="fadeSlide" duration={0.45}>
  <YourPageContent />
</PageTransition>
```

**Modes:**
- `fade`: تلاشي بسيط
- `slide`: انزلاق أفقي
- `fadeSlide`: تلاشي + انزلاق عمودي (افتراضي)
- `scale`: تلاشي + تكبير/تصغير

### 4. Lottie Animation

```tsx
import Lottie from 'lottie-react';
import loadingAnimation from '@/public/animations/lottie_loading.json';

function MyComponent() {
  return (
    <Lottie 
      animationData={loadingAnimation}
      loop={true}
      style={{ width: 200, height: 200 }}
    />
  );
}
```

### 5. Vanilla CSS/HTML

```html
<!-- في HTML -->
<link rel="stylesheet" href="animations/vanilla.css">

<!-- مؤشر تحميل -->
<div class="loading-spinner" role="status" aria-label="Loading">
  <span class="sr-only">Loading...</span>
</div>

<!-- زر تفاعلي -->
<button class="btn btn-press">اضغط هنا</button>

<!-- بطاقة تفاعلية -->
<div class="card card-lift">
  <h3>عنوان البطاقة</h3>
  <p>محتوى البطاقة</p>
</div>
```

## 🎨 التخصيص (Theming)

### CSS Variables

```css
:root {
  --primary: #2563EB;
  --accent: #1D4ED8;
  --bg: #FFFFFF;
  --text: #1A1A1A;
  --gray: #6B7280;
  
  --duration-fast: 0.12s;
  --duration-normal: 0.3s;
  --duration-slow: 0.45s;
  --easing: cubic-bezier(0.22, 1, 0.36, 1);
}
```

### React Props

```tsx
// تغيير الألوان
<LoadingSpinner color="#FF6B35" />

// تغيير السرعة
<MicroInteraction duration={0.2} />

// تغيير نوع الانتقال
<PageTransition mode="scale" duration={0.6} />
```

## ♿ الوصول (Accessibility)

### prefers-reduced-motion

جميع المكونات تحترم تفضيل المستخدم لتقليل الحركة:

```css
@media (prefers-reduced-motion: reduce) {
  /* الأنيميشنات تتوقف أو تتباطأ تلقائياً */
}
```

### ARIA Labels

```tsx
// مؤشرات التحميل
<LoadingSpinner /> // يحتوي على role="status" و aria-live="polite"

// نص مخفي للقارئات الشاشة
<span className="sr-only">Loading...</span>
```

### Focus States

```css
.btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

## 📊 الأداء (Performance)

### أحجام الملفات

- **Lottie JSON**: ~15KB (مضغوط)
- **LoadingSpinner.tsx**: ~3KB
- **MicroInteraction.tsx**: ~4KB
- **PageTransition.tsx**: ~4KB
- **vanilla.css**: ~8KB

### توصيات الأداء

1. **Lazy Loading**:
```tsx
const LoadingSpinner = lazy(() => import('@/components/animations/LoadingSpinner'));
```

2. **Code Splitting**:
```tsx
// في Next.js
const PageTransition = dynamic(() => import('@/components/animations/PageTransition'), {
  ssr: false
});
```

3. **will-change** (استخدم بحذر):
```css
.animating-element {
  will-change: transform, opacity;
}
```

4. **تحسين Lottie**:
- استخدم SVGO قبل التصدير
- قلل عدد الـ paths
- استخدم shapes بدلاً من الصور

### معايير الأداء

- ✅ حجم Lottie: <100KB (مثالي), <200KB (مقبول)
- ✅ معدل الإطارات: 30 FPS (معقد), 60 FPS (بسيط)
- ✅ مدة الأنيميشن:
  - Micro: 0.12-0.35s
  - Loading: 0.8-2.5s
  - Page Transition: 0.3-0.9s

## 🌓 الوضع الداكن (Dark Mode)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1A1A1A;
    --text: #FFFFFF;
    --gray-light: #2D2D2D;
  }
}
```

## 📱 الاستجابة (Responsive)

```tsx
// تغيير الحجم حسب الشاشة
<LoadingSpinner 
  size={window.innerWidth < 768 ? 32 : 48}
/>
```

## 🔧 أمثلة متقدمة

### تسلسل الأنيميشنات

```tsx
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map((item, i) => (
    <motion.div key={i} variants={item}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

### أنيميشن مخصص

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
  transition={{
    duration: 0.3,
    ease: [0.22, 1, 0.36, 1]
  }}
>
  محتوى مخصص
</motion.div>
```

## 📄 الترخيص

MIT License - استخدم بحرية في مشاريعك!

## 🤝 المساهمة

نرحب بالمساهمات! افتح issue أو pull request.

## 📞 الدعم

للأسئلة والدعم، افتح issue في المستودع.

---

صُنع بـ ❤️ للمطورين العرب
