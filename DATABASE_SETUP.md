# 🗄️ تحضير قاعدة البيانات للاختبار

## 📋 المستخدمون المطلوبون

ستحتاج إلى 4 مستخدمين بالأدوار المختلفة:

### 1. الطالب الأول (Student 1)
```json
{
  "email": "student1@example.com",
  "password": "Password123!",
  "name": "أحمد محمد",
  "role": "user",
  "chatStatus": "online",
  "profileImg": "https://example.com/student1.jpg"
}
```

**كيفية الإنشاء عبر API:**
```bash
POST http://localhost:8000/api/v1/auth/signup
Content-Type: application/json

{
  "email": "student1@example.com",
  "password": "Password123!",
  "name": "أحمد محمد"
}
```

---

### 2. الطالب الثاني (Student 2)
```json
{
  "email": "student2@example.com",
  "password": "Password123!",
  "name": "فاطمة علي",
  "role": "user",
  "chatStatus": "offline",
  "profileImg": "https://example.com/student2.jpg"
}
```

**كيفية الإنشاء عبر API:**
```bash
POST http://localhost:8000/api/v1/auth/signup
Content-Type: application/json

{
  "email": "student2@example.com",
  "password": "Password123!",
  "name": "فاطمة علي"
}
```

---

### 3. المدرب (Instructor)
```json
{
  "email": "instructor@example.com",
  "password": "Password123!",
  "name": "د. محمود علي",
  "role": "instructor",
  "chatStatus": "online",
  "profileImg": "https://example.com/instructor.jpg"
}
```

**ملاحظة:** يجب تغيير الـ role إلى "instructor" يدويًا في قاعدة البيانات

**طريقة بديلة - مباشرة في MongoDB:**
```javascript
db.users.updateOne(
  { email: "instructor@example.com" },
  { $set: { role: "instructor" } }
)
```

---

### 4. الأدمن (Admin)
```json
{
  "email": "admin@example.com",
  "password": "Password123!",
  "name": "المسؤول",
  "role": "admin",
  "chatStatus": "online",
  "profileImg": "https://example.com/admin.jpg"
}
```

**طريقة الإنشاء - مباشرة في MongoDB:**
```javascript
db.users.insertOne({
  email: "admin@example.com",
  password: "... hashed password ...",
  name: "المسؤول",
  role: "admin",
  chatStatus: "online",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## 🔧 خطوات التحضير

### الطريقة 1: عبر API (الأسهل)

1. **تسجيل Student 1:**
   ```bash
   POST http://localhost:8000/api/v1/auth/signup
   {
     "email": "student1@example.com",
     "password": "Password123!",
     "name": "أحمد محمد"
   }
   ```
   احفظ المعرف: `STUDENT1_ID`

2. **تسجيل Student 2:**
   ```bash
   POST http://localhost:8000/api/v1/auth/signup
   {
     "email": "student2@example.com",
     "password": "Password123!",
     "name": "فاطمة علي"
   }
   ```
   احفظ المعرف: `STUDENT2_ID`

3. **تسجيل Instructor (كـ user أولاً):**
   ```bash
   POST http://localhost:8000/api/v1/auth/signup
   {
     "email": "instructor@example.com",
     "password": "Password123!",
     "name": "د. محمود علي"
   }
   ```
   احفظ المعرف: `INSTRUCTOR_ID`

4. **تعديل الـ role في MongoDB:**
   ```javascript
   db.users.updateOne(
     { email: "instructor@example.com" },
     { $set: { role: "instructor" } }
   )
   ```

---

### الطريقة 2: مباشرة في MongoDB Compass

1. افتح MongoDB Compass
2. اختر Database: `ecommerce` (أو اسم قاعدتك)
3. اختر Collection: `users`
4. انقر `Insert Document`
5. أدرج البيانات:

```javascript
{
  "_id": ObjectId("..."),
  "email": "student1@example.com",
  "password": "$2a$12$...", // bcrypt hash لـ "Password123!"
  "name": "أحمد محمد",
  "role": "user",
  "chatStatus": "online",
  "isActive": true,
  "isBlockedFromChat": false,
  "blockedUsers": [],
  "createdAt": ISODate("2025-12-24T00:00:00Z"),
  "updatedAt": ISODate("2025-12-24T00:00:00Z")
}
```

---

## 🔐 كيفية إنشاء Password Hash

### طريقة 1: عبر Node.js
```javascript
const bcrypt = require('bcrypt');

const plainPassword = 'Password123!';
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(plainPassword, salt);
console.log(hashedPassword);
// ستحصل على: $2a$10$...
```

### طريقة 2: استخدام أداة أون لاين
- اذهب إلى: https://www.bcryptvisualiser.com/
- أدخل `Password123!`
- انسخ النتيجة

### طريقة 3: استخدام CLI
```bash
# إذا كان Node.js مثبتاً
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Password123!', 10, (err, hash) => console.log(hash));"
```

---

## ✅ التحقق من البيانات

### تأكد من وجود المستخدمين:

```bash
# في MongoDB Compass أو Shell
db.users.find({})
```

**يجب أن تحصل على نتائج مشابهة:**
```javascript
[
  {
    _id: ObjectId("..."),
    email: "student1@example.com",
    name: "أحمد محمد",
    role: "user"
  },
  {
    _id: ObjectId("..."),
    email: "student2@example.com",
    name: "فاطمة علي",
    role: "user"
  },
  {
    _id: ObjectId("..."),
    email: "instructor@example.com",
    name: "د. محمود علي",
    role: "instructor"
  },
  {
    _id: ObjectId("..."),
    email: "admin@example.com",
    name: "المسؤول",
    role: "admin"
  }
]
```

---

## 🔑 حفظ المعرفات المهمة

بعد الإنشاء، احفظ هذه الـ IDs في ملف نصي آمن:

```
STUDENT1_ID = 507f1f77bcf86cd799439011
STUDENT2_ID = 507f1f77bcf86cd799439012
INSTRUCTOR_ID = 507f1f77bcf86cd799439013
ADMIN_ID = 507f1f77bcf86cd799439014
```

ستحتاج لها لاحقاً في الاختبارات!

---

## 🧪 اختبار البيانات

### بعد الإنشاء، جرّب تسجيل الدخول:

```bash
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "email": "student1@example.com",
  "password": "Password123!"
}
```

**الرد الناجح:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "أحمد محمد",
    "email": "student1@example.com",
    "role": "user"
  }
}
```

---

## 🚨 حل المشاكل

### المشكلة: "كلمة المرور غير صحيحة"
**الحل:** تأكد من أن كلمة المرور المحفوظة هي hash صحيح لـ `Password123!`

### المشكلة: "البريد الإلكتروني موجود بالفعل"
**الحل:** احذف المستخدم القديم:
```javascript
db.users.deleteOne({ email: "student1@example.com" })
```

### المشكلة: "لا يمكن العثور على المستخدم"
**الحل:** أعد الإنشاء من جديد:
```javascript
db.users.findOne({ email: "student1@example.com" })
// إذا لم يظهر شيء، أنشئه
```

---

## 📊 قائمة التحقق

- [ ] تم إنشاء Student 1
- [ ] تم إنشاء Student 2
- [ ] تم إنشاء Instructor (بـ role = instructor)
- [ ] تم إنشاء Admin (بـ role = admin)
- [ ] جميع المستخدمين يمكنهم تسجيل الدخول
- [ ] حفظت معرفات المستخدمين (IDs)
- [ ] جاهز للاختبار! ✅

---

**ملاحظة:** استخدم نفس بيانات المستخدمين في جميع الاختبارات اللاحقة!
