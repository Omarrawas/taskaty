# Taskaty - سوق الخدمات الرقمية

<div align="center">

![Taskaty](https://taskaty.app/og-image.png)

**منصة الخدمات الرقمية الأولى في سوريا**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## ملخص المشروع

Taskaty هو سوق رقمي يربط بين المشترين والبائعين لتقديم الخدمات الرقمية. مستوحى من منصات مثل Fiverr وخمسات، مع دعم كامل للغة العربية ونظام RTL.

### الميزات الرئيسية

- ✅ **نظام المصادقة**: Firebase Auth (إيميل + Google)
- ✅ **عرض الخدمات**: شبكة + قائمة + فلاتر + بحث
- ✅ **نظام الطلبات**: طلب → تسليم → تعديل → قبول
- ✅ **نظام الدفع**: محفظة + إيداع + سحب + Escrow
- ✅ **المحادثات**: محادثة فورية عبر Firestore
- ✅ **لوحة التحكم**: للمشترين والبائعين
- ✅ **لوحة الإدارة**: إدارة شاملة للمستخدمين والخدمات
- ✅ **نظام الإشعارات**: إشعارات داخل التطبيق
- ✅ **نظام المفضلة**: حفظ الخدمات المفضلة
- ✅ **نظام الدعوات**: مكافآت لدعوة الأصدقاء
- ✅ **نظام الباقات**: باقات أسعار مقارنة
- ✅ **البحث المحسّن**: اقتراحات + تاريخ + فلاتر متقدمة

---

## التقنيات المستخدمة

### Frontend
- **React 19** - مكتبة الواجهات
- **TypeScript 5.3** - نظام الأنواع
- **Vite 7** - أداة البناء
- **Tailwind CSS 3** - تنسيقات
- **shadcn/ui** - مكتبة المكونات
- **tRPC** - API client
- **React Router v7** - التوجيه
- **React Query** - إدارة الحالة

### Backend
- **Hono** - خادم HTTP
- **tRPC** - API layer
- **Firebase Admin** - المصادقة
- **Firestore** - قاعدة البيانات

### الخدمات
- **Firebase Auth** - المصادقة
- **Firestore** - قاعدة البيانات
- **Vercel** - الاستضافة

---

## البدء السريع

### المتطلبات
- Node.js 18+
- npm أو yarn
- حساب Firebase

### التثبيت

```bash
# استنساخ المشروع
git clone https://github.com/yourusername/taskaty.git
cd taskaty

# تثبيت التبعيات
npm install

# نسخ ملف البيئة
cp .env.example .env

# تعديل متغيرات البيئة
# أضف مفاتيح Firebase الخاصة بك
```

### إعداد Firebase

1. أنشئ مشروع جديد في [Firebase Console](https://console.firebase.google.com/)
2. فعّل Authentication وحدد طرق الدخول (Email/Password, Google)
3. أنشئ Firestore Database
4. أضف Web App واحصل على التكوين
5. أنشئ Service Account واحصل على Private Key

### تشغيل التطوير

```bash
npm run dev
```

سيبدأ التطبيق على `http://localhost:5173`

### البناء للإنتاج

```bash
npm run build
```

### النشر على Vercel

```bash
npm i -g vercel
vercel
```

---

## هيكل المشروع

```
taskaty/
├── src/                    # Frontend (React)
│   ├── components/         # المكونات
│   │   ├── ui/            # مكونات shadcn/ui
│   │   ├── layout/        # التخطيط (Header, Footer)
│   │   ├── cards/         # بطاقات الخدمات والبائعين
│   │   └── chat/          # مكونات المحادثة
│   ├── pages/             # الصفحات
│   ├── sections/          # أقسام الصفحة الرئيسية
│   ├── hooks/             # خطافات مخصصة
│   ├── providers/         # مزودي السياق
│   └── lib/               # أدوات مساعدة
├── api/                    # Backend (tRPC + Hono)
│   ├── routes/            # API routes
│   ├── queries/           # استعلامات قاعدة البيانات
│   └── lib/               # مكتبات الخادم
├── db/                     # قاعدة البيانات
│   └── schema.ts          # تعريف الجداول
└── contracts/              # العقود المشتركة
```

---

## أوامر مفيدة

```bash
# تشغيل التطوير
npm run dev

# البناء
npm run build

# المعاينة
npm run preview

# فحص الأكواد
npm run lint

# اختبارات
npm run test
```

---

## بيئة التطوير

### ملف .env المطلوب

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Firebase Admin (Server)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Database
DATABASE_URL=

# App
OWNER_UNION_ID=
```

---

## كيفية العمل

### للمشترين
1. تصفح الخدمات أو استخدم البحث
2. اختر الخدمة والباقة المناسبة
3. ادفع عبر المحفظة (يتم الحفظ في نظام الضمان)
4. تواصل مع البائع
5. استلم العمل وقم بالمراجعة
6. قبول أو طلب تعديل

### للبائعين
1. سجّل حساباً كبائع
2. أضف خدماتك مع وصف تفصيلي
3. تلقّى طلبات من المشتريين
4. نفّذ العمل وسلّمه
5. احصل على أرباحك

---

## الترخيص

هذا المشروع مرخص بموجب [MIT License](LICENSE).

---

## الدعم

- البريد الإلكتروني: support@taskaty.app
- الصفحة: [تواصل معنا](https://taskaty.app/contact)

---

## المساهمة

نرحب بالمساهمات! يرجى قراءة [دليل المساهمة](CONTRIBUTING.md) أولاً.

---

<div align="center">

**صنع بـ ❤️ في سوريا**

</div>
