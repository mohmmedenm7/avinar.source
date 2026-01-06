# 🚀 دليل اختبار API الشات الكامل

> نظام الرسائل الفعلي بين الطلاب والمدربين والدعم الإداري

---

## 📋 المحتويات
1. [إعداد البيئة](#إعداد-البيئة)
2. [سيناريوهات الاختبار](#سيناريوهات-الاختبار)
3. [اختبار المحادثات](#اختبار-المحادثات)
4. [اختبار الرسائل](#اختبار-الرسائل)
5. [اختبار الدعم](#اختبار-الدعم)
6. [حالات الخطأ](#حالات-الخطأ)

---

## ⚙️ إعداد البيئة

### المستخدمون المطلوبون للاختبار:

```json
{
  "student1": {
    "email": "student1@example.com",
    "password": "Password123!",
    "role": "user"
  },
  "student2": {
    "email": "student2@example.com",
    "password": "Password123!",
    "role": "user"
  },
  "instructor": {
    "email": "instructor@example.com",
    "password": "Password123!",
    "role": "instructor"
  },
  "admin": {
    "email": "admin@example.com",
    "password": "Password123!",
    "role": "admin"
  }
}
```

### الحصول على Tokens:

**1. تسجيل الدخول للطالب الأول:**
```bash
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "email": "student1@example.com",
  "password": "Password123!"
}
```

**الرد:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "STUDENT1_ID",
    "name": "الطالب الأول",
    "role": "user"
  }
}
```

احفظ هذه Tokens للاستخدام في الاختبارات:
- `TOKEN_STUDENT1` = token الطالب الأول
- `TOKEN_STUDENT2` = token الطالب الثاني
- `TOKEN_INSTRUCTOR` = token المدرب
- `TOKEN_ADMIN` = token الأدمن

---

## 🎯 سيناريوهات الاختبار

### السيناريو 1️⃣: محادثة بين طالبين

#### الخطوة 1: الطالب 1 ينشئ محادثة مع الطالب 2

```bash
POST http://localhost:8000/api/v1/chat/conversations
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json

{
  "participantId": "STUDENT2_ID"
}
```

**الرد:**
```json
{
  "status": "success",
  "data": {
    "_id": "CONV_ID_1",
    "participants": [
      {
        "_id": "STUDENT1_ID",
        "name": "الطالب الأول",
        "profileImg": "...",
        "chatStatus": "online"
      },
      {
        "_id": "STUDENT2_ID",
        "name": "الطالب الثاني",
        "profileImg": "...",
        "chatStatus": "offline"
      }
    ],
    "type": "direct",
    "createdAt": "2025-12-24T11:00:00Z"
  }
}
```

احفظ `CONV_ID_1` للخطوات التالية

#### الخطوة 2: الطالب 1 يرسل رسالة نصية

```bash
POST http://localhost:8000/api/v1/chat/messages
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json

{
  "conversationId": "CONV_ID_1",
  "content": "السلام عليكم ورحمة الله وبركاته 😊",
  "messageType": "text"
}
```

**الرد:**
```json
{
  "status": "success",
  "message": "Message sent successfully",
  "data": {
    "_id": "MSG_ID_1",
    "conversation": "CONV_ID_1",
    "sender": {
      "_id": "STUDENT1_ID",
      "name": "الطالب الأول",
      "profileImg": "...",
      "role": "user",
      "email": "student1@example.com"
    },
    "content": "السلام عليكم ورحمة الله وبركاته 😊",
    "messageType": "text",
    "attachments": [],
    "isRead": false,
    "readBy": [],
    "isEdited": false,
    "isDeleted": false,
    "createdAt": "2025-12-24T11:05:00Z",
    "updatedAt": "2025-12-24T11:05:00Z"
  }
}
```

#### الخطوة 3: الطالب 1 يرسل رسالة مع إيموجي

```bash
POST http://localhost:8000/api/v1/chat/messages
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json

{
  "conversationId": "CONV_ID_1",
  "content": "كيف حالك؟ 🌟✨ هل تمكنت من حل الواجب؟",
  "messageType": "text"
}
```

#### الخطوة 4: الطالب 2 يرسل رد

```bash
POST http://localhost:8000/api/v1/chat/messages
Authorization: Bearer TOKEN_STUDENT2
Content-Type: application/json

{
  "conversationId": "CONV_ID_1",
  "content": "وعليكم السلام ورحمة الله! 👋 الحمد لله بخير، نعم تمكنت الحمد لله 🎉",
  "messageType": "text"
}
```

#### الخطوة 5: عرض المحادثة

```bash
GET http://localhost:8000/api/v1/chat/conversations/CONV_ID_1/messages?page=1&limit=50
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json
```

**الرد:**
```json
{
  "status": "success",
  "results": 2,
  "total": 2,
  "pagination": {
    "page": 1,
    "limit": 50,
    "pages": 1
  },
  "pinnedMessages": [],
  "data": [
    {
      "_id": "MSG_ID_1",
      "conversation": "CONV_ID_1",
      "sender": {
        "_id": "STUDENT1_ID",
        "name": "الطالب الأول",
        "profileImg": "...",
        "role": "user",
        "email": "student1@example.com"
      },
      "content": "السلام عليكم ورحمة الله وبركاته 😊",
      "messageType": "text",
      "isRead": false,
      "readBy": [],
      "isEdited": false,
      "isDeleted": false,
      "createdAt": "2025-12-24T11:05:00Z"
    },
    {
      "_id": "MSG_ID_2",
      "conversation": "CONV_ID_1",
      "sender": {
        "_id": "STUDENT2_ID",
        "name": "الطالب الثاني",
        "profileImg": "...",
        "role": "user",
        "email": "student2@example.com"
      },
      "content": "وعليكم السلام ورحمة الله! 👋 الحمد لله بخير، نعم تمكنت الحمد لله 🎉",
      "messageType": "text",
      "isRead": false,
      "readBy": [],
      "isEdited": false,
      "isDeleted": false,
      "createdAt": "2025-12-24T11:06:00Z"
    }
  ]
}
```

---

### السيناريو 2️⃣: محادثة بين طالب ومدرب

#### الخطوة 1: الطالب ينشئ محادثة مع المدرب

```bash
POST http://localhost:8000/api/v1/chat/conversations
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json

{
  "participantId": "INSTRUCTOR_ID"
}
```

احفظ `CONV_ID_2`

#### الخطوة 2: الطالب يسأل المدرب

```bash
POST http://localhost:8000/api/v1/chat/messages
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json

{
  "conversationId": "CONV_ID_2",
  "content": "السلام عليكم دكتور، هل يمكنك شرح درس البرمجة الكائنية التوجه؟ لم أفهمها جيداً 😟",
  "messageType": "text"
}
```

#### الخطوة 3: المدرب يرد

```bash
POST http://localhost:8000/api/v1/chat/messages
Authorization: Bearer TOKEN_INSTRUCTOR
Content-Type: application/json

{
  "conversationId": "CONV_ID_2",
  "content": "وعليكم السلام ورحمة الله! بكل سرور 😊\n\nالبرمجة الكائنية التوجه (OOP) تعتمد على 4 أركان أساسية:\n1. التغليف (Encapsulation)\n2. الوراثة (Inheritance)\n3. التعدد الشكلي (Polymorphism)\n4. التجريد (Abstraction)\n\nهل تريد شرح أي منها بالتفصيل؟",
  "messageType": "text"
}
```

---

### السيناريو 3️⃣: رسالة الدعم الإداري

#### الخطوة 1: الطالب يفتح محادثة دعم

```bash
POST http://localhost:8000/api/v1/chat/admin-support
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json

{
  "subject": "مشكلة في الدفع",
  "description": "لم أستقبل الكورس رغم أنني دفعت من أسبوع",
  "priority": "high"
}
```

**الرد:**
```json
{
  "status": "success",
  "message": "تم فتح طلب الدعم",
  "data": {
    "_id": "SUPPORT_CONV_ID",
    "type": "admin_support",
    "participants": [
      {
        "_id": "STUDENT1_ID",
        "name": "الطالب الأول",
        "role": "user"
      }
    ],
    "subject": "مشكلة في الدفع",
    "description": "لم أستقبل الكورس رغم أنني دفعت من أسبوع",
    "priority": "high",
    "supportStatus": "waiting",
    "createdAt": "2025-12-24T11:10:00Z"
  }
}
```

احفظ `SUPPORT_CONV_ID`

#### الخطوة 2: الطالب يرسل رسالة في محادثة الدعم

```bash
POST http://localhost:8000/api/v1/chat/messages
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json

{
  "conversationId": "SUPPORT_CONV_ID",
  "content": "رقم الطلب: 12345\nرقم بطاقتي الآخيرة: 4532\nالمبلغ المدفوع: 299.99 ريال\n\nبرجاء حل المشكلة في أقرب وقت 🙏",
  "messageType": "text"
}
```

#### الخطوة 3: الأدمن يعرض محادثات الدعم

```bash
GET http://localhost:8000/api/v1/chat/admin/support?status=waiting&priority=high
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json
```

#### الخطوة 4: الأدمن يرد على الدعم

```bash
POST http://localhost:8000/api/v1/chat/messages
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json

{
  "conversationId": "SUPPORT_CONV_ID",
  "content": "السلام عليكم ورحمة الله 🙏\n\nشكراً لتواصلك معنا. لقد تحقققنا من الطلب وتبين أن المشكلة تقنية من جانب نظام الدفع.\n\nتم إعادة تفعيل الكورس في حسابك الآن ✅\n\nيمكنك الوصول للكورس من خلال لوحة التحكم.\n\nشكراً لصبرك 🌟",
  "messageType": "text"
}
```

#### الخطوة 5: الأدمن يحدّث حالة الدعم

```bash
PUT http://localhost:8000/api/v1/chat/admin/support/SUPPORT_CONV_ID/status
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json

{
  "status": "resolved",
  "assignedTo": "ADMIN_ID",
  "notes": "تم حل المشكلة - إعادة تفعيل الكورس"
}
```

---

## 📝 اختبار المحادثات

### 1. الحصول على قائمة المحادثات

```bash
GET http://localhost:8000/api/v1/chat/conversations?limit=10&skip=0&search=
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json
```

**الرد:**
```json
{
  "status": "success",
  "results": 2,
  "data": [
    {
      "_id": "CONV_ID_2",
      "participants": [...],
      "type": "direct",
      "lastMessage": {
        "_id": "MSG_ID_3",
        "content": "وعليكم السلام ورحمة الله! بكل سرور...",
        "sender": "INSTRUCTOR_ID",
        "createdAt": "2025-12-24T11:08:00Z"
      },
      "lastMessageAt": "2025-12-24T11:08:00Z",
      "myUnreadCount": 1,
      "createdAt": "2025-12-24T11:07:00Z"
    },
    {
      "_id": "CONV_ID_1",
      "participants": [...],
      "type": "direct",
      "lastMessage": {...},
      "lastMessageAt": "2025-12-24T11:06:00Z",
      "myUnreadCount": 0
    }
  ]
}
```

### 2. البحث عن محادثة

```bash
GET http://localhost:8000/api/v1/chat/conversations?search=دكتور
Authorization: Bearer TOKEN_STUDENT1
```

### 3. تحديد رسائل كمقروءة

```bash
POST http://localhost:8000/api/v1/chat/conversations/CONV_ID_1/read
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json

{
  "messageIds": ["MSG_ID_1", "MSG_ID_2"]
}
```

---

## 💬 اختبار الرسائل

### 1. تعديل رسالة

```bash
PUT http://localhost:8000/api/v1/chat/messages/MSG_ID_1
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json

{
  "text": "السلام عليكم ورحمة الله وبركاته 😊 (معدل)"
}
```

### 2. حذف رسالة

```bash
DELETE http://localhost:8000/api/v1/chat/messages/MSG_ID_1
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json
```

### 3. تثبيت رسالة

```bash
POST http://localhost:8000/api/v1/chat/messages/MSG_ID_3/pin
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json

{
  "pinned": true
}
```

### 4. البحث عن رسائل

```bash
GET http://localhost:8000/api/v1/chat/search?q=برمجة&limit=20
Authorization: Bearer TOKEN_STUDENT1
```

---

## 🆘 اختبار الدعم

### 1. الأدمن يشاهد الإبلاغات

```bash
GET http://localhost:8000/api/v1/chat/admin/reports?status=pending
Authorization: Bearer TOKEN_ADMIN
```

### 2. الأدمن يعالج إبلاغ

```bash
PUT http://localhost:8000/api/v1/chat/admin/reports/REPORT_ID
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json

{
  "status": "reviewed",
  "action": "warn",
  "notes": "تحذير - لا تكرر السلوك المسيء"
}
```

### 3. حجب مستخدم من الشات (الأدمن)

```bash
PUT http://localhost:8000/api/v1/chat/admin/block/PROBLEM_USER_ID
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json

{
  "blocked": true,
  "reason": "انتهاك سياسة المنصة"
}
```

---

## ❌ حالات الخطأ

### 1. محاولة إرسال رسالة فارغة

```bash
POST http://localhost:8000/api/v1/chat/messages
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json

{
  "conversationId": "CONV_ID_1",
  "content": ""
}
```

**الرد:**
```json
{
  "status": "error",
  "message": "Message content cannot be empty"
}
```

### 2. محاولة الرسائل لمستخدم لم يتم حفظ محادثة معه

```bash
POST http://localhost:8000/api/v1/chat/conversations
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json

{
  "participantId": "STUDENT1_ID"
}
```

**الرد:**
```json
{
  "status": "error",
  "message": "Cannot start conversation with yourself"
}
```

### 3. محاولة الوصول لمحادثة ليس طرفاً فيها

```bash
GET http://localhost:8000/api/v1/chat/conversations/SOMEONE_ELSES_CONV/messages
Authorization: Bearer TOKEN_STUDENT1
```

**الرد:**
```json
{
  "status": "error",
  "message": "You are not authorized to view this conversation"
}
```

### 4. رسالة أطول من الحد الأقصى

```bash
POST http://localhost:8000/api/v1/chat/messages
Authorization: Bearer TOKEN_STUDENT1
Content-Type: application/json

{
  "conversationId": "CONV_ID_1",
  "content": "... نص يتجاوز 5000 حرف ..."
}
```

**الرد:**
```json
{
  "status": "error",
  "message": "Message content cannot exceed 5000 characters"
}
```

---

## ✅ نقاط الاختبار الأساسية

### الوظائف الأساسية:
- ✅ إنشاء محادثة بين مستخدمين
- ✅ إرسال رسائل نصية
- ✅ إرسال رسائل بإيموجي
- ✅ عرض الرسائل بشكل صحيح
- ✅ تعديل الرسائل
- ✅ حذف الرسائل
- ✅ تثبيت الرسائل
- ✅ البحث عن الرسائل
- ✅ تحديد الرسائل كمقروءة
- ✅ عرض قائمة المحادثات

### الدعم والحماية:
- ✅ محادثات الدعم الإداري
- ✅ الأدمن يشاهد كل المحادثات
- ✅ الأدمن يرد على الدعم
- ✅ تحديث حالة الدعم
- ✅ حجب المستخدمين
- ✅ الإبلاغ عن المستخدمين

### التحقق من الأخطاء:
- ✅ لا يمكن الرسالة لنفسك
- ✅ رسائل فارغة مرفوضة
- ✅ رسائل طويلة جداً مرفوضة
- ✅ عدم السماح بالوصول لمحادثات الآخرين
- ✅ المستخدمون المحجوبون لا يمكنهم الرسالة

---

## 🔧 ملاحظات تقنية

1. **الوقت الفعلي (Real-time)**: يمكن إضافة Socket.IO للتحديثات الفورية
2. **الإشعارات**: يجب إرسال إشعارات للمستخدم الآخر عند وصول رسالة
3. **التشفير**: يفضل تشفير الرسائل الحساسة
4. **الأرشفة**: يمكن أرشفة المحادثات القديمة
5. **النسخ الاحتياطي**: تأكد من نسخ احتياطية منتظمة

---

**آخر تحديث:** 2025-12-24
