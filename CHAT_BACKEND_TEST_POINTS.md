# 📋 نقاط اختبار Backend الشات 🧪

**النسخة:** 2.0 - نظام الرسائل الفعلي الكامل
**آخر تحديث:** 2025-12-24

> جميع الـ Routes تتطلب **Authentication** (Bearer Token) إلا ما يُذكر خلاف ذلك

## ⚡ تحديثات جديدة

✅ **نظام الرسائل الفعلي الكامل**
- إرسال رسائل حقيقية بين الطلاب والمدربين والطلاب
- دعم الإيموجي والنصوص الطويلة
- تحديث الرسائل تلقائياً في البيانات
- عرض الرسائل بشكل صحيح مع تفاصيل المرسل
- رسائل الدعم الفعلية للـ Admin

✅ **تحسينات الأداء:**
- معالجة الرسائل المقروءة بكفاءة
- Pagination صحيح للرسائل
- تحديث عداد الرسائل غير المقروءة تلقائياً

---

## 1️⃣ **Chat Status** ✅

### `PUT /api/v1/chat/status`
- **الغرض**: تحديث حالة الشات (Online/Offline)
- **المتطلبات**: 
  - Bearer Token (المستخدم)

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "status": "online"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم تحديث الحالة بنجاح",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "status": "online",
    "lastSeen": "2025-12-24T10:30:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "حالة غير صحيحة. استخدم: online أو offline"
}
```

- **النقاط المراد اختبارها**:
  - ✓ تحديث الحالة بنجاح
  - ✓ التحقق من الحالة الجديدة
  - ✓ Validation: قيمة status غير صحيحة
  - ✓ Validation: عدم إرسال status

---

## 2️⃣ **Get Chat Users** 👥

### `GET /api/v1/chat/users`
- **الغرض**: الحصول على قائمة المستخدمين المتاحين للدردشة
- **المتطلبات**: Bearer Token

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
```
GET /api/v1/chat/users?status=online&limit=10&skip=0
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم جلب قائمة المستخدمين",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "status": "online",
      "lastSeen": "2025-12-24T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "فاطمة علي",
      "email": "fatima@example.com",
      "avatar": "https://example.com/avatar2.jpg",
      "status": "offline",
      "lastSeen": "2025-12-23T15:20:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "skip": 0
  }
}
```

- **النقاط المراد اختبارها**:
  - ✓ الحصول على قائمة المستخدمين
  - ✓ التصفية حسب Status
  - ✓ Pagination يعمل بشكل صحيح
  - ✓ عدم إظهار المستخدم الحالي نفسه
  - ✓ عدم إظهار المحجوبين

---

## 3️⃣ **Conversations** 💬

### `GET /api/v1/chat/conversations`
- **الغرض**: الحصول على محادثات المستخدم
- **المتطلبات**: Bearer Token

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
```
GET /api/v1/chat/conversations?limit=10&skip=0&search=أحمد
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم جلب المحادثات",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "participantId": "507f1f77bcf86cd799439012",
      "participantName": "أحمد محمد",
      "participantAvatar": "https://example.com/avatar.jpg",
      "lastMessage": "السلام عليكم ورحمة الله",
      "lastMessageTime": "2025-12-24T10:30:00Z",
      "unreadCount": 3,
      "isActive": true,
      "createdAt": "2025-12-20T08:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 10,
    "skip": 0
  }
}
```

- **النقاط المراد اختبارها**:
  - ✓ الحصول على جميع المحادثات
  - ✓ البحث عن محادثة معينة
  - ✓ Pagination يعمل بشكل صحيح
  - ✓ ترتيب المحادثات (الأحدث أولاً)
  - ✓ إظهار عدد الرسائل غير المقروءة

---

### `POST /api/v1/chat/conversations`
- **الغرض**: إنشاء محادثة جديدة
- **المتطلبات**: Bearer Token

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "participantId": "507f1f77bcf86cd799439012"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "تم إنشاء المحادثة",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "participant1Id": "507f1f77bcf86cd799439011",
    "participant2Id": "507f1f77bcf86cd799439012",
    "participantName": "أحمد محمد",
    "participantAvatar": "https://example.com/avatar.jpg",
    "lastMessage": null,
    "lastMessageTime": "2025-12-24T10:30:00Z",
    "unreadCount": 0,
    "createdAt": "2025-12-24T10:30:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "لا يمكنك فتح محادثة مع نفسك"
}
```

- **النقاط المراد اختبارها**:
  - ✓ إنشاء محادثة جديدة بنجاح
  - ✓ عدم السماح بمحادثة مع نفسك
  - ✓ عدم السماح بمحادثة مع مستخدم محجوب
  - ✓ إعادة المحادثة الموجودة إذا كانت قائمة
  - ✓ Validation: participantId مفقود
  - ✓ Validation: participantId غير موجود

---

### `GET /api/v1/chat/conversations/:conversationId/messages`
- **الغرض**: الحصول على رسائل محادثة معينة
- **المتطلبات**: Bearer Token

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
```
GET /api/v1/chat/conversations/507f1f77bcf86cd799439020/messages?limit=20&skip=0
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم جلب الرسائل",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "conversationId": "507f1f77bcf86cd799439020",
      "senderId": "507f1f77bcf86cd799439011",
      "senderName": "أنت",
      "text": "السلام عليكم ورحمة الله",
      "attachments": [],
      "isPinned": false,
      "isRead": true,
      "createdAt": "2025-12-24T10:30:00Z",
      "updatedAt": "2025-12-24T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "skip": 0
  }
}
```

- **النقاط المراد اختبارها**:
  - ✓ الحصول على جميع الرسائل
  - ✓ Pagination يعمل بشكل صحيح
  - ✓ ترتيب الرسائل (الأقدم أولاً أو الأحدث أولاً)
  - ✓ عدم القدرة على رؤية محادثة لا تنتمي للمستخدم
  - ✓ Validation: conversationId غير صحيح

---

### `POST /api/v1/chat/conversations/:conversationId/read`
- **الغرض**: تحديد الرسائل كمقروءة
- **المتطلبات**: Bearer Token

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Request Body:** (اختياري)
```json
{
  "messageIds": ["507f1f77bcf86cd799439030", "507f1f77bcf86cd799439031"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم تحديد الرسائل كمقروءة",
  "data": {
    "conversationId": "507f1f77bcf86cd799439020",
    "markedAsReadCount": 3,
    "unreadCount": 0
  }
}
```

- **النقاط المراد اختبارها**:
  - ✓ تحديد الرسائل كمقروءة
  - ✓ تحديث عدد الرسائل غير المقروءة
  - ✓ عدم القدرة على تحديد محادثة لا تنتمي للمستخدم

---

## 4️⃣ **Admin Support** 🆘

### `POST /api/v1/chat/admin-support`
- **الغرض**: فتح محادثة دعم مع الإدارة
- **المتطلبات**: Bearer Token

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "subject": "مشكلة في الدفع",
  "description": "لم أستقبل الكورس رغم الدفع",
  "priority": "high"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "تم فتح طلب الدعم",
  "data": {
    "_id": "507f1f77bcf86cd799439050",
    "userId": "507f1f77bcf86cd799439011",
    "userName": "أحمد محمد",
    "userEmail": "ahmed@example.com",
    "subject": "مشكلة في الدفع",
    "description": "لم أستقبل الكورس رغم الدفع",
    "status": "waiting",
    "priority": "high",
    "createdAt": "2025-12-24T10:30:00Z"
  }
}
```

- **النقاط المراد اختبارها**:
  - ✓ إنشاء محادثة دعم جديدة
  - ✓ إعادة محادثة الدعم الموجودة
  - ✓ تحديد حالة المحادثة كـ "Waiting"
  - ✓ إخطار الإدارة بالمحادثة الجديدة

---

## 5️⃣ **Messages** 💌

### `POST /api/v1/chat/messages`
- **الغرض**: إرسال رسالة جديدة
- **المتطلبات**: Bearer Token

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "conversationId": "507f1f77bcf86cd799439020",
  "text": "السلام عليكم، كيف حالك؟",
  "attachments": [
    "https://example.com/file.pdf",
    "https://example.com/image.jpg"
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "تم إرسال الرسالة",
  "data": {
    "_id": "507f1f77bcf86cd799439060",
    "conversationId": "507f1f77bcf86cd799439020",
    "senderId": "507f1f77bcf86cd799439011",
    "senderName": "أحمد محمد",
    "text": "السلام عليكم، كيف حالك؟",
    "attachments": [
      "https://example.com/file.pdf",
      "https://example.com/image.jpg"
    ],
    "isPinned": false,
    "isRead": false,
    "createdAt": "2025-12-24T10:30:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "النص مفقود أو فارغ"
}
```

- **النقاط المراد اختبارها**:
  - ✓ إرسال رسالة نصية
  - ✓ إرسال رسالة مع مرفقات
  - ✓ Validation: text مفقود
  - ✓ Validation: text فارغ
  - ✓ Validation: conversationId مفقود
  - ✓ عدم السماح بالرسائل الطويلة جداً (limit)
  - ✓ تحديث وقت آخر رسالة في المحادثة
  - ✓ إخطار الطرف الآخر بالرسالة الجديدة (Notification)

---

### `PUT /api/v1/chat/messages/:messageId`
- **الغرض**: تعديل رسالة موجودة
- **المتطلبات**: Bearer Token (المرسل الأصلي فقط)

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "text": "السلام عليكم، كيف حالك؟ (معدل)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم تعديل الرسالة",
  "data": {
    "_id": "507f1f77bcf86cd799439060",
    "conversationId": "507f1f77bcf86cd799439020",
    "senderId": "507f1f77bcf86cd799439011",
    "text": "السلام عليكم، كيف حالك؟ (معدل)",
    "isPinned": false,
    "isEdited": true,
    "createdAt": "2025-12-24T10:30:00Z",
    "updatedAt": "2025-12-24T10:35:00Z"
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "لا يمكنك تعديل رسالة لم تُرسلها"
}
```

- **النقاط المراد اختبارها**:
  - ✓ تعديل الرسالة بنجاح
  - ✓ عدم السماح بتعديل رسالة لم تُرسلها
  - ✓ عدم السماح بتعديل الرسائل القديمة جداً (15 دقيقة مثلاً)
  - ✓ Validation: text مفقود أو فارغ
  - ✓ تحديث `updatedAt` في الرسالة

---

### `DELETE /api/v1/chat/messages/:messageId`
- **الغرض**: حذف رسالة
- **المتطلبات**: Bearer Token (المرسل الأصلي فقط)

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم حذف الرسالة",
  "data": {
    "_id": "507f1f77bcf86cd799439060",
    "isDeleted": true,
    "deletedAt": "2025-12-24T10:40:00Z"
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "لا يمكنك حذف رسالة لم تُرسلها"
}
```

- **النقاط المراد اختبارها**:
  - ✓ حذف الرسالة بنجاح
  - ✓ عدم السماح بحذف رسالة لم تُرسلها
  - ✓ عدم السماح بحذف الرسائل القديمة جداً
  - ✓ التحقق من عدم ظهور الرسالة المحذوفة

---

### `POST /api/v1/chat/messages/:messageId/pin`
- **الغرض**: تثبيت أو فك تثبيت رسالة
- **المتطلبات**: Bearer Token

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Request Body:** (اختياري)
```json
{
  "pinned": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم تثبيت الرسالة",
  "data": {
    "_id": "507f1f77bcf86cd799439060",
    "conversationId": "507f1f77bcf86cd799439020",
    "text": "السلام عليكم، كيف حالك؟",
    "isPinned": true,
    "pinnedBy": "507f1f77bcf86cd799439011",
    "pinnedAt": "2025-12-24T10:45:00Z"
  }
}
```

- **النقاط المراد اختبارها**:
  - ✓ تثبيت الرسالة
  - ✓ فك تثبيت الرسالة
  - ✓ عرض الرسائل المثبتة في أعلى المحادثة
  - ✓ عدم السماح بتثبيت أكثر من عدد معين (5 مثلاً)

---

## 6️⃣ **Search Messages** 🔍

### `GET /api/v1/chat/search`
- **الغرض**: البحث عن رسائل
- **المتطلبات**: Bearer Token

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
```
GET /api/v1/chat/search?q=كورس&conversationId=507f1f77bcf86cd799439020&limit=10&skip=0
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "نتائج البحث",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439060",
      "conversationId": "507f1f77bcf86cd799439020",
      "participantName": "أحمد محمد",
      "senderId": "507f1f77bcf86cd799439011",
      "text": "ما رأيك في كورس البرمجة الجديد؟",
      "context": "...في كورس البرمجة...",
      "createdAt": "2025-12-24T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 10,
    "skip": 0
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "نص البحث مفقود"
}
```

- **النقاط المراد اختبارها**:
  - ✓ البحث عن كلمات مفتاحية
  - ✓ البحث حسّاس/غير حسّاس للأحرف (case insensitive)
  - ✓ البحث في محادثة معينة
  - ✓ البحث في جميع محادثات المستخدم
  - ✓ Validation: `q` مفقود
  - ✓ Pagination يعمل بشكل صحيح
  - ✓ إظهار السياق (context) مع النتائج

---

## 7️⃣ **Blocking Users** 🚫

### `GET /api/v1/chat/blocked`
- **الغرض**: الحصول على قائمة المستخدمين المحجوبين
- **المتطلبات**: Bearer Token

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
```
GET /api/v1/chat/blocked?limit=10&skip=0
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "قائمة المستخدمين المحجوبين",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "علي محمود",
      "email": "ali@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "blockedAt": "2025-12-20T08:00:00Z",
      "reason": "إزعاج متكرر"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 10,
    "skip": 0
  }
}
```

- **النقاط المراد اختبارها**:
  - ✓ الحصول على قائمة المحجوبين
  - ✓ Pagination يعمل بشكل صحيح
  - ✓ عرض معلومات المستخدم المحجوب

---

### `POST /api/v1/chat/block/:userId`
- **الغرض**: حجب مستخدم
- **المتطلبات**: Bearer Token

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Request Body:** (اختياري)
```json
{
  "reason": "إزعاج متكرر"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "تم حجب المستخدم",
  "data": {
    "_id": "507f1f77bcf86cd799439070",
    "blockedUserId": "507f1f77bcf86cd799439012",
    "blockedByUserId": "507f1f77bcf86cd799439011",
    "reason": "إزعاج متكرر",
    "blockedAt": "2025-12-24T10:50:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "لا يمكنك حجب نفسك"
}
```

- **النقاط المراد اختبارها**:
  - ✓ حجب المستخدم بنجاح
  - ✓ عدم السماح بحجب نفسك
  - ✓ عدم السماح بحجب نفس المستخدم مرتين
  - ✓ حذف جميع الرسائل من المستخدم المحجوب
  - ✓ منع المستخدم المحجوب من الرسائل
  - ✓ Validation: userId غير موجود

---

### `DELETE /api/v1/chat/block/:userId`
- **الغرض**: فك حجب مستخدم
- **المتطلبات**: Bearer Token

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم فك حجب المستخدم",
  "data": {
    "_id": "507f1f77bcf86cd799439070",
    "blockedUserId": "507f1f77bcf86cd799439012",
    "unblockAt": "2025-12-24T10:55:00Z"
  }
}
```

- **النقاط المراد اختبارها**:
  - ✓ فك حجب المستخدم
  - ✓ Validation: المستخدم غير محجوب أصلاً
  - ✓ السماح بالرسائل من المستخدم السابق

---

## 8️⃣ **Report User** 🚩

### `POST /api/v1/chat/report`
- **الغرض**: الإبلاغ عن مستخدم
- **المتطلبات**: Bearer Token

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "reason": "harassment",
  "description": "يتحرش بي باستمرار ويرسل رسائل مسيئة",
  "messageIds": ["507f1f77bcf86cd799439060", "507f1f77bcf86cd799439061"]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "تم الإبلاغ بنجاح",
  "data": {
    "_id": "507f1f77bcf86cd799439080",
    "reportedUserId": "507f1f77bcf86cd799439012",
    "reportedByUserId": "507f1f77bcf86cd799439011",
    "reason": "harassment",
    "description": "يتحرش بي باستمرار ويرسل رسائل مسيئة",
    "messageIds": ["507f1f77bcf86cd799439060", "507f1f77bcf86cd799439061"],
    "status": "pending",
    "createdAt": "2025-12-24T11:00:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "لا يمكنك الإبلاغ عن نفسك"
}
```

- **النقاط المراد اختبارها**:
  - ✓ الإبلاغ عن مستخدم بنجاح
  - ✓ Validation: reason من القيم المسموحة
  - ✓ Validation: description مفقود عند reason = "other"
  - ✓ عدم السماح بالإبلاغ عن نفسك
  - ✓ عدم السماح بالإبلاغ مرتين عن نفس المستخدم
  - ✓ تخزين الرسائل المرتبطة بالإبلاغ

---

## 9️⃣ **Admin Routes** 👮

### `GET /api/v1/chat/admin/conversations`
- **الغرض**: الحصول على جميع المحادثات (Admin فقط)
- **المتطلبات**: Bearer Token + Admin Role

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
```
GET /api/v1/chat/admin/conversations?limit=20&skip=0&status=active
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "جميع المحادثات",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "participant1": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "أحمد محمد",
        "email": "ahmed@example.com"
      },
      "participant2": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "فاطمة علي",
        "email": "fatima@example.com"
      },
      "lastMessage": "السلام عليكم",
      "status": "active",
      "messagesCount": 25,
      "createdAt": "2025-12-20T08:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "skip": 0
  }
}
```

- **النقاط المراد اختبارها**:
  - ✓ الوصول متاح للـ Admin فقط
  - ✓ منع المستخدمين العاديين
  - ✓ عرض جميع المحادثات
  - ✓ تصفية حسب الحالة (Active, Closed, etc.)

---

### `GET /api/v1/chat/admin/support`
- **الغرض**: الحصول على محادثات الدعم (Admin فقط)
- **المتطلبات**: Bearer Token + Admin Role

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
```
GET /api/v1/chat/admin/support?status=waiting&priority=high
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "محادثات الدعم",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "userId": "507f1f77bcf86cd799439011",
      "userName": "أحمد محمد",
      "userEmail": "ahmed@example.com",
      "subject": "مشكلة في الدفع",
      "description": "لم أستقبل الكورس",
      "status": "waiting",
      "priority": "high",
      "assignedTo": null,
      "messagesCount": 2,
      "createdAt": "2025-12-24T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 20,
    "skip": 0
  }
}
```

- **النقاط المراد اختبارها**:
  - ✓ الوصول متاح للـ Admin فقط
  - ✓ عرض محادثات الدعم فقط
  - ✓ تصفية حسب الحالة والأولوية
  - ✓ ترتيب حسب الأولوية والوقت

---

### `GET /api/v1/chat/admin/reports`
- **الغرض**: الحصول على الإبلاغات (Admin فقط)
- **المتطلبات**: Bearer Token + Admin Role

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Query Parameters:**
```
GET /api/v1/chat/admin/reports?status=pending&reason=harassment
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "الإبلاغات",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439080",
      "reportedUser": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "علي محمود",
        "email": "ali@example.com"
      },
      "reportedByUser": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "أحمد محمد"
      },
      "reason": "harassment",
      "description": "يتحرش باستمرار",
      "status": "pending",
      "messageIds": ["507f1f77bcf86cd799439060"],
      "createdAt": "2025-12-24T11:00:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "limit": 20,
    "skip": 0
  }
}
```

- **النقاط المراد اختبارها**:
  - ✓ الوصول متاح للـ Admin فقط
  - ✓ عرض جميع الإبلاغات
  - ✓ تصفية حسب الحالة والنوع
  - ✓ ترتيب حسب التاريخ (الأحدث أولاً)

---

### `PUT /api/v1/chat/admin/reports/:reportId`
- **الغرض**: التعامل مع الإبلاغ (Admin فقط)
- **المتطلبات**: Bearer Token + Admin Role

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "status": "reviewed",
  "action": "suspend",
  "notes": "المستخدم يتحرش بشكل متكرر - تم إيقاف الحساب لمدة 7 أيام"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم معالجة الإبلاغ",
  "data": {
    "_id": "507f1f77bcf86cd799439080",
    "reportedUserId": "507f1f77bcf86cd799439012",
    "status": "reviewed",
    "action": "suspend",
    "notes": "المستخدم يتحرش بشكل متكرر",
    "handledBy": "507f1f77bcf86cd799439000",
    "handledAt": "2025-12-24T11:10:00Z"
  }
}
```

- **النقاط المراد اختبارها**:
  - ✓ تحديث حالة الإبلاغ
  - ✓ تطبيق الإجراء (Warn, Suspend, Ban)
  - ✓ Validation: الإجراء صحيح
  - ✓ إخطار المستخدم المُبلّغ عنه

---

### `PUT /api/v1/chat/admin/support/:conversationId/status`
- **الغرض**: تحديث حالة محادثة الدعم (Admin فقط)
- **المتطلبات**: Bearer Token + Admin Role

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "status": "in-progress",
  "assignedTo": "507f1f77bcf86cd799439000",
  "notes": "جاري البحث عن سبب عدم استقبال الكورس"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم تحديث حالة الدعم",
  "data": {
    "_id": "507f1f77bcf86cd799439050",
    "userId": "507f1f77bcf86cd799439011",
    "status": "in-progress",
    "assignedTo": "507f1f77bcf86cd799439000",
    "assignedToName": "محمد أحمد",
    "notes": "جاري البحث",
    "updatedAt": "2025-12-24T11:15:00Z"
  }
}
```

- **النقاط المراد اختبارها**:
  - ✓ تحديث الحالة
  - ✓ إسناد المحادثة لـ Admin معين
  - ✓ Validation: الحالة صحيحة
  - ✓ إخطار المستخدم بتحديث الحالة

---

### `PUT /api/v1/chat/admin/block/:userId`
- **الغرض**: حجب مستخدم من الشات (Admin فقط)
- **المتطلبات**: Bearer Token + Admin Role

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "blocked": true,
  "reason": "انتهاك سياسة الاستخدام"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم حجب المستخدم من الشات",
  "data": {
    "_id": "507f1f77bcf86cd799439090",
    "userId": "507f1f77bcf86cd799439012",
    "userName": "علي محمود",
    "blocked": true,
    "reason": "انتهاك سياسة الاستخدام",
    "blockedBy": "507f1f77bcf86cd799439000",
    "blockedAt": "2025-12-24T11:20:00Z"
  }
}
```

- **النقاط المراد اختبارها**:
  - ✓ حجب المستخدم من الشات
  - ✓ فك حجب المستخدم
  - ✓ منع المستخدم المحجوب من الوصول للشات
  - ✓ إخطار المستخدم بالحجب والسبب

---

## 🔟 **Edge Cases & Security** 🔐

### Authentication & Authorization
- ✓ جميع الـ Routes (ما عدا المحددة) تتطلب Token صحيح
- ✓ Token منتهي الصلاحية يرجع 401
- ✓ Token غير صحيح يرجع 401
- ✓ عدم وجود Token يرجع 401

### Data Validation
- ✓ جميع IDs يجب أن تكون صحيحة (ObjectId)
- ✓ جميع الحقول الإجبارية يجب أن تكون موجودة
- ✓ عدم السماح بـ Null أو Undefined في الحقول الحساسة
- ✓ Sanitization: منع XSS و SQL Injection

### Rate Limiting
- ✓ عدم السماح بإرسال رسائل كثيرة في وقت قصير
- ✓ عدم السماح بإنشاء محادثات متعددة مع نفس المستخدم

### Real-time & Notifications
- ✓ تحديثات الرسائل تظهر فوراً
- ✓ التنبيهات تُرسل للطرف الآخر
- ✓ الحالة Online/Offline تُحدّث فوراً
- ✓ إشعارات الرسائل غير المقروءة صحيحة

### Performance
- ✓ الـ Pagination يعمل بشكل صحيح
- ✓ الاستعلامات الكبيرة تُحسّن (Indexing)
- ✓ وقت الاستجابة معقول (< 500ms)

---

## 📊 **Summary Table**

| الميزة | POST | GET | PUT | DELETE |
|--------|------|-----|-----|--------|
| Chat Status | - | - | ✓ | - |
| Users | - | ✓ | - | - |
| Conversations | ✓ | ✓ | - | - |
| Messages | ✓ | - | ✓ | ✓ |
| Pin Messages | ✓ | - | - | - |
| Search | - | ✓ | - | - |
| Blocking | ✓ | ✓ | - | ✓ |
| Reporting | ✓ | - | - | - |
| Admin | ✓ | ✓ | ✓ | - |

---

## 🛠️ **Tools for Testing**

- **Postman**: لاختبار الـ APIs يدويًا
- **Jest + Supertest**: لـ Unit & Integration Tests
- **MongoDB**: للتحقق من البيانات
- **Socket.io Tester**: لاختبار Real-time Features
- **Load Testing**: Apache JMeter أو Autocannon

---

## 📝 **Notes**

- تأكد من استخدام Bearer Token صحيح في جميع الطلبات
- استخدم Test Database منفصل
- تحقق من Logs للأخطاء المحتملة
- اختبر مع عدة متصفحات/أجهزة
- تحقق من عمل الإشعارات في الوقت الفعلي
