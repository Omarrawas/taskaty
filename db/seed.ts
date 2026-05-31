import admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

const COLLECTIONS = {
  USERS: "users",
  SERVICES: "services",
  ORDERS: "orders",
  WALLETS: "wallets",
  CATEGORIES: "categories",
  PAYMENT_PROOFS: "payment_proofs",
  WITHDRAWAL_REQUESTS: "withdrawal_requests",
  CONVERSATIONS: "conversations",
  REVIEWS: "reviews",
  NOTIFICATIONS: "notifications",
};

async function seed() {
  console.log("🌱 Starting seed...");

  // 1. Create Categories
  const categories = [
    { nameAr: "تصميم", slug: "design", icon: "palette", sortOrder: 1, isActive: true, serviceCount: 15 },
    { nameAr: "برمجة", slug: "programming", icon: "code", sortOrder: 2, isActive: true, serviceCount: 22 },
    { nameAr: "ترجمة", slug: "translation", icon: "languages", sortOrder: 3, isActive: true, serviceCount: 8 },
    { nameAr: "تسويق رقمي", slug: "marketing", icon: "megaphone", sortOrder: 4, isActive: true, serviceCount: 12 },
    { nameAr: "كتابة محتوى", slug: "content-writing", icon: "pen-tool", sortOrder: 5, isActive: true, serviceCount: 10 },
    { nameAr: "فيديو وصوت", slug: "video", icon: "video", sortOrder: 6, isActive: true, serviceCount: 7 },
    { nameAr: "تصميم جرافيك", slug: "graphic-design", icon: "image", sortOrder: 7, isActive: true, serviceCount: 18 },
    { nameAr: "تطوير ويب", slug: "web-dev", icon: "globe", sortOrder: 8, isActive: true, serviceCount: 20 },
  ];

  for (const cat of categories) {
    await db.collection(COLLECTIONS.CATEGORIES).doc(cat.slug).set(cat);
  }
  console.log(`✅ Created ${categories.length} categories`);

  // 2. Create Users (buyers + sellers)
  const users = [
    { unionId: "admin-user-001", name: "مدير المنصة", email: "admin@taskaty.app", role: "admin", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin" },
    { unionId: "seller-001", name: "أحمد محمد", email: "ahmed@example.com", role: "seller", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed" },
    { unionId: "seller-002", name: "فاطمة علي", email: "fatima@example.com", role: "seller", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fatima" },
    { unionId: "seller-003", name: "عمر حسن", email: "omar@example.com", role: "seller", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=omar" },
    { unionId: "seller-004", name: "سارة خالد", email: "sara@example.com", role: "seller", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sara" },
    { unionId: "seller-005", name: "محمد العلي", email: "mohammed@example.com", role: "seller", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mohammed" },
    { unionId: "buyer-001", name: "خالد إبراهيم", email: "khaled@example.com", role: "buyer", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=khaled" },
    { unionId: "buyer-002", name: "نور الدين", email: "nour@example.com", role: "buyer", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nour" },
    { unionId: "buyer-003", name: "ريم شريف", email: "reem@example.com", role: "buyer", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=reem" },
    { unionId: "buyer-004", name: "يوسف أحمد", email: "yousef@example.com", role: "buyer", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=yousef" },
  ];

  for (const user of users) {
    await db.collection(COLLECTIONS.USERS).doc(user.unionId).set({
      ...user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  console.log(`✅ Created ${users.length} users`);

  // 3. Create Services
  const services = [
    { sellerId: "seller-001", sellerName: "أحمد محمد", title: "سأصمم شعار احترافي لشركتك", slug: "logo-design-1", description: "تصميم شعار احترافي وعصري يناسب هوية شركتك. يتضمن 3 تصاميم مختلفة مع تعديلات غير محدودة.", price: "15000", deliveryTime: 3, categoryId: "design", categorySlug: "design", categoryName: "تصميم", images: ["https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800"], rating: "4.9", totalReviews: 47, totalOrders: 120, status: "active", featured: true, extras: [{ name: "ملف مصدري", price: 5000 }, { name: "بطاقات أعمال", price: 8000 }] },
    { sellerId: "seller-002", sellerName: "فاطمة علي", title: "سأكتب لك مقالات SEO احترافية", slug: "seo-articles-1", description: "كتابة مقالات محسّنة لمحركات البحث بمحتوى أصلي وجذاب. كل مقال 1000-2000 كلمة.", price: "8000", deliveryTime: 2, categoryId: "content-writing", categorySlug: "content-writing", categoryName: "كتابة محتوى", images: ["https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800"], rating: "4.8", totalReviews: 32, totalOrders: 85, status: "active", featured: true, extras: [{ name: "صورة مخصصة", price: 3000 }] },
    { sellerId: "seller-003", sellerName: "عمر حسن", title: "سأطور لك موقع ويب متجاوب", slug: "responsive-website-1", description: "تطوير موقع ويب احترافي ومتجاوب بأحدث التقنيات. يشمل التصميم والبرمجة والاستضافة.", price: "50000", deliveryTime: 7, categoryId: "programming", categorySlug: "web-dev", categoryName: "تطوير ويب", images: ["https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800"], rating: "4.7", totalReviews: 28, totalOrders: 45, status: "active", featured: true, extras: [{ name: "لوحة تحكم", price: 25000 }, { name: "متجر إلكتروني", price: 40000 }] },
    { sellerId: "seller-004", sellerName: "سارة خالد", title: "سأترجم لك مستنداتك بجودة عالية", slug: "translation-1", description: "ترجمة احترافية من وإلى الإنجليزية. ترجمة طبية، قانونية، فنية، وأكثر.", price: "5000", deliveryTime: 1, categoryId: "translation", categorySlug: "translation", categoryName: "ترجمة", images: ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800"], rating: "5.0", totalReviews: 56, totalOrders: 200, status: "active", featured: false, extras: [{ name: "ترجمة عاجلة", price: 3000 }] },
    { sellerId: "seller-005", sellerName: "محمد العلي", title: "سأدير حملاتك الإعلانية على فيسبوك", slug: "facebook-ads-1", description: "إدارة حملات إعلانية احترافية على فيسبوك وإنستغرام. يتضمن التحليل والتقارير.", price: "20000", deliveryTime: 5, categoryId: "marketing", categorySlug: "marketing", categoryName: "تسويق رقمي", images: ["https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800"], rating: "4.6", totalReviews: 19, totalOrders: 35, status: "active", featured: false, extras: [{ name: "تصميم الإعلانات", price: 10000 }] },
    { sellerId: "seller-001", sellerName: "أحمد محمد", title: "سأصمم هوية بصرية كاملة لعلامتك", slug: "brand-identity-1", description: "تصميم هوية بصرية شاملة تشمل الشعار والألوان والخطوط ودليل الاستخدام.", price: "35000", deliveryTime: 10, categoryId: "design", categorySlug: "graphic-design", categoryName: "تصميم جرافيك", images: ["https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800"], rating: "4.9", totalReviews: 38, totalOrders: 62, status: "active", featured: true, extras: [{ name: "دليل العلامة التجارية", price: 15000 }, { name: "قوالب سوشيال ميديا", price: 12000 }] },
    { sellerId: "seller-002", sellerName: "فاطمة علي", title: "سأكتب لك نص إعلاني يجذب العملاء", slug: "copywriting-1", description: "كتابة نصوص إعلانية مقنعة تزيد من التحويلات والمبيعات. للإعلانات والمواقع والرسائل الإخبارية.", price: "7000", deliveryTime: 2, categoryId: "content-writing", categorySlug: "content-writing", categoryName: "كتابة محتوى", images: ["https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800"], rating: "4.7", totalReviews: 24, totalOrders: 58, status: "active", featured: false, extras: [{ name: "نسخ متعدد", price: 4000 }] },
    { sellerId: "seller-003", sellerName: "عمر حسن", title: "سأبني لك تطبيق موبايل احترافي", slug: "mobile-app-1", description: "تطوير تطبيق موبايل لنظامي iOS وAndroid باستخدام أحدث التقنيات.", price: "80000", deliveryTime: 14, categoryId: "programming", categorySlug: "programming", categoryName: "برمجة", images: ["https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800"], rating: "4.8", totalReviews: 15, totalOrders: 22, status: "active", featured: true, extras: [{ name: "لوحة تحكم للتطبيق", price: 30000 }, { name: "نظام إشعارات", price: 15000 }] },
  ];

  for (const service of services) {
    const docRef = db.collection(COLLECTIONS.SERVICES).doc();
    await docRef.set({
      ...service,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  console.log(`✅ Created ${services.length} services`);

  // 4. Create Wallets
  const wallets = [
    { userId: "admin-user-001", balance: "50000" },
    { userId: "seller-001", balance: "125000" },
    { userId: "seller-002", balance: "85000" },
    { userId: "seller-003", balance: "200000" },
    { userId: "seller-004", balance: "95000" },
    { userId: "seller-005", balance: "45000" },
    { userId: "buyer-001", balance: "30000" },
    { userId: "buyer-002", balance: "15000" },
    { userId: "buyer-003", balance: "22000" },
    { userId: "buyer-004", balance: "8000" },
  ];

  for (const wallet of wallets) {
    await db.collection(COLLECTIONS.WALLETS).doc(wallet.userId).set({
      ...wallet,
      createdAt: new Date().toISOString(),
    });
  }
  console.log(`✅ Created ${wallets.length} wallets`);

  // 5. Create Orders
  const orders = [
    { buyerId: "buyer-001", buyerName: "خالد إبراهيم", sellerId: "seller-001", sellerName: "أحمد محمد", serviceId: "svc-001", serviceTitle: "سأصمم شعار احترافي لشركتك", serviceSlug: "logo-design-1", totalAmount: "15000", status: "completed", orderNumber: "ORD-2025-001" },
    { buyerId: "buyer-002", buyerName: "نور الدين", sellerId: "seller-002", sellerName: "فاطمة علي", serviceId: "svc-002", serviceTitle: "سأكتب لك مقالات SEO احترافية", serviceSlug: "seo-articles-1", totalAmount: "8000", status: "completed", orderNumber: "ORD-2025-002" },
    { buyerId: "buyer-003", buyerName: "ريم شريف", sellerId: "seller-003", sellerName: "عمر حسن", serviceId: "svc-003", serviceTitle: "سأطور لك موقع ويب متجاوب", serviceSlug: "responsive-website-1", totalAmount: "50000", status: "in_progress", orderNumber: "ORD-2025-003" },
    { buyerId: "buyer-004", buyerName: "يوسف أحمد", sellerId: "seller-004", sellerName: "سارة خالد", serviceId: "svc-004", serviceTitle: "سأترجم لك مستنداتك بجودة عالية", serviceSlug: "translation-1", totalAmount: "5000", status: "delivered", orderNumber: "ORD-2025-004" },
    { buyerId: "buyer-001", buyerName: "خالد إبراهيم", sellerId: "seller-005", sellerName: "محمد العلي", serviceId: "svc-005", serviceTitle: "سأدير حملاتك الإعلانية على فيسبوك", serviceSlug: "facebook-ads-1", totalAmount: "20000", status: "pending", orderNumber: "ORD-2025-005" },
    { buyerId: "buyer-002", buyerName: "نور الدين", sellerId: "seller-001", sellerName: "أحمد محمد", serviceId: "svc-006", serviceTitle: "سأصمم هوية بصرية كاملة لعلامتك", serviceSlug: "brand-identity-1", totalAmount: "35000", status: "completed", orderNumber: "ORD-2025-006" },
    { buyerId: "buyer-003", buyerName: "ريم شريف", sellerId: "seller-003", sellerName: "عمر حسن", serviceId: "svc-008", serviceTitle: "سأبني لك تطبيق موبايل احترافي", serviceSlug: "mobile-app-1", totalAmount: "80000", status: "completed", orderNumber: "ORD-2025-007" },
  ];

  for (const order of orders) {
    const docRef = db.collection(COLLECTIONS.ORDERS).doc();
    await docRef.set({
      ...order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  console.log(`✅ Created ${orders.length} orders`);

  // 6. Create Payment Proofs
  const paymentProofs = [
    { userId: "buyer-001", userName: "خالد إبراهيم", amount: "50000", method: "syriatel cash", transactionNumber: "TXN-001", status: "approved", createdAt: new Date().toISOString() },
    { userId: "buyer-002", userName: "نور الدين", amount: "30000", method: "haram", transactionNumber: "TXN-002", status: "approved", createdAt: new Date().toISOString() },
    { userId: "buyer-003", userName: "ريم شريف", amount: "25000", method: "syriatel cash", transactionNumber: "TXN-003", status: "pending", createdAt: new Date().toISOString() },
  ];

  for (const proof of paymentProofs) {
    const docRef = db.collection(COLLECTIONS.PAYMENT_PROOFS).doc();
    await docRef.set(proof);
  }
  console.log(`✅ Created ${paymentProofs.length} payment proofs`);

  // 7. Create Withdrawal Requests
  const withdrawals = [
    { userId: "seller-001", userName: "أحمد محمد", amount: "30000", method: "syriatel cash", accountNumber: "09XX XXX XXX", status: "approved", createdAt: new Date().toISOString() },
    { userId: "seller-002", userName: "فاطمة علي", amount: "20000", method: "haram", accountNumber: "09XX XXX XXX", status: "pending", createdAt: new Date().toISOString() },
  ];

  for (const withdrawal of withdrawals) {
    const docRef = db.collection(COLLECTIONS.WITHDRAWAL_REQUESTS).doc();
    await docRef.set(withdrawal);
  }
  console.log(`✅ Created ${withdrawals.length} withdrawal requests`);

  // 8. Create Reviews
  const reviews = [
    { orderId: "order-1", reviewerId: "buyer-001", reviewerName: "خالد إبراهيم", revieweeId: "seller-001", type: "buyer_to_seller", rating: 5, comment: "عمل ممتاز وتسليم في الوقت المحدد. أنصح بالتعامل معه.", createdAt: new Date().toISOString() },
    { orderId: "order-2", reviewerId: "buyer-002", reviewerName: "نور الدين", revieweeId: "seller-002", type: "buyer_to_seller", rating: 5, comment: "مقالات ذات جودة عالية ومحتوى أصلي. شكراً جزيلاً.", createdAt: new Date().toISOString() },
    { orderId: "order-6", reviewerId: "buyer-002", reviewerName: "نور الدين", revieweeId: "seller-001", type: "buyer_to_seller", rating: 5, comment: "هوية بصرية رائعة فهمت رؤيتي تماماً.", createdAt: new Date().toISOString() },
  ];

  for (const review of reviews) {
    const docRef = db.collection(COLLECTIONS.REVIEWS).doc();
    await docRef.set(review);
  }
  console.log(`✅ Created ${reviews.length} reviews`);

  console.log("\n🎉 Seed completed successfully!");
  console.log(`
📊 Summary:
- ${categories.length} categories
- ${users.length} users
- ${services.length} services
- ${wallets.length} wallets
- ${orders.length} orders
- ${paymentProofs.length} payment proofs
- ${withdrawals.length} withdrawal requests
- ${reviews.length} reviews
  `);
}

seed().catch(console.error);
