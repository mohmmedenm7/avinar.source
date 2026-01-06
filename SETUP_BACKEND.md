# تعليمات تشغيل الباك إند

## المشكلة الحالية
التطبيق يحاول الاتصال بالباك إند على `localhost:8000` ولكن الباك إند غير شغال.

## خطوات تشغيل الباك إند

### 1. الانتقال إلى مجلد الباك إند
```bash
cd udemy-build-ecommerce-api-using-nodejs-master
```

### 2. تثبيت المكتبات (إذا لم تكن مثبتة)
```bash
npm install
```

### 3. التأكد من وجود ملف config.env
تأكد من وجود ملف `config.env` في مجلد الباك إند ويحتوي على:
```
MONGO_URI=mongodb+srv://AVinar:Paswerd78*@cluster0.rg5zb.mongodb.net/ecommerce
JWT_SECRET=Paswerd78*
JWT_EXPIRES_IN=90d
PORT=8000
NODE_ENV=development
BASE_URL=http://localhost:8000
```

### 4. تشغيل الباك إند
```bash
npm run start:dev
```

أو للإنتاج:
```bash
npm start
```

### 5. التحقق من أن الباك إند يعمل
افتح المتصفح واذهب إلى:
```
http://localhost:8000/api/v1/products
```

يجب أن ترى استجابة JSON.

## ملاحظات مهمة

### للاختبار على Android Emulator:
- الباك إند يستخدم `localhost:8000`
- التطبيق Android سيستخدم تلقائياً `10.0.2.2:8000` (يتم التحويل تلقائياً)

### للاختبار على iOS Simulator:
- الباك إند يستخدم `localhost:8000`
- التطبيق iOS سيستخدم `localhost:8000` مباشرة

### للاختبار على جهاز حقيقي:
1. احصل على IP جهاز الكمبيوتر:
   - Windows: `ipconfig` في CMD
   - Mac/Linux: `ifconfig` في Terminal
2. غيّر `BASE_URL` في `react/my-app/services/api.ts` أو استخدم متغير البيئة `API_BASE_URL`

## استكشاف الأخطاء

### خطأ: `ECONNREFUSED`
- **السبب**: الباك إند غير شغال
- **الحل**: شغّل الباك إند باستخدام `npm run start:dev`

### خطأ: `Cannot connect to MongoDB`
- **السبب**: مشكلة في اتصال MongoDB
- **الحل**: تحقق من `MONGO_URI` في `config.env`

### خطأ: `Port 8000 already in use`
- **السبب**: البورت 8000 مستخدم من تطبيق آخر
- **الحل**: غيّر `PORT` في `config.env` أو أوقف التطبيق الذي يستخدم البورت

